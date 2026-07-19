import React from 'react';
import { 
  Home, 
  Plus, 
  Layers, 
  Database, 
  Tag, 
  Search, 
  FileCode2, 
  Settings,
  Share2,
  LogOut
} from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { Language } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  sourcesCount: number;
  currentUser?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, lang, sourcesCount, currentUser, onLogout }: SidebarProps) {
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

  return (
    <aside id="premium-sidebar" className="hidden md:flex flex-col w-64 h-screen border-r border-stone-150 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-stone-150 dark:border-stone-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
          <span className="font-mono text-sm font-semibold tracking-wider">C</span>
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            {t.brandName}
          </span>
          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-widest leading-none">
            v1.0 MVP
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-xs transition-all duration-150 ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 font-bold shadow-md'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/60 dark:hover:bg-stone-900/60 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'scale-105' : 'opacity-85'}`} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-3 rounded-full bg-stone-100 dark:bg-stone-950" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Usage Progress Card */}
      <div id="sidebar-usage-widget" className="px-4 py-3 mx-4 mb-4 bg-stone-50 dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          <span>{lang === 'zh-TW' ? '上傳與分析額度' : 'Usage Quota'}</span>
          <span className="text-stone-900 dark:text-stone-100">{sourcesCount} / 100</span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-stone-900 dark:bg-stone-100 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (sourcesCount / 100) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[9px] text-stone-400 dark:text-stone-500 font-mono">
          <span>{lang === 'zh-TW' ? `剩餘 ${100 - sourcesCount} 個` : `${100 - sourcesCount} left`}</span>
          <span>{lang === 'zh-TW' ? '免費方案' : 'Free tier'}</span>
        </div>
      </div>

      {/* Account Info / Footer */}
      <div className="p-4 border-t border-stone-150 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center font-sans text-xs font-bold text-stone-900 dark:text-stone-100 shrink-0">
            {currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-xs font-medium text-stone-900 dark:text-stone-50 truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate leading-tight">
              {currentUser?.email || ''}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title={lang === 'zh-TW' ? '登出' : 'Sign out'}
              className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
