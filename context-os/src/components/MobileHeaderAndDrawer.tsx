import React from 'react';
import { 
  Home, 
  Plus, 
  Layers, 
  Database, 
  Tag, 
  Search, 
  Share2, 
  FileCode2, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { Language } from '../types';

interface MobileHeaderAndDrawerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  sourcesCount: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}

export function MobileHeader({ 
  lang, 
  setIsOpen 
}: { 
  lang: Language; 
  setIsOpen: (open: boolean) => void; 
}) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950">
          <span className="font-mono text-xs font-bold">C</span>
        </div>
        <span className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          {t.brandName}
        </span>
      </div>

      <button
        type="button"
        id="mobile-hamburger-btn"
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>
    </header>
  );
}

export function MobileDrawer({
  activeTab,
  setActiveTab,
  lang,
  sourcesCount,
  isOpen,
  setIsOpen,
  currentUser,
  onLogout,
}: MobileHeaderAndDrawerProps) {
  const t = TRANSLATIONS[lang];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'save-url', label: t.capture, icon: Plus },
    { id: 'projects', label: t.projects, icon: Layers },
    { id: 'library', label: t.library, icon: Database },
    { id: 'tags', label: t.tags, icon: Tag },
    { id: 'search', label: t.search, icon: Search },
    { id: 'share', label: 'Share Capture', icon: Share2 },
    { id: 'export', label: t.export, icon: FileCode2 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[60] flex font-sans">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel content */}
      <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-850 shadow-2xl animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-250 dark:border-stone-850">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-stone-950 text-white dark:bg-stone-50 dark:text-stone-950">
              <span className="font-mono text-xs font-bold">C</span>
            </div>
            <span className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              {t.brandName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-900 border border-stone-200 dark:border-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`drawer-item-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100/60 dark:hover:bg-stone-900/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0 font-mono capitalize">
                    {item.id === 'settings' || item.id === 'tags' || item.id === 'search' ? 'utility' : ''}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quota Gauge widget */}
        <div className="p-4 mx-4 mb-4 bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            <span>{lang === 'zh-TW' ? '分析額度' : 'Quota'}</span>
            <span className="text-stone-900 dark:text-stone-100">{sourcesCount} / 100</span>
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-stone-900 dark:bg-stone-100 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (sourcesCount / 100) * 100)}%` }}
            />
          </div>
        </div>

        {/* Footer Account */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/10">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-sans text-xs font-bold text-stone-900 dark:text-stone-100">
              {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate leading-none mt-0.5">
                {currentUser?.email || ''}
              </p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title={lang === 'zh-TW' ? '登出' : 'Sign out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
