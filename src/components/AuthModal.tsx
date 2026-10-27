import React, { useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Building2, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
  /** Render only the card (used inside the landing page). */
  embedded?: boolean;
}

export function AuthModal({ onSuccess, embedded = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setNotice(null);

    if (!supabaseConfigured) {
      setErrorMessage('系統尚未完成設定（缺少 Supabase 連線資訊），暫時無法登入，請聯絡網站管理員。');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice('註冊成功！請到信箱點擊驗證連結後，再回來登入。');
          setIsSignUp(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      onSuccess?.();
    } catch (err: any) {
      const m = String(err?.message || '');
      setErrorMessage(
        /invalid login credentials/i.test(m) ? '電子郵件或密碼錯誤。'
        : /email not confirmed/i.test(m) ? '請先到信箱點擊驗證連結後再登入。'
        : /already registered/i.test(m) ? '此電子郵件已註冊，請直接登入。'
        : /failed to fetch|networkerror|load failed/i.test(m) ? '無法連線到伺服器，請檢查網路或稍後再試。'
        : m || '驗證失敗，請稍後再試。'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth" className={embedded ? 'w-full' : 'min-h-screen flex items-center justify-center p-4 bg-slate-900/10'}>
      <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {isSignUp ? '建立房東帳號' : '登入智慧房東系統'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isSignUp ? 'Taiwan AI Landlord Suite - 免費開始' : 'Taiwan AI Landlord Portal'}
          </p>
        </div>

        {notice && (
          <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">{notice}</div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                房東姓名 / Landlord Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="陳大文"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              電子郵件 / Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="landlord@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              密碼 / Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-xl shadow-lg shadow-indigo-200 transition duration-150 flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSignUp ? '註冊帳號 (Sign Up)' : '立即登入 (Sign In)'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMessage(null);
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            {isSignUp
              ? '已經有帳號？點此登入 (Already have an account? Sign in)'
              : '還沒有帳號？免費註冊 (New landlord? Sign up)'}
          </button>
        </div>
      </div>
    </div>
  );
}