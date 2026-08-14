import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { DashboardShell } from './components/DashboardShell';
import { ContractGenerator } from './components/ContractGenerator';
import { TenantReminderManager } from './components/TenantReminderManager';
import { Loader2, Plus, Home } from 'lucide-react';

export default function App() {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-medium text-slate-500">載入房東工作台...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthModal />;
  }

  return (
    <DashboardShell profile={profile} onSignOut={signOut}>
      {(currentTab) => {
        switch (currentTab) {
          case 'contract':
            return <ContractGenerator />;

          case 'receipts':
            return (
              <div className="max-w-4xl mx-auto space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">LINE 自動催繳與收據管理</h3>
                  <p className="text-xs text-slate-500">在此測試發送租金通知給房客</p>
                </div>
                <TenantReminderManager />
              </div>
            );

          case 'properties':
          default:
            return (
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">房產物件管理</h3>
                    <p className="text-xs text-slate-500">管理您的出租套房、公寓與電費設定</p>
                  </div>
                  <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
                    <Plus className="w-4 h-4" />
                    <span>新增物件 (Add Property)</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Home className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">尚未建立出租物件</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    點擊上方按鈕新增您的第一個出租套房或公寓，並開始自動化追蹤租金。
                  </p>
                </div>
              </div>
            );
        }
      }}
    </DashboardShell>
  );
}