import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Globe2, 
  Loader2, 
  Plus, 
  FolderPlus 
} from 'lucide-react';
import { Project, Category, Language, ImportanceLevel, SourceType, SourcePlatform } from '../types';
import { TRANSLATIONS } from '../data';
import AIAnalysisStatus from '../components/AIAnalysisStatus';
import CategorySelect from '../components/CategorySelect';

interface SaveURLProps {
  projects: Project[];
  categories: Category[];
  onCreateCategory: (name: string) => void;
  onSave: (sourceData: {
    projectId: string;
    title: string;
    url: string;
    type: SourceType;
    platform: SourcePlatform;
    category: string;
    tags: string[];
    note: string;
    importance: ImportanceLevel;
    useCase: string;
    analyzeNow: boolean;
    includeInContext: boolean;
  }) => void;
  onBack: () => void;
  lang: Language;
}

export default function SaveURL({ projects, categories, onCreateCategory, onSave, onBack, lang }: SaveURLProps) {
  const t = TRANSLATIONS[lang];
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  // Preselect the project when arriving via /capture?projectId=... (e.g. the
  // "Add Source" button inside a Project Detail page).
  const preselectedProjectId = new URLSearchParams(window.location.search).get('projectId');
  const [projectId, setProjectId] = useState(
    (preselectedProjectId && projects.some(p => p.id === preselectedProjectId))
      ? preselectedProjectId
      : (projects[0]?.id || '')
  );
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [importance, setImportance] = useState<ImportanceLevel>('medium');
  const [useCase, setUseCase] = useState('程式參考');
  const [tagsInput, setTagsInput] = useState('');
  const [note, setNote] = useState('');
  const [analyzeNow, setAnalyzeNow] = useState(true);
  const [includeInContext, setIncludeInContext] = useState(true);

  // Flow control states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedProjectName, setSavedProjectName] = useState('');

  // Handle URL changes to auto-guess platform, type and prefill titles
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);

    // Auto-fill titles based on sample URLs to make MVP interactive
    if (value.includes('github.com')) {
      setTitle('github.com/quant-devs/delta-hedger-core');
      setCategory('Reference Code');
      setUseCase(lang === 'zh-TW' ? '程式參考' : 'Reference');
    } else if (value.includes('youtube.com') || value.includes('youtu.be')) {
      setTitle('CBOE Volatility Index VIX Trading Tutorial');
      setCategory('Video Lecture');
      setUseCase(lang === 'zh-TW' ? '交易研究' : 'Research');
    } else if (value.includes('instagram.com')) {
      setTitle('SaaS Hook Reels - Design Deconstruction');
      setCategory('Competitive Analysis');
      setUseCase(lang === 'zh-TW' ? 'UI 靈感' : 'Inspiration');
    } else if (value.includes('tiktok.com') || value.includes('douyin.com')) {
      setTitle('TikTok Growth Secrets 2026');
      setCategory('Competitive Analysis');
      setUseCase(lang === 'zh-TW' ? '內容靈感' : 'Inspiration');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Default title fallback
    const finalTitle = title.trim() || `Resource: ${new URL(url).hostname}`;

    // Get project name for success message
    const matchedProj = projects.find(p => p.id === projectId);
    setSavedProjectName(matchedProj ? matchedProj.name : 'Target Workspace');

    if (analyzeNow) {
      setIsAnalyzing(true);
    } else {
      triggerSave(finalTitle);
    }
  };

  const triggerSave = (finalTitle: string) => {
    // Guess Platform
    let platform: SourcePlatform = 'other';
    let type: SourceType = 'url';

    if (url.includes('github.com')) {
      platform = 'github';
      type = 'github';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
      type = 'youtube';
    } else if (url.includes('instagram.com')) {
      platform = 'instagram';
      type = 'instagram';
    } else if (url.includes('tiktok.com')) {
      platform = 'tiktok';
      type = 'tiktok';
    } else if (url.includes('douyin.com')) {
      platform = 'douyin';
      type = 'tiktok';
    } else if (url.endsWith('.pdf')) {
      platform = 'pdf';
      type = 'pdf';
    }

    // Process Tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      projectId,
      title: finalTitle,
      url,
      type,
      platform,
      category,
      tags,
      note,
      importance,
      useCase,
      analyzeNow,
      includeInContext,
    });

    setIsAnalyzing(false);
    setShowSuccess(true);
  };

  const handleAnalysisComplete = () => {
    const finalTitle = title.trim() || `Analyzed: ${new URL(url).hostname}`;
    triggerSave(finalTitle);
  };

  const handleResetForm = () => {
    setUrl('');
    setTitle('');
    setTagsInput('');
    setNote('');
    setShowSuccess(false);
  };

  if (isAnalyzing) {
    return (
      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-950 flex flex-col justify-center min-h-[400px]">
        <AIAnalysisStatus onComplete={handleAnalysisComplete} lang={lang} />
      </div>
    );
  }

  return (
    <div id="save-url-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-950">
      
      {/* Back button */}
      <button 
        id="btn-save-url-back"
        onClick={onBack}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-sans font-semibold transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'zh-TW' ? '返回' : 'Back'}</span>
      </button>

      {showSuccess ? (
        <div id="save-url-success-card" className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center space-y-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '資源收藏成功' : 'Captured Successfully'}
            </h2>
            <p className="font-sans text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              {lang === 'zh-TW' 
                ? `連結已被成功保存與索引編目至「${savedProjectName}」中。`
                : `Resource has been processed and safely stored into the active directory "${savedProjectName}".`}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onBack}
              className="px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-sans font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/40 cursor-pointer"
            >
              {lang === 'zh-TW' ? '返回前頁' : 'Back to Workspace'}
            </button>
            <button
              onClick={handleResetForm}
              className="px-4 py-2 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-lg text-xs font-sans font-semibold hover:bg-stone-850 dark:hover:bg-stone-200 cursor-pointer"
            >
              {lang === 'zh-TW' ? '收藏新網址' : 'Capture Another'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '收藏全新資料來源' : 'Capture URL & Index'}
            </h1>
            <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
              {lang === 'zh-TW' ? '貼上程式庫、PDF或影片，由 AI 對其進行剖析建檔' : 'Store GitHub repos, PDFs, web files, or videos with immediate categorization metadata.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* URL Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Source URL
              </label>
              <input
                id="save-url-input"
                type="url"
                required
                value={url}
                onChange={handleUrlChange}
                placeholder="https://github.com/..., https://youtube.com/..."
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
              />
            </div>

            {/* Custom Title (Auto fill fallback) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Resource Title
              </label>
              <input
                id="save-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give it a descriptive name (optional, AI can automatically generate this)"
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {t.projectSelector}
                </label>
                <select
                  id="save-project-select"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {t.categorySelector}
                </label>
                <CategorySelect
                  id="save-category-select"
                  categories={categories}
                  value={category}
                  onChange={setCategory}
                  onCreate={onCreateCategory}
                  lang={lang}
                />
              </div>
            </div>

            {/* Importance and Intended Use */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {t.importanceSelector}
                </label>
                <select
                  id="save-importance-select"
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as ImportanceLevel)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {t.useCaseSelector}
                </label>
                <select
                  id="save-usecase-select"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
                >
                  <option value="程式參考">{lang === 'zh-TW' ? '程式參考 (Coding Reference)' : 'Coding Reference'}</option>
                  <option value="交易研究">{lang === 'zh-TW' ? '交易研究 (Trading Model)' : 'Trading Model'}</option>
                  <option value="內容靈感">{lang === 'zh-TW' ? '內容靈感 (Content Inspiration)' : 'Content Inspiration'}</option>
                  <option value="UI 靈感">{lang === 'zh-TW' ? 'UI 靈感 (Visual Hook)' : 'Visual Hook'}</option>
                  <option value="API 文件">{lang === 'zh-TW' ? 'API 文件 (Integration Spec)' : 'Integration Spec'}</option>
                  <option value="稍後閱讀">{lang === 'zh-TW' ? '稍後閱讀 (Read later)' : 'Read later'}</option>
                </select>
              </div>
            </div>

            {/* Custom tags input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Custom Tags (comma separated)
              </label>
              <input
                id="save-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., Options, Volatility, yfinance"
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
              />
            </div>

            {/* Notes field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                Personal Annotation & Notes
              </label>
              <textarea
                id="save-note-input"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add custom hook descriptions, key takeaways, or specific files to reference..."
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 resize-none"
              />
            </div>

            {/* Logic switches */}
            <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-900">
              <label className="flex items-center gap-3 text-xs font-sans text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="save-analyze-now-checkbox"
                  type="checkbox"
                  checked={analyzeNow}
                  onChange={(e) => setAnalyzeNow(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-800 text-stone-900 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">{t.analyzeNow}</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-sans text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="save-include-context-checkbox"
                  type="checkbox"
                  checked={includeInContext}
                  onChange={(e) => setIncludeInContext(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-800 text-stone-900 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">{t.includeInContext}</span>
              </label>
            </div>

            {/* Actions button */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex justify-end gap-3">
              <button
                id="btn-save-cancel"
                type="button"
                onClick={onBack}
                className="px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-sans font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/40 cursor-pointer"
              >
                {lang === 'zh-TW' ? '取消' : 'Cancel'}
              </button>
              <button
                id="btn-save-submit"
                type="submit"
                className="px-4 py-2 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-lg text-xs font-sans font-semibold hover:bg-stone-850 dark:hover:bg-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {analyzeNow && <Sparkles className="w-3.5 h-3.5" />}
                <span>{lang === 'zh-TW' ? '儲存並索引' : 'Capture Link'}</span>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
