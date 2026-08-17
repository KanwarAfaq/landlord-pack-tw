import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useReactToPrint } from 'react-to-print';
import { FileText, Printer, CheckCircle2, QrCode, Stamp, Image as ImageIcon, Upload, X } from 'lucide-react';

export function ContractGenerator() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  // Images & Stamps State
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [manualImages, setManualImages] = useState<string[]>([]);
  const [landlordStamp, setLandlordStamp] = useState<string>('');
  const [tenantStamp, setTenantStamp] = useState<string>('');
  
  // Stamp State
  const [stampPosition, setStampPosition] = useState<'none' | 'top' | 'center' | 'bottom'>('center');

  const [formData, setFormData] = useState({
    landlordName: '', landlordId: '', landlordPhone: '', landlordAddress: '',
    tenantName: '', tenantId: '', tenantPhone: '', tenantAddress: '', tenantLineId: '',
    propertyAddress: '', rentAmount: '', depositAmount: '',
    leaseStart: '', leaseEnd: '',
    bankName: '', bankAccount: '',
    customClauses: '',
    lineBotId: '' // NEW: Added to state to store fetched ID
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Taiwan_Rental_Contract_${formData.tenantName || 'Agreement'}`,
  });

  useEffect(() => {
    const fetchDefaults = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: settings } = await supabase.from('landlord_settings').select('*').eq('id', userData.user.id).single();
      if (settings) {
        setFormData(prev => ({
          ...prev,
          landlordName: settings.landlord_name || '', landlordPhone: settings.landlord_phone || '',
          landlordId: settings.landlord_id_number || '', landlordAddress: settings.landlord_address || '',
          bankName: settings.bank_code || '', bankAccount: settings.bank_account || '',
          customClauses: settings.default_contract_clauses || '',
          lineBotId: settings.line_bot_id || '' // NEW: Fetch dynamically from database
        }));
      }

      const { data: props } = await supabase.from('properties').select('*').eq('landlord_id', userData.user.id);
      if (props) setProperties(props);
    };
    fetchDefaults();
  }, []);

  const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPropertyId(id);
    const prop = properties.find(p => p.id === id);
    if (prop) {
      setFormData(prev => ({
        ...prev,
        propertyAddress: prop.address,
        rentAmount: prop.expected_rent.toString(),
        depositAmount: (prop.expected_rent * 2).toString()
      }));
      // Grab auto-fetched images for the appendix
      const images = prop.image_urls?.length ? prop.image_urls : (prop.image_url ? [prop.image_url] : []);
      setPropertyImages(images);
    } else {
      setPropertyImages([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Local Image Handlers
  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const handleManualImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map(f => URL.createObjectURL(f));
    setManualImages(prev => [...prev, ...urls]);
  };

  const removeManualImage = (indexToRemove: number) => {
    setManualImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Combine auto-fetched and manually added images for the appendix
  const allAppendixImages = [...propertyImages, ...manualImages];

  // NEW: Dynamic LINE Bot URL mapping
  const botId = formData.lineBotId || '@your_bot_id'; // Fallback if setting is empty
  const lineBotUrl = `https://line.me/R/ti/p/${botId}`; 
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(lineBotUrl)}`;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI 合約生成 (Contract Generator)</h1>
          <p className="text-sm text-slate-500 mt-1">Generate MOI-compliant bilingual leases with digital stamps and appendix photos.</p>
        </div>
        <button onClick={() => handlePrint()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg transition">
          <Printer className="w-4 h-4 mr-2" /> 列印 / 下載 PDF (Print / PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            
            {/* Quick Property Selector */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
              <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> 快速帶入物件資料 (Auto-fill Property Data)</label>
              <select value={selectedPropertyId} onChange={handlePropertySelect} className="w-full px-4 py-2 border border-indigo-200 rounded-lg outline-none text-sm font-medium bg-white">
                <option value="">-- 選擇您的出租物件 --</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name} - {p.address}</option>)}
              </select>
            </div>

            <form className="space-y-6">
              
              {/* Document Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center"><Stamp className="w-4 h-4 mr-2 text-rose-500"/> 列印設定 (Print Settings)</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">騎縫章位置 (Cross-page Seal Position)</label>
                  <select value={stampPosition} onChange={(e) => setStampPosition(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="none">不使用 (None)</option>
                    <option value="top">右上角 (Top Right)</option>
                    <option value="center">右側置中 (Center Right)</option>
                    <option value="bottom">右下角 (Bottom Right)</option>
                  </select>
                </div>
              </div>

              {/* Appendix Photos Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center"><ImageIcon className="w-4 h-4 mr-2 text-emerald-600"/> 合約附件照片 (Appendix Photos)</h3>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 mb-3 font-medium">這些照片將會自動附在合約的最後一頁，作為屋況與設備確認的依據。</p>
                  
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleManualImagesUpload} 
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 transition cursor-pointer mb-3" 
                  />
                  
                  {/* Photo Preview Gallery */}
                  {(propertyImages.length > 0 || manualImages.length > 0) && (
                    <div className="mt-2 pt-3 border-t border-emerald-200/50">
                      <p className="text-[10px] text-emerald-700 font-bold mb-2">準備列印的照片 (Ready to Print):</p>
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {propertyImages.map((img, i) => (
                          <div key={`auto-${i}`} className="relative w-14 h-14 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-md border border-emerald-200" alt="auto upload"/>
                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[8px] text-center rounded-b-md">系統帶入</div>
                          </div>
                        ))}
                        {manualImages.map((img, i) => (
                          <div key={`manual-${i}`} className="relative w-14 h-14 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-md border border-emerald-200" alt="manual upload"/>
                            <button 
                              type="button" 
                              onClick={() => removeManualImage(i)} 
                              className="absolute -top-1.5 -right-1.5 bg-white rounded-full text-rose-500 shadow hover:text-rose-600"
                            >
                              <X className="w-4 h-4"/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Landlord Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">出租人 (Landlord)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">姓名 (Name)</label><input type="text" name="landlordName" value={formData.landlordName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">身分證 (ID)</label><input type="text" name="landlordId" value={formData.landlordId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">電話 (Phone)</label><input type="text" name="landlordPhone" value={formData.landlordPhone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">戶籍地址 (Address)</label><input type="text" name="landlordAddress" value={formData.landlordAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  
                  {/* Landlord Stamp Upload */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center">
                      <Upload className="w-3 h-3 mr-1" /> 上傳簽章照片 (Upload Stamp/Signature)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, setLandlordStamp)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                </div>
              </div>

              {/* Tenant Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">承租人 (Tenant)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">姓名 (Name)</label><input type="text" name="tenantName" value={formData.tenantName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">身分證/居留證 (ID/ARC)</label><input type="text" name="tenantId" value={formData.tenantId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">電話 (Phone)</label><input type="text" name="tenantPhone" value={formData.tenantPhone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">LINE ID (Optional)</label><input type="text" name="tenantLineId" value={formData.tenantLineId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">戶籍地址 (Address)</label><input type="text" name="tenantAddress" value={formData.tenantAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  
                  {/* Tenant Stamp Upload */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center">
                      <Upload className="w-3 h-3 mr-1" /> 上傳簽章照片 (Upload Stamp/Signature)
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, setTenantStamp)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                </div>
              </div>

              {/* Property & Terms Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">租賃標的與條件 (Property & Terms)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">房屋地址 (Property Address)</label><input type="text" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">每月租金 (Rent Amount)</label><input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-indigo-700" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">押金 (Deposit)</label><input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-indigo-700" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">租期開始 (Start Date)</label><input type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">租期結束 (End Date)</label><input type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">匯款帳戶 (Bank Details)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">銀行代碼 (Bank Code)</label><input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">銀行帳號 (Account Number)</label><input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                </div>
              </div>

              {/* Custom Clauses */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">特別約定條款 (Custom Clauses)</h3>
                <textarea rows={4} name="customClauses" value={formData.customClauses} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Live A4 Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="bg-slate-200 p-4 rounded-3xl overflow-auto h-[800px] border border-slate-300 shadow-inner flex justify-center">
              
              {/* Actual Printable A4 Area */}
              <div ref={printRef} className="bg-white w-[210mm] min-h-[297mm] shadow-lg text-slate-900 text-sm leading-relaxed relative" style={{ fontFamily: '"Noto Sans TC", sans-serif' }}>
                
                {/* CSS Fixed Stamp for Printing (Repeats on every page) */}
                {stampPosition !== 'none' && (
                  <div 
                    className="fixed right-[-20mm] opacity-70 z-50 pointer-events-none" 
                    style={{
                      top: stampPosition === 'top' ? '10%' : stampPosition === 'center' ? '50%' : 'auto',
                      bottom: stampPosition === 'bottom' ? '10%' : 'auto',
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <svg width="80" height="150" viewBox="0 0 80 150">
                      <rect x="0" y="0" width="80" height="150" fill="none" stroke="#ef4444" strokeWidth="4" />
                      <text x="40" y="75" fill="#ef4444" fontSize="24" fontWeight="bold" textAnchor="middle" transform="rotate(90 40 75)">騎縫章</text>
                    </svg>
                  </div>
                )}

                <div className="p-[20mm]">
                  <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                    <h1 className="text-2xl font-black tracking-widest mb-1">房屋租賃契約書</h1>
                    <h2 className="text-base text-slate-600 font-bold">Residential Lease Agreement</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Parties */}
                    <div className="flex justify-between">
                      <div><p><span className="font-bold">出租人 (Landlord):</span> {formData.landlordName || '________________'}</p><p><span className="font-bold">身分證字號 (ID Number):</span> {formData.landlordId || '________________'}</p></div>
                      <div><p><span className="font-bold">承租人 (Tenant):</span> {formData.tenantName || '________________'}</p><p><span className="font-bold">身分證/居留證 (ID/ARC):</span> {formData.tenantId || '________________'}</p></div>
                    </div>

                    {/* Premises */}
                    <div><h3 className="font-bold text-lg border-b border-slate-300 mb-2">第一條：租賃標的 (Premises)</h3><p>房屋門牌地址 (Property Address): {formData.propertyAddress || '____________________________________________________'}</p></div>

                    {/* Term */}
                    <div><h3 className="font-bold text-lg border-b border-slate-300 mb-2">第二條：租賃期間 (Lease Term)</h3><p>自 (From) <span className="font-bold">{formData.leaseStart || '____年__月__日'}</span> 起，至 (To) <span className="font-bold">{formData.leaseEnd || '____年__月__日'}</span> 止。</p></div>

                    {/* Rent & Deposit */}
                    <div>
                      <h3 className="font-bold text-lg border-b border-slate-300 mb-2">第三條：租金與押金 (Rent and Deposit)</h3>
                      <p>1. 每月租金 (Monthly Rent): 新台幣 <span className="font-bold">{formData.rentAmount ? Number(formData.rentAmount).toLocaleString() : '__________'}</span> 元。</p>
                      <p>2. 押金 (Security Deposit): 新台幣 <span className="font-bold">{formData.depositAmount ? Number(formData.depositAmount).toLocaleString() : '__________'}</span> 元。</p>
                      <p>3. 租金應於每月約定日期前，匯入以下帳戶 (Remit to):</p>
                      <div className="pl-4 mt-2 bg-slate-50 p-2 border border-slate-200">
                        <p>銀行代碼 (Bank Code): {formData.bankName || '____'}</p>
                        <p>銀行帳號 (Account Number): {formData.bankAccount || '________________'}</p>
                      </div>
                    </div>

                    {/* Custom Clauses */}
                    <div><h3 className="font-bold text-lg border-b border-slate-300 mb-2">第四條：特別約定事項 (Custom Clauses)</h3><p className="whitespace-pre-wrap">{formData.customClauses || '無 (None)'}</p></div>

                    {/* Signatures with Inserted Stamps */}
                    <div className="pt-20 mt-10 border-t-2 border-slate-900 grid grid-cols-2 gap-10">
                      
                      {/* Landlord Signature Block */}
                      <div>
                        <p className="font-bold mb-8">出租人簽章 (Landlord Signature)</p>
                        <div className="h-16 border-b border-slate-400 mb-2 relative flex items-end">
                          {landlordStamp && (
                            <img src={landlordStamp} className="absolute bottom-0 left-4 h-24 max-w-[150px] object-contain" style={{ mixBlendMode: 'multiply' }} alt="Landlord Stamp" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">電話 (Phone): {formData.landlordPhone}</p>
                        <p className="text-xs text-slate-500">地址 (Address): {formData.landlordAddress}</p>
                      </div>

                      {/* Tenant Signature Block */}
                      <div>
                        <p className="font-bold mb-8">承租人簽章 (Tenant Signature)</p>
                        <div className="h-16 border-b border-slate-400 mb-2 relative flex items-end">
                          {tenantStamp && (
                            <img src={tenantStamp} className="absolute bottom-0 left-4 h-24 max-w-[150px] object-contain" style={{ mixBlendMode: 'multiply' }} alt="Tenant Stamp" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">電話 (Phone): {formData.tenantPhone}</p>
                        <p className="text-xs text-slate-500">地址 (Address): {formData.tenantAddress}</p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* --- PAGE BREAK: LINE BOT INTEGRATION --- */}
                <div className="p-[20mm]" style={{ pageBreakBefore: 'always' }}>
                  <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                    <h2 className="text-2xl font-black tracking-widest mb-1 flex items-center justify-center"><QrCode className="w-6 h-6 mr-2"/> 租客專屬 LINE 服務綁定</h2>
                    <p className="text-sm text-slate-600 font-bold">Tenant LINE Notification Binding</p>
                  </div>
                  
                  <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 text-center space-y-6">
                    <h3 className="text-xl font-bold text-emerald-800">請掃描下方 QR Code 啟用繳費通知</h3>
                    <p className="text-emerald-700">Scan the QR code below to bind your account for automated rent reminders and e-receipts.</p>
                    
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl shadow-md border border-emerald-200">
                        <img src={qrCodeUrl} alt="LINE Bot QR Code" className="w-40 h-40" />
                      </div>
                    </div>

                    <div className="text-left bg-white p-6 rounded-xl border border-emerald-200 mt-6">
                      <h4 className="font-bold text-slate-800 mb-2">綁定步驟 (Binding Steps):</h4>
                      <ol className="list-decimal list-inside space-y-2 text-slate-600">
                        <li>開啟手機相機掃描上方 QR Code 加入官方帳號 (Add our Official LINE Account).</li>
                        <li>在對話框輸入您的手機號碼: <span className="font-mono font-bold text-indigo-600">{formData.tenantPhone || '您填寫的手機號碼'}</span></li>
                        <li>系統將自動連結您的租約，未來可直接在 LINE 收到帳單與收據！ (The system will automatically link your lease!)</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* --- PAGE BREAK: PROPERTY PHOTOS --- */}
                {allAppendixImages.length > 0 && (
                  <div className="p-[20mm]" style={{ pageBreakBefore: 'always' }}>
                    <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                      <h2 className="text-2xl font-black tracking-widest mb-1">附件：屋況與設備確認照片</h2>
                      <p className="text-sm text-slate-600 font-bold">Appendix: Property Condition Photos</p>
                    </div>
                    
                    <p className="mb-4 text-slate-600 text-sm">此頁為簽約當下之房屋現況照片留存，以避免退租時之爭議。 (These photos document the property condition at the time of signing.)</p>

                    <div className="grid grid-cols-2 gap-4">
                      {allAppendixImages.map((url, idx) => (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden h-64 bg-slate-100 flex items-center justify-center p-2">
                          <img src={url} alt={`Property Photo ${idx + 1}`} className="max-w-full max-h-full object-contain shadow-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}