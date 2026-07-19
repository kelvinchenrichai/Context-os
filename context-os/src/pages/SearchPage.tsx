import React, { useState, useMemo } from 'react';
import { Search, Command, Github, Video, Globe2, FileText, Image, Code2, BookOpen } from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface SearchPageProps {
  sources: Source[];
  projects: Project[];
  onViewSource: (id: string) => void;
  lang: Language;
}

// Highlight matching text in a string — wraps matched portions in a <mark> span
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim() || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-sm px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'github':    return <Github className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />;
    case 'youtube':   return <Video className="w-3.5 h-3.5 text-red-500" />;
    case 'instagram': return <Video className="w-3.5 h-3.5 text-pink-500" />;
    case 'tiktok':    return <Video className="w-3.5 h-3.5 text-stone-800 dark:text-stone-200" />;
    case 'pdf':       return <FileText className="w-3.5 h-3.5 text-orange-500" />;
    case 'image':     return <Image className="w-3.5 h-3.5 text-blue-400" />;
    case 'api':       return <Code2 className="w-3.5 h-3.5 text-violet-500" />;
    default:          return <Globe2 className="w-3.5 h-3.5 text-stone-400" />;
  }
}

// Returns the best "excerpt" to show under the result — prefers a field that
// actually matched the query so the user can see *why* it appeared.
function getMatchExcerpt(source: Source, query: string): string | null {
  if (!query.trim()) return null;
  const q = query.toLowerCase();

  if (source.aiSummary && source.aiSummary.toLowerCase().includes(q)) {
    // Show a short window around the match
    const idx = source.aiSummary.toLowerCase().indexOf(q);
    const start = Math.max(0, idx - 40);
    const end = Math.min(source.aiSummary.length, idx + query.length + 60);
    return (start > 0 ? '…' : '') + source.aiSummary.slice(start, end) + (end < source.aiSummary.length ? '…' : '');
  }
  if (source.note && source.note.toLowerCase().includes(q)) return source.note.slice(0, 120);
  if (source.useCase && source.useCase.toLowerCase().includes(q)) return source.useCase;
  if (source.aiKeyPoints) {
    const hit = source.aiKeyPoints.find(kp => kp.toLowerCase().includes(q));
    if (hit) return hit;
  }
  return null;
}

export default function SearchPage({ sources, projects, onViewSource, lang }: SearchPageProps) {
  const t = TRANSLATIONS[lang];
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Full-field search — covers every text field on a Source including AI output
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return sources.filter(s => {
      const fields = [
        s.title,
        s.url,
        s.note,
        s.category,
        s.platform,
        s.type,
        s.useCase,
        s.aiSummary,
        ...(s.aiKeyPoints || []),
        ...(s.aiSuggestedTags || []),
        ...(s.tags || []),
        // also match against the project name
        projects.find(p => p.id === s.projectId)?.name || '',
      ];
      return fields.some(f => f && f.toLowerCase().includes(q));
    }).filter(s => filterType === 'all' || s.type === filterType);
  }, [query, sources, projects, filterType]);

  // Collect all unique source types present in results for the filter chips
  const availableTypes = useMemo(() => {
    const types = new Set(sources.map(s => s.type));
    return Array.from(types);
  }, [sources]);

  return (
    <div id="search-page" className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto space-y-5 bg-white dark:bg-stone-950">

      {/* Search bar */}
      <div className="relative flex items-center bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3.5 shadow-sm focus-within:ring-1 focus-within:ring-stone-400 focus-within:border-stone-400">
        <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 mr-3" />
        <input
          id="search-omni-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'zh-TW'
            ? '搜尋標題、網址、備註、AI 摘要、標籤、分類…'
            : 'Search titles, URLs, notes, AI summaries, tags, categories…'}
          className="w-full bg-transparent text-xs font-sans text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-[10px] font-mono text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 ml-2 shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Type filter chips — only show when there are results */}
      {query.trim() !== '' && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold border transition-colors ${
              filterType === 'all'
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-400'
            }`}
          >
            {lang === 'zh-TW' ? '全部' : 'All'} {query.trim() && `(${results.length})`}
          </button>
          {availableTypes.map(type => {
            const count = sources.filter(s => s.type === type && (() => {
              const q = query.trim().toLowerCase();
              if (!q) return false;
              return [s.title, s.url, s.note, s.category, s.platform, s.type, s.useCase, s.aiSummary, ...(s.aiKeyPoints||[]), ...(s.tags||[])].some(f => f && f.toLowerCase().includes(q));
            })()).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold border transition-colors ${
                  filterType === type
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4 pt-1">
        {query.trim() === '' ? (
          <div className="text-center py-16 space-y-3">
            <Search className="w-6 h-6 text-stone-300 dark:text-stone-700 mx-auto" />
            <p className="font-sans font-semibold text-xs text-stone-700 dark:text-stone-300">
              {lang === 'zh-TW' ? '輸入任何文字開始尋找' : 'Type to start searching'}
            </p>
            <p className="font-sans text-[11px] text-stone-400 dark:text-stone-500 max-w-xs mx-auto leading-relaxed">
              {lang === 'zh-TW'
                ? '支援搜尋：標題、網址、備註、AI 摘要、AI 重點、標籤、分類、用途、平台、專案名稱'
                : 'Searches across: title, URL, note, AI summary, AI key points, tags, category, use case, platform, project name'}
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-sans font-semibold text-xs text-stone-500 dark:text-stone-400">
              {lang === 'zh-TW' ? `找不到「${query}」的相關資料` : `No results for "${query}"`}
            </p>
            <p className="font-sans text-[11px] text-stone-400 dark:text-stone-500 mt-1">
              {lang === 'zh-TW' ? '試試看不同的關鍵字或縮短搜尋詞' : 'Try different keywords or a shorter query'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              {lang === 'zh-TW' ? `找到 ${results.length} 筆結果` : `${results.length} result${results.length !== 1 ? 's' : ''}`}
            </span>

            {results.map((source) => {
              const proj = projects.find(p => p.id === source.projectId);
              const excerpt = getMatchExcerpt(source, query);
              return (
                <div
                  key={source.id}
                  id={`search-result-${source.id}`}
                  onClick={() => onViewSource(source.id)}
                  className="group p-4 bg-stone-50/50 dark:bg-stone-900/35 border border-stone-200 dark:border-stone-850 hover:border-stone-350 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-xl cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-stone-800 rounded shrink-0 mt-0.5">
                      {getPlatformIcon(source.platform)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Title */}
                      <h4 className="font-sans font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white leading-snug">
                        <Highlight text={source.title} query={query} />
                      </h4>

                      {/* URL */}
                      <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 truncate">
                        <Highlight text={source.url || ''} query={query} />
                      </p>

                      {/* Matching excerpt (note / aiSummary / keypoint) */}
                      {excerpt && (
                        <p className="text-[11px] font-sans text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 mt-1">
                          <Highlight text={excerpt} query={query} />
                        </p>
                      )}

                      {/* Tags + project + category chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {proj && (
                          <span
                            className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded border text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                            style={{ borderLeftColor: proj.color, borderLeftWidth: '3px' }}
                          >
                            {proj.name}
                          </span>
                        )}
                        <span className="text-[9px] font-sans text-stone-400 bg-stone-100 dark:bg-stone-800 dark:text-stone-500 px-1.5 py-0.5 rounded">
                          {source.category}
                        </span>
                        {source.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] font-mono text-stone-400 dark:text-stone-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
