import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Sparkles, Check, Globe2, Loader2, Link2, X, Clipboard, Image as ImageIcon, Upload, AlertTriangle
} from 'lucide-react';
import { Project, Category, Language, ImportanceLevel, SourceType, SourcePlatform } from '../types';
import { TRANSLATIONS } from '../data';
import CategorySelect from '../components/CategorySelect';
import { getToken, uploadImage, fetchImageUsage } from '../api';
import { compressImage, formatBytes } from '../imageCompress';

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
    imageUrl?: string;
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

  // Two capture modes: paste a URL, or upload an image/screenshot
  const [mode, setMode] = useState<'url' | 'image'>('url');

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaFetched, setMetaFetched] = useState(false);

  // Image upload mode state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUsage, setImageUsage] = useState<{ used: number; limit: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'image') {
      fetchImageUsage().then(setImageUsage).catch(() => {});
    }
  }, [mode]);

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

  // ── Image upload handlers ─────────────────────────────────────────────────

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    // Client-side guardrails before we even try uploading
    if (!file.type.startsWith('image/')) {
      setUploadError(zh ? '請選擇圖片檔案（JPEG/PNG/WEBP/GIF）。' : 'Please select an image file (JPEG/PNG/WEBP/GIF).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(zh ? '檔案太大，請選擇 10MB 以內的圖片。' : 'File too large — please choose an image under 10MB.');
      return;
    }
    if (imageUsage && imageUsage.limit !== -1 && imageUsage.used >= imageUsage.limit) {
      setUploadError(zh
        ? `已達圖片上傳上限（${imageUsage.limit} 張），請升級方案。`
        : `Image upload limit reached (${imageUsage.limit}). Please upgrade your plan.`);
      return;
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''));

    // Upload immediately (compressed) so the user sees progress right away
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const result = await uploadImage(compressed);
      setUploadedImageUrl(result.imageUrl);
      setImageUsage(prev => prev ? { ...prev, used: prev.used + 1 } : prev);
    } catch (e: any) {
      setUploadError(e.message || (zh ? '上傳失敗，請再試一次。' : 'Upload failed — please try again.'));
      setImageFile(null);
      setImagePreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setUploadedImageUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImageUrl || saving || uploading) return;

    setSaving(true);
    try {
      await onSave({
        projectId,
        title: title.trim() || (zh ? '未命名圖片' : 'Untitled Image'),
        url: uploadedImageUrl,
        type: 'image',
        platform: 'other',
        category, tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        note, importance, useCase,
        analyzeNow, includeInContext,
        imageUrl: uploadedImageUrl,
      });
      if (analyzeNow) {
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 2000);
      }
      setShowSuccess(true);
    } catch (err: any) {
      alert(err.message || (zh ? '儲存失敗' : 'Save failed'));
    } finally {
      setSaving(false);
    }
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
    clearImage();
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
              <p className="text-xs text-keepo-500 flex items-center justify-center gap-1.5 mt-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {zh ? 'AI 分析中...' : 'AI analyzing...'}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={resetForm} className="flex-1 py-2 bg-keepo-600 dark:bg-keepo-400 text-white dark:text-keepo-950 rounded-xl text-xs font-semibold">
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

      {/* Mode switcher: URL vs Image upload */}
      <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
            mode === 'url'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          {zh ? '貼上網址' : 'Paste URL'}
        </button>
        <button
          type="button"
          onClick={() => setMode('image')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
            mode === 'image'
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {zh ? '上傳圖片' : 'Upload Image'}
        </button>
      </div>

      {/* Clipboard detection banner */}
      {mode === 'url' && clipboardUrl && (
        <div className="flex items-center gap-3 p-3.5 bg-keepo-50 dark:bg-keepo-950/30 border border-keepo-200 dark:border-keepo-800 rounded-xl text-xs font-sans">
          <Clipboard className="w-4 h-4 text-keepo-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-keepo-800 dark:text-keepo-300">
              {zh ? '偵測到剪貼簿網址' : 'URL detected in clipboard'}
            </p>
            <p className="text-keepo-600 dark:text-keepo-400 truncate">{clipboardUrl}</p>
          </div>
          <button onClick={applyClipboardUrl} className="shrink-0 px-2.5 py-1 bg-keepo-600 text-white rounded-lg font-semibold">
            {zh ? '使用' : 'Use'}
          </button>
          <button onClick={() => setClipboardUrl(null)} className="shrink-0 text-keepo-400 hover:text-keepo-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {mode === 'image' ? (
        <form onSubmit={handleImageSubmit} className="space-y-5">

          {/* Image usage quota */}
          {imageUsage && (
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-sans ${
              imageUsage.limit !== -1 && imageUsage.used >= imageUsage.limit
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                : 'bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400'
            }`}>
              <span>{zh ? '圖片上傳額度' : 'Image upload quota'}</span>
              <span className="font-mono font-semibold">
                {imageUsage.used} / {imageUsage.limit === -1 ? '∞' : imageUsage.limit}
              </span>
            </div>
          )}

          {/* Upload zone */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {zh ? '圖片 / 截圖 *' : 'Image / Screenshot *'}
            </label>

            {!imagePreviewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl hover:border-stone-400 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors"
              >
                <Upload className="w-6 h-6 text-stone-400" />
                <span className="text-xs font-sans font-semibold text-stone-600 dark:text-stone-400">
                  {zh ? '點擊選擇圖片' : 'Tap to choose an image'}
                </span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">
                  JPEG / PNG / WEBP / GIF · {zh ? '最大 10MB' : 'up to 10MB'}
                </span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                <img src={imagePreviewUrl} alt="" className="w-full max-h-64 object-contain bg-stone-50 dark:bg-stone-900" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="text-xs font-sans font-semibold text-white">{zh ? '上傳中…' : 'Uploading…'}</span>
                  </div>
                )}
                {!uploading && uploadedImageUrl && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-emerald-600 rounded-lg text-[10px] font-sans font-semibold text-white">
                    <Check className="w-3 h-3" />
                    {zh ? '已上傳' : 'Uploaded'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {imageFile && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded-lg text-[10px] font-mono text-white">
                    {formatBytes(imageFile.size)}
                  </div>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadError && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {zh ? '標題' : 'Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={zh ? '這張圖片是什麼？' : 'What is this image?'}
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

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {zh ? '備註' : 'Note'}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={zh ? '這張圖片有什麼用途或值得注意的地方？' : 'Why are you saving this? Any notes?'}
              rows={2}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>

          {/* AI analyze toggle */}
          <label
            htmlFor="toggle-analyze-image"
            className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-keepo-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-semibold text-stone-800 dark:text-stone-200">
                {zh ? '立即 AI 讀圖分析' : 'Analyze with Vision AI now'}
              </p>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed">
                {zh ? 'AI 讀取圖片內容，擷取文字並產生摘要' : 'AI reads the image, extracts text, and generates a summary'}
              </p>
            </div>
            <input
              id="toggle-analyze-image"
              type="checkbox"
              checked={analyzeNow}
              onChange={() => setAnalyzeNow(v => !v)}
              className="w-4 h-4 rounded accent-stone-900 dark:accent-stone-100 shrink-0 cursor-pointer"
            />
          </label>

          {/* Submit */}
          <div className="pt-2 pb-6">
            <button
              type="submit"
              disabled={!uploadedImageUrl || saving || uploading}
              className="w-full py-3 bg-keepo-600 dark:bg-keepo-400 text-white dark:text-keepo-950 rounded-xl text-sm font-sans font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{zh ? '儲存中...' : 'Saving...'}</>
              ) : (
                <><Check className="w-4 h-4" />{zh ? '儲存圖片' : 'Save Image'}</>
              )}
            </button>
          </div>
        </form>
      ) : (
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
                    ? 'bg-keepo-600 dark:bg-keepo-400 border-keepo-600 dark:border-keepo-400 text-white dark:text-keepo-950'
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
              icon: <Sparkles className="w-3.5 h-3.5 text-keepo-500" />,
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
            className="w-full py-3 bg-keepo-600 dark:bg-keepo-400 text-white dark:text-keepo-950 rounded-xl text-sm font-sans font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{zh ? '儲存中...' : 'Saving...'}</>
            ) : (
              <><Check className="w-4 h-4" />{zh ? '儲存資料來源' : 'Save Source'}</>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
