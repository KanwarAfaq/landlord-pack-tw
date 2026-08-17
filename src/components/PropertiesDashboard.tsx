import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, MapPin, Plus, Trash2, Home, Wallet, Activity, Edit, Image as ImageIcon, X, ChevronRight, LayoutGrid } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  property_type: string;
  expected_rent: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  image_url?: string; // Legacy
  image_urls: string[]; // New multiple images array
}

export function PropertiesDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [activeGalleryImage, setActiveGalleryImage] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '', address: '', property_type: '獨立套房', expected_rent: 15000, status: 'vacant' as 'vacant' | 'occupied' | 'maintenance', image_urls: [] as string[]
  });

  useEffect(() => { fetchProperties(); }, []);

  const fetchProperties = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data, error } = await supabase.from('properties').select('*').eq('landlord_id', userData.user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setProperties(data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    
    try {
      // TODO: Replace these with your actual Cloudinary details
      const cloudName = 'slwuhbdd'; // fiazan, tw property 
      const uploadPreset = 'Tw_Property';


      // Upload all selected files concurrently
      const uploadPromises = files.map(async (file) => {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadData,
        });

        if (!response.ok) throw new Error('Cloudinary upload failed');
        const data = await response.json();
        return data.secure_url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      
      // Append new images to the existing array
      setFormData(prev => ({ ...prev, image_urls: [...prev.image_urls, ...newImageUrls] }));
    } catch (error) {
      console.error('Upload error:', error);
      alert('圖片上傳失敗 (Image upload failed)');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const openModal = (property?: Property) => {
    if (property) {
      setEditingId(property.id);
      // Migrate legacy single image to array if needed
      const existingUrls = property.image_urls?.length ? property.image_urls : (property.image_url ? [property.image_url] : []);
      setFormData({ 
        name: property.name, address: property.address, property_type: property.property_type, 
        expected_rent: property.expected_rent, status: property.status, image_urls: existingUrls 
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', address: '', property_type: '獨立套房', expected_rent: 15000, status: 'vacant', image_urls: [] });
    }
    setIsModalOpen(true);
  };

  const openPropertyDetails = (property: Property) => {
    setViewingProperty(property);
    const cover = property.image_urls?.[0] || property.image_url || '';
    setActiveGalleryImage(cover);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      if (editingId) {
        await supabase.from('properties').update(formData).eq('id', editingId);
      } else {
        await supabase.from('properties').insert([{ ...formData, landlord_id: userData.user.id }]);
      }
      setIsModalOpen(false);
      fetchProperties();
    } catch (error) { alert('儲存失敗'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確定要刪除此物件嗎？')) return;
    await supabase.from('properties').delete().eq('id', id);
    setViewingProperty(null);
    fetchProperties();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">物件管理 (Properties)</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your rooms and photos.</p>
        </div>
        <button onClick={() => openModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center shadow-lg transition">
          <Plus className="w-4 h-4 mr-2" /> 新增物件
        </button>
      </div>

      {loading ? <div className="text-center py-20 text-slate-400">載入中 (Loading...)</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => {
            const coverImage = property.image_urls?.[0] || property.image_url;
            return (
              <div key={property.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden group">
                {/* Image Header */}
                <div 
                  className="h-48 bg-slate-100 relative cursor-pointer group/img overflow-hidden"
                  onClick={() => openPropertyDetails(property)}
                >
                  {coverImage ? (
                    <img src={coverImage} alt={property.name} className="w-full h-full object-cover transition duration-500 group-hover/img:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Home className="w-10 h-10" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-sm font-bold flex items-center">
                      查看詳情與照片 (View Gallery) <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 shadow-sm">
                    {property.status === 'vacant' ? '🟢 空租中' : property.status === 'occupied' ? '🔵 出租中' : '🟠 維護中'}
                  </div>
                  {/* Photo Count Badge */}
                  {property.image_urls?.length > 1 && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-bold flex items-center backdrop-blur-sm">
                      <LayoutGrid className="w-3 h-3 mr-1" /> {property.image_urls.length}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate pr-2">{property.name}</h3>
                    <div className="flex space-x-2 shrink-0">
                      <button onClick={() => openModal(property)} className="text-slate-400 hover:text-indigo-500"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(property.id)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center mb-4 truncate"><MapPin className="w-3.5 h-3.5 mr-1 shrink-0" /> {property.address}</p>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">{property.property_type}</span>
                    <span className="text-lg font-black text-indigo-700">NT$ {property.expected_rent.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Property Details & Gallery Modal */}
      {viewingProperty && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 md:p-8 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            <button onClick={() => setViewingProperty(null)} className="absolute top-4 right-4 z-10 p-2 bg-white/50 hover:bg-white rounded-full text-slate-900 transition backdrop-blur-sm">
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Gallery */}
            <div className="w-full md:w-3/5 bg-slate-100 flex flex-col h-64 md:h-[90vh]">
              {/* Main Image Viewer */}
              <div className="flex-1 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                {activeGalleryImage ? (
                  <img src={activeGalleryImage} alt="Property" className="w-full h-full object-contain" />
                ) : (
                  <Home className="w-20 h-20 text-slate-300" />
                )}
              </div>
              
              {/* Thumbnails Row */}
              {viewingProperty.image_urls && viewingProperty.image_urls.length > 0 && (
                <div className="h-28 bg-slate-900 p-4 flex space-x-3 overflow-x-auto overflow-y-hidden items-center shrink-0">
                  {viewingProperty.image_urls.map((url, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setActiveGalleryImage(url)}
                      className={`h-full aspect-video rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeGalleryImage === url ? 'border-indigo-500 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-2/5 p-8 overflow-y-auto bg-white">
              <div className="mb-6">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  viewingProperty.status === 'vacant' ? 'bg-emerald-100 text-emerald-700' :
                  viewingProperty.status === 'occupied' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {viewingProperty.status === 'vacant' ? '🟢 目前空租中 (Vacant)' : viewingProperty.status === 'occupied' ? '🔵 出租中 (Occupied)' : '🟠 維護中 (Maintenance)'}
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">{viewingProperty.name}</h2>
                <p className="text-sm text-slate-500 flex items-center"><MapPin className="w-4 h-4 mr-1" /> {viewingProperty.address}</p>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-sm text-slate-500 font-medium mb-1">預估月租金 (Monthly Rent)</p>
                  <p className="text-3xl font-black text-indigo-700">NT$ {viewingProperty.expected_rent.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">物件類型 (Property Type)</p>
                  <p className="text-base font-medium text-slate-900">{viewingProperty.property_type}</p>
                </div>

                <div className="pt-8 border-t border-slate-100 flex space-x-4">
                  <button onClick={() => { setViewingProperty(null); openModal(viewingProperty); }} className="flex-1 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition flex items-center justify-center">
                    <Edit className="w-4 h-4 mr-2" /> 編輯資料
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal (Updated for Multiple Images) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? '編輯物件' : '新增物件'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              
              {/* Image Upload Area (Multiple) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">物件照片 (Property Gallery)</label>
                
                {/* Display existing images */}
                {formData.image_urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {formData.image_urls.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-white/90 hover:bg-rose-100 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition text-rose-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 relative hover:bg-indigo-50 hover:border-indigo-200 transition">
                  <ImageIcon className="w-8 h-8 text-indigo-300 mb-2" />
                  <span className="text-xs font-bold text-indigo-600">{uploading ? '圖片上傳中 (Uploading...)' : '點擊選擇多張照片 (Select Multiple)'}</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              <div><label className="block text-xs font-bold text-slate-700 mb-1">物件名稱 (房號)</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" /></div>
              <div><label className="block text-xs font-bold text-slate-700 mb-1">完整地址</label><input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-700 mb-1">類型</label><select value={formData.property_type} onChange={e => setFormData({...formData, property_type: e.target.value})} className="w-full px-3 py-2 border rounded-xl bg-slate-50"><option>獨立套房</option><option>分租套房</option><option>雅房</option><option>整層住家</option></select></div>
                <div><label className="block text-xs font-bold text-slate-700 mb-1">預估月收</label><input required type="number" value={formData.expected_rent} onChange={e => setFormData({...formData, expected_rent: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700 bg-slate-50 focus:bg-white" /></div>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">取消 (Cancel)</button>
                <button type="submit" disabled={uploading} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition">儲存 (Save)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}