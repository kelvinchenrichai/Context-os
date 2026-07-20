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
  Loader2 
} from 'lucide-react';
import { Project, Source, Language, ImportanceLevel } from '../types';
import { TRANSLATIONS } from '../data';
import AIAnalysisStatus from '../components/AIAnalysisStatus';
import { getToken } from '../api';

const API_BASE = 'https://context-os-api.kelvinchenrichai.workers.dev';

interface SourceDetailProps {
  source: Source;
  projects: Project[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Source>) => void;
  lang: Language;
}

export default function SourceDetail({ 
  source: initialSource, 
  projects, 
  onBack, 
  onDelete, 
  onUpdate, 
  lang 
}: SourceDetailProps) {
  const t = TRANSLATIONS[lang];
  const zh = lang === 'zh-TW';

  // Live source state — fetch fresh data from backend on mount
  const [source, setSource] = useState<Source>(initialSource);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
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
  }, [initialSource.id]);

  const handleReAnalyze = async () => {
    const token = getToken();
    if (!token || analyzing) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/sources/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
        onUpdate(source.id, {
          aiSummary: data.data.summary,
          aiKeyPoints: data.data.keyPoints || [],
          isAnalyzed: true,
        });
      }
    } catch {}
    finally { setAnalyzing(false); }
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
                Personal Annotation / Note
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
                  {source.note || 'No custom annotations written yet. Click edit to add notes or thoughts.'}
                </p>
              )}
            </div>

            {/* AI Summary Section */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="block text-[10px] font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  AI Context Summary
                </span>
              </div>
              <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {source.aiSummary || 'Analysis pending... Use re-analyze to run Gemini model over raw metadata.'}
              </p>
            </div>

            {/* AI Key Insights points */}
            {source.aiKeyPoints && source.aiKeyPoints.length > 0 && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <span className="block text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Core Technical Takeaways
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
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Workspace Project</span>
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
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Category</span>
                <span className="font-semibold text-stone-800 dark:text-stone-200 mt-1 block">
                  {source.category}
                </span>
              </div>

              {/* Importance level */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Importance Level</span>
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
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium">Context Package Status</span>
                <button
                  id="btn-detail-toggle-ctx"
                  onClick={() => onUpdate(source.id, { includeInContext: !source.includeInContext })}
                  className={`mt-1.5 px-2.5 py-1 rounded-md border text-[10.5px] font-sans font-semibold transition-colors cursor-pointer ${
                    source.includeInContext
                      ? 'bg-stone-900 border-stone-900 text-white dark:bg-stone-50 dark:border-stone-50 dark:text-stone-950'
                      : 'bg-transparent border-stone-200 dark:border-stone-800 text-stone-500'
                  }`}
                >
                  {source.includeInContext ? 'Included in Context Prompt' : 'Omitted (Click to include)'}
                </button>
              </div>

              {/* Tags distribution */}
              <div>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 font-medium mb-1">Tags</span>
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
