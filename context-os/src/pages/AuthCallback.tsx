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
      // Force a full page reload to `/` so the main App re-initialises
      // with the new token in localStorage — avoids React state timing issues
      window.location.href = '/';
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 mx-auto flex items-center justify-center animate-pulse">
          <span className="font-mono text-sm font-bold text-white dark:text-stone-900">C</span>
        </div>
        <p className="text-xs text-stone-400 font-sans">登入中，請稍候...</p>
      </div>
    </div>
  );
}
