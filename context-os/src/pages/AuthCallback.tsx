import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setToken } from '../api';

interface AuthCallbackProps {
  onLogin: () => Promise<void>;
}

export default function AuthCallback({ onLogin }: AuthCallbackProps) {
  const location = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const err = params.get('error');

    if (token) {
      setToken(token);
      // Use replace to avoid back-button issues, try multiple methods for iOS PWA
      try {
        window.location.replace('/');
      } catch {
        window.location.href = '/';
      }
      return;
    }

    // No token: show why instead of silently bouncing back to login, which
    // used to look like the login button "did nothing" and invited repeated
    // clicking (each click re-running the same failing flow).
    setError(err || 'no_token');
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 mx-auto flex items-center justify-center">
            <span className="font-mono text-lg font-bold text-white dark:text-stone-900">!</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-sans font-semibold text-stone-700 dark:text-stone-300">
              登入失敗
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 font-sans break-all">
              {error}
            </p>
          </div>
          <a
            href="/"
            className="inline-block text-sm font-sans font-semibold text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 rounded-xl px-4 py-2"
          >
            重新登入
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-stone-100 mx-auto flex items-center justify-center animate-pulse">
          <span className="font-mono text-lg font-bold text-white dark:text-stone-900">C</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-sans font-semibold text-stone-700 dark:text-stone-300">
            登入中，請稍候...
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-sans">
            Signing you in...
          </p>
        </div>
      </div>
    </div>
  );
}
