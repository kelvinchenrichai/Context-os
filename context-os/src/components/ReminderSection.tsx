import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Bell, 
  Volume2, 
  Square, 
  CheckSquare, 
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Project, Language, Reminder } from '../types';

interface ReminderSectionProps {
  projects: Project[];
  lang: Language;
  filterProjectId?: string; // If specified, show only for this project
}

export default function ReminderSection({ projects, lang, filterProjectId }: ReminderSectionProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [selectedProjId, setSelectedProjId] = useState('global');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Load reminders
  useEffect(() => {
    const saved = localStorage.getItem('context_os_reminders');
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        setReminders(getMockReminders());
      }
    } else {
      const mock = getMockReminders();
      setReminders(mock);
      localStorage.setItem('context_os_reminders', JSON.stringify(mock));
    }
  }, []);

  const saveReminders = (list: Reminder[]) => {
    setReminders(list);
    localStorage.setItem('context_os_reminders', JSON.stringify(list));
  };

  const getMockReminders = (): Reminder[] => {
    return [
      {
        id: 'rem-1',
        projectId: 'proj-1',
        title: lang === 'zh-TW' ? '期權做市商 Delta 避險平倉審查與提交' : ' SPX Index Option Delta Hedging Review & Submission',
        time: '2026-07-09T15:30',
        type: 'text',
        isCompleted: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rem-2',
        projectId: 'proj-3',
        title: lang === 'zh-TW' ? '語音記事：分析 IG Reels 影片前三秒高流失率剪輯點' : 'Voice Note: Deconstruct top Vercel video hooks inside first 3 seconds',
        time: '2026-07-09T10:00',
        type: 'voice',
        isCompleted: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rem-3',
        projectId: 'proj-2',
        title: lang === 'zh-TW' ? '提交與 n8n Workflow 的 API 連接配置報告' : 'Complete n8n multi-agent reasoning node workspace setup',
        time: '2026-07-09T18:00',
        type: 'text',
        isCompleted: false,
        createdAt: new Date().toISOString()
      }
    ];
  };

  // Recording Timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleAddTextReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time) return;

    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      projectId: selectedProjId,
      title: title.trim(),
      time,
      type: 'text',
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    saveReminders([newRem, ...reminders]);
    setTitle('');
    setTime('');
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
  };

  const stopVoiceRecordingAndTranscribe = () => {
    setIsRecording(false);
    
    // Simulate transcribing using preset high-fidelity voice notes based on project
    let transcribedText = '';
    const selectedProj = projects.find(p => p.id === selectedProjId);
    
    if (lang === 'zh-TW') {
      transcribedText = `🎙️ 語音備忘：關於「${selectedProj ? selectedProj.name : '系統全局'}」重要備註 - 需要在今日完成提交與最終驗證`;
    } else {
      transcribedText = `🎙️ Voice Memo: Critical note for "${selectedProj ? selectedProj.name : 'Workspace'}" - Ensure full compile checks and submission before deadline`;
    }

    const defaultTime = new Date(Date.now() + 2 * 3600 * 1000) // 2 hours from now
      .toISOString()
      .slice(0, 16);

    const newRem: Reminder = {
      id: `rem-${Date.now()}`,
      projectId: selectedProjId,
      title: transcribedText,
      time: defaultTime,
      type: 'voice',
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    saveReminders([newRem, ...reminders]);
  };

  const toggleComplete = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r);
    saveReminders(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
  };

  const handlePlayAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      // Automatically stop playing after 3 seconds simulation
      setTimeout(() => {
        setPlayingAudioId(current => current === id ? null : current);
      }, 3000);
    }
  };

  // Filter reminders for display
  const displayedReminders = reminders.filter(r => {
    if (filterProjectId) {
      return r.projectId === filterProjectId;
    }
    return true;
  });

  // Helper colors for project badges
  const getProjectBadgeStyle = (pId: string) => {
    const proj = projects.find(p => p.id === pId);
    if (!proj) return { borderLeft: '3px solid #78716c', bg: 'bg-stone-100 dark:bg-stone-850' };
    return {
      borderLeft: `3.5px solid ${proj.color}`,
      bg: 'bg-stone-50 dark:bg-stone-900/40'
    };
  };

  const formatTimeStr = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      
      if (lang === 'zh-TW') {
        return `${d.getMonth() + 1}月${d.getDate()}日 ${hours}:${mins}`;
      } else {
        return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${hours}:${mins}`;
      }
    } catch(e) {
      return timeStr;
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-stone-700 dark:text-stone-300" />
          <div>
            <h3 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '日程提醒與語音/文字備忘' : 'Calendar Deadlines & Voice Reminders'}
            </h3>
            <p className="text-[11px] font-sans text-stone-500 dark:text-stone-400">
              {lang === 'zh-TW' ? '追蹤專案時程，支持錄音筆記與時效提醒' : 'Schedule deadlines or record voice-to-text memos'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-850 px-2 py-1 rounded-lg text-[10px] font-mono text-stone-500 dark:text-stone-400">
          <Bell className="w-3 h-3 text-amber-500 animate-bounce" />
          <span>{displayedReminders.filter(r => !r.isCompleted).length} {lang === 'zh-TW' ? '個待辦' : 'Pending'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Create / Record Reminder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-stone-50/60 dark:bg-stone-950/40 rounded-xl border border-stone-150 dark:border-stone-850 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {lang === 'zh-TW' ? '新增記事與提醒' : 'Add Note / Memo'}
            </h4>

            {/* Simulated Voice Recorder Section */}
            <div className="space-y-3">
              <label className="text-[11px] font-sans font-semibold text-stone-500 dark:text-stone-400 block">
                {lang === 'zh-TW' ? '🎙️ 語音記事錄音器 (Voice-to-Text)' : '🎙️ Voice Note Recorder'}
              </label>
              
              {!isRecording ? (
                <button
                  type="button"
                  id="btn-voice-recorder-start"
                  onClick={startVoiceRecording}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-800 transition-colors"
                >
                  <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>{lang === 'zh-TW' ? '開始模擬語音記事' : 'Simulate Voice Recording'}</span>
                </button>
              ) : (
                <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-200/50 dark:border-red-900/30 rounded-lg p-3 flex flex-col items-center justify-center gap-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                      Recording: 0:{(recordingSeconds < 10 ? '0' : '') + recordingSeconds}
                    </span>
                  </div>
                  
                  {/* Highly polished breathing CSS waveform animation */}
                  <div className="flex items-end gap-1 h-5 my-1">
                    <span className="w-1 bg-red-500 dark:bg-red-400 rounded-full h-2 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-1 bg-red-500 dark:bg-red-400 rounded-full h-4 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <span className="w-1 bg-red-500 dark:bg-red-400 rounded-full h-5 animate-bounce" style={{ animationDelay: '0.5s' }} />
                    <span className="w-1 bg-red-500 dark:bg-red-400 rounded-full h-3 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1 bg-red-500 dark:bg-red-400 rounded-full h-4 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <span className="w-1 bg-red-500 dark:bg-red-400 rounded-full h-2 animate-bounce" style={{ animationDelay: '0.6s' }} />
                  </div>

                  <button
                    type="button"
                    id="btn-voice-recorder-stop"
                    onClick={stopVoiceRecordingAndTranscribe}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>{lang === 'zh-TW' ? '停止並自動生成文字' : 'Stop & Auto-Transcribe'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-stone-200 dark:border-stone-800" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase">
                <span className="px-2 bg-stone-50 dark:bg-stone-900 text-stone-400 dark:text-stone-500 font-bold">
                  {lang === 'zh-TW' ? '或 使用文字輸入' : 'or use text input'}
                </span>
              </div>
            </div>

            {/* Standard Text Form */}
            <form onSubmit={handleAddTextReminder} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-sans font-semibold text-stone-500 dark:text-stone-400 block">
                  {lang === 'zh-TW' ? '備忘描述 / 提醒項目' : 'Reminder description'}
                </label>
                <input
                  type="text"
                  id="reminder-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'zh-TW' ? '例如：下午三點半提交分析報告...' : 'e.g., Submit options summary reports...'}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-semibold text-stone-500 dark:text-stone-400 block">
                    {lang === 'zh-TW' ? '提醒時間' : 'Deadline / Time'}
                  </label>
                  <input
                    type="datetime-local"
                    id="reminder-time-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2 py-1.5 text-[11px] text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-sans font-semibold text-stone-500 dark:text-stone-400 block">
                    {lang === 'zh-TW' ? '關聯專案' : 'Link Project'}
                  </label>
                  <select
                    id="reminder-project-select"
                    value={selectedProjId}
                    onChange={(e) => setSelectedProjId(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2 py-1.5 text-[11px] text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 font-sans"
                  >
                    <option value="global" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                      {lang === 'zh-TW' ? '全局 / 無關聯' : 'Global / None'}
                    </option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                id="btn-add-text-reminder"
                disabled={!title.trim() || !time}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'zh-TW' ? '建立文字日程提醒' : 'Add Text Reminder'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Timeline Agenda list */}
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {lang === 'zh-TW' ? '提醒記事日程清單 (Timeline Agenda)' : 'Upcoming Timeline Agenda'}
          </h4>

          {displayedReminders.length === 0 ? (
            <div className="h-[260px] border border-dashed border-stone-200 dark:border-stone-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="w-8 h-8 text-stone-300 dark:text-stone-700 mb-2" />
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 font-sans">
                {lang === 'zh-TW' ? '尚無日程備忘' : 'No upcoming deadlines'}
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans mt-0.5">
                {lang === 'zh-TW' ? '可以點擊左側模擬錄音或輸入文字來新建日程。' : 'Simulate a voice note or add text key points above.'}
              </span>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[295px] overflow-y-auto pr-1 scrollbar-thin">
              {displayedReminders.map((rem) => {
                const badge = getProjectBadgeStyle(rem.projectId);
                const isOverdue = new Date(rem.time).getTime() < Date.now() && !rem.isCompleted;

                return (
                  <div
                    key={rem.id}
                    id={`reminder-item-${rem.id}`}
                    className={`p-3.5 rounded-lg border border-stone-200 dark:border-stone-800/80 transition-all flex items-start gap-3.5 shadow-sm ${badge.bg}`}
                    style={{ borderLeft: badge.borderLeft }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleComplete(rem.id)}
                      className="mt-0.5 text-stone-400 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-200 transition-colors shrink-0"
                    >
                      {rem.isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-stone-300 dark:border-stone-700" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {rem.type === 'voice' && (
                          <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[8px] font-mono font-bold uppercase rounded flex items-center gap-0.5 shrink-0">
                            <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                            Voice
                          </span>
                        )}
                        <p className={`font-sans text-xs font-semibold leading-snug break-words ${rem.isCompleted ? 'text-stone-400 dark:text-stone-600 line-through' : 'text-stone-800 dark:text-stone-200'}`}>
                          {rem.title}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-stone-400 dark:text-stone-500">
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 dark:text-red-400 font-bold' : ''}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeStr(rem.time)} {isOverdue && (lang === 'zh-TW' ? '(已逾期)' : '(Overdue)')}
                        </span>

                        {rem.projectId !== 'global' && (
                          <span className="font-sans text-[9px] text-stone-500 dark:text-stone-400 px-1.5 rounded-md bg-stone-100 dark:bg-stone-850">
                            {projects.find(p => p.id === rem.projectId)?.name || 'Linked'}
                          </span>
                        )}
                      </div>

                      {/* Voice Memo interactive Player simulator */}
                      {rem.type === 'voice' && !rem.isCompleted && (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(rem.id)}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-850 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {playingAudioId === rem.id ? (
                              <>
                                <Pause className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span className="animate-pulse">Playing...</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span>Play Recording</span>
                              </>
                            )}
                          </button>
                          
                          {playingAudioId === rem.id && (
                            <div className="flex items-center gap-0.5">
                              <span className="w-0.5 bg-indigo-500 h-2.5 animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <span className="w-0.5 bg-indigo-500 h-4 animate-bounce" style={{ animationDelay: '0.3s' }} />
                              <span className="w-0.5 bg-indigo-500 h-3 animate-bounce" style={{ animationDelay: '0.2s' }} />
                              <span className="w-0.5 bg-indigo-500 h-1 animate-bounce" style={{ animationDelay: '0.4s' }} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(rem.id)}
                      className="text-stone-400 dark:text-stone-600 hover:text-red-500 transition-colors shrink-0 p-1"
                      title={lang === 'zh-TW' ? '刪除此項目' : 'Delete item'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
