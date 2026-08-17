import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useReactToPrint } from 'react-to-print';
import { Printer, CheckCircle2, Stamp, Image as ImageIcon, Upload, X, PlusCircle } from 'lucide-react';
import { ContractDocument, type ContractData } from './ContractDocument';
export function ContractGenerator() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [manualImages, setManualImages] = useState<string[]>([]);
  const [landlordStamp, setLandlordStamp] = useState<string>('');
  const [tenantStamp, setTenantStamp] = useState<string>('');
  
  const [stampPosition, setStampPosition] = useState<'none' | 'top' | 'center' | 'bottom'>('center');
  
  // Dynamic Other Fees Array
  const [otherFees, setOtherFees] = useState<{name: string, amount: string}[]>([]);

  const [formData, setFormData] = useState({
    landlordName: '', landlordId: '', landlordPhone: '', landlordAddress: '',
    tenantName: '', tenantId: '', tenantPhone: '', tenantAddress: '', tenantLineId: '',
    propertyAddress: '', rentAmount: '', depositAmount: '',
    leaseStart: '', leaseEnd: '',
    bankName: '', bankAccount: '',
    customClauses: '',
    lineBotId: '',
    // New Fee Fields
    managementFee: '',
    waterFeeMethod: '依自來水公司帳單繳納',
    gasFeeMethod: '依天然氣公司帳單繳納',
    internetFee: '',
    electricityRate: ''
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
          lineBotId: settings.line_bot_id || ''
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
      const images = prop.image_urls?.length ? prop.image_urls : (prop.image_url ? [prop.image_url] : []);
      setPropertyImages(images);
    } else {
      setPropertyImages([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addOtherFee = () => {
    setOtherFees([...otherFees, { name: '', amount: '' }]);
  };

  const updateOtherFee = (index: number, field: 'name' | 'amount', value: string) => {
    const newFees = [...otherFees];
    newFees[index][field] = value;
    setOtherFees(newFees);
  };

  const removeOtherFee = (index: number) => {
    setOtherFees(otherFees.filter((_, idx) => idx !== index));
  };

  const handleSingleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) setter(URL.createObjectURL(file));
  };

  const handleManualImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map(f => URL.createObjectURL(f));
    setManualImages(prev => [...prev, ...urls]);
  };

  const allAppendixImages = [...propertyImages, ...manualImages];

  // Map to ContractData for the Document Component
  const contractData: ContractData = {
    ...formData,
    lineUserId: formData.tenantLineId,
    startDate: formData.leaseStart,
    endDate: formData.leaseEnd,
    monthlyRent: Number(formData.rentAmount || 0),
    depositAmount: Number(formData.depositAmount || 0),
    managementFee: Number(formData.managementFee || 0),
    internetFee: Number(formData.internetFee || 0),
    electricityRate: Number(formData.electricityRate || 0),
    otherFees: otherFees.map(f => ({ name: f.name, amount: Number(f.amount || 0) })),
    customClauses: [formData.customClauses],
    inventory: '',
    propertyImages: allAppendixImages,
    landlordSignature: landlordStamp,
    tenantSignature: tenantStamp,
    signaturePosition: stampPosition as any,
    tenantSignaturePosition: stampPosition as any,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI 合約生成 (Contract Generator)</h1>
          <p className="text-sm text-slate-500 mt-1">Generate MOI-compliant bilingual leases with digital stamps and appendix photos.</p>
        </div>
        <button onClick={() => handlePrint()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-lg transition">
          <Printer className="w-4 h-4 mr-2" /> 列印 / 下載 PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
              <label className="block text-sm font-bold text-indigo-900 mb-2 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> 快速帶入物件資料</label>
              <select value={selectedPropertyId} onChange={handlePropertySelect} className="w-full px-4 py-2 border border-indigo-200 rounded-lg outline-none text-sm font-medium bg-white">
                <option value="">-- 選擇您的出租物件 --</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name} - {p.address}</option>)}
              </select>
            </div>

            <form className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center"><Stamp className="w-4 h-4 mr-2 text-rose-500"/> 列印設定</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">騎縫章位置</label>
                  <select value={stampPosition} onChange={(e) => setStampPosition(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="none">不使用</option>
                    <option value="top">右上角</option>
                    <option value="center">右側置中</option>
                    <option value="bottom">右下角</option>
                  </select>
                </div>
              </div>

              {/* Appendix Photos Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center"><ImageIcon className="w-4 h-4 mr-2 text-emerald-600"/> 合約附件照片</h3>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <input type="file" multiple accept="image/*" onChange={handleManualImagesUpload} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer mb-3" />
                  {(propertyImages.length > 0 || manualImages.length > 0) && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {propertyImages.map((img, i) => (
                        <img key={`auto-${i}`} src={img} className="w-14 h-14 object-cover rounded-md border border-emerald-200" alt="auto"/>
                      ))}
                      {manualImages.map((img, i) => (
                        <div key={`manual-${i}`} className="relative w-14 h-14 shrink-0">
                          <img src={img} className="w-full h-full object-cover rounded-md border border-emerald-200" alt="manual"/>
                          <button type="button" onClick={() => setManualImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 bg-white rounded-full text-rose-500 shadow"><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Parties Data */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">出租人 (Landlord)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">姓名</label><input type="text" name="landlordName" value={formData.landlordName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">身分證</label><input type="text" name="landlordId" value={formData.landlordId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">電話</label><input type="text" name="landlordPhone" value={formData.landlordPhone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center"><Upload className="w-3 h-3 mr-1" /> 上傳簽章照片</label>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, setLandlordStamp)} className="w-full text-xs text-slate-500 file:bg-indigo-50 file:text-indigo-700 file:rounded-full file:border-0 file:py-1 file:px-3" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">承租人 (Tenant)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-500 mb-1">姓名</label><input type="text" name="tenantName" value={formData.tenantName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">身分證</label><input type="text" name="tenantId" value={formData.tenantId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">電話</label><input type="text" name="tenantPhone" value={formData.tenantPhone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center"><Upload className="w-3 h-3 mr-1" /> 上傳簽章照片</label>
                    <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload(e, setTenantStamp)} className="w-full text-xs text-slate-500 file:bg-indigo-50 file:text-indigo-700 file:rounded-full file:border-0 file:py-1 file:px-3" />
                  </div>
                </div>
              </div>

              {/* Property & Utilities Fees Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">租金與各項費用 (Rent & Utilities)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">房屋地址</label><input type="text" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">每月租金 (Rent)</label><input type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-indigo-700" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">押金 (Deposit)</label><input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-indigo-700" /></div>
                  
                  <div><label className="block text-xs text-slate-500 mb-1">管理費 (Management Fee/Month)</label><input type="number" name="managementFee" value={formData.managementFee} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 500" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">電費 (Electricity Rate/kWh)</label><input type="number" step="0.1" name="electricityRate" value={formData.electricityRate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 5.5" /></div>
                  
                  <div><label className="block text-xs text-slate-500 mb-1">網路/第四台 (Internet/TV Fee)</label><input type="number" name="internetFee" value={formData.internetFee} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 300" /></div>
                  
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">水費約定方式 (Water Fee)</label><input type="text" name="waterFeeMethod" value={formData.waterFeeMethod} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">瓦斯費約定方式 (Gas Fee)</label><input type="text" name="gasFeeMethod" value={formData.gasFeeMethod} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" /></div>
                  
                  <div><label className="block text-xs text-slate-500 mb-1">租期開始</label><input type="date" name="leaseStart" value={formData.leaseStart} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                  <div><label className="block text-xs text-slate-500 mb-1">租期結束</label><input type="date" name="leaseEnd" value={formData.leaseEnd} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
                </div>

                {/* Dynamic Extra Fees (Parking, Gym, etc.) */}
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-bold text-slate-700">其他月繳費用 (Other Monthly Fees)</label>
                    <button type="button" onClick={addOtherFee} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                      <PlusCircle className="w-3 h-3 mr-1"/> 新增項目 (Add Fee)
                    </button>
                  </div>
                  
                  {otherFees.map((fee, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input type="text" placeholder="名稱 (e.g. 汽車位/Parking)" value={fee.name} onChange={(e) => updateOtherFee(index, 'name', e.target.value)} className="w-1/2 px-3 py-2 border rounded-lg text-sm" />
                      <input type="number" placeholder="金額 (Amount)" value={fee.amount} onChange={(e) => updateOtherFee(index, 'amount', e.target.value)} className="w-1/3 px-3 py-2 border rounded-lg text-sm" />
                      <button type="button" onClick={() => removeOtherFee(index)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {otherFees.length === 0 && <p className="text-[10px] text-slate-400">尚無其他費用項目</p>}
                </div>
              </div>

              {/* Custom Clauses */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">特別約定條款</h3>
                <textarea rows={4} name="customClauses" value={formData.customClauses} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50" />
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Live A4 Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-6">
            <div className="bg-slate-200 p-4 rounded-3xl overflow-auto h-[800px] border border-slate-300 shadow-inner flex justify-center">
              <ContractDocument data={contractData} ref={printRef} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}