import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  RefreshCw, 
  Edit, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  FileText, 
  Github, 
  Video, 
  Globe2, 
  Loader2,
  FolderInput,
  Link2,
  X,
  Plus
} from 'lucide-react';
import { Project, Source, Language, ImportanceLevel } from '../types';
import { TRANSLATIONS } from '../data';
import AIAnalysisStatus from '../components/AIAnalysisStatus';
import { getToken, getSourceProjects, moveSource, linkSource, unlinkSource } from '../api';

const API_BASE = 'https://context-os-api.kelvinchenrichai.workers.dev';

interface SourceDetailProps {
  source: Source;
  projects: Project[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Source>) => void;
  onMoved?: () => void;
  lang: Language;
}

export default function SourceDetail({ 
  source: initialSource, 
  projects, 
  onBack, 
  onDelete, 
  onUpdate,
  onMoved,
  lang 
}: SourceDetailProps) {
  const t = TRANSLATIONS[lang];
  const zh = lang === 'zh-TW';

  // Live source state — fetch fresh data from backend on mount
  const [source, setSource] = useState<Source>(initialSource);
  const [analyzing, setAnalyzing] = useState(false);

  // Move / link state
  const [linkedProjectIds, setLinkedProjectIds] = useState<string[]>([]);
  const [showMovePanel, setShowMovePanel] = useState(false);
  const [showLinkPanel, setShowLinkPanel] = useState(false);
  const [movingTo, setMovingTo] = useState('');
  const [linkingTo, setLinkingTo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    // Fetch fresh source data
    fetch(`${API_BASE}/api/v1/sources/${initialSource.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((d: any) => {
        if (d.success && d.data) {
          setSource(s => ({
            ...s,
            aiSummary: d.data.ai_summary || s.aiSummary,
            aiKeyPoints: JSON.parse(d.data.ai_key_points || '[]'),
            aiSuggestedTags: JSON.parse(d.data.ai_suggested_tags || '[]'),
            isAnalyzed: d.data.is_analyzed === 1,
          }));
        }
      })
      .catch(() => {});

    // Fetch linked projects
    getSourceProjects(initialSource.id)
      .then(data => setLinkedProjectIds(data.linkedProjectIds))
      .catch(() => {});
  }, [initialSource.id]);

  const handleReAnalyze = async () => {
    const token = getToken();
    if (!token || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/sources/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sourceId: source.id }),
      });
      const data = await res.json() as any;
      if (data.success && data.data) {
        setSource(s => ({
          ...s,
          aiSummary: data.data.summary,
          aiKeyPoints: data.data.keyPoints || [],
          aiSuggestedTags: data.data.suggestedTags || [],
          isAnalyzed: true,
        }));
        onUpdate(source.id, { aiSummary: data.data.summary, aiKeyPoints: data.data.keyPoints || [], isAnalyzed: true });
      }
    } catch {}
    finally { setAnalyzing(false); }
  };

  const handleMove = async () => {
    if (!movingTo || actionLoading) return;
    setActionLoading(true);
    try {
      await moveSource(source.id, movingTo);
      setActionMsg(zh ? '已移動！' : 'Moved!');
      setTimeout(() => { setActionMsg(''); setShowMovePanel(false); onMoved?.(); onBack(); }, 1200);
    } catch (e: any) {
      setActionMsg(e.message || (zh ? '移動失敗' : 'Move failed'));
    } finally { setActionLoading(false); }
  };

  const handleLink = async () => {
    if (!linkingTo || actionLoading) return;
    setActionLoading(true);
    try {
      await linkSource(source.id, linkingTo);
      setLinkedProjectIds(prev => [...prev, linkingTo]);
      setLinkingTo('');
      setShowLinkPanel(false);
      setActionMsg(zh ? '已加入專案！' : 'Linked!');
      setTimeout(() => setActionMsg(''), 2000);
    } catch (e: any) {
      setActionMsg(e.message || (zh ? '加入失敗' : 'Link failed'));
    } finally { setActionLoading(false); }
  };

  const handleUnlink = async (projectId: string) => {
    try {
      await unlinkSource(source.id, projectId);
      setLinkedProjectIds(prev => prev.filter(id => id !== projectId));
    } catch {}
  };

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(source.title);
  const [editedNote, setEditedNote] = useState(source.note);
  const [editedImportance, setEditedImportance] = useState<ImportanceLevel>(source.importance);

  const matchedProj = projects.find(p => p.id === source.projectId);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-5 h-5 text-stone-700 dark:text-stone-300" />;
      case 'youtube': return <Video className="w-5 h-5 text-red-500" />;
      case 'instagram': return <Video className="w-5 h-5 text-pink-500" />;
      default: return <Globe2 className="w-5 h-5 text-stone-400" />;
    }
  };

  const handleSaveChanges = () => {
    onUpdate(source.id, {
      title: editedTitle,
      note: editedNote,
      importance: editedImportance
    });
    setIsEditing(false);
  };

  if (analyzing) {
    return (
      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-950 flex flex-col justify-center min-h-[400px]">
        <AIAnalysisStatus onComplete={() => setAnalyzing(false)} lang={lang} />
      </div>
    );
  }

  return (
    <div id="source-detail-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 bg-stone-50/60 dark:bg-stone-950/20 space-y-6">
      
      {/* Back & Actions */}
      <div className="flex items-center justify-between">
        <button 
          id="btn-source-detail-back"
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-sans font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'zh-TW' ? '返回上一頁' : 'Back to Library'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Edit toggle */}
          {isEditing ? (
            <button
              id="btn-source-save-edit"
              onClick={handleSaveChanges}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white text-xs font-sans font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{lang === 'zh-TW' ? '儲存變更' : 'Save'}</span>
            </button>
          ) : (
            <button
              id="btn-source-toggle-edit"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 text-stone-600 dark:text-stone-400 dark:hover:bg-stone-900/40 text-xs font-sans font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{lang === 'zh-TW' ? '編輯資源' : 'Edit'}</span>
            </button>
          )}

          {/* Trigger manual analysis */}
          <button
            id="btn-source-reanalyze"
            onClick={handleReAnalyze}
            disabled={analyzing}
            className="p-1.5 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 rounded-lg cursor-pointer disabled:opacity-50"
            title={zh ? '重新 AI 分析' : 'Re-analyze with AI'}
          >
            {analyzing
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <RefreshCw className="w-4 h-4" />
            }
          </button>

          {/* Move to project */}
          <button
            onClick={() => { setShowMovePanel(v => !v); setShowLinkPanel(false); }}
            className="p-1.5 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-indigo-600 hover:border-indigo-300 rounded-lg cursor-pointer transition-colors"
            title={zh ? '移動到其他專案' : 'Move to project'}
          >
            <FolderInput className="w-4 h-4" />
          </button>

          {/* Link to project */}
          <button
            onClick={() => { setShowLinkPanel(v => !v); setShowMovePanel(false); }}
            className="p-1.5 border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-emerald-600 hover:border-emerald-300 rounded-lg cursor-pointer transition-colors"
            title={zh ? '加入其他專案（共用）' : 'Link to another project'}
          >
            <Link2 className="w-4 h-4" />
          </button>

          {/* Delete resource */}
          <button
            id="btn-source-delete"
            onClick={() => {
              if (confirm(lang === 'zh-TW' ? '確定要刪除這筆收藏資料嗎？' : 'Are you sure you want to delete this resource?')) {
                onDelete(source.id);
              }
            }}
            className="p-1.5 border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-red-500 rounded-lg cursor-pointer"
            title="Delete resource"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action message toast */}
      {actionMsg && (
        <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-sans">
          {actionMsg}
        </div>
      )}

      {/* Move panel */}
      {showMovePanel && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
              <FolderInput className="w-3.5 h-3.5" />
              {zh ? '移動到其他專案' : 'Move to another project'}
            </p>
            <button onClick={() => setShowMovePanel(false)} className="text-indigo-400 hover:text-indigo-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-sans">
            {zh ? '移動後此資料將從原專案中移除，並出現在新專案裡。' : 'The source will be removed from the current project and appear in the new one.'}
          </p>
          <div className="flex gap-2">
            <select
              value={movingTo}
              onChange={e => setMovingTo(e.target.value)}
              className="flex-1 bg-white dark:bg-stone-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="">{zh ? '選擇目標專案…' : 'Select target project…'}</option>
              {projects.filter(p => p.id !== source.projectId).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleMove}
              disabled={!movingTo || actionLoading}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderInput className="w-3.5 h-3.5" />}
              {zh ? '移動' : 'Move'}
            </button>
          </div>
        </div>
      )}

      {/* Link panel */}
      {showLinkPanel && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-sans font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              {zh ? '加入其他專案（共用）' : 'Share to another project'}
            </p>
            <button onClick={() => setShowLinkPanel(false)} className="text-emerald-400 hover:text-emerald-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-sans">
            {zh ? '此資料會同時出現在多個專案裡，原本的位置不變。' : 'The source will appear in multiple projects simultaneously.'}
          </p>

          {/* Currently linked projects */}
          {linkedProjectIds.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400">{zh ? '目前共用的專案' : 'Currently linked'}</p>
              {linkedProjectIds.map(pid => {
                const p = projects.find(pr => pr.id === pid);
                return p ? (
                  <div key={pid} className="flex items-center justify-between px-2.5 py-1.5 bg-white dark:bg-stone-900 rounded-lg text-xs font-sans">
                    <span className="text-stone-700 dark:text-stone-300">{p.name}</span>
                    <button onClick={() => handleUnlink(pid)} className="text-stone-400 hover:text-red-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          )}

          <div className="flex gap-2">
            <select
              value={linkingTo}
              onChange={e => setLinkingTo(e.target.value)}
              className="flex-1 bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none"
            >
              <option value="">{zh ? '選擇要加入的專案…' : 'Select project to share into…'}</option>
              {projects
                .filter(p => p.id !== source.projectId && !linkedProjectIds.includes(p.id))
                .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
              onClick={handleLink}
              disabled={!linkingTo || actionLoading}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {zh ? '加入' : 'Link'}
            </button>
          </div>
        </div>
      )}

      {/* Main detail grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left primary information panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm space-y-4">
            
            {/* Header branding */}
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded-lg shrink-0 text-stone-600">
                {getPlatformIcon(source.platform)}
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    id="edit-source-title-input"
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-2 py-1 text-sm font-sans font-bold text-stone-900 dark:text-stone-100 focus:outline-none"
                  />
                ) : (
                  <h1 className="font-sans text-sm md:text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                    {source.title}
                  </h1>
                )}
                
                <a 
                  href={source.url?.replace(/&amp;/g, '&')} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-1 text-[11px] font-mono text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mt-1.5"
                >
                  <span className="truncate max-w-sm md:max-w-md">{source.url?.replace(/&amp;/g, '&')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* User Note annotation */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                {zh ? '個人備註' : 'Personal Annotation / Note'}
              </span>
              {isEditing ? (
                <textarea
                  id="edit-source-note-input"
                  rows={3}
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs font-sans text-stone-900 dark:text-stone-100 resize-none"
                />
              ) : (
                <p className="font-sans text-xs text-stone-600 dark:text-stone-300 italic bg-stone-50/50 dark:bg-stone-950/40 p-3 rounded-lg border border-stone-100 dark:border-stone-850">
                  {source.note || (zh ? '尚未新增備註，點「編輯」來加入想法或用途。' : 'No custom annotations written yet. Click edit to add notes or thoughts.')}
                </p>
              )}
            </div>

            {/* AI Summary Section */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="block text-[10px] font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  {zh ? 'AI 摘要' : 'AI Context Summary'}
                </span>
              </div>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {source.aiSummary || (zh ? '尚未分析，點右上角重新整理按鈕來執行 AI 分析。' : 'Analysis pending... Use re-analyze to run AI model over raw metadata.')}
              </p>
            </div>

            {/* AI Key Insights points */}
            {source.aiKeyPoints && source.aiKeyPoints.length > 0 && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  {zh ? 'AI 重點整理' : 'Core Technical Takeaways'}
                </span>
                <ul className="list-disc pl-4 space-y-1.5 text-xs font-sans text-stone-600 dark:text-stone-300">
                  {source.aiKeyPoints.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed">{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right metadata sidebar details panel */}
        <div className="lg:col-span-4 space-y-6 text-xs font-sans">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800 pb-2">
              Resource Metadata
            </h3>

            <div className="space-y-3.5">
              {/* Belongs to Project */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">{zh ? '所屬專案' : 'Workspace Project'}</span>
                {matchedProj ? (
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-stone-800 dark:text-stone-200">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: matchedProj.color }} />
                    <span>{matchedProj.name}</span>
                  </div>
                ) : (
                  <span className="font-semibold text-stone-800 dark:text-stone-200 mt-1 block">Unassigned</span>
                )}
              </div>

              {/* Classification Category */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">{zh ? '分類' : 'Category'}</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 mt-1 block">
                  {source.category}
                </span>
              </div>

              {/* Importance level */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">{zh ? '重要程度' : 'Importance Level'}</span>
                {isEditing ? (
                  <select
                    id="edit-source-importance"
                    value={editedImportance}
                    onChange={(e) => setEditedImportance(e.target.value as ImportanceLevel)}
                    className="mt-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded p-1 font-sans text-xs focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : (
                  <span className={`inline-block font-bold text-[10px] px-1.5 py-0.5 mt-1 rounded ${
                    source.importance === 'critical'
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                      : source.importance === 'high'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-stone-50 text-stone-500 dark:bg-stone-900/50 dark:text-stone-400'
                  }`}>
                    {source.importance.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Inclusion in Context Pack */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">{zh ? 'Context 狀態' : 'Context Package Status'}</span>
                <button
                  id="btn-detail-toggle-ctx"
                  onClick={() => onUpdate(source.id, { includeInContext: !source.includeInContext })}
                  className={`mt-1.5 px-2.5 py-1 rounded-md border text-[10.5px] font-sans font-semibold transition-colors cursor-pointer ${
                    source.includeInContext
                      ? 'bg-stone-900 border-stone-900 text-white dark:bg-stone-50 dark:border-stone-50 dark:text-stone-950'
                      : 'bg-transparent border-stone-200 dark:border-stone-800 text-stone-500'
                  }`}
                >
                  {source.includeInContext ? (zh ? '已加入 Context' : 'Included in Context Prompt') : (zh ? '未加入（點擊加入）' : 'Omitted (Click to include)')}
                </button>
              </div>

              {/* Tags distribution */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium mb-1">{zh ? '標籤' : 'Tags'}</span>
                <div className="flex flex-wrap gap-1">
                  {source.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded text-[9.5px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {source.tags.length === 0 && (
                    <span className="text-stone-400 italic text-[10.5px]">No tags applied</span>
                  )}
                </div>
              </div>

              {/* Upload timestamp */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium mb-1">
                  {zh ? '上傳時間' : 'Saved at'}
                </span>
                <span className="text-[11px] font-mono text-stone-600 dark:text-stone-400">
                  {source.createdAt
                    ? new Date(source.createdAt).toLocaleString(zh ? 'zh-TW' : 'en-US', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                        hour12: false,
                      })
                    : '—'}
                </span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
