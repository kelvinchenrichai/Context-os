import React, { useState } from 'react';
import { Search, Command, Layers, FileText, ArrowRight, Github, Video, Globe2 } from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface SearchPageProps {
  sources: Source[];
  projects: Project[];
  onViewSource: (id: string) => void;
  lang: Language;
}

export default function SearchPage({ sources, projects, onViewSource, lang }: SearchPageProps) {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-3.5 h-3.5" />;
      case 'youtube': return <Video className="w-3.5 h-3.5 text-red-500" />;
      case 'instagram': return <Video className="w-3.5 h-3.5 text-pink-500" />;
      default: return <Globe2 className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  // Live filter search results
  const results = query.trim() === '' 
    ? [] 
    : sources.filter(s => {
        const q = query.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.url.toLowerCase().includes(q) ||
          s.note.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q))
        );
      });

  return (
    <div id="search-page" className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto space-y-6 bg-white dark:bg-stone-950">
      
      {/* Omni input header bar */}
      <div className="relative flex items-center bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3.5 shadow-sm focus-within:ring-1 focus-within:ring-stone-400 focus-within:border-stone-400">
        <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 mr-3" />
        <input
          id="search-omni-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'zh-TW' ? '貼上關鍵字、標籤、專案名稱或任何備註進行即時搜尋...' : 'Search matching titles, categories, project workspaces, or annotations...'}
          className="w-full bg-transparent text-xs font-sans text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none"
          autoFocus
        />
        <div className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-white dark:bg-stone-950 px-2 py-0.5 rounded border border-stone-100 dark:border-stone-850">
          <Command className="w-2.5 h-2.5" />
          <span>F</span>
        </div>
      </div>

      {/* Results Display */}
      <div className="space-y-4 pt-2">
        {query.trim() === '' ? (
          <div className="text-center py-16 text-stone-400 text-xs font-sans space-y-2">
            <Command className="w-6 h-6 text-stone-300 dark:text-stone-700 mx-auto" />
            <p className="font-semibold text-stone-700 dark:text-stone-300">
              {lang === 'zh-TW' ? '輸入任何文字開始尋找' : 'Type to start querying'}
            </p>
            <p className="text-stone-400 dark:text-stone-500 scale-90 max-w-[240px] mx-auto">
              {lang === 'zh-TW' ? '搜尋將涵蓋所有的專案、PDF、程式碼及標籤' : 'Searches are vectorized instantly across titles, tags, notes, and AI logs.'}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-stone-400 text-xs font-sans">
            <p className="font-semibold text-stone-500">No matching search results found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              {results.length} Search Results Found
            </span>
            <div className="space-y-2.5">
              {results.map((source) => {
                const proj = projects.find(p => p.id === source.projectId);
                return (
                  <div
                    key={source.id}
                    id={`search-result-${source.id}`}
                    onClick={() => onViewSource(source.id)}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-stone-50/50 dark:bg-stone-900/35 border border-stone-200 dark:border-stone-850 hover:border-stone-350 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white dark:bg-stone-800 rounded shrink-0 text-stone-600">
                        {getPlatformIcon(source.platform)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-stone-950 dark:group-hover:text-white">
                          {source.title}
                        </h4>
                        <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 truncate mt-0.5">
                          {source.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3.5 md:mt-0 shrink-0">
                      {proj && (
                        <span 
                          className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md border text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 bg-white"
                          style={{ borderLeftColor: proj.color, borderLeftWidth: '3.5px' }}
                        >
                          {proj.name}
                        </span>
                      )}
                      <span className="text-[9.5px] font-sans text-stone-400 bg-stone-100 dark:bg-stone-800 dark:text-stone-500 px-1.5 py-0.5 rounded">
                        {source.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
