import { forwardRef } from 'react';

export interface ContractData {
  landlordName: string;
  landlordId: string;
  landlordPhone: string;
  tenantName: string;
  tenantId: string;
  tenantPhone: string;
  lineUserId: string;
  lineBotId?: string; // NEW: To pass the bot ID dynamically
  propertyAddress: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  managementFee: number;
  waterFeeMethod: string;
  gasFeeMethod: string;
  internetFee: number;
  electricityRate: number;
  bankCode: string;
  bankAccount: string;
  inventory: string;
  customClauses: string[];
  propertyImages: string[];
  landlordSignature: string | null;
  signaturePosition: 'bottom-right' | 'bottom-left' | 'center';
  tenantSignature: string | null;
  tenantSignaturePosition: 'bottom-right' | 'bottom-left' | 'center';
}

interface ContractDocumentProps {
  data: ContractData;
}

export const ContractDocument = forwardRef<HTMLDivElement, ContractDocumentProps>(({ data }, ref) => {
  const landlordSigPositionClass = 
    data.signaturePosition === 'bottom-left' ? 'left-8' :
    data.signaturePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-8';

  const tenantSigPositionClass = 
    data.tenantSignaturePosition === 'bottom-left' ? 'left-8' :
    data.tenantSignaturePosition === 'center' ? 'left-1/2 -translate-x-1/2' : 'right-8';

  // Dynamic QR Code Generation
  const botId = data.lineBotId || '@smartlandlord';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://line.me/R/ti/p/${botId}`)}`;

  return (
    <div
      ref={ref}
      className="relative bg-white text-slate-900 font-serif leading-relaxed text-sm max-w-3xl mx-auto shadow-sm print:shadow-none print:max-w-full print:m-0"
      style={{ minHeight: '1050px', counterReset: 'page' }}
    >
      {/* Landlord Repeating Signature Watermark (騎縫章) */}
      {data.landlordSignature && (
        <div className={`hidden print:flex flex-col items-center fixed bottom-4 ${landlordSigPositionClass} opacity-80 z-50`}>
          <img src={data.landlordSignature} alt="Landlord Seal" className="h-16 object-contain mix-blend-multiply" />
          <p className="text-[8px] text-slate-400 text-center border-t border-slate-300 mt-1 pt-1">
            甲方騎縫章 (Landlord)
          </p>
        </div>
      )}

      {/* Tenant Repeating Signature Watermark (騎縫章) */}
      {data.tenantSignature && (
        <div className={`hidden print:flex flex-col items-center fixed bottom-4 ${tenantSigPositionClass} opacity-80 z-50`}>
          <img src={data.tenantSignature} alt="Tenant Seal" className="h-16 object-contain mix-blend-multiply" />
          <p className="text-[8px] text-slate-400 text-center border-t border-slate-300 mt-1 pt-1">
            乙方騎縫章 (Tenant)
          </p>
        </div>
      )}

      <div className="p-10 print:p-8">
        <div className="text-center border-b-4 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-black tracking-widest">房屋租賃定型化契約 (中英對照)</h1>
          <h2 className="text-sm font-bold text-slate-600 mt-1">Residential Tenancy Agreement</h2>
          <p className="text-[11px] text-slate-500 mt-1">依據中華民國內政部《住宅租賃定型化契約應記載及不得記載事項》規範</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs break-inside-avoid">
          <div>
            <p className="font-bold text-slate-800 mb-1 text-sm border-b border-slate-300 pb-1">出租人 (Landlord / Party A)</p>
            <p className="mt-2">姓名 (Name): <span className="font-semibold">{data.landlordName || '____________'}</span></p>
            <p>身分證號 (ID/ARC): <span className="font-semibold">{data.landlordId || '____________'}</span></p>
            <p>電話 (Phone): <span className="font-semibold">{data.landlordPhone || '____________'}</span></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 mb-1 text-sm border-b border-slate-300 pb-1">承租人 (Tenant / Party B)</p>
            <p className="mt-2">姓名 (Name): <span className="font-semibold">{data.tenantName || '____________'}</span></p>
            <p>身分證號 (ID/ARC): <span className="font-semibold">{data.tenantId || '____________'}</span></p>
            <p>電話 (Phone): <span className="font-semibold">{data.tenantPhone || '____________'}</span></p>
            <p>LINE ID: <span className="font-mono text-slate-600">{data.lineUserId || '未提供'}</span></p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          <div className="break-inside-avoid">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第一條：租賃標的與期間 (Property & Term)</h3>
            <p>租賃房屋座落於：<span className="font-semibold underline">{data.propertyAddress || '________________________'}</span>。</p>
            <p className="mt-1">租賃期間自民國 <span className="font-semibold underline">{data.startDate || 'YYYY-MM-DD'}</span> 起至 <span className="font-semibold underline">{data.endDate || 'YYYY-MM-DD'}</span> 止。</p>
          </div>

          <div className="break-inside-avoid">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第二條：押金與匯款帳戶 (Deposit & Bank Info)</h3>
            <p>押金（保證金）為新臺幣 <span className="font-semibold underline">NT$ {data.depositAmount.toLocaleString()}</span> 元整（依法最高不得超過兩個月）。</p>
            <p className="mt-1">租金匯款金融機構代碼: <span className="font-semibold underline">{data.bankCode || '___'}</span> ； 帳號: <span className="font-semibold underline">{data.bankAccount || '_______________'}</span></p>
          </div>

          <div className="break-inside-avoid">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第三條：租金與各項費用明細 (Rent & Utilities)</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-300">
              <ul className="space-y-3">
                <li><span className="font-bold">1. 房屋租金：</span> 每月新臺幣 <span className="font-black text-lg bg-yellow-200 px-1 mx-1">NT$ {data.monthlyRent.toLocaleString()}</span> 元。</li>
                <li><span className="font-bold">2. 管理費用：</span> 每月新臺幣 <span className="font-semibold underline">NT$ {data.managementFee.toLocaleString()}</span> 元。</li>
                <li><span className="font-bold">3. 水費約定：</span> <span className="font-semibold">{data.waterFeeMethod || '依自來水公司帳單繳納'}</span>。</li>
                <li><span className="font-bold">4. 瓦斯費約定：</span> <span className="font-semibold">{data.gasFeeMethod || '依天然氣公司帳單繳納'}</span>。</li>
                <li><span className="font-bold">5. 網路/第四台：</span> 每月新臺幣 <span className="font-semibold underline">NT$ {data.internetFee.toLocaleString()}</span> 元。</li>
                <li><span className="font-bold">6. 電費約定：</span> 每度新臺幣 <span className="font-semibold underline">NT$ {data.electricityRate}</span> 元 (不得超過台電當期上限)。</li>
              </ul>
            </div>
          </div>

          <div className="break-inside-avoid mt-6">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第四條：房屋附屬設備與現況 (Inventory & Furnishings)</h3>
            <p className="mb-2 text-xs text-slate-600">雙方確認點交時，房屋包含以下設備與門窗狀況 (損壞照價賠償)：</p>
            <div className="p-4 border border-slate-300 whitespace-pre-wrap font-mono text-xs bg-white">
              {data.inventory || '無特別註記 (No special inventory noted)'}
            </div>
          </div>

          <div className="break-inside-avoid mt-6">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第五條：特約條款 (Special Conditions)</h3>
            {data.customClauses.length > 0 ? (
              <ol className="list-decimal pl-5 space-y-2 font-bold text-slate-800">
                {data.customClauses.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ol>
            ) : (
              <p className="text-slate-400 italic text-xs mt-1">無其他個別磋商條款 (No additional custom terms)</p>
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-12 break-inside-avoid">
          <div className="relative">
            <p className="font-bold text-lg mb-16">出租人 (甲方) 簽章：</p>
            <div className="border-b-2 border-slate-400"></div>
            <p className="text-xs text-slate-500 mt-2">日期 (Date): 年 / 月 / 日</p>
            {data.landlordSignature && (
               <img src={data.landlordSignature} alt="Sig" className="absolute top-6 left-4 h-16 mix-blend-multiply" />
            )}
          </div>
          <div className="relative">
            <p className="font-bold text-lg mb-16">承租人 (乙方) 簽章：</p>
            <div className="border-b-2 border-slate-400"></div>
            <p className="text-xs text-slate-500 mt-2">日期 (Date): 年 / 月 / 日</p>
            {data.tenantSignature && (
               <img src={data.tenantSignature} alt="Sig" className="absolute top-6 left-4 h-16 mix-blend-multiply" />
            )}
          </div>
        </div>

        {/* --- NEW SECTION: LINE BOT QR CODE --- */}
        <div className="mt-16 pt-10 border-t-2 border-slate-900 print:break-before-page break-inside-avoid text-center">
          <h3 className="text-2xl font-black text-slate-900 mb-2">租客專屬 LINE 服務綁定</h3>
          <p className="text-sm text-slate-600 mb-8 font-bold">Tenant LINE Notification Binding</p>
          
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
            <h4 className="text-lg font-bold text-emerald-800 mb-4">請掃描下方 QR Code 啟用繳費通知</h4>
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-md border border-emerald-200">
                <img src={qrCodeUrl} alt="LINE Bot QR Code" className="w-40 h-40" />
              </div>
            </div>
            <div className="text-left bg-white p-6 rounded-xl border border-emerald-200 text-slate-700 text-sm">
              <p className="font-bold mb-2">綁定步驟 (Binding Steps):</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>掃描上方 QR Code 加入官方帳號。</li>
                <li>在對話框中輸入您的手機號碼：<span className="font-bold text-indigo-700">{data.tenantPhone || '您填寫的號碼'}</span></li>
                <li>系統將自動連結您的租約，啟用自動催繳與電子收據功能！</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Property Photo Appendix */}
        {data.propertyImages.length > 0 && (
          <div className="pt-10 mt-10 border-t-2 border-slate-900 print:break-before-page break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">附件：房屋現況與設備附圖</h3>
            <p className="text-xs text-slate-500 mb-6">Attachment: Property Condition & Furnishing Photos (起租日現況存證)</p>
            
            <div className="grid grid-cols-2 gap-6">
              {data.propertyImages.map((src, idx) => (
                <div key={idx} className="border border-slate-300 p-2 bg-slate-50 shadow-sm">
                  <img src={src} alt={`Property condition ${idx + 1}`} className="w-full h-56 object-contain mix-blend-multiply bg-white" />
                  <p className="text-center font-bold text-xs text-slate-600 mt-2">現況存證圖 (Photo) {idx + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ContractDocument.displayName = 'ContractDocument';