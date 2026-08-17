import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ContractDocument, type ContractData } from './ContractDocument';
import { Printer, Sparkles, Plus, Trash2, ShieldCheck, Camera, ImagePlus, PenTool } from 'lucide-react';

export function ContractGenerator() {
  const [newClause, setNewClause] = useState('');
  const [formData, setFormData] = useState<ContractData>({
    landlordName: '', landlordId: '', landlordPhone: '',
    tenantName: '', tenantId: '', tenantPhone: '',
    lineUserId: '',
    propertyAddress: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    monthlyRent: 18000,
    depositAmount: 36000,
    managementFee: 0,
    waterFeeMethod: '依台水帳單',
    gasFeeMethod: '依天然氣帳單',
    internetFee: 0,
    electricityRate: 5.0,
    bankCode: '822', bankAccount: '',
    inventory: '1. 雙人床組 x1\n2. 系統衣櫃 x1\n3. 變頻冷氣 x1\n4. 窗戶玻璃完好無裂痕\n5. 椅子 x2',
    customClauses: ['房屋內部全面禁菸，若違約需負擔清潔除味費用 NT$5,000。'],
    propertyImages: [],
    landlordSignature: null,
    signaturePosition: 'bottom-right',
    tenantSignature: null,
    tenantSignaturePosition: 'bottom-left', // Default tenant seal to the left
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Taiwan_Rental_Contract_${formData.tenantName || 'Agreement'}`,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'monthlyRent') {
      const rent = Number(value) || 0;
      setFormData(prev => ({ ...prev, monthlyRent: rent, depositAmount: rent * 2 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, propertyImages: [...prev.propertyImages, event.target!.result as string] }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>, role: 'landlord' | 'tenant') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (role === 'landlord') {
            setFormData(prev => ({ ...prev, landlordSignature: event.target!.result as string }));
          } else {
            setFormData(prev => ({ ...prev, tenantSignature: event.target!.result as string }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex justify-between items-center">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /><span>內政部標準租約規範 (Pro Version)</span>
          </div>
          <h2 className="text-xl font-bold">進階雙語合約引擎</h2>
        </div>
        <button onClick={() => handlePrint()} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl text-xs font-semibold shadow-lg transition">
          <Printer className="w-4 h-4" /><span>列印 / 輸出 PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold flex items-center space-x-2 mb-4"><ShieldCheck className="w-4 h-4 text-indigo-600" /><span>雙方資訊與推播設定</span></h3>
             <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" name="landlordName" placeholder="房東姓名" value={formData.landlordName} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input type="text" name="landlordId" placeholder="房東身分證號" value={formData.landlordId} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                  <input type="text" name="landlordPhone" placeholder="房東電話" value={formData.landlordPhone} onChange={handleChange} className="px-3 py-2 border rounded-lg" />
                </div>
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" name="tenantName" placeholder="租客姓名" value={formData.tenantName} onChange={handleChange} className="px-3 py-2 border rounded-lg bg-white" />
                    <input type="text" name="tenantId" placeholder="租客身分證號" value={formData.tenantId} onChange={handleChange} className="px-3 py-2 border rounded-lg bg-white" />
                    <input type="text" name="tenantPhone" placeholder="租客電話" value={formData.tenantPhone} onChange={handleChange} className="px-3 py-2 border rounded-lg bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 mb-1 block">租客 LINE User ID (自動推播帳單必填)</label>
                    <input type="text" name="lineUserId" placeholder="例: U1234567890abcdef..." value={formData.lineUserId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg font-mono bg-white" />
                  </div>
                </div>

                <input type="text" name="propertyAddress" placeholder="租賃地址 (Property Address)" value={formData.propertyAddress} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold mb-4">費用明細 (Financials)</h3>
             <div className="grid grid-cols-2 gap-3 text-xs">
                <div><label className="font-medium text-slate-700">每月租金</label><input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1 font-bold text-indigo-700 bg-indigo-50" /></div>
                <div><label className="font-medium text-slate-700">押金</label><input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
                <div><label className="font-medium text-slate-700">管理費</label><input type="number" name="managementFee" value={formData.managementFee} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
                <div><label className="font-medium text-slate-700">網路/第四台</label><input type="number" name="internetFee" value={formData.internetFee} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
                <div><label className="font-medium text-slate-700">水費約定</label><input type="text" name="waterFeeMethod" value={formData.waterFeeMethod} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
                <div><label className="font-medium text-slate-700">瓦斯費約定</label><input type="text" name="gasFeeMethod" value={formData.gasFeeMethod} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
                <div><label className="font-medium text-slate-700">電費 (每度元)</label><input type="number" name="electricityRate" value={formData.electricityRate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" step="0.1" /></div>
             </div>
             
             <div className="grid grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t">
               <div><label className="font-medium text-slate-700">匯款銀行代碼</label><input type="text" name="bankCode" value={formData.bankCode} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1" /></div>
               <div><label className="font-medium text-slate-700">匯款帳號</label><input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg mt-1 font-mono" /></div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
             <h3 className="text-sm font-bold mb-4">設備點交與條款</h3>
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium block mb-1 text-slate-700">房屋設備清單 (Inventory)</label>
                  <textarea name="inventory" value={formData.inventory} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50" />
                </div>
                
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs font-medium block mb-2 text-slate-700">特約條款 (Custom Terms)</label>
                  {formData.customClauses.map((clause, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] mb-2">
                      <span className="flex-1 text-slate-700">{idx + 1}. {clause}</span>
                      <button onClick={() => setFormData(p => ({...p, customClauses: p.customClauses.filter((_, i) => i !== idx)}))} className="text-rose-500 hover:text-rose-700 ml-2">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2 mt-2">
                    <input type="text" placeholder="新增條款..." value={newClause} onChange={(e) => setNewClause(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setFormData(p => ({...p, customClauses: [...p.customClauses, newClause]})), setNewClause(''))} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs" />
                    <button onClick={() => { if(newClause) { setFormData(p => ({...p, customClauses: [...p.customClauses, newClause]})); setNewClause(''); } }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-lg transition"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold flex items-center space-x-2"><PenTool className="w-4 h-4 text-indigo-600" /><span>甲方(房東) 數位印章/簽名</span></h3>
                {formData.landlordSignature && <button onClick={() => setFormData(p => ({...p, landlordSignature: null}))} className="text-[10px] text-rose-500 font-bold hover:underline">🗑️ 移除</button>}
              </div>
              <p className="text-[10px] text-slate-500 mb-2">若需實體用印請留白 (Leave blank for physical stamping)</p>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleSignatureUpload(e, 'landlord')} className="text-xs mb-2 block w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              <select disabled={!formData.landlordSignature} value={formData.signaturePosition} onChange={(e) => setFormData(p => ({...p, signaturePosition: e.target.value as any}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs disabled:bg-slate-100">
                <option value="bottom-right">騎縫章位置：右下角 (Bottom Right)</option>
                <option value="bottom-left">騎縫章位置：左下角 (Bottom Left)</option>
                <option value="center">騎縫章位置：置中 (Center)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold flex items-center space-x-2"><PenTool className="w-4 h-4 text-indigo-600" /><span>乙方(租客) 數位印章/簽名</span></h3>
                {formData.tenantSignature && <button onClick={() => setFormData(p => ({...p, tenantSignature: null}))} className="text-[10px] text-rose-500 font-bold hover:underline">🗑️ 移除</button>}
              </div>
              <p className="text-[10px] text-slate-500 mb-2">若需實體用印請留白 (Leave blank for physical stamping)</p>
              <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleSignatureUpload(e, 'tenant')} className="text-xs mb-2 block w-full text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              <select disabled={!formData.tenantSignature} value={formData.tenantSignaturePosition} onChange={(e) => setFormData(p => ({...p, tenantSignaturePosition: e.target.value as any}))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs disabled:bg-slate-100">
                <option value="bottom-left">騎縫章位置：左下角 (Bottom Left)</option>
                <option value="bottom-right">騎縫章位置：右下角 (Bottom Right)</option>
                <option value="center">騎縫章位置：置中 (Center)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold flex items-center space-x-2 mb-3"><Camera className="w-4 h-4 text-indigo-600" /><span>房屋現況附圖 (Photos)</span></h3>
              <label className="flex items-center justify-center w-full py-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer mb-3">
                <div className="flex flex-col items-center space-y-1"><ImagePlus className="w-6 h-6 text-slate-400" /><span className="text-xs font-medium text-slate-600">點擊上傳多張照片</span></div>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              {formData.propertyImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {formData.propertyImages.map((src, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 group">
                      <img src={src} alt="preview" className="w-full h-16 object-cover" />
                      <button onClick={() => setFormData(p => ({...p, propertyImages: p.propertyImages.filter((_, i) => i !== idx)}))} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4 text-white" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="lg:col-span-7 bg-slate-200 p-6 rounded-3xl overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-4 px-2"><span>即時預覽 (Live Preview)</span><span>A4 Standard Format</span></div>
          <div className="shadow-2xl"><ContractDocument ref={printRef} data={formData} /></div>
        </div>
      </div>
    </div>
  );
}

export default ContractGenerator;