import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Github, 
  Video, 
  Globe2, 
  Bookmark, 
  Check, 
  ArrowUpDown, 
  Cpu, 
  SlidersHorizontal,
  FolderInput,
  Link2,
  X,
  Loader2,
  CheckSquare,
  Square
} from 'lucide-react';
import { Project, Source, Language, ImportanceLevel } from '../types';
import { TRANSLATIONS } from '../data';
import { moveSource, linkSource } from '../api';

interface LibraryProps {
  projects: Project[];
  sources: Source[];
  onViewSource: (id: string) => void;
  onToggleIncludeInContext: (id: string) => void;
  onRefresh?: () => void;
  lang: Language;
}

export default function Library({ 
  projects, 
  sources, 
  onViewSource, 
  onToggleIncludeInContext,
  onRefresh,
  lang 
}: LibraryProps) {
  const t = TRANSLATIONS[lang];
  const zh = lang === 'zh-TW';

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [batchAction, setBatchAction] = useState<'move' | 'link' | null>(null);
  const [batchTargetProject, setBatchTargetProject] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchMsg, setBatchMsg] = useState('');

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />;
      case 'youtube': return <Video className="w-3.5 h-3.5 text-red-500" />;
      case 'instagram': return <Video className="w-3.5 h-3.5 text-pink-500" />;
      default: return <Globe2 className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  // Filter Logic
  const filteredSources = sources.filter((source) => {
    // 1. Search Query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      source.title.toLowerCase().includes(searchLower) ||
      source.url.toLowerCase().includes(searchLower) ||
      source.note.toLowerCase().includes(searchLower) ||
      source.category.toLowerCase().includes(searchLower) ||
      source.tags.some(tg => tg.toLowerCase().includes(searchLower));

    // 2. Project
    const matchesProject = selectedProjectId === 'all' || source.projectId === selectedProjectId;

    // 3. Platform
    const matchesPlatform = selectedPlatform === 'all' || source.platform === selectedPlatform;

    // 4. Importance
    const matchesImportance = selectedImportance === 'all' || source.importance === selectedImportance;

    // 5. Status
    const matchesStatus = 
      selectedStatus === 'all' || 
      (selectedStatus === 'analyzed' && source.isAnalyzed) ||
      (selectedStatus === 'pending' && !source.isAnalyzed);

    return matchesSearch && matchesProject && matchesPlatform && matchesImportance && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBatchExecute = async () => {
    if (!batchTargetProject || selectedIds.size === 0 || batchLoading) return;
    setBatchLoading(true);
    try {
      const ids = Array.from(selectedIds);
      await Promise.all(ids.map(id =>
        batchAction === 'move' ? moveSource(id, batchTargetProject) : linkSource(id, batchTargetProject)
      ));
      setBatchMsg(batchAction === 'move'
        ? (zh ? `已移動 ${ids.length} 筆資料！` : `Moved ${ids.length} sources!`)
        : (zh ? `已加入 ${ids.length} 筆資料！` : `Linked ${ids.length} sources!`));
      setSelectedIds(new Set());
      setBatchMode(false);
      setBatchAction(null);
      setBatchTargetProject('');
      onRefresh?.();
      setTimeout(() => setBatchMsg(''), 2500);
    } catch {
      setBatchMsg(zh ? '操作失敗，請重試' : 'Operation failed, please retry');
    } finally { setBatchLoading(false); }
  };

  return (
    <div id="library-page" className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6 bg-stone-50/60 dark:bg-stone-950/20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {t.library}
          </h1>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
            {lang === 'zh-TW' ? '管理與篩選所有專案中收藏的 GitHub 程式庫、PDF 文件與影片' : 'Explore and filter all captured materials in one master repository.'}
          </p>
        </div>
        <button
          onClick={() => { setBatchMode(v => !v); setSelectedIds(new Set()); setBatchAction(null); }}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold border transition-colors ${
            batchMode
              ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900'
              : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400'
          }`}
        >
          {batchMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          {batchMode ? (zh ? `已選 ${selectedIds.size} 筆` : `${selectedIds.size} selected`) : (zh ? '批量操作' : 'Select')}
        </button>
      </div>

      {/* Batch action bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-stone-900 dark:bg-stone-800 rounded-xl text-white text-xs font-sans">
          <span className="font-semibold">{zh ? `已選 ${selectedIds.size} 筆` : `${selectedIds.size} selected`}</span>
          <div className="flex gap-2 flex-1 flex-wrap">
            <button
              onClick={() => setBatchAction(batchAction === 'move' ? null : 'move')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${batchAction === 'move' ? 'bg-indigo-500' : 'bg-stone-700 hover:bg-stone-600'}`}
            >
              <FolderInput className="w-3.5 h-3.5" />
              {zh ? '移動到' : 'Move to'}
            </button>
            <button
              onClick={() => setBatchAction(batchAction === 'link' ? null : 'link')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${batchAction === 'link' ? 'bg-emerald-600' : 'bg-stone-700 hover:bg-stone-600'}`}
            >
              <Link2 className="w-3.5 h-3.5" />
              {zh ? '共用到' : 'Link to'}
            </button>
            {batchAction && (
              <>
                <select
                  value={batchTargetProject}
                  onChange={e => setBatchTargetProject(e.target.value)}
                  className="flex-1 bg-stone-700 border-none rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none min-w-32"
                >
                  <option value="">{zh ? '選擇目標專案…' : 'Select project…'}</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                  onClick={handleBatchExecute}
                  disabled={!batchTargetProject || batchLoading}
                  className="px-3 py-1.5 bg-white text-stone-900 rounded-lg font-bold disabled:opacity-40 flex items-center gap-1.5"
                >
                  {batchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {zh ? '執行' : 'Apply'}
                </button>
              </>
            )}
          </div>
          <button onClick={() => { setSelectedIds(new Set()); setBatchMode(false); }} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {batchMsg && (
        <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-sans">
          {batchMsg}
        </div>
      )}

      {/* Filter and search controls bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm space-y-4">
        
        {/* Search Input bar */}
        <div className="flex items-center gap-2.5 px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg">
          <Search className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            id="library-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none"
          />
        </div>

        {/* Dynamic selectors grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-sans">
          {/* Project Filter */}
          <div className="space-y-1">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Project
            </span>
            <select
              id="lib-filter-project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg p-2 font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div className="space-y-1">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Platform
            </span>
            <select
              id="lib-filter-platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg p-2 font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Platforms</option>
              <option value="github">GitHub</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="pdf">PDF Docs</option>
              <option value="other">Web URL</option>
            </select>
          </div>

          {/* Importance Filter */}
          <div className="space-y-1">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Importance
            </span>
            <select
              id="lib-filter-importance"
              value={selectedImportance}
              onChange={(e) => setSelectedImportance(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg p-2 font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Importance</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Analysis Status
            </span>
            <select
              id="lib-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg p-2 font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="analyzed">Ready (Indexed)</option>
              <option value="pending">Analyzing (Pending)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {filteredSources.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-900">
          <p className="text-xs text-stone-400">No resources found matching the specified filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((source) => {
            const matchedProj = projects.find(p => p.id === source.projectId);
            const isSelected = selectedIds.has(source.id);
            return (
              <div
                key={source.id}
                id={`source-row-lib-${source.id}`}
                onClick={() => batchMode ? toggleSelect(source.id) : onViewSource(source.id)}
                className={`group bg-white dark:bg-stone-900 border rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-300 dark:ring-indigo-700'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (batchMode) {
                            toggleSelect(source.id);
                          } else {
                            onToggleIncludeInContext(source.id);
                          }
                        }}
                        className={`shrink-0 p-1.5 rounded-md border transition-all ${
                          batchMode
                            ? isSelected
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'border-stone-300 dark:border-stone-600 text-transparent hover:border-indigo-400'
                            : source.includeInContext
                              ? 'bg-stone-900 border-stone-900 dark:bg-stone-100 dark:border-stone-100 text-white dark:text-stone-950'
                              : 'bg-transparent border-stone-200 dark:border-stone-800 text-transparent hover:border-stone-400'
                        }`}
                        title={batchMode ? (isSelected ? '取消選取' : '選取') : 'Include in Context Package'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                      <div className="p-2 bg-stone-50 dark:bg-stone-850 rounded text-stone-600 dark:text-stone-300 shrink-0">
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
                  </div>

                  <p className="font-sans text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {source.aiSummary}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    {matchedProj && (
                      <span 
                        className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-md border text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950"
                        style={{ borderLeftColor: matchedProj.color, borderLeftWidth: '3px' }}
                      >
                        {matchedProj.name}
                      </span>
                    )}
                    <span className="text-[9px] font-sans text-stone-400 bg-stone-100 dark:bg-stone-800 dark:text-stone-500 px-1.5 py-0.5 rounded">
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

                  <span className="text-[10px] font-mono text-stone-400 dark:text-stone-600">
                    {source.isAnalyzed ? 'Indexed' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
