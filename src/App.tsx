import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { DashboardShell } from './components/DashboardShell';
import { ContractGenerator } from './components/ContractGenerator';
import { TenantReminderManager } from './components/TenantReminderManager';
import { PropertiesDashboard } from './components/PropertiesDashboard';
import { TenantsDashboard } from './components/TenantsDashboard';
import { SettingsDashboard } from './components/SettingsDashboard';
import { Loader2 } from 'lucide-react';

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
          case 'properties':
            return <PropertiesDashboard />;
            
          case 'tenants':
            return <TenantsDashboard />;

          case 'contract':
          case 'contracts':
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
            
          case 'settings':
            return <SettingsDashboard />;

          default:
            return <PropertiesDashboard />;
        }
      }}
    </DashboardShell>
  );
}