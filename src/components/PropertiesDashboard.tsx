import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust this import path if your supabase client is located elsewhere
import { Building2, MapPin, Plus, Trash2, Home, Wallet, Activity } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  property_type: string;
  expected_rent: number;
  status: 'vacant' | 'occupied' | 'maintenance';
}

export function PropertiesDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newProperty, setNewProperty] = useState({
    name: '',
    address: '',
    property_type: '獨立套房',
    expected_rent: 15000,
    status: 'vacant'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return alert('請先登入 (Please login first)');

      const { error } = await supabase.from('properties').insert([{
        ...newProperty,
        landlord_id: userData.user.id
      }]);

      if (error) throw error;
      
      setIsModalOpen(false);
      setNewProperty({ name: '', address: '', property_type: '獨立套房', expected_rent: 15000, status: 'vacant' });
      fetchProperties();
    } catch (error) {
      console.error('Error adding property:', error);
      alert('新增失敗 (Failed to add property)');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除此物件嗎？(Are you sure?)')) return;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
      setProperties(properties.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const totalRent = properties.reduce((sum, p) => sum + p.expected_rent, 0);
  const vacantCount = properties.filter(p => p.status === 'vacant').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Metrics */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">物件管理 (Properties)</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your rooms, apartments, and expected revenue.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center shadow-lg transition">
          <Plus className="w-4 h-4 mr-2" /> 新增物件 (Add Property)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500">總物件數 (Total)</p>
            <p className="text-2xl font-black text-slate-900">{properties.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500">空租中 (Vacant)</p>
            <p className="text-2xl font-black text-slate-900">{vacantCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Wallet className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500">預估月收 (Est. Revenue)</p>
            <p className="text-2xl font-black text-slate-900">NT$ {totalRent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">載入中 (Loading...)</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">尚未新增任何物件 (No properties yet)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  property.status === 'vacant' ? 'bg-emerald-100 text-emerald-700' :
                  property.status === 'occupied' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {property.status === 'vacant' ? '🟢 空租中 (Vacant)' : property.status === 'occupied' ? '🔵 出租中 (Occupied)' : '🟠 維護中 (Maintenance)'}
                </div>
                <button onClick={() => handleDelete(property.id)} className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{property.name}</h3>
              <p className="text-xs text-slate-500 flex items-center mb-4"><MapPin className="w-3.5 h-3.5 mr-1" /> {property.address}</p>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">{property.property_type}</span>
                <span className="text-lg font-black text-indigo-700">NT$ {property.expected_rent.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">新增物件 (New Property)</h2>
            <form onSubmit={handleAddProperty} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">物件名稱 (房號)</label>
                <input required type="text" value={newProperty.name} onChange={e => setNewProperty({...newProperty, name: e.target.value})} placeholder="例: A棟 301室" className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">完整地址</label>
                <input required type="text" value={newProperty.address} onChange={e => setNewProperty({...newProperty, address: e.target.value})} placeholder="例: 台北市信義區..." className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">物件類型</label>
                  <select value={newProperty.property_type} onChange={e => setNewProperty({...newProperty, property_type: e.target.value})} className="w-full px-3 py-2 border rounded-xl">
                    <option>獨立套房 (Studio)</option>
                    <option>分租套房 (Shared Studio)</option>
                    <option>雅房 (Room)</option>
                    <option>整層住家 (Apartment)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">預估租金/月</label>
                  <input required type="number" value={newProperty.expected_rent} onChange={e => setNewProperty({...newProperty, expected_rent: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700" />
                </div>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">取消 (Cancel)</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition">儲存 (Save)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}