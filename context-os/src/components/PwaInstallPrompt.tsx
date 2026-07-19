import React, { useState, useEffect } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { Language } from '../types';

interface PwaInstallPromptProps {
  lang: Language;
}

export default function PwaInstallPrompt({ lang }: PwaInstallPromptProps) {
  const zh = lang === 'zh-TW';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    if (isInStandaloneMode) return; // already installed
    if (localStorage.getItem('pwa_prompt_dismissed')) return;

    if (isIos) {
      // Show iOS guide after 5 seconds
      const t = setTimeout(() => setShowIosGuide(true), 5000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    setDismissed(true);
    localStorage.setItem('pwa_prompt_dismissed', '1');
  };

  // Android install banner
  if (showPrompt && !dismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom-4">
        <div className="p-2 bg-stone-900 dark:bg-stone-100 rounded-lg shrink-0">
          <Download className="w-4 h-4 text-white dark:text-stone-900" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-sans font-bold text-stone-900 dark:text-stone-100">
            {zh ? '安裝 Context OS App' : 'Install Context OS'}
          </p>
          <p className="text-[11px] font-sans text-stone-500 dark:text-stone-400 leading-relaxed">
            {zh
              ? '安裝後可從主畫面直接開啟，並支援從其他 App 分享網址進來。'
              : 'Install for quick access and to enable Share from other apps.'}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-[11px] font-semibold"
            >
              {zh ? '安裝' : 'Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-stone-400 text-[11px] font-semibold"
            >
              {zh ? '之後再說' : 'Later'}
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="shrink-0 text-stone-400 hover:text-stone-600 p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // iOS guide banner
  if (showIosGuide && !dismissed) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-stone-500" />
            <p className="text-xs font-sans font-bold text-stone-900 dark:text-stone-100">
              {zh ? '加入主畫面（iOS）' : 'Add to Home Screen (iOS)'}
            </p>
          </div>
          <button onClick={handleDismiss} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-sans text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded">
              <Share className="w-3.5 h-3.5" />
            </span>
            <span>{zh ? '點分享' : 'Tap Share'}</span>
          </div>
          <span className="text-stone-300">→</span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="p-1.5 bg-stone-100 dark:bg-stone-800 rounded">
              <Plus className="w-3.5 h-3.5" />
            </span>
            <span>{zh ? '加入主畫面' : 'Add to Home Screen'}</span>
          </div>
        </div>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed">
          {zh
            ? '安裝後，在 YouTube/IG/TikTok 按「分享」時，就能選擇「Context OS」直接儲存到你的專案。'
            : 'After installing, use the iOS Share sheet from YouTube/IG/TikTok to save directly to Context OS.'}
        </p>
      </div>
    );
  }

  return null;
}
