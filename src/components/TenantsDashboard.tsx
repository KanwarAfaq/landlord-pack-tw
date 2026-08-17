import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Trash2, Smartphone, Calendar, Home, CheckCircle2, XCircle } from 'lucide-react';

interface Tenant {
  id: string;
  property_id: string;
  full_name: string;
  phone: string;
  national_id_or_arc: string;
  line_user_id: string | null;
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  status: string;
  properties?: { name: string }; // Joined from Supabase
}

interface Property {
  id: string;
  name: string;
  status: string;
}

export function TenantsDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTenant, setNewTenant] = useState({
    property_id: '',
    full_name: '',
    national_id_or_arc: '',
    phone: '',
    lease_start: new Date().toISOString().split('T')[0],
    lease_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    rent_amount: 15000,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Fetch tenants and join with property name
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*, properties(name)')
        .eq('landlord_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData || []);

      // Fetch available properties for the dropdown
      const { data: propsData, error: propsError } = await supabase
        .from('properties')
        .select('id, name, status')
        .eq('landlord_id', userData.user.id);

      if (propsError) throw propsError;
      setProperties(propsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.property_id) return alert('請選擇租賃物件 (Please select a property)');

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return alert('請先登入 (Please login first)');

      // 1. Insert the new tenant
      const { error: insertError } = await supabase.from('tenants').insert([{
        ...newTenant,
        landlord_id: userData.user.id
      }]);
      if (insertError) throw insertError;

      // 2. Automatically update the property status to 'occupied'
      const { error: updateError } = await supabase
        .from('properties')
        .update({ status: 'occupied' })
        .eq('id', newTenant.property_id);
      if (updateError) throw updateError;
      
      setIsModalOpen(false);
      setNewTenant({
        property_id: '', full_name: '', national_id_or_arc: '', phone: '',
        lease_start: new Date().toISOString().split('T')[0],
        lease_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        rent_amount: 15000,
      });
      fetchData();
    } catch (error) {
      console.error('Error adding tenant:', error);
      alert('新增失敗 (Failed to add tenant)');
    }
  };

  const handleDelete = async (id: string, property_id: string) => {
    if (!window.confirm('確定要刪除此租客資料嗎？(Are you sure?)')) return;
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
      
      // Optionally update property back to vacant
      await supabase.from('properties').update({ status: 'vacant' }).eq('id', property_id);
      
      fetchData();
    } catch (error) {
      console.error('Error deleting tenant:', error);
    }
  };

  // Filter properties to only show vacant ones in the dropdown
  const vacantProperties = properties.filter(p => p.status === 'vacant');

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">租客管理 (Tenants)</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active leases, tenant profiles, and LINE binding status.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center shadow-lg transition">
          <UserPlus className="w-4 h-4 mr-2" /> 新增租客 (Add Tenant)
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">載入中 (Loading...)</div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">尚未新增任何租客 (No tenants yet)</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">租客姓名 (Name)</th>
                  <th className="px-6 py-4">租賃物件 (Property)</th>
                  <th className="px-6 py-4">租期 (Lease Period)</th>
                  <th className="px-6 py-4">租金 (Rent)</th>
                  <th className="px-6 py-4 text-center">LINE 綁定狀態</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3">
                        {tenant.full_name.charAt(0)}
                      </div>
                      <div>
                        {tenant.full_name}
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5 flex items-center">
                          <Smartphone className="w-3 h-3 mr-1" /> {tenant.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-slate-400 mr-2" />
                        {tenant.properties?.name || '未綁定物件'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center mb-1"><Calendar className="w-3 h-3 mr-1" /> 起: {tenant.lease_start}</div>
                      <div className="flex items-center text-slate-400"><Calendar className="w-3 h-3 mr-1 opacity-0" /> 迄: {tenant.lease_end}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo-700">
                      NT$ {tenant.rent_amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tenant.line_user_id ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 已綁定
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> 待綁定
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(tenant.id, tenant.property_id)} className="text-slate-300 hover:text-rose-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl">
            <h2 className="text-xl font-bold mb-4">新增租客 (New Tenant)</h2>
            <form onSubmit={handleAddTenant} className="space-y-4 text-sm">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">選擇租賃物件 (Assign Property)</label>
                <select required value={newTenant.property_id} onChange={e => setNewTenant({...newTenant, property_id: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-slate-50">
                  <option value="">-- 請選擇空租中的物件 --</option>
                  {vacantProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {vacantProperties.length === 0 && <p className="text-[10px] text-rose-500 mt-1">目前沒有空租的物件，請先至「物件管理」新增。</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">姓名</label>
                  <input required type="text" value={newTenant.full_name} onChange={e => setNewTenant({...newTenant, full_name: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">手機號碼 (用於 LINE 綁定)</label>
                  <input required type="text" placeholder="09xxxxxxxx" value={newTenant.phone} onChange={e => setNewTenant({...newTenant, phone: e.target.value})} className="w-full px-3 py-2 border rounded-xl font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">身分證號 / 居留證號</label>
                  <input type="text" value={newTenant.national_id_or_arc} onChange={e => setNewTenant({...newTenant, national_id_or_arc: e.target.value})} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">每月租金約定</label>
                  <input required type="number" value={newTenant.rent_amount} onChange={e => setNewTenant({...newTenant, rent_amount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">租期開始</label>
                  <input required type="date" value={newTenant.lease_start} onChange={e => setNewTenant({...newTenant, lease_start: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-slate-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">租期結束</label>
                  <input required type="date" value={newTenant.lease_end} onChange={e => setNewTenant({...newTenant, lease_end: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-slate-600" />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">取消 (Cancel)</button>
                <button type="submit" disabled={vacantProperties.length === 0} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md transition">儲存並入駐 (Save & Move In)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}