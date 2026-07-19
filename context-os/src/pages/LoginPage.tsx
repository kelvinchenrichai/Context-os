import React, { useState } from 'react';
import { devLogin, setToken } from '../api';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDevLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await devLogin('kelvin@contextOS.app', 'Kelvin');
      setToken(result.token);
      onLogin();
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://context-os-api.kelvinchenrichai.workers.dev/auth/google/start';
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100">
            <span className="font-mono text-xl font-bold text-white dark:text-stone-900">C</span>
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Context OS
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Save anything. Build AI-ready context.
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-8 space-y-4 shadow-sm">
          <h2 className="font-sans text-sm font-semibold text-stone-700 dark:text-stone-300 text-center">
            登入你的帳號
          </h2>

          {error && (
            <p className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-950/30 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          {/* Google OAuth (enabled when configured) */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-sans font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            使用 Google 帳號登入
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200 dark:border-stone-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-2 bg-white dark:bg-stone-900 text-stone-400">或</span>
            </div>
          </div>

          {/* Dev login */}
          <button
            onClick={handleDevLogin}
            disabled={loading}
            className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-sm font-sans font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? '登入中...' : '開發者快速登入（Demo）'}
          </button>

          <p className="text-[10px] text-stone-400 dark:text-stone-500 text-center leading-relaxed">
            開發者登入不需要密碼，適合本地測試使用。正式上線後請使用 Google 登入。
          </p>
        </div>

      </div>
    </div>
  );
}
