import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Building, FileText, CreditCard, User, MessageCircle } from 'lucide-react';

export function SettingsDashboard() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    landlord_name: '',
    landlord_phone: '',
    landlord_id_number: '',
    landlord_address: '',
    bank_code: '',
    bank_account: '',
    default_contract_clauses: '',
    line_bot_id: '' // NEW: LINE Bot ID state
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('landlord_settings')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          landlord_name: data.landlord_name || '',
          landlord_phone: data.landlord_phone || '',
          landlord_id_number: data.landlord_id_number || '',
          landlord_address: data.landlord_address || '',
          bank_code: data.bank_code || '',
          bank_account: data.bank_account || '',
          default_contract_clauses: data.default_contract_clauses || '',
          line_bot_id: data.line_bot_id || '' // NEW: Fetch LINE Bot ID
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from('landlord_settings')
        .upsert({ id: userData.user.id, ...settings, updated_at: new Date().toISOString() });

      if (error) throw error;
      alert('設定已儲存 (Settings saved successfully)');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('儲存失敗 (Failed to save)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">系統設定 (Settings)</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your default information. This will auto-fill your contracts.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Landlord Details Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">出租人資料 (Landlord Details)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">姓名 (Name)</label>
              <input type="text" value={settings.landlord_name} onChange={e => setSettings({...settings, landlord_name: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">電話 (Phone)</label>
              <input type="text" value={settings.landlord_phone} onChange={e => setSettings({...settings, landlord_phone: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">身分證字號 (ID Number)</label>
              <input type="text" value={settings.landlord_id_number} onChange={e => setSettings({...settings, landlord_id_number: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">戶籍地址 (Address)</label>
              <input type="text" value={settings.landlord_address} onChange={e => setSettings({...settings, landlord_address: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Building className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">收款銀行帳戶 (Default Bank Account)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">銀行代碼 (Bank Code)</label>
              <input type="text" value={settings.bank_code} onChange={e => setSettings({...settings, bank_code: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">銀行帳號 (Account Number)</label>
              <input type="text" value={settings.bank_account} onChange={e => setSettings({...settings, bank_account: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            </div>
          </div>
        </div>

        {/* NEW: LINE Bot Integration Section */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MessageCircle className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">LINE 服務綁定 (LINE Bot Integration)</h2>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">LINE 官方帳號 ID (Basic ID)</label>
            <input type="text" placeholder="例如: @smartlandlord" value={settings.line_bot_id} onChange={e => setSettings({...settings, line_bot_id: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
            <p className="text-xs text-slate-500 mt-2">請輸入包含 @ 的完整 ID。此 ID 將用於合約最後一頁自動產生讓租客掃描的 QR Code。</p>
          </div>
        </div>

        {/* Contract Rules Section */}
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileText className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-slate-800">預設合約條款 (Default Custom Clauses)</h2>
          </div>
          <textarea rows={4} value={settings.default_contract_clauses} onChange={e => setSettings({...settings, default_contract_clauses: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-slate-50 outline-none" />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={loading} className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition">
          <Save className="w-5 h-5 mr-2" /> {loading ? '儲存中...' : '儲存設定 (Save Settings)'}
        </button>
      </div>
    </div>
  );
}