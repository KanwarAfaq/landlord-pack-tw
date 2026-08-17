import React, { useState } from 'react';
import { Check, X, Crown, Building, MessageCircle, FileText } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function UpgradeModal({ isOpen, onClose, onSubscribe }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsLoading(true);
    onSubscribe();
    // In the next step, this will redirect to Stripe Checkout
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Pitch */}
        <div className="w-full md:w-1/2 bg-indigo-600 p-10 text-white flex flex-col justify-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/50 px-3 py-1 rounded-full w-max mb-6 border border-indigo-400">
            <Crown className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold tracking-wider">PRO PLAN</span>
          </div>
          <h2 className="text-3xl font-black mb-4 leading-tight">解放自動化管理<br/>擴展您的租賃事業</h2>
          <p className="text-indigo-100 mb-8 text-sm leading-relaxed">
            免費版最多支援 5 間物件。升級 Pro 方案，無限制管理所有房產，並解鎖進階 LINE 機器人自動催繳功能。
          </p>
          
          <ul className="space-y-4">
            <li className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-1.5 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="text-sm font-medium">無限制物件與租客數量 (Unlimited Properties)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-1.5 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="text-sm font-medium">自訂 LINE 官方帳號綁定 (Custom LINE Bot)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-1.5 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="text-sm font-medium">自動化租金催繳與收據 (Auto-Reminders)</span>
            </li>
            <li className="flex items-center space-x-3">
              <div className="bg-indigo-500 p-1.5 rounded-full"><Check className="w-4 h-4 text-white" /></div>
              <span className="text-sm font-medium">完整電子合約無浮水印 (No Watermarks)</span>
            </li>
          </ul>
        </div>

        {/* Right Side: Pricing Card */}
        <div className="w-full md:w-1/2 p-10 bg-slate-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 w-full max-w-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">專業房東訂閱 (Pro Landlord)</h3>
            <p className="text-xs text-slate-500 mb-6">按月計費，隨時可取消。</p>
            
            <div className="flex items-end space-x-1 mb-8">
              <span className="text-4xl font-black text-indigo-600">NT$ 499</span>
              <span className="text-sm font-bold text-slate-400 mb-1">/ 月 (mo)</span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span>導向安全結帳頁面... (Redirecting...)</span>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <span>立即升級 (Upgrade Now)</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-4 font-medium">
              透過 Stripe 安全加密付款 (Secure payment via Stripe)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}