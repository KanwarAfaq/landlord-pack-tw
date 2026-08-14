import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function TenantReminderManager() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleTriggerReminders = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-rent-reminder', {
        body: {},
      });

      if (error) throw error;

      setStatus({
        type: 'success',
        message: `成功發送通知！已推播至 ${data?.processed?.length || 0} 位租客的 LINE。`,
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || '發送 LINE 提醒失敗，請檢查 Token 設定。',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">LINE 自動催繳與推播設定</h3>
          <p className="text-xs text-slate-500">系統將於每月租金到期前 3 天自動發送 LINE Flex 繳費卡片</p>
        </div>
      </div>

      {status && (
        <div
          className={`mb-4 p-3 rounded-xl flex items-center space-x-2 text-xs font-medium ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <button
        onClick={handleTriggerReminders}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-200 transition"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        <span>立即手動觸發測試發送 (Send Test Reminder)</span>
      </button>
    </div>
  );
}