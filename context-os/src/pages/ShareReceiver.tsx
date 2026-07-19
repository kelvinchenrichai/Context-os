import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Check, 
  Globe2, 
  Info, 
  Plus, 
  Laptop 
} from 'lucide-react';
import { Project, Category, Language, ImportanceLevel, SourceType, SourcePlatform } from '../types';
import { TRANSLATIONS } from '../data';
import AIAnalysisStatus from '../components/AIAnalysisStatus';
import CategorySelect from '../components/CategorySelect';

const PWA_MANIFEST_CODE = `"share_target": {\n  "action": "/share",\n  "method": "GET",\n  "params": {\n    "title": "title",\n    "text": "text",\n    "url": "url"\n  }\n}`;

interface ShareReceiverProps {
  projects: Project[];
  categories: Category[];
  onCreateCategory: (name: string) => void;
  onSaveShare: (sourceData: {
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

export default function ShareReceiver({ projects, categories, onCreateCategory, onSaveShare, onBack, lang }: ShareReceiverProps) {
  const t = TRANSLATIONS[lang];

  // Raw states
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  // Form states
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState('Video Lecture');
  const [note, setNote] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [importance, setImportance] = useState<ImportanceLevel>('high');
  const [useCase, setUseCase] = useState('內容靈感');
  const [analyzeNow, setAnalyzeNow] = useState(true);

  // Status states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Read URL query params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUrl = params.get('url') || '';
    const queryTitle = params.get('title') || '';
    const queryText = params.get('text') || '';

    // If query params are empty, use high-fidelity simulation defaults to keep the experience active
    if (queryUrl) {
      setUrl(queryUrl);
      setTitle(queryTitle);
      setText(queryText);
    } else {
      // Simulate default incoming share payload
      setUrl('https://youtube.com/watch?v=GEX_Hedging_Mechanics_101');
      setTitle('Options Market Maker Gamma Hedging Mechanics');
      setText('Shared from mobile device YouTube App');
    }
  }, []);

  // Autofill some categories based on URL
  useEffect(() => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setCategory('Video Lecture');
      setUseCase(lang === 'zh-TW' ? '交易研究' : 'Research');
    } else if (url.includes('instagram.com') || url.includes('tiktok.com')) {
      setCategory('Competitive Analysis');
      setUseCase(lang === 'zh-TW' ? '內容靈感' : 'Inspiration');
    } else if (url.includes('github.com')) {
      setCategory('Reference Code');
      setUseCase(lang === 'zh-TW' ? '程式參考' : 'Coding');
    }
  }, [url]);

  const handleSave = () => {
    if (analyzeNow) {
      setIsAnalyzing(true);
    } else {
      executeSave();
    }
  };

  const executeSave = () => {
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
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSaveShare({
      projectId,
      title: title || `Shared Link`,
      url,
      type,
      platform,
      category,
      tags,
      note: note || text,
      importance,
      useCase,
      analyzeNow,
      includeInContext: true,
    });

    setIsAnalyzing(false);
    setIsSaved(true);
  };

  if (isAnalyzing) {
    return (
      <div className="flex-grow max-w-md mx-auto px-4 py-8 bg-white dark:bg-stone-950 flex flex-col justify-center min-h-[400px]">
        <AIAnalysisStatus onComplete={executeSave} lang={lang} />
      </div>
    );
  }

  return (
    <div id="share-receiver-page" className="flex-1 overflow-y-auto px-4 py-6 max-w-md mx-auto space-y-6 bg-white dark:bg-stone-950">
      
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-900 pb-4">
        <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-stone-50 text-white dark:text-stone-950 flex items-center justify-center">
          <Share2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100 leading-tight">
            Save to Context OS
          </h1>
          <p className="font-sans text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
            iOS / Android Share Target Simulation
          </p>
        </div>
      </div>

      {isSaved ? (
        <div id="share-success-box" className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800 rounded-xl p-6 text-center space-y-4">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Check className="w-4.5 h-4.5 stroke-[3]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '手機快速儲存完成' : 'Share Target Processed'}
            </h3>
            <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400">
              {lang === 'zh-TW' ? '連結與內容已成功編入專案 AI 知識記憶庫。' : 'The share payload has been parsed and integrated successfully.'}
            </p>
          </div>
          <button
            onClick={() => {
              setIsSaved(false);
              onBack();
            }}
            className="w-full py-2 bg-stone-900 hover:bg-stone-850 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-sans font-semibold rounded-lg"
          >
            {lang === 'zh-TW' ? '回到首頁' : 'Back to Dashboard'}
          </button>
        </div>
      ) : (
        <>
          {/* Share target information */}
          <div className="p-3 bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-850 rounded-lg space-y-1 text-xs font-sans">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Detected Share Payload
            </span>
            <p className="font-sans font-bold text-stone-800 dark:text-stone-200 truncate">{title}</p>
            <p className="font-mono text-[10px] text-stone-500 dark:text-stone-500 truncate mt-0.5">{url}</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Project Select */}
            <div className="space-y-1.5 text-xs font-sans">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Target Project
              </label>
              <select
                id="share-project-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5 text-xs font-sans">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Category
              </label>
              <CategorySelect
                id="share-category-select"
                categories={categories}
                value={category}
                onChange={setCategory}
                onCreate={onCreateCategory}
                lang={lang}
              />
            </div>

            {/* Tags and note */}
            <div className="space-y-1.5 text-xs font-sans">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Custom Tags
              </label>
              <input
                id="share-tags-input"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., Options, Trading"
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="space-y-1.5 text-xs font-sans">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Quick Annotation
              </label>
              <textarea
                id="share-note-input"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Hook description or key points to reference..."
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 resize-none"
              />
            </div>

            {/* Logic switches */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-900 text-xs font-sans">
              <label className="flex items-center gap-3 text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="share-analyze-checkbox"
                  type="checkbox"
                  checked={analyzeNow}
                  onChange={(e) => setAnalyzeNow(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-850 text-stone-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Analyze with AI Immediately</span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex flex-col gap-2">
              <button
                id="btn-share-save-primary"
                onClick={handleSave}
                className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 dark:bg-stone-50 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-sans font-semibold rounded-lg text-xs"
              >
                Save & Analyze
              </button>
              <button
                id="btn-share-save-secondary"
                onClick={() => {
                  setAnalyzeNow(false);
                  executeSave();
                }}
                className="w-full py-2 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-sans font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50"
              >
                Save without analysis
              </button>
            </div>
          </div>
        </>
      )}

        {/* PWA share spec explanation */}
        <div className="mt-8 p-4 bg-stone-50/50 dark:bg-stone-900/15 border border-stone-200 dark:border-stone-900 rounded-xl space-y-2 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 font-semibold text-[10.5px]">
            <Info className="w-3.5 h-3.5 text-stone-400" />
            <span>Developer PWA Manifest Specification</span>
          </div>
          <p className="text-stone-400 dark:text-stone-500 text-[10px] leading-relaxed">
            To register this page as a system-wide OS share target when installed on mobile devices, register the following parameters inside <code>manifest.json</code>:
          </p>
          <pre className="p-3 bg-stone-900 text-stone-300 font-mono text-[9px] rounded-lg overflow-x-auto leading-relaxed border border-stone-800">
            {PWA_MANIFEST_CODE}
          </pre>
        </div>
    </div>
  );
}
