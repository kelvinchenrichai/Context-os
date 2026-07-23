import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setToken } from '../api';

interface AuthCallbackProps {
  onLogin: () => Promise<void>;
}

export default function AuthCallback({ onLogin }: AuthCallbackProps) {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      setToken(token);
      // Use replace to avoid back-button issues, try multiple methods for iOS PWA
      try {
        window.location.replace('/');
      } catch {
        window.location.href = '/';
      }
    } else {
      window.location.replace('/');
    }
  }, []);

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
