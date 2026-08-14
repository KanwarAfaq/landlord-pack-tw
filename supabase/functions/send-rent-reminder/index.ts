import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const lineChannelAccessToken = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN");
    if (!lineChannelAccessToken) {
      throw new Error("Missing LINE_CHANNEL_ACCESS_TOKEN");
    }

    const today = new Date();
    // Assuming target is 3 days ahead. Adjust timezone if necessary.
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);
    const targetDateString = targetDate.toISOString().split('T')[0];

    // Fetch pending bills. Skip anything already marked 'paid' (Advance Payments safe!)
    const { data: pendingBills, error: billError } = await supabaseClient
      .from("rent_payments")
      .select(`
        id,
        billing_month,
        rent_amount,
        water_fee,
        gas_fee,
        internet_fee,
        management_fee,
        total_amount,
        due_date,
        leases (
          properties ( title ),
          tenants ( full_name, line_user_id ),
          profiles ( bank_code, bank_account_number )
        )
      `)
      .eq("status", "pending")
      .eq("due_date", targetDateString);

    if (billError) throw billError;

    const results = [];

    for (const bill of pendingBills || []) {
      const lease = bill.leases;
      // Handle array or object relationships gracefully
      const tenant = Array.isArray(lease?.tenants) ? lease.tenants[0] : lease?.tenants;
      const property = Array.isArray(lease?.properties) ? lease.properties[0] : lease?.properties;
      const landlord = Array.isArray(lease?.profiles) ? lease.profiles[0] : lease?.profiles;

      if (!tenant?.line_user_id) continue;

      // Extract fees safely (handle nulls if they don't exist in DB)
      const rent = bill.rent_amount || 0;
      const water = bill.water_fee || 0;
      const gas = bill.gas_fee || 0;
      const mgmt = bill.management_fee || 0;
      const net = bill.internet_fee || 0;
      const total = bill.total_amount || (rent + water + gas + mgmt + net);

      const messagePayload = {
        to: tenant.line_user_id,
        messages: [
          {
            type: "flex",
            altText: `【繳費提醒】${property?.title} 本期帳單通知`,
            contents: {
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  { type: "text", text: "📋 智慧房東・本期帳單明細", weight: "bold", color: "#4f46e5", size: "sm" },
                  { type: "text", text: `NT$ ${total.toLocaleString()}`, weight: "bold", size: "xxl", margin: "md" }
                ]
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  { type: "text", text: `親愛的 ${tenant?.full_name} 您好：`, size: "xs", color: "#334155" },
                  { type: "text", text: `您承租的【${property?.title}】本月帳單即將於 3 天後 (${bill.due_date}) 到期。`, size: "xs", color: "#64748b", wrap: true, margin: "sm" },
                  { type: "separator", margin: "lg" },
                  
                  // Detailed Breakdown
                  {
                    type: "box", layout: "vertical", margin: "lg", spacing: "sm",
                    contents: [
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "房屋租金", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: `NT$ ${rent.toLocaleString()}`, color: "#1e293b", size: "xs", flex: 5, align: "end" }] },
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "管理費", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: `NT$ ${mgmt.toLocaleString()}`, color: "#1e293b", size: "xs", flex: 5, align: "end" }] },
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "水費", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: `NT$ ${water.toLocaleString()}`, color: "#1e293b", size: "xs", flex: 5, align: "end" }] },
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "瓦斯費", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: `NT$ ${gas.toLocaleString()}`, color: "#1e293b", size: "xs", flex: 5, align: "end" }] },
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "網路費", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: `NT$ ${net.toLocaleString()}`, color: "#1e293b", size: "xs", flex: 5, align: "end" }] }
                    ]
                  },
                  
                  { type: "separator", margin: "lg" },
                  
                  // Bank Transfer Info
                  {
                    type: "box", layout: "vertical", margin: "lg", spacing: "sm",
                    contents: [
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "銀行代碼", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: landlord?.bank_code || "未提供", color: "#1e293b", size: "xs", flex: 5, weight: "bold" }] },
                      { type: "box", layout: "baseline", contents: [{ type: "text", text: "轉帳帳號", color: "#94a3b8", size: "xs", flex: 3 }, { type: "text", text: landlord?.bank_account_number || "未提供", color: "#1e293b", size: "xs", flex: 5, weight: "bold" }] }
                    ]
                  }
                ]
              },
              footer: {
                type: "box",
                layout: "vertical",
                contents: [
                  { type: "text", text: "若您已預先繳納，請忽略此訊息。", size: "xxs", color: "#cbd5e1", align: "center", margin: "sm" }
                ]
              }
            }
          }
        ]
      };

      const lineRes = await fetch(LINE_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lineChannelAccessToken}`,
        },
        body: JSON.stringify(messagePayload),
      });

      const lineResult = await lineRes.json();
      results.push({ tenant: tenant?.full_name, lineResult });
    }

    return new Response(JSON.stringify({ success: true, processed: results }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});