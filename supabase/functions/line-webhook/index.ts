import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const LINE_REPLY_URL = "https://api.line.me/v2/bot/message/reply";

Deno.serve(async (req: Request) => {
  // LINE requires webhooks to return a fast 200 OK response
  if (req.method !== "POST") return new Response("ok", { status: 200 });

  try {
    const body = await req.json();
    const events = body.events || [];

    // Initialize Supabase Admin Client to bypass RLS for system updates
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    const lineToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");

    for (const event of events) {
      const userId = event.source.userId; // The secret U... ID!
      const replyToken = event.replyToken;

      // 1. User adds the bot as a friend (Follow Event)
      if (event.type === "follow") {
        await replyToLine(
          replyToken, 
          "👋 歡迎加入智慧房東小幫手！\n\n請輸入「綁定 您的手機號碼」來啟用帳單推播功能。\n\n👉 範例：綁定 0912345678", 
          lineToken!
        );
      }

      // 2. User sends a text message
     // 2. User sends a text message
      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.trim();
        
        // NEW: Check if they typed "綁定...", "bind...", OR just a raw 10-digit TW phone number (09xxxxxxxx)
        const isBindingAttempt = text.startsWith("綁定") || 
                                 text.toLowerCase().startsWith("bind") || 
                                 /^09\d{8}$/.test(text);

        if (isBindingAttempt) {
          
          // Extract only the numbers from their message
          const phone = text.replace(/[^\d]/g, "");

          if (!phone || phone.length !== 10) {
            await replyToLine(replyToken, "⚠️ 格式錯誤。請提供正確的10碼手機號碼，例如：0912345678", lineToken!);
            continue;
          }

          // Search the database for this phone number and update the LINE ID
          const { data, error } = await supabaseClient
            .from("tenants")
            .update({ line_user_id: userId })
            .eq("phone", phone)
            .select();

          if (error || !data || data.length === 0) {
            await replyToLine(replyToken, `❌ 找不到手機號碼 ${phone} 的租約紀錄。請確認房東已在系統中建立您的資料。`, lineToken!);
          } else {
            const tenantName = data[0].full_name;
            await replyToLine(replyToken, `✅ 綁定成功！\n\n${tenantName} 您好，未來您的專屬租金與繳費通知將會直接傳送到這裡。`, lineToken!);
          }
        } else {
          // General reply if they type random things
          await replyToLine(replyToken, "💡 系統提示：\n請直接輸入您的「10碼手機號碼」來完成系統連線。\n\n👉 範例：0912345678", lineToken!);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});

// Helper function to send messages back to the user right after they text the bot
async function replyToLine(replyToken: string, text: string, token: string) {
  await fetch(LINE_REPLY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [{ type: "text", text: text }],
    }),
  });
}