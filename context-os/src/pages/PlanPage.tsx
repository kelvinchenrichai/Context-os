import React from 'react';
import { ArrowLeft, Zap, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Language, PlanId, PlanLimits, PLAN_LIMITS } from '../types';

interface PlanPageProps {
  lang: Language;
  plan: PlanId;
  setPlan: (p: PlanId) => void;
  projectCount: number;
  sourceCount: number;
  aiAnalysesUsed: number;
  onBack: () => void;
}

function UsageBar({ used, max, label, lang }: { used: number; max: number; label: string; lang: Language }) {
  const pct = max === -1 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const isOver = max !== -1 && used >= max;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-sans">
        <span className="font-medium text-stone-700 dark:text-stone-300">{label}</span>
        <span className={`font-mono font-bold ${isOver ? 'text-red-500' : 'text-stone-500 dark:text-stone-400'}`}>
          {used} / {max === -1 ? '∞' : max}
        </span>
      </div>
      {max !== -1 && (
        <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-stone-900 dark:bg-stone-100'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {isOver && (
        <p className="flex items-center gap-1 text-[10px] text-red-500 font-sans">
          <AlertCircle className="w-3 h-3" />
          {lang === 'zh-TW' ? '已達上限，請升級方案' : 'Limit reached — upgrade to continue'}
        </p>
      )}
    </div>
  );
}

const PLANS: { id: PlanId; price: string; popular?: boolean; features: string[] }[] = [
  {
    id: 'free',
    price: '$0',
    features: ['3 Projects', '100 Sources', '10 AI analyses / month', 'Basic export'],
  },
  {
    id: 'pro',
    price: '$19 / mo',
    popular: true,
    features: ['Unlimited projects', '1,000 Sources', '200 AI analyses / month', 'PDF & Image analysis', 'Context Package', 'Knowledge Graph'],
  },
  {
    id: 'power',
    price: '$49 / mo',
    features: ['Everything in Pro', 'Unlimited sources & analyses', 'BYOK (Bring Your Own Key)', 'Team workspace', 'Bulk import / export', 'Custom export templates'],
  },
];

export default function PlanPage({ lang, plan, setPlan, projectCount, sourceCount, aiAnalysesUsed, onBack }: PlanPageProps) {
  const limits = PLAN_LIMITS[plan];
  const zh = lang === 'zh-TW';

  return (
    <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto space-y-8 bg-white dark:bg-stone-950">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {zh ? '方案與用量' : 'Plan & Usage'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {zh ? '查看目前用量與升級方案' : 'Track your usage and manage your subscription'}
          </p>
        </div>
      </div>

      {/* Current Usage */}
      <section className="space-y-4">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {zh ? '本月用量' : 'Current Usage'}
          </h2>
          <span className="ml-auto text-[10px] font-sans px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800">
            {zh ? `目前方案：${plan === 'free' ? '免費版' : plan === 'pro' ? '專業版' : '終極版'}` : `Current: ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
          </span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-5">
          <UsageBar
            used={projectCount}
            max={limits.maxProjects}
            label={zh ? '專案數' : 'Projects'}
            lang={lang}
          />
          <UsageBar
            used={sourceCount}
            max={limits.maxSources}
            label={zh ? '收藏資料數' : 'Sources'}
            lang={lang}
          />
          <UsageBar
            used={aiAnalysesUsed}
            max={limits.maxAiAnalysesPerMonth}
            label={zh ? 'AI 分析次數（本月）' : 'AI Analyses (this month)'}
            lang={lang}
          />
        </div>
      </section>

      {/* Plan cards */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {zh ? '訂閱方案' : 'Subscription Plans'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(p => {
            const isActive = plan === p.id;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col p-5 rounded-xl border text-xs font-sans transition-all ${
                  isActive
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-50/60 dark:bg-stone-900/20 shadow-sm'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/10'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2.5 left-4 text-[9px] font-sans font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    {zh ? '最受歡迎' : 'Popular'}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -top-2.5 right-4 text-[9px] font-sans font-bold px-2 py-0.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
                    {zh ? '目前方案' : 'Current'}
                  </span>
                )}

                <div className="space-y-1 mb-4">
                  <span className="block font-bold text-stone-900 dark:text-stone-100 capitalize">
                    {p.id === 'free' ? (zh ? '免費版' : 'Free') : p.id === 'pro' ? (zh ? '專業版' : 'Pro') : (zh ? '終極版' : 'Power')}
                  </span>
                  <span className="block text-xl font-bold text-stone-900 dark:text-stone-100">{p.price}</span>
                </div>

                <ul className="space-y-1.5 flex-1 mb-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-[10.5px] text-stone-600 dark:text-stone-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setPlan(p.id)}
                  className={`w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default'
                      : p.id === 'pro'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : p.id === 'power'
                          ? 'bg-stone-900 dark:bg-stone-100 hover:opacity-90 text-white dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {isActive ? (zh ? '目前使用中' : 'Active') : (zh ? '切換此方案' : p.id === 'free' ? 'Downgrade' : 'Upgrade')}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 text-center">
          {zh ? '此為 MVP demo，方案切換僅作展示用途，不會產生實際費用。' : 'MVP demo — plan switching is for demonstration only, no actual billing.'}
        </p>
      </section>

    </div>
  );
}
