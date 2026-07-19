import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Eye, HelpCircle } from 'lucide-react';
import { Language } from '../types';

export interface TourStep {
  targetId: string;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  tab?: string;
}

interface OnboardingTourProps {
  lang: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'none',
    titleZh: '歡迎使用 Context OS 🧠',
    titleEn: 'Welcome to Context OS 🧠',
    contentZh: '這是一個專利級的 AI 專案語境管理系統。它可以幫你將分散的網誌、GitHub 代碼庫、PDF 文件與 YouTube 影片，打包成 ChatGPT、Claude 或 Cursor 最愛讀的結構化知識 Context。讓我們花 60 秒帶您熟悉核心功能！',
    contentEn: 'A professional AI context orchestrator. It compiles scattered articles, codebases, PDFs, and videos into dense, structured, LLM-readable background prompts for ChatGPT, Claude, or Cursor. Let us show you around in 60 seconds!',
    placement: 'center',
    tab: 'dashboard'
  },
  {
    targetId: 'quick-capture-bar',
    titleZh: '1. 閃電收藏列 ⚡',
    titleEn: '1. Quick Capture Bar ⚡',
    contentZh: '在此輸入或粘貼任何網址（YouTube 影片、GitHub Repo 或是 PDF / 網頁連結）。系統將自動爬取網頁，並使用內建 AI 模型產生完整的結構化總結。',
    contentEn: 'Paste any repository link, YouTube video URL, PDF address, or article. The server-side engine will automatically download, parse, and generate highly compact summaries.',
    placement: 'bottom',
    tab: 'dashboard'
  },
  {
    targetId: 'usage-quota-metric-card',
    titleZh: '2. 使用量度量儀 📊',
    titleEn: '2. Live Quota Gauge 📊',
    contentZh: '這裡會動態顯示您的上傳使用量與剩餘額度。我們預先為每位用戶提供 100 筆免費 AI 解析空間，確保您的專案記憶庫不受限制。',
    contentEn: 'Tracks your current source ingestion and analyzed items. Each account gets a dedicated 100-source quota on our free-tier memory cluster to host your dynamic research base.',
    placement: 'bottom',
    tab: 'dashboard'
  },
  {
    targetId: 'sidebar-item-projects',
    titleZh: '3. 專案看板 📂',
    titleEn: '3. Project Memories 📂',
    contentZh: '在這裡分門別類建立並整理不同的專案記憶。例如建立「前端開發」、「AI Agent 研究」，讓每個專案的語境彼此獨立、互不干擾。',
    contentEn: 'Create separate project clusters to organize your research. Grouping sources under discrete projects prevents context contamination and organizes different developer assets.',
    placement: 'right',
    tab: 'dashboard'
  },
  {
    targetId: 'sidebar-item-library',
    titleZh: '4. 智能資料庫 🗄️',
    titleEn: '4. Knowledge Base Library 🗄️',
    contentZh: '收錄您所有已爬取的完整內容、代碼庫目錄結構與 AI 的逐字稿分析，支援全文检索、自訂標籤與逐字編輯。',
    contentEn: 'View fully extracted transcripts, structured file hierarchies, and key tags. Use this tab to search, modify, or inspect parsed records in deep analytical detail.',
    placement: 'right',
    tab: 'dashboard'
  },
  {
    targetId: 'sidebar-item-export',
    titleZh: '5. 語境打包打包器 📦',
    titleEn: '5. Context Packaging System 📦',
    contentZh: '專案的核心靈魂！勾選想要匯入 AI 的多個文件與影片，一鍵將其編譯壓縮成一段完美的 Prompts。貼進 ChatGPT / Claude 後，大模型將對您的專案如指掌！',
    contentEn: 'The core superpower! Select multiple processed URLs, PDF documents, or transcripts to compile them into a token-optimized Context prompt for immediate clipboard copying.',
    placement: 'right',
    tab: 'dashboard'
  },
  {
    targetId: 'btn-trigger-tour-settings',
    titleZh: '忘記了嗎？隨時重看 ⚙️',
    titleEn: 'Need a reminder? Restart anytime ⚙️',
    contentZh: '大功告成！這個導覽只會出現一次。如果之後忘記某個功能，可以到「設定」頁面找到「重新啟動功能導覽」按鈕，隨時重看。現在就去貼上第一個連結吧！',
    contentEn: 'All done! This tour only appears once. If you ever forget something, go to Settings and click "Restart Walkthrough" to replay it anytime. Now go paste your first link!',
    placement: 'right',
    tab: 'settings'
  }
];

export default function OnboardingTour({
  lang,
  activeTab,
  setActiveTab,
  isOpen,
  onClose
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const resizeTimeout = useRef<number | null>(null);

  const step = TOUR_STEPS[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    // Auto-switch tab if specified for the step
    if (step.tab && activeTab !== step.tab) {
      setActiveTab(step.tab);
    }

    const calculatePosition = () => {
      if (step.targetId === 'none') {
        setCoords(null);
        return;
      }

      let el = document.getElementById(step.targetId);
      
      // Mobile fallback mapping sidebar IDs to bottom nav IDs
      if (!el && step.targetId.startsWith('sidebar-item-')) {
        const tabId = step.targetId.replace('sidebar-item-', '');
        el = document.getElementById(`bottom-nav-item-${tabId}`);
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        
        // Smooth scroll to view if not perfectly inside screen
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setCoords(null);
      }
    };

    // Delay calculation slightly to allow layout and transitions to settle
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
      localStorage.setItem('context_os_tour_completed', 'true');
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('context_os_tour_completed', 'true');
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-[10000] overflow-hidden pointer-events-none font-sans">
      {/* Translucent Backdrop with click capture to prevent background clicks during tour */}
      <div 
        className={`absolute inset-0 transition-all duration-300 pointer-events-auto ${
          coords 
            ? 'bg-transparent' 
            : 'bg-stone-950/30 dark:bg-black/50'
        }`}
        onClick={handleSkip}
      />

      {/* Pulsing Highlight Target overlay ring (Spotlight) */}
      {coords && (
        <div 
          className="absolute border-2 border-amber-500 dark:border-amber-400 rounded-xl pointer-events-none transition-all duration-300 z-[10001]"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12,
            boxShadow: '0 0 0 9999px rgba(12, 12, 14, 0.5), 0 0 15px rgba(245, 158, 11, 0.3)'
          }}
        >
          {/* Breathing highlight indicator */}
          <div className="absolute inset-0 rounded-xl border border-amber-500 dark:border-amber-400 animate-ping opacity-65" />
        </div>
      )}

      {/* Guide dialog box */}
      <div 
        className="fixed pointer-events-auto transition-all duration-300 z-[10002] flex items-center justify-center"
        style={{
          left: '50%',
          width: 'calc(100% - 32px)',
          maxWidth: '350px',
          // Smart positioning based on highlight target position
          ...(!coords ? {
            top: '50%',
            transform: 'translate(-50%, -50%)',
          } : {
            ...(coords.top > window.innerHeight / 2 ? {
              top: '72px',
              transform: 'translateX(-50%)',
            } : {
              bottom: '84px',
              transform: 'translateX(-50%)',
            })
          })
        }}
      >
        <div className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-stone-900 dark:text-stone-100">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
              <h4 className="text-xs font-bold font-sans tracking-wide">
                {lang === 'zh-TW' ? step.titleZh : step.titleEn}
              </h4>
            </div>
            <button 
              onClick={handleSkip}
              className="p-1 rounded-full text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
              title={lang === 'zh-TW' ? '跳過引導' : 'Skip'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Text */}
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
            {lang === 'zh-TW' ? step.contentZh : step.contentEn}
          </p>

          {/* Progress Indicator and Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800/80">
            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 font-bold">
              {currentStep + 1} / {TOUR_STEPS.length}
            </span>

            <div className="flex items-center gap-1.5">
              {/* Skip button for non-final steps */}
              {currentStep < TOUR_STEPS.length - 1 && (
                <button 
                  onClick={handleSkip}
                  className="px-2.5 py-1.5 text-[10px] font-sans font-medium text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  {lang === 'zh-TW' ? '跳過' : 'Skip'}
                </button>
              )}

              {/* Prev button */}
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Next/Finish button */}
              <button 
                onClick={handleNext}
                className="px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <span>{currentStep === TOUR_STEPS.length - 1 ? (lang === 'zh-TW' ? '開始使用' : 'Get Started') : (lang === 'zh-TW' ? '下一步' : 'Next')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
