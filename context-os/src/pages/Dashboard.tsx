import React from 'react';
import { 
  TrendingUp, 
  Layers, 
  Database, 
  CheckCircle2, 
  Clock, 
  FileCode2, 
  ArrowRight,
  Youtube,
  Github,
  Instagram,
  FileText,
  Globe2,
  AlertCircle
} from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';
import QuickCapture from '../components/QuickCapture';
import TodoSection from '../components/TodoSection';

interface DashboardProps {
  projects: Project[];
  sources: Source[];
  onSaveQuick: (url: string, projectId: string, analyzeNow: boolean) => void;
  onViewSource: (id: string) => void;
  onViewProject: (id: string) => void;
  lang: Language;
  setActiveTab: (tab: string) => void;
  onStartTour?: () => void;
}

export default function Dashboard({ 
  projects, 
  sources, 
  onSaveQuick, 
  onViewSource, 
  onViewProject,
  lang,
  setActiveTab,
  onStartTour
}: DashboardProps) {
  const t = TRANSLATIONS[lang];

  // Calculate metrics
  const totalProjects = projects.length;
  const totalSources = sources.length;
  const pendingCount = sources.filter(s => !s.isAnalyzed).length;
  const contextCount = sources.filter(s => s.includeInContext).length;
  const todayCount = sources.filter(s => {
    const todayStr = new Date().toISOString().split('T')[0];
    return s.createdAt.startsWith(todayStr);
  }).length;

  const recentSources = [...sources]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-3.5 h-3.5" />;
      case 'youtube': return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      default: return <Globe2 className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div id="dashboard-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-8 bg-stone-50/60 dark:bg-stone-950/20">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {lang === 'zh-TW' ? '專案記憶總覽' : 'Project Memories'}
          </h1>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
            {lang === 'zh-TW' 
              ? '將零散的網址、文件與影片，轉化為適用於 ChatGPT、Claude 與 Cursor 的結構化專案背景。'
              : 'Turn fragmented references, repositories, and media streams into dense, structured, AI-readable project contexts.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {onStartTour && (
            <button
              id="dashboard-start-tour-btn"
              onClick={onStartTour}
              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              <span>{lang === 'zh-TW' ? '功能引導導覽' : 'Quick Guide'}</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500 font-mono text-[10px] uppercase tracking-wider font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString(lang === 'zh-TW' ? 'zh-TW' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}</span>
          </div>
        </div>
      </div>

      {/* Quick Capture Panel */}
      <section className="space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {t.quickCapture}
        </h2>
        <QuickCapture projects={projects} onSave={onSaveQuick} lang={lang} />
      </section>

      {/* Key Metrics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-sans font-semibold text-stone-600 dark:text-stone-300">
              {t.totalProjects}
            </span>
            <Layers className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100">
              {totalProjects}
            </span>
          </div>
        </div>

        {/* Metric Card 2 - Upgraded to beautiful interactive Usage Quota */}
        <div id="usage-quota-metric-card" className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all duration-150 hover:border-stone-300 dark:hover:border-stone-700">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-sans font-semibold text-stone-600 dark:text-stone-300">
                {lang === 'zh-TW' ? '上傳與分析使用量' : 'Uploads & Analysis Quota'}
              </span>
              <Database className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100">
                {totalSources}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">/ 100</span>
            </div>
          </div>
          
          <div className="mt-2 space-y-1">
            <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-stone-900 dark:bg-stone-100 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (totalSources / 100) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-500 dark:text-stone-300 font-mono font-medium">
              <span>{lang === 'zh-TW' ? `剩餘 ${100 - totalSources} 個` : `${100 - totalSources} remaining`}</span>
              <span>{Math.round((totalSources / 100) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-sans font-semibold text-stone-600 dark:text-stone-300">
              {t.pendingAnalysis}
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100">
              {pendingCount}
            </span>
            {pendingCount > 0 && (
              <span className="text-[11px] font-sans font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-sans font-semibold text-stone-600 dark:text-stone-300">
              {t.readyContext}
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100">
              {contextCount}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold">
              Compiled
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Projects Column */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-300">
              {t.recentProjects}
            </h2>
            <button 
              id="dash-view-projects-link"
              onClick={() => setActiveTab('projects')}
              className="text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 font-sans text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <span>{lang === 'zh-TW' ? '看全部' : 'View all'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3.5">
            {projects.map((project) => {
              const projectSources = sources.filter(s => s.projectId === project.id);
              const ghCount = projectSources.filter(s => s.type === 'github').length;
              const pdfCount = projectSources.filter(s => s.type === 'pdf').length;
              const urlCount = projectSources.filter(s => s.type === 'url').length;
              const mediaCount = projectSources.filter(s => ['youtube', 'instagram', 'tiktok'].includes(s.type)).length;

              return (
                <div 
                  key={project.id}
                  id={`project-row-${project.id}`}
                  onClick={() => onViewProject(project.id)}
                  className="group relative bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 rounded-xl p-5 shadow-sm cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Left color bar indicator */}
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white">
                          {project.name}
                        </h3>
                      </div>
                      <p className="font-sans text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2 max-w-lg leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  {/* Counters */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-stone-150 dark:border-stone-800">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-300 font-semibold">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{projectSources.length}</span>
                      <span>Total</span>
                    </div>
                    {ghCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-300 font-semibold">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{ghCount}</span>
                        <span>Repos</span>
                      </div>
                    )}
                    {pdfCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-300 font-semibold">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{pdfCount}</span>
                        <span>PDFs</span>
                      </div>
                    )}
                    {mediaCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-stone-600 dark:text-stone-300 font-semibold">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{mediaCount}</span>
                        <span>Video</span>
                      </div>
                    )}
                    
                    <span className="ml-auto text-[10px] font-mono text-stone-500 dark:text-stone-400 font-bold">
                      {project.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Captures Column */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-300">
              {t.recentCaptures}
            </h2>
            <button 
              id="dash-view-library-link"
              onClick={() => setActiveTab('library')}
              className="text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-stone-100 font-sans text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <span>{lang === 'zh-TW' ? '看全部庫' : 'Library'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentSources.map((source) => {
              const proj = projects.find(p => p.id === source.projectId);
              return (
                <div 
                  key={source.id}
                  id={`recent-source-card-${source.id}`}
                  onClick={() => onViewSource(source.id)}
                  className="group bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-xl p-4 shadow-sm cursor-pointer transition-all duration-150 flex flex-col gap-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1 shrink-0 p-1.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {getPlatformIcon(source.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white truncate">
                        {source.title}
                      </h3>
                      <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {source.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {proj && (
                      <span 
                        className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-md border text-stone-700 dark:text-stone-200 border-stone-150 dark:border-stone-800 bg-stone-50 dark:bg-stone-950"
                        style={{ borderLeftColor: proj.color, borderLeftWidth: '3px' }}
                      >
                        {proj.name}
                      </span>
                    )}
                    <span className="text-[10px] font-sans font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                      {source.category}
                    </span>
                    {source.isAnalyzed ? (
                      <span className="ml-auto text-[9px] font-sans font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">
                        Indexed
                      </span>
                    ) : (
                      <span className="ml-auto text-[9px] font-sans font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded animate-pulse">
                        Analyzing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Todo Section */}
      <TodoSection projects={projects} lang={lang} />

      {/* Export Context Promo Banner */}
      <section className="bg-stone-900 dark:bg-stone-950 border border-stone-800 dark:border-stone-900 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-stone-800 text-stone-100">
              <FileCode2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
              {lang === 'zh-TW' ? 'AI 記憶打包器' : 'Context Packaging Service'}
            </span>
          </div>
          <h2 className="text-sm font-semibold font-sans">
            {lang === 'zh-TW' ? '將專案的所有收藏一鍵打包為 AI Context' : 'Package multiple references into standard AI Context'}
          </h2>
          <p className="text-xs text-stone-400 max-w-xl font-sans leading-relaxed">
            {lang === 'zh-TW' 
              ? '選擇任何專案，Context OS 會自動彙整程式庫、PDF、網頁與影片重點，輸出為 ChatGPT 或 Claude 最好解讀的語境 Prompts。'
              : 'Compile your selected PDFs, GitHub repositories, notes and video transcripts into perfectly optimized background knowledge prompts for LLM chats.'}
          </p>
        </div>
        <button
          id="dashboard-export-action-btn"
          onClick={() => setActiveTab('export')}
          className="shrink-0 bg-white hover:bg-stone-100 text-stone-900 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <span>{lang === 'zh-TW' ? '開始產生語境' : 'Generate Context'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
}
