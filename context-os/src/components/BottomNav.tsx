import React from 'react';
import { 
  Home, 
  Plus, 
  Layers, 
  Database, 
  FileCode2 
} from 'lucide-react';
import { TRANSLATIONS } from '../data';
import { Language } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
}

export default function BottomNav({ activeTab, setActiveTab, lang }: BottomNavProps) {
  const t = TRANSLATIONS[lang];

  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'save-url', label: t.capture, icon: Plus },
    { id: 'projects', label: t.projects, icon: Layers },
    { id: 'library', label: t.library, icon: Database },
    { id: 'export', label: 'Export', icon: FileCode2 },
  ];

  return (
    <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/95 backdrop-blur-md flex items-center justify-around px-2 pb-safe z-50 transition-colors duration-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            id={`bottom-nav-item-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-sans transition-all duration-150 ${
              isActive 
                ? 'text-stone-950 dark:text-stone-50 font-bold' 
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            <div className={`p-1.5 rounded-full transition-transform duration-150 ${
              isActive 
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-950 scale-105 shadow-sm' 
                : 'bg-transparent'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="mt-1 scale-90 tracking-wide font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
