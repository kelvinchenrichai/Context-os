import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Layers, 
  FileText, 
  Github, 
  Video, 
  Globe2, 
  CheckSquare, 
  Square, 
  Code, 
  Link2, 
  Sparkles, 
  Plus, 
  Trash2,
  Bookmark,
  Check,
  ChevronRight,
  Clipboard,
  ExternalLink
} from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';
import TodoSection from '../components/TodoSection';

interface ProjectDetailProps {
  project: Project;
  sources: Source[];
  onBack: () => void;
  onAddSourceClick: () => void;
  onViewSource: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onToggleIncludeInContext: (id: string) => void;
  onUpdateProjectStatus: (id: string, status: 'idea' | 'planning' | 'in_progress' | 'done') => void;
  lang: Language;
}

export default function ProjectDetail({
  project,
  sources,
  onBack,
  onAddSourceClick,
  onViewSource,
  onDeleteProject,
  onToggleIncludeInContext,
  onUpdateProjectStatus,
  lang
}: ProjectDetailProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'knowledge' | 'tags' | 'relations' | 'export' | 'todo'>('overview');
  const [copied, setCopied] = useState(false);

  // Filter sources belonging to this project
  const projectSources = sources.filter(s => s.projectId === project.id);

  // Mock checklist state
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-4 h-4 text-stone-700 dark:text-stone-300" />;
      case 'youtube': return <Video className="w-4 h-4 text-red-500" />;
      case 'instagram': return <Video className="w-4 h-4 text-pink-500" />;
      default: return <Globe2 className="w-4 h-4 text-stone-400" />;
    }
  };

  // Compile Context Prompt
  const generatePromptText = () => {
    const included = projectSources.filter(s => s.includeInContext);
    let prompt = `=========================================\n`;
    prompt += `CONTEXT OS PROJECT MEMORY: ${project.name.toUpperCase()}\n`;
    prompt += `TYPE: ${project.type.toUpperCase()}\n`;
    prompt += `GENERATED: ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC\n`;
    prompt += `=========================================\n\n`;
    
    prompt += `## PROJECT SUMMARY\n${project.summary || project.description}\n\n`;
    
    prompt += `## COMPILED KNOWLEDGE REPOSITORY\n`;
    included.forEach((s, idx) => {
      prompt += `${idx + 1}. [${s.category}] ${s.title}\n`;
      prompt += `   - Source URL: ${s.url}\n`;
      prompt += `   - Technical Summary: ${s.aiSummary}\n`;
      if (s.aiKeyPoints && s.aiKeyPoints.length > 0) {
        prompt += `   - Key Insights:\n`;
        s.aiKeyPoints.forEach(pt => {
          prompt += `     * ${pt}\n`;
        });
      }
      prompt += `\n`;
    });

    prompt += `\n-----------------------------------------\n`;
    prompt += `Please utilize the above metadata contexts to assist me in executing development, strategy modeling, or content architecture.`;
    
    return prompt;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatePromptText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="project-detail-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 bg-stone-50/60 dark:bg-stone-950/20 space-y-6">
      
      {/* Back & Actions header */}
      <div className="flex items-center justify-between">
        <button 
          id="btn-project-detail-back"
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-sans font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'zh-TW' ? '返回專案列表' : 'Back to projects'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-project-add-source"
            onClick={onAddSourceClick}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-sans font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'zh-TW' ? '新增收藏來源' : 'Capture Source'}</span>
          </button>
          
          <button
            id="btn-project-delete"
            onClick={() => {
              if (confirm(lang === 'zh-TW' ? '確定要刪除此專案與其所有資料嗎？' : 'Are you sure you want to delete this project? All child sources will be removed.')) {
                onDeleteProject(project.id);
              }
            }}
            className="p-1.5 border border-stone-200 dark:border-stone-800 hover:border-red-200 dark:hover:border-red-900 text-stone-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Brand Header Banner */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {project.type} project
              </span>
            </div>
            <h1 className="font-sans text-xl md:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              {project.name}
            </h1>
            <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </div>
          <div className="shrink-0 flex md:flex-col items-start gap-4 p-4 rounded-lg bg-stone-50/60 dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 w-full md:w-auto">
            <div className="text-center md:text-left">
              <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                {lang === 'zh-TW' ? '來源數量' : 'Sources'}
              </span>
              <span className="font-sans text-base font-bold text-stone-900 dark:text-stone-100">
                {projectSources.length}
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                {lang === 'zh-TW' ? '標籤' : 'Compiled Tags'}
              </span>
              <span className="font-sans text-xs font-semibold text-stone-600 dark:text-stone-300">
                {project.tags.slice(0, 3).join(', ')}
              </span>
            </div>
            
            <div className="w-full border-t border-stone-200 dark:border-stone-800 my-0.5 md:block hidden" />
            
            <div className="text-center md:text-left space-y-1 w-full flex-1">
              <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider font-bold">
                {lang === 'zh-TW' ? '執行進度' : 'Progress'}
              </span>
              <select
                id="project-detail-status-select"
                value={project.status || 'idea'}
                onChange={(e) => onUpdateProjectStatus(project.id, e.target.value as any)}
                className={`text-[11px] font-sans font-bold rounded-lg px-2 py-1 cursor-pointer transition-all focus:outline-none w-full border ${
                  project.status === 'done' 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' 
                    : project.status === 'in_progress' 
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40' 
                    : project.status === 'planning' 
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/40' 
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                }`}
              >
                <option value="idea" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                  {lang === 'zh-TW' ? '想法構思 (Idea)' : 'Idea / Concept'}
                </option>
                <option value="planning" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                  {lang === 'zh-TW' ? '計畫籌備 (Planning)' : 'Planning'}
                </option>
                <option value="in_progress" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                  {lang === 'zh-TW' ? '專案執行 (In Progress)' : 'In Progress'}
                </option>
                <option value="done" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                  {lang === 'zh-TW' ? '已完成 (Completed)' : 'Completed'}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="border-b border-stone-200 dark:border-stone-800 flex overflow-x-auto whitespace-nowrap scrollbar-none gap-6 text-xs font-sans">
        {(['overview', 'sources', 'knowledge', 'tags', 'relations', 'export', 'todo'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-button-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-semibold transition-all relative ${
              activeTab === tab
                ? 'text-stone-950 dark:text-stone-100 border-b-2 border-stone-900 dark:border-stone-50'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {tab === 'overview' && (lang === 'zh-TW' ? '總覽' : 'Overview')}
            {tab === 'sources' && (lang === 'zh-TW' ? `來源 (${projectSources.length})` : `Sources (${projectSources.length})`)}
            {tab === 'knowledge' && (lang === 'zh-TW' ? '知識記憶' : 'Knowledge Memory')}
            {tab === 'tags' && (lang === 'zh-TW' ? '標籤地圖' : 'Tags Map')}
            {tab === 'relations' && (lang === 'zh-TW' ? '關聯' : 'Relations')}
            {tab === 'export' && (lang === 'zh-TW' ? '匯出 Prompt' : 'Export Prompt')}
            {tab === 'todo' && (lang === 'zh-TW' ? '待辦事項' : 'To-Do')}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div id="tab-panels-wrapper" className="min-h-[300px]">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Primary left panel */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    {lang === 'zh-TW' ? 'AI 專案總覽與記憶摘要' : 'AI Project Overview & Memory Summary'}
                  </h3>
                </div>
                <p className="font-sans text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {project.summary || (lang === 'zh-TW' ? 'AI 尚未生成摘要，新增資料並分析後會自動更新。' : 'AI synthesis has evaluated standard characteristics of this namespace and mapped out relevant indexing triggers.')}
                </p>
                <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-150 dark:border-stone-850 space-y-2.5">
                  <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                    Next Recommended Action
                  </span>
                  <p className="font-sans text-xs font-medium text-stone-900 dark:text-stone-100">
                    {lang === 'zh-TW' 
                      ? '建議將 gex-tracker-py 參考程式編入 Context 進行 prompt 生成，供 Cursor 直接調用 delta 計算函式。'
                      : 'Integrate the critical code structures inside gex-tracker-py into your active prompt context for smooth code suggestions inside Cursor.'}
                  </p>
                </div>
              </div>

              {/* Recent Active Sources in this project */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Recent Additions in this Workspace
                </h3>
                {projectSources.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900">
                    <p className="text-xs text-stone-400">{lang === 'zh-TW' ? '尚未新增任何來源。' : 'No sources indexed yet.'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectSources.slice(0, 3).map(s => (
                      <div 
                        key={s.id}
                        onClick={() => onViewSource(s.id)}
                        className="group flex items-center justify-between p-4 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 hover:border-stone-300 dark:hover:border-stone-700 rounded-xl shadow-sm cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-stone-50 dark:bg-stone-800 rounded shrink-0">
                            {getPlatformIcon(s.platform)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white truncate">
                              {s.title}
                            </h4>
                            <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 truncate mt-0.5">
                              {s.url}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reminders / Tasks Schedule for this specific project */}
              <TodoSection projects={[project]} lang={lang} filterProjectId={project.id} />
            </div>

            {/* Sidebar metadata panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4 shadow-sm text-xs font-sans">
                <h4 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800 pb-2">
                  Technical Architecture Context
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Core Stack</span>
                    <span className="font-sans font-semibold text-stone-800 dark:text-stone-200">
                      {project.type === 'trading' ? 'Python, Vectorized Pandas, yfinance API' : 'TypeScript, Node.js, Gemini API SDK'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Primary Focus</span>
                    <span className="font-sans font-semibold text-stone-800 dark:text-stone-200">
                      {project.type === 'trading' ? 'Dealer Hedging Curves, Volatility Splines' : 'LLM Function Binding, Automated Routings'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Indexed Memory Ratio</span>
                    <span className="font-sans font-semibold text-stone-800 dark:text-stone-200">
                      {projectSources.filter(s => s.isAnalyzed).length} / {projectSources.length} {lang === 'zh-TW' ? '筆已分析' : 'Items ready'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SOURCES TAB */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-sans text-stone-500">
              <span>{projectSources.length} {lang === 'zh-TW' ? '筆資料已收藏在此專案' : 'resources captured in this namespace'}</span>
              <span>Click to view AI summary & metadata</span>
            </div>

            {projectSources.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900">
                <p className="text-xs text-stone-400">No resources have been captured yet in this project.</p>
                <button
                  onClick={onAddSourceClick}
                  className="mt-3 px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
                >
                  Capture First Link
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectSources.map((source) => (
                  <div
                    key={source.id}
                    id={`source-card-pd-${source.id}`}
                    className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm hover:border-stone-400 dark:hover:border-stone-700 transition-colors flex flex-col justify-between cursor-pointer"
                    onClick={() => onViewSource(source.id)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-stone-50 dark:bg-stone-850 rounded text-stone-600 dark:text-stone-300">
                            {getPlatformIcon(source.platform)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-stone-950 dark:group-hover:text-white">
                              {source.title}
                            </h3>
                            <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 truncate block mt-0.5">
                              {source.url}
                            </span>
                          </div>
                        </div>

                        {/* Include in context checkbox inside list (does not bubble click) */}
                        <button
                          id={`toggle-ctx-${source.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleIncludeInContext(source.id);
                          }}
                          className={`p-1.5 rounded-md border ${
                            source.includeInContext
                              ? 'bg-stone-900 border-stone-900 dark:bg-stone-100 dark:border-stone-100 text-white dark:text-stone-950'
                              : 'bg-transparent border-stone-200 dark:border-stone-800 text-transparent hover:border-stone-400'
                          } transition-all cursor-pointer`}
                          title="Toggle in Context Package"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>

                      {/* AI Snippet Preview */}
                      <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {source.aiSummary || 'Analysis pending...'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-sans font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-1.5 py-0.5 rounded">
                          {source.category}
                        </span>
                        <span className={`text-[9px] font-sans font-bold px-1.5 py-0.5 rounded ${
                          source.importance === 'critical'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                            : source.importance === 'high'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'bg-stone-50 text-stone-500 dark:bg-stone-900/50 dark:text-stone-400'
                        }`}>
                          {source.importance.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-stone-400 dark:text-stone-600">
                        {source.includeInContext ? 'INCLUDED' : 'OMITTED'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. KNOWLEDGE MEMORY TAB */}
        {activeTab === 'knowledge' && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Core Synthesized Project Knowledge
              </h3>
              <p className="font-sans text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                Compiled directly from analyzed PDFs, GitHub APIs, and video transcripts inside this container.
              </p>
            </div>

            {projectSources.length === 0 ? (
              <p className="text-xs text-stone-400">Capture resources to extract compiled knowledge.</p>
            ) : (
              <div className="space-y-6 text-xs font-sans">
                {projectSources.map((source) => (
                  <div key={source.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-900 dark:bg-stone-50 shrink-0" />
                      <h4 className="font-bold text-stone-900 dark:text-stone-100">
                        {source.title} ({source.category})
                      </h4>
                    </div>
                    <div className="pl-3.5 border-l border-stone-200 dark:border-stone-800 space-y-2 text-stone-500 dark:text-stone-400">
                      <p className="leading-relaxed">{source.aiSummary}</p>
                      {source.aiKeyPoints && source.aiKeyPoints.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-stone-600 dark:text-stone-300">
                          {source.aiKeyPoints.map((kp, kIdx) => (
                            <li key={kIdx} className="leading-relaxed">{kp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. TAGS MAP TAB */}
        {activeTab === 'tags' && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
              Tag Distribution Map
            </h3>
            <div className="flex flex-wrap gap-2.5 pt-2">
              {project.tags.map((tag, idx) => (
                <div 
                  key={idx}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg flex items-center gap-2 text-xs font-sans text-stone-700 dark:text-stone-300"
                >
                  <Bookmark className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                  <span className="font-semibold">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. RELATIONS TAB */}
        {activeTab === 'relations' && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-6">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Knowledge Relationship Graph
              </h3>
              <p className="font-sans text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                System matches shared code dependencies and content narratives between source entities automatically.
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 space-y-3 bg-stone-50/50 dark:bg-stone-950/20">
                <div className="flex items-center gap-1 text-stone-500">
                  <Link2 className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-mono text-[10px] uppercase font-bold tracking-wider">Detected Core Association</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2.5">
                  <div className="px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-750 rounded-lg font-semibold text-stone-800 dark:text-stone-200">
                    Options Market Maker Gamma Hedging Mechanics
                  </div>
                  <div className="text-center text-stone-400 font-mono scale-90">➔ related formula parsing in ➔</div>
                  <div className="px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-750 rounded-lg font-semibold text-stone-800 dark:text-stone-200">
                    GEX-Tracker: Dealer Option Position Parser
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. CONTEXT EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4 shadow-sm text-xs font-sans">
                <h4 className="font-sans font-bold text-stone-900 dark:text-stone-100">
                  Compile Single Project
                </h4>
                <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-[11px]">
                  Exports all checked items. Make sure your critical reference codes and document transcripts are toggled.
                </p>

                <button
                  id="btn-detail-export-copy"
                  onClick={handleCopyPrompt}
                  className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 dark:bg-stone-50 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                  <span>{copied ? t.promptCopied : t.copyPrompt}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="bg-stone-900 rounded-xl p-5 font-mono text-[10.5px] text-stone-300 space-y-3 shadow-inner max-h-[360px] overflow-y-auto leading-relaxed border border-stone-800">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-2.5">
                  <span className="text-stone-500 uppercase tracking-widest font-bold">PROMPT PREVIEW (AUTOGENERATED)</span>
                  <span className="text-stone-500">{new Date().toLocaleDateString()}</span>
                </div>
                <pre className="whitespace-pre-wrap">{generatePromptText()}</pre>
              </div>
            </div>
          </div>
        )}

        {/* 7. TODO TAB */}
        {activeTab === 'todo' && (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm">
            <TodoSection projects={[project]} lang={lang} filterProjectId={project.id} />
          </div>
        )}
      </div>
    </div>
  );
}
