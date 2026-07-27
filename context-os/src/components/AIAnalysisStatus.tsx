import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface AIAnalysisStatusProps {
  onComplete: () => void;
  lang: Language;
}

export default function AIAnalysisStatus({ onComplete, lang }: AIAnalysisStatusProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = lang === 'zh-TW' ? [
    '看看這是什麼類型的內容...',
    '讀取網頁或影片的內容...',
    '整理出重點摘要...',
    '想幾個適合的標籤...',
    '跟你其他的資料做個連結...',
    '整理完成，已經加進你的專案囉！'
  ] : [
    'Checking what kind of content this is...',
    'Reading through the page or video...',
    'Writing up a summary...',
    'Picking a few good tags...',
    'Linking it to your other saved stuff...',
    'All done — added to your project!'
  ];

  useEffect(() => {
    // Increment progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    // Transition steps based on progress thresholds
    const stepsCount = steps.length - 1;
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < stepsCount) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 700);

    // Call completion when progress hits 100
    const timeout = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div id="ai-analysis-container" className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src="/mascot/mascot-thinking.svg" alt="" className="w-8 h-8 animate-mascot" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
            {lang === 'zh-TW' ? 'AI 正在整理中' : 'AI is organizing this'}
          </span>
        </div>
        <span className="text-xs font-mono text-stone-500 dark:text-stone-400 font-semibold">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 dark:bg-stone-800 h-1 rounded-full overflow-hidden mb-6">
        <div 
          className="bg-keepo-600 dark:bg-keepo-400 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isFuture = idx > currentStep;

          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 text-xs transition-opacity duration-200 ${
                isFuture ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-keepo-600 dark:text-keepo-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-700 bg-transparent" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-sans font-medium leading-normal ${
                  isCurrent 
                    ? 'text-stone-900 dark:text-stone-100' 
                    : isDone 
                      ? 'text-stone-500 dark:text-stone-500 line-through decoration-stone-200 dark:decoration-stone-800' 
                      : 'text-stone-400 dark:text-stone-600'
                }`}>
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
