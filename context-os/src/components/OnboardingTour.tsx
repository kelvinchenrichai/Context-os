import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles, FolderPlus, Link, Database, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface OnboardingTourProps {
  lang: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  targetId: string;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  tab?: string;
  actionZh?: string;
  actionEn?: string;
  onAction?: (setActiveTab: (tab: string) => void) => void;
  icon?: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  // ── Step 1: Welcome ────────────────────────────────────────────────────────
  {
    targetId: 'none',
    titleZh: '👋 歡迎使用 Context OS',
    titleEn: '👋 Welcome to Context OS',
    contentZh: 'Context OS 幫你把分散在各地的連結、GitHub、PDF、影片，整理成 AI 可以直接理解的專案記憶。\n\n這個導覽會帶你完成三個最重要的步驟：建立專案 → 存入第一筆資料 → 了解如何管理。大約需要 2 分鐘。',
    contentEn: 'Context OS organizes your scattered links, GitHub repos, PDFs and videos into AI-ready project memory.\n\nThis tour covers the 3 most important steps: Create a project → Save your first source → Manage your library. Takes about 2 minutes.',
    placement: 'center',
    tab: 'dashboard',
    icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
  },

  // ── Step 2: Quick Capture Bar ─────────────────────────────────────────────
  {
    targetId: 'quick-capture-bar',
    titleZh: '⚡ 快速收藏列',
    titleEn: '⚡ Quick Capture Bar',
    contentZh: '這裡是最快的存入方式。直接貼上任何網址（YouTube、GitHub、IG、一般網頁），系統會自動偵測來源類型，然後讓你選擇要放進哪個專案。',
    contentEn: 'The fastest way to save content. Paste any URL (YouTube, GitHub, Instagram, any webpage) and the system automatically detects the source type, then lets you choose which project to add it to.',
    placement: 'bottom',
    tab: 'dashboard',
  },

  // ── Step 3: Go create a project ───────────────────────────────────────────
  {
    targetId: 'sidebar-item-projects',
    titleZh: '📂 第一步：建立你的第一個專案',
    titleEn: '📂 Step 1: Create your first project',
    contentZh: '在存入任何資料之前，先建立一個專案來組織它們。點「專案列表」，然後點右上角的「建立新專案」按鈕。\n\n例如：「AI 研究」、「行銷素材」、「交易策略」、「個人學習」。',
    contentEn: 'Before saving any content, create a project to organize it. Click "Projects" then the "Create new project" button in the top right.\n\nExamples: "AI Research", "Marketing Assets", "Trading Strategy", "Personal Learning".',
    placement: 'right',
    tab: 'projects',
    actionZh: '去建立專案',
    actionEn: 'Go create a project',
    onAction: (setActiveTab) => setActiveTab('projects'),
    icon: <FolderPlus className="w-6 h-6 text-emerald-500" />,
  },

  // ── Step 4: Save a source ─────────────────────────────────────────────────
  {
    targetId: 'sidebar-item-save-url',
    titleZh: '🔗 第二步：存入你的第一筆資料',
    titleEn: '🔗 Step 2: Save your first source',
    contentZh: '建立好專案之後，點「快速收藏」來存入資料。\n\n你可以貼上：\n• GitHub 網址（自動抓取 README）\n• YouTube 影片（自動取得標題和縮圖）\n• 任何網頁連結\n• IG Reels 或 TikTok 連結\n\n勾選「立即 AI 分析」，AI 會自動產生繁體中文摘要和標籤。',
    contentEn: 'After creating a project, click "Capture" to save content.\n\nYou can paste:\n• GitHub URLs (auto-fetches README)\n• YouTube videos (auto-gets title & thumbnail)\n• Any webpage link\n• Instagram Reels or TikTok links\n\nCheck "Analyze with AI" for automatic Chinese summaries and tag suggestions.',
    placement: 'right',
    tab: 'save-url',
    actionZh: '去存入資料',
    actionEn: 'Go save a source',
    onAction: (setActiveTab) => setActiveTab('save-url'),
    icon: <Link className="w-6 h-6 text-blue-500" />,
  },

  // ── Step 5: Library ───────────────────────────────────────────────────────
  {
    targetId: 'sidebar-item-library',
    titleZh: '🗄️ 第三步：在資料庫管理你的內容',
    titleEn: '🗄️ Step 3: Manage in Library',
    contentZh: '所有存入的資料都會在這裡顯示。你可以：\n\n• 用專案、平台、重要程度來篩選\n• 搜尋標題、備註、AI 摘要\n• 點進任何一筆看 AI 分析結果\n• 用「批量操作」把資料移動到其他專案\n• 打勾按鈕控制哪些資料加入 AI Context',
    contentEn: 'All your saved content appears here. You can:\n\n• Filter by project, platform, importance\n• Search titles, notes, AI summaries\n• Click any item to view AI analysis\n• Use "Select" to batch-move sources to other projects\n• Use the checkmark to control which sources go into AI Context',
    placement: 'right',
    tab: 'library',
    actionZh: '去資料庫看看',
    actionEn: 'Go to Library',
    onAction: (setActiveTab) => setActiveTab('library'),
    icon: <Database className="w-6 h-6 text-violet-500" />,
  },

  // ── Step 6: Export ────────────────────────────────────────────────────────
  {
    targetId: 'sidebar-item-export',
    titleZh: '📦 最後：匯出給 AI 使用',
    titleEn: '📦 Finally: Export for AI',
    contentZh: '把整個專案的知識打包成一個 Prompt，直接貼進 ChatGPT、Claude 或 Cursor，讓 AI 立刻理解你的專案背景，不用再重複解釋。\n\n這就是 Context OS 的核心價值：\n存好資料 → 一鍵匯出 → AI 秒懂你的專案。',
    contentEn: "Package your entire project knowledge into one prompt. Paste it into ChatGPT, Claude, or Cursor and the AI instantly understands your project context — no more repeated explanations.\n\nThis is Context OS's core value:\nSave content → One-click export → AI understands your project instantly.",
    placement: 'right',
    tab: 'export',
    actionZh: '去試試匯出',
    actionEn: 'Try Export',
    onAction: (setActiveTab) => setActiveTab('export'),
  },

  // ── Step 7: Done ──────────────────────────────────────────────────────────
  {
    targetId: 'none',
    titleZh: '✅ 你已經準備好了！',
    titleEn: '✅ You\'re all set!',
    contentZh: '你已經了解 Context OS 的核心流程。\n\n現在就開始：\n1. 建立第一個專案\n2. 貼上幾個你常用的連結\n3. 匯出給 AI 用\n\n如果之後忘記什麼功能，去「設定」頁面找「重新啟動功能導覽」按鈕。',
    contentEn: "You now understand Context OS's core workflow.\n\nGet started now:\n1. Create your first project\n2. Paste a few links you use often\n3. Export to AI\n\nIf you ever forget something, go to Settings and click 'Restart Walkthrough'.",
    placement: 'center',
    tab: 'dashboard',
    icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
  },
];

export default function OnboardingTour({
  lang,
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}: OnboardingTourProps) {
  const zh = lang === 'zh-TW';
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const resizeTimeout = useRef<number | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!isOpen) return;
    if (step.tab && activeTab !== step.tab) {
      setActiveTab(step.tab);
    }

    const calculatePosition = () => {
      if (step.targetId === 'none') { setCoords(null); return; }
      let el = document.getElementById(step.targetId);
      if (!el && step.targetId.startsWith('sidebar-item-')) {
        const tabId = step.targetId.replace('sidebar-item-', '');
        el = document.getElementById(`bottom-nav-item-${tabId}`);
      }
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setCoords(null);
      }
    };

    const timeoutId = window.setTimeout(calculatePosition, 250);
    const handleResize = () => {
      if (resizeTimeout.current) window.clearTimeout(resizeTimeout.current);
      resizeTimeout.current = window.setTimeout(calculatePosition, 100);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', calculatePosition);
    return () => {
      window.clearTimeout(timeoutId);
      if (resizeTimeout.current) window.clearTimeout(resizeTimeout.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [currentStep, isOpen, step.targetId, step.tab, activeTab, setActiveTab]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleClose = () => {
    localStorage.setItem('context_os_tour_completed', 'true');
    onClose();
    setCurrentStep(0);
  };

  // ── Tooltip / card positioning ────────────────────────────────────────────

  const CARD_W = 340;
  const CARD_H_APPROX = 280;
  const GAP = 16;

  const getCardStyle = (): React.CSSProperties => {
    if (!coords || step.placement === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: CARD_W,
        zIndex: 10002,
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0, left = 0;
    switch (step.placement) {
      case 'bottom':
        top = coords.top + coords.height + GAP;
        left = coords.left + coords.width / 2 - CARD_W / 2;
        break;
      case 'top':
        top = coords.top - CARD_H_APPROX - GAP;
        left = coords.left + coords.width / 2 - CARD_W / 2;
        break;
      case 'right':
        top = coords.top + coords.height / 2 - CARD_H_APPROX / 2;
        left = coords.left + coords.width + GAP;
        break;
      case 'left':
        top = coords.top + coords.height / 2 - CARD_H_APPROX / 2;
        left = coords.left - CARD_W - GAP;
        break;
    }

    // Clamp to viewport
    left = Math.max(12, Math.min(left, vw - CARD_W - 12));
    top = Math.max(12, Math.min(top, vh - CARD_H_APPROX - 12));

    return { position: 'fixed', top, left, width: CARD_W, zIndex: 10002 };
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/40 dark:bg-black/60 pointer-events-auto"
        onClick={handleClose}
      />

      {/* Spotlight ring */}
      {coords && (
        <div
          className="absolute border-2 border-amber-400 dark:border-amber-500 rounded-xl pointer-events-none z-[10001] transition-all duration-300"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
          }}
        />
      )}

      {/* Tour card */}
      <div
        className="pointer-events-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xl overflow-hidden"
        style={getCardStyle()}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            {step.icon}
            <h3 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {zh ? step.titleZh : step.titleEn}
            </h3>
          </div>
          <button onClick={handleClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <p className="text-xs font-sans text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
            {zh ? step.contentZh : step.contentEn}
          </p>
        </div>

        {/* Action button (optional) */}
        {step.onAction && (
          <div className="px-5 pb-3">
            <button
              onClick={() => { step.onAction!(setActiveTab); handleNext(); }}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              {zh ? step.actionZh : step.actionEn}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Footer: progress + nav */}
        <div className="flex items-center justify-between px-5 py-3 bg-stone-50/60 dark:bg-stone-950/30 border-t border-stone-100 dark:border-stone-800">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`rounded-full transition-all ${
                  i === currentStep
                    ? 'w-4 h-1.5 bg-indigo-500'
                    : i < currentStep
                      ? 'w-1.5 h-1.5 bg-emerald-400'
                      : 'w-1.5 h-1.5 bg-stone-300 dark:bg-stone-700'
                }`}
              />
            ))}
          </div>

          {/* Step counter + nav buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-stone-400">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              {currentStep === TOUR_STEPS.length - 1
                ? (zh ? '開始使用' : 'Get Started')
                : (zh ? '繼續' : 'Next')}
              {currentStep < TOUR_STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
