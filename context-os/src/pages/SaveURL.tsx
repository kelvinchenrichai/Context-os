import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Check, Globe2, Loader2, Link2, X, Clipboard
} from 'lucide-react';
import { Project, Category, Language, ImportanceLevel, SourceType, SourcePlatform } from '../types';
import { TRANSLATIONS } from '../data';
import CategorySelect from '../components/CategorySelect';
import { getToken } from '../api';

const API_BASE = 'https://context-os-api.kelvinchenrichai.workers.dev';

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
  }) => Promise<void> | void;
  onBack: () => void;
  lang: Language;
}

function detectPlatform(url: string): { type: SourceType; platform: SourcePlatform } {
  if (url.includes('github.com')) return { type: 'github', platform: 'github' };
  if (url.includes('youtube.com') || url.includes('youtu.be')) return { type: 'youtube', platform: 'youtube' };
  if (url.includes('instagram.com')) return { type: 'instagram', platform: 'instagram' };
  if (url.includes('tiktok.com')) return { type: 'tiktok', platform: 'tiktok' };
  if (url.includes('douyin.com')) return { type: 'tiktok', platform: 'douyin' };
  if (url.endsWith('.pdf')) return { type: 'pdf', platform: 'pdf' };
  return { type: 'url', platform: 'website' };
}

export default function SaveURL({ projects, categories, onCreateCategory, onSave, onBack, lang }: SaveURLProps) {
  const t = TRANSLATIONS[lang];
  const zh = lang === 'zh-TW';

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaFetched, setMetaFetched] = useState(false);

  const preselectedProjectId = new URLSearchParams(window.location.search).get('projectId');
  const [projectId, setProjectId] = useState(
    (preselectedProjectId && projects.some(p => p.id === preselectedProjectId))
      ? preselectedProjectId
      : (projects[0]?.id || '')
  );
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [importance, setImportance] = useState<ImportanceLevel>('medium');
  const [useCase, setUseCase] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [note, setNote] = useState('');
  const [analyzeNow, setAnalyzeNow] = useState(true);
  const [includeInContext, setIncludeInContext] = useState(true);

  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedSourceId, setSavedSourceId] = useState<string | null>(null);

  // Clipboard detection
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const clipboardChecked = useRef(false);

  useEffect(() => {
    if (clipboardChecked.current) return;
    clipboardChecked.current = true;

    // Check clipboard for URL on mount
    if (navigator.clipboard?.readText) {
      navigator.clipboard.readText().then(text => {
        const trimmed = text.trim();
        if (trimmed.startsWith('http') && trimmed.length < 2000 && !url) {
          setClipboardUrl(trimmed);
        }
      }).catch(() => {});
    }
  }, []);

  const applyClipboardUrl = () => {
    if (clipboardUrl) {
      setUrl(clipboardUrl);
      setClipboardUrl(null);
      fetchMetadata(clipboardUrl);
    }
  };

  // Auto-fetch metadata after URL is pasted (debounced)
  const metaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setMetaFetched(false);
    setTitle('');
    setDescription('');
    setImageUrl(null);

    if (metaTimer.current) clearTimeout(metaTimer.current);
    if (value.startsWith('http')) {
      metaTimer.current = setTimeout(() => fetchMetadata(value), 800);
    }
  };

  const fetchMetadata = async (targetUrl: string) => {
    setMetaLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/metadata/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json() as any;
      if (data.success && data.data) {
        const meta = data.data;
        setTitle(meta.title || '');
        setDescription(meta.description || '');
        setImageUrl(meta.imageUrl || null);
        setMetaFetched(true);

        // Auto-set category based on platform
        if (meta.platform === 'youtube') setCategory('Video Lecture');
        else if (meta.platform === 'github') setCategory('Reference Code');
        else if (meta.platform === 'instagram' || meta.platform === 'tiktok') setCategory('Competitive Analysis');
      }
    } catch {}
    finally { setMetaLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || saving) return;

    const finalTitle = title.trim() || (() => { try { return `Resource: ${new URL(url).hostname}`; } catch { return url.slice(0, 60); } })();
    const { type, platform } = detectPlatform(url);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    setSaving(true);
    try {
      await onSave({
        projectId, title: finalTitle, url, type, platform,
        category, tags, note, importance, useCase,
        analyzeNow,
        includeInContext,
      });

      // If analyze now, call AI analysis after save
      if (analyzeNow) {
        setAnalyzing(true);
        // The source was just created — we need its ID
        // We'll trigger analysis via the App's loadData which updates sources
        // For now show success and let background analysis happen
        setTimeout(() => setAnalyzing(false), 2000);
      }

      setShowSuccess(true);
    } catch (err: any) {
      alert(err.message || (zh ? '儲存失敗' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setUrl(''); setTitle(''); setDescription(''); setImageUrl(null);
    setNote(''); setTagsInput(''); setMetaFetched(false);
    setShowSuccess(false); setSavedSourceId(null);
  };

  // ── Success screen ──────────────────────────────────────────────────────────

  if (showSuccess) {
    const proj = projects.find(p => p.id === projectId);
    return (
      <div className="flex-grow overflow-y-auto flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-stone-950 min-h-full">
        <div className="text-center space-y-5 max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
            <Check className="w-7 h-7 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h2 className="font-sans text-base font-bold text-stone-900 dark:text-stone-100">
              {zh ? '已成功儲存！' : 'Saved successfully!'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {zh ? `已加入「${proj?.name || '專案'}」` : `Added to "${proj?.name || 'project'}"`}
            </p>
            {analyzing && (
              <p className="text-xs text-indigo-500 flex items-center justify-center gap-1.5 mt-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {zh ? 'AI 分析中...' : 'AI analyzing...'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={resetForm} className="flex-1 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold">
              {zh ? '再存一個' : 'Save another'}
            </button>
            <button onClick={onBack} className="flex-1 py-2 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold">
              {zh ? '返回' : 'Back'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-950">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-sans text-lg font-semibold text-stone-900 dark:text-stone-100">
            {zh ? '新增資料來源' : 'Add Source'}
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {zh ? '貼上網址，AI 自動擷取標題與摘要' : 'Paste a URL — AI fetches title and summary automatically'}
          </p>
        </div>
      </div>

      {/* Clipboard detection banner */}
      {clipboardUrl && (
        <div className="flex items-center gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-sans">
          <Clipboard className="w-4 h-4 text-indigo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-indigo-800 dark:text-indigo-300">
              {zh ? '偵測到剪貼簿網址' : 'URL detected in clipboard'}
            </p>
            <p className="text-indigo-600 dark:text-indigo-400 truncate">{clipboardUrl}</p>
          </div>
          <button onClick={applyClipboardUrl} className="shrink-0 px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold">
            {zh ? '使用' : 'Use'}
          </button>
          <button onClick={() => setClipboardUrl(null)} className="shrink-0 text-indigo-400 hover:text-indigo-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* URL input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            URL *
          </label>
          <div className="relative flex items-center">
            <Globe2 className="absolute left-3 w-4 h-4 text-stone-400 dark:text-stone-500" />
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://..."
              required
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-10 py-2.5 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
            />
            {metaLoading && (
              <Loader2 className="absolute right-3 w-4 h-4 text-stone-400 animate-spin" />
            )}
            {metaFetched && !metaLoading && (
              <Check className="absolute right-3 w-4 h-4 text-emerald-500" />
            )}
          </div>
        </div>

        {/* Metadata preview card */}
        {(metaFetched || metaLoading) && (
          <div className="flex gap-3 p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
            {imageUrl && (
              <img src={imageUrl} alt="" className="w-16 h-12 object-cover rounded-lg shrink-0 bg-stone-200" onError={e => (e.currentTarget.style.display = 'none')} />
            )}
            {metaLoading ? (
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-stone-200 dark:bg-stone-800 rounded animate-pulse w-full" />
              </div>
            ) : (
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-xs font-sans font-semibold text-stone-800 dark:text-stone-200 line-clamp-1">{title}</p>
                {description && <p className="text-[11px] font-sans text-stone-500 dark:text-stone-400 line-clamp-2">{description}</p>}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {zh ? '標題' : 'Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={zh ? '自動填入，或手動修改' : 'Auto-filled from URL, or edit manually'}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Project + Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {zh ? '專案' : 'Project'}
            </label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {zh ? '分類' : 'Category'}
            </label>
            <CategorySelect
              categories={categories}
              value={category}
              onChange={setCategory}
              onCreate={onCreateCategory}
              lang={lang}
            />
          </div>
        </div>

        {/* Tags + Note */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {zh ? '標籤（逗號分隔）' : 'Tags (comma-separated)'}
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder={zh ? '例如：Trading, Python, API' : 'e.g. Trading, Python, API'}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {zh ? '備註' : 'Note'}
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={zh ? '這個資料有什麼用途或值得注意的地方？' : 'Why are you saving this? Any notes?'}
            rows={2}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>

        {/* Importance */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {zh ? '重要程度' : 'Importance'}
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high', 'critical'] as ImportanceLevel[]).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setImportance(level)}
                className={`flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                  importance === level
                    ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-900'
                    : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-400'
                }`}
              >
                {level === 'low' ? (zh ? '低' : 'Low') : level === 'medium' ? (zh ? '中' : 'Mid') : level === 'high' ? (zh ? '高' : 'High') : (zh ? '關鍵' : 'Key')}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 pt-1">
          {[
            {
              id: 'analyze',
              checked: analyzeNow,
              onChange: () => setAnalyzeNow(v => !v),
              label: zh ? '立即 AI 分析' : 'Analyze with AI now',
              desc: zh ? 'Groq AI 自動產生摘要、重點與標籤建議' : 'Groq AI generates summary, key points & tag suggestions',
              icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" />,
            },
            {
              id: 'context',
              checked: includeInContext,
              onChange: () => setIncludeInContext(v => !v),
              label: zh ? '加入 Context' : 'Include in Context',
              desc: zh ? '匯出 AI Prompt 時包含此資料' : 'Include when exporting AI context prompt',
              icon: <Link2 className="w-3.5 h-3.5 text-stone-400" />,
            },
          ].map(item => (
            <label
              key={item.id}
              htmlFor={`toggle-${item.id}`}
              className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
            >
              {item.icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans font-semibold text-stone-800 dark:text-stone-200">{item.label}</p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
              <input
                id={`toggle-${item.id}`}
                type="checkbox"
                checked={item.checked}
                onChange={item.onChange}
                className="w-4 h-4 rounded accent-stone-900 dark:accent-stone-100 shrink-0 cursor-pointer"
              />
            </label>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-2 pb-6">
          <button
            type="submit"
            disabled={!url.trim() || saving}
            className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-sm font-sans font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{zh ? '儲存中...' : 'Saving...'}</>
            ) : (
              <><Check className="w-4 h-4" />{zh ? '儲存資料來源' : 'Save Source'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
