import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  FileText, 
  Receipt, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Crown,
  Bell
} from 'lucide-react';
import type { Profile } from '../types/database';

interface DashboardShellProps {
  profile: Profile | null;
  onSignOut: () => void;
  children: (currentTab: string) => React.ReactNode;
}

export function DashboardShell({ profile, onSignOut, children }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<'properties' | 'tenants' | 'contract' | 'receipts' | 'settings'>('properties');

  const navItems = [
    { id: 'properties', label: '房產物件 (Properties)', icon: Building },
    { id: 'tenants', label: '租客管理 (Tenants)', icon: Users },
    { id: 'contract', label: 'AI 合約生成 (Contracts)', icon: FileText },
    { id: 'receipts', label: '租金收據 (Receipts)', icon: Receipt },
    { id: 'settings', label: '系統設定 (Settings)', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight">AI 智慧房東</h1>
              <p className="text-[11px] text-slate-500 font-medium">Taiwan Landlord Suite</p>
            </div>
          </div>

          {/* User Tier Badge */}
          <div className="px-6 py-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {profile?.full_name || 'Landlord'}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <Crown className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {profile?.subscription_tier || 'Free'} Plan
                  </span>
                </div>
              </div>
              <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                升級 Pro
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onSignOut}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>登出系統 (Sign Out)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            {navItems.find((n) => n.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 right-2 ring-2 ring-white" />
            </button>
            <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition">
              <PlusCircle className="w-4 h-4" />
              <span>快速新增</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children(activeTab)}
        </main>
      </div>
    </div>
  );
}