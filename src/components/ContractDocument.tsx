import { forwardRef } from 'react';

export interface ContractData {
  landlordName: string;
  landlordId: string;
  landlordPhone: string;
  tenantName: string;
  tenantId: string;
  tenantPhone: string;
  lineUserId: string;
  lineBotId?: string;
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
  otherFees: { name: string; amount: number }[]; // NEW: Dynamic extra fees
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

  const botId = data.lineBotId || '@smartlandlord';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://line.me/R/ti/p/${botId}`)}`;

  return (
    <div
      ref={ref}
      className="relative bg-white text-slate-900 font-serif leading-relaxed text-sm max-w-3xl mx-auto shadow-sm print:shadow-none print:max-w-full print:m-0"
      style={{ minHeight: '1050px', counterReset: 'page' }}
    >
      {/* Landlord Seal */}
      {data.landlordSignature && (
        <div className={`hidden print:flex flex-col items-center fixed bottom-4 ${landlordSigPositionClass} opacity-80 z-50`}>
          <img src={data.landlordSignature} alt="Landlord Seal" className="h-16 object-contain mix-blend-multiply" />
          <p className="text-[8px] text-slate-400 text-center border-t border-slate-300 mt-1 pt-1">甲方騎縫章</p>
        </div>
      )}

      {/* Tenant Seal */}
      {data.tenantSignature && (
        <div className={`hidden print:flex flex-col items-center fixed bottom-4 ${tenantSigPositionClass} opacity-80 z-50`}>
          <img src={data.tenantSignature} alt="Tenant Seal" className="h-16 object-contain mix-blend-multiply" />
          <p className="text-[8px] text-slate-400 text-center border-t border-slate-300 mt-1 pt-1">乙方騎縫章</p>
        </div>
      )}

      <div className="p-10 print:p-8">
        <div className="text-center border-b-4 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-black tracking-widest">房屋租賃定型化契約 (中英對照)</h1>
          <h2 className="text-sm font-bold text-slate-600 mt-1">Residential Tenancy Agreement</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs break-inside-avoid">
          <div>
            <p className="font-bold text-slate-800 mb-1 text-sm border-b border-slate-300 pb-1">出租人 (Landlord / Party A)</p>
            <p className="mt-2">姓名: <span className="font-semibold">{data.landlordName || '____________'}</span></p>
            <p>身分證號: <span className="font-semibold">{data.landlordId || '____________'}</span></p>
            <p>電話: <span className="font-semibold">{data.landlordPhone || '____________'}</span></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 mb-1 text-sm border-b border-slate-300 pb-1">承租人 (Tenant / Party B)</p>
            <p className="mt-2">姓名: <span className="font-semibold">{data.tenantName || '____________'}</span></p>
            <p>身分證號: <span className="font-semibold">{data.tenantId || '____________'}</span></p>
            <p>電話: <span className="font-semibold">{data.tenantPhone || '____________'}</span></p>
          </div>
        </div>

        <div className="space-y-6 text-sm">
          <div className="break-inside-avoid">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第一條：租賃標的與期間</h3>
            <p>租賃房屋座落於：<span className="font-semibold underline">{data.propertyAddress || '________________________'}</span>。</p>
            <p className="mt-1">自民國 <span className="font-semibold underline">{data.startDate || 'YYYY-MM-DD'}</span> 起至 <span className="font-semibold underline">{data.endDate || 'YYYY-MM-DD'}</span> 止。</p>
          </div>

          <div className="break-inside-avoid">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第二條：押金與匯款帳戶</h3>
            <p>押金為新臺幣 <span className="font-semibold underline">NT$ {Number(data.depositAmount).toLocaleString()}</span> 元整。</p>
            <p className="mt-1">匯款銀行代碼: <span className="font-semibold underline">{data.bankCode || '___'}</span> ； 帳號: <span className="font-semibold underline">{data.bankAccount || '_______________'}</span></p>
          </div>

          <div className="break-inside-avoid">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第三條：租金與各項費用明細</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-300">
              <ul className="space-y-3">
                <li><span className="font-bold">1. 房屋租金：</span> 每月新臺幣 <span className="font-black text-lg bg-yellow-200 px-1 mx-1">NT$ {Number(data.monthlyRent).toLocaleString()}</span> 元。</li>
                <li><span className="font-bold">2. 管理費用：</span> 每月新臺幣 <span className="font-semibold underline">NT$ {Number(data.managementFee || 0).toLocaleString()}</span> 元。</li>
                <li><span className="font-bold">3. 水費約定：</span> <span className="font-semibold">{data.waterFeeMethod || '依自來水公司帳單繳納'}</span>。</li>
                <li><span className="font-bold">4. 瓦斯費約定：</span> <span className="font-semibold">{data.gasFeeMethod || '依天然氣公司帳單繳納'}</span>。</li>
                <li><span className="font-bold">5. 網路/第四台：</span> 每月新臺幣 <span className="font-semibold underline">NT$ {Number(data.internetFee || 0).toLocaleString()}</span> 元。</li>
                <li><span className="font-bold">6. 電費約定：</span> 每度新臺幣 <span className="font-semibold underline">NT$ {data.electricityRate || 0}</span> 元。</li>
                
                {/* Dynamic Extra Fees Rendering */}
                {data.otherFees && data.otherFees.map((fee, idx) => (
                  <li key={idx}>
                    <span className="font-bold">{7 + idx}. {fee.name}：</span> 每月新臺幣 <span className="font-semibold underline">NT$ {Number(fee.amount).toLocaleString()}</span> 元。
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="break-inside-avoid mt-6">
            <h3 className="font-bold text-lg text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">第四條：特約條款</h3>
            <p className="whitespace-pre-wrap">{data.customClauses || '無'}</p>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-12 break-inside-avoid">
          <div className="relative">
            <p className="font-bold text-lg mb-16">出租人 (甲方) 簽章：</p>
            <div className="border-b-2 border-slate-400"></div>
            <p className="text-xs text-slate-500 mt-2">日期 (Date): 年 / 月 / 日</p>
            {data.landlordSignature && <img src={data.landlordSignature} alt="Sig" className="absolute top-6 left-4 h-16 mix-blend-multiply" />}
          </div>
          <div className="relative">
            <p className="font-bold text-lg mb-16">承租人 (乙方) 簽章：</p>
            <div className="border-b-2 border-slate-400"></div>
            <p className="text-xs text-slate-500 mt-2">日期 (Date): 年 / 月 / 日</p>
            {data.tenantSignature && <img src={data.tenantSignature} alt="Sig" className="absolute top-6 left-4 h-16 mix-blend-multiply" />}
          </div>
        </div>

        {/* LINE Bot QR Code */}
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
          </div>
        </div>

        {/* Photos */}
        {data.propertyImages.length > 0 && (
          <div className="pt-10 mt-10 border-t-2 border-slate-900 print:break-before-page break-inside-avoid">
            <h3 className="text-xl font-bold text-slate-900 border-l-4 border-slate-900 pl-2 mb-2">附件：房屋現況與設備附圖</h3>
            <div className="grid grid-cols-2 gap-6 mt-6">
              {data.propertyImages.map((src, idx) => (
                <div key={idx} className="border border-slate-300 p-2 bg-slate-50 shadow-sm">
                  <img src={src} alt={`Property condition ${idx + 1}`} className="w-full h-56 object-contain mix-blend-multiply bg-white" />
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