import React, { useState } from 'react';
import { Sparkles, Globe, ArrowRight, CornerDownLeft, Loader2, FolderOpen } from 'lucide-react';
import { Project, Language, SourceType, SourcePlatform } from '../types';
import { TRANSLATIONS } from '../data';

interface QuickCaptureProps {
  projects: Project[];
  onSave: (url: string, projectId: string, analyzeNow: boolean) => void;
  lang: Language;
}

export default function QuickCapture({ projects, onSave, lang }: QuickCaptureProps) {
  const [url, setUrl] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isSubmitting) return;
    // Basic URL validation
    if (!url.trim().startsWith('http')) {
      return; // silently ignore non-URLs
    }
    setIsSubmitting(true);
    onSave(url, selectedProjectId, true);
    setUrl('');
    setIsSubmitting(false);
  };

  return (
    <div id="quick-capture-bar" className="w-full bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden transition-all duration-150 focus-within:border-stone-400 dark:focus-within:border-stone-700 focus-within:ring-1 focus-within:ring-stone-400 dark:focus-within:ring-stone-700">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-stretch md:items-center">
        {/* URL Input */}
        <div className="flex-1 flex items-center px-4 py-3.5 gap-3 border-b md:border-b-0 border-stone-100 dark:border-stone-800">
          <Globe className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0" />
          <input
            id="quick-capture-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.quickCapturePlaceholder}
            className="w-full bg-transparent text-stone-900 dark:text-stone-100 text-xs font-sans placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Controls Panel */}
        <div className="flex items-center justify-between md:justify-end gap-2 px-4 py-2 md:py-0 bg-stone-50/50 dark:bg-stone-900/30 md:bg-transparent border-t md:border-t-0 border-stone-100 dark:border-stone-800">
          {/* Project Selector */}
          <div className="flex items-center gap-1.5 border border-stone-150 dark:border-stone-800 rounded-lg px-2 py-1 bg-white dark:bg-stone-950">
            <FolderOpen className="w-3 h-3 text-stone-400 dark:text-stone-500" />
            <select
              id="quick-capture-project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-sans font-semibold text-stone-600 dark:text-stone-300 bg-transparent border-none focus:outline-none focus:ring-0 max-w-[120px]"
              disabled={isSubmitting}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action button */}
          <button
            id="quick-capture-save-btn"
            type="submit"
            disabled={isSubmitting || !url.trim()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all duration-150 ${
              url.trim()
                ? 'bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-400 dark:text-stone-600 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <span className="md:inline">{lang === 'zh-TW' ? '智慧儲存' : 'Capture'}</span>
                <CornerDownLeft className="hidden md:inline w-3 h-3 opacity-60" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
