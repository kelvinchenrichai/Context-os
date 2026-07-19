import React, { useState } from 'react';
import { Bookmark, Tag as TagIcon, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface TagsPageProps {
  sources: Source[];
  projects: Project[];
  onViewSource: (id: string) => void;
  lang: Language;
}

export default function TagsPage({ sources, projects, onViewSource, lang }: TagsPageProps) {
  const t = TRANSLATIONS[lang];
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Group sources by tags dynamically
  const tagGroups: Record<string, Source[]> = {};
  sources.forEach(source => {
    source.tags.forEach(tag => {
      if (!tagGroups[tag]) {
        tagGroups[tag] = [];
      }
      if (!tagGroups[tag].some(s => s.id === source.id)) {
        tagGroups[tag].push(source);
      }
    });
  });

  const sortedTags = Object.keys(tagGroups).sort((a, b) => tagGroups[b].length - tagGroups[a].length);

  return (
    <div id="tags-page" className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6 bg-stone-50/60 dark:bg-stone-950/20">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5">
        <h1 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          {t.tags}
        </h1>
        <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
          {lang === 'zh-TW' ? '檢視所有自動生成與手動建立的知識標籤，並查看關聯的收藏內容' : 'Inspect the global vocabulary of tags index-mapped across projects.'}
        </p>
      </div>

      {/* Grid of tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedTags.map((tag) => {
          const isExpanded = selectedTag === tag;
          const associatedSources = tagGroups[tag];

          return (
            <div 
              key={tag}
              id={`tag-group-box-${tag}`}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden transition-all duration-150"
            >
              {/* Tag Header Row */}
              <button
                id={`btn-tag-header-${tag}`}
                onClick={() => setSelectedTag(isExpanded ? null : tag)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 dark:hover:bg-stone-950 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <TagIcon className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">
                    {tag}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                    {associatedSources.length} items
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              {/* Expanded Sources List */}
              {isExpanded && (
                <div className="border-t border-stone-100 dark:border-stone-800 bg-stone-50/45 dark:bg-stone-950/20 px-4 py-3 space-y-2">
                  {associatedSources.map(s => {
                    const matchedProj = projects.find(p => p.id === s.projectId);
                    return (
                      <div
                        key={s.id}
                        id={`tag-associated-${s.id}`}
                        onClick={() => onViewSource(s.id)}
                        className="p-2.5 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 rounded-lg border border-stone-150 dark:border-stone-850 shadow-sm cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-xs md:max-w-md">
                          {s.title}
                        </span>
                        {matchedProj && (
                          <span 
                            className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded border text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 bg-stone-50"
                            style={{ borderLeftColor: matchedProj.color, borderLeftWidth: '3.5px' }}
                          >
                            {matchedProj.name}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
