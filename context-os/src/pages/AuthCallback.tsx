import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setToken } from '../api';
import { PENDING_COPY_KEY } from './PublicProjectPage';

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
      // If the user got here via "copy this public project" while logged
      // out, send them back to that project's page instead of the
      // dashboard — it auto-resumes the copy once it sees the new token.
      const pendingCopySlug = localStorage.getItem(PENDING_COPY_KEY);
      const dest = pendingCopySlug ? `/p/${pendingCopySlug}` : '/';
      // Use replace to avoid back-button issues, try multiple methods for iOS PWA
      try {
        window.location.replace(dest);
      } catch {
        window.location.href = dest;
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
          <img src="/mascot/mascot-sorry.svg" alt="" className="w-14 h-14 mx-auto" />
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
            className="inline-block text-sm font-sans font-semibold text-white dark:text-keepo-950 bg-keepo-600 dark:bg-keepo-400 rounded-xl px-4 py-2"
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
        <img src="/mascot/mascot-thinking.svg" alt="" className="w-14 h-14 mx-auto animate-pulse" />
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
