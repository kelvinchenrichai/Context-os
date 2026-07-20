import React, { useState, useEffect, useRef } from 'react';
import {
  CheckSquare, Square, Plus, Trash2, Mic, MicOff,
  Loader2, Calendar, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Project, Language } from '../types';
import { Todo, fetchTodos, createTodo, updateTodo, deleteTodo } from '../api';

interface TodoSectionProps {
  projects: Project[];
  lang: Language;
  filterProjectId?: string;   // when used inside ProjectDetail
}

export default function TodoSection({ projects, lang, filterProjectId }: TodoSectionProps) {
  const zh = lang === 'zh-TW';
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(filterProjectId || null);
  const [dueAt, setDueAt] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDone, setShowDone] = useState(false);

  // Voice input
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Load todos from backend
  useEffect(() => {
    fetchTodos(filterProjectId).then(data => {
      setTodos(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filterProjectId]);

  // Web Speech API setup
  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(zh ? '你的瀏覽器不支援語音輸入，請使用 Chrome 或 Safari。' : 'Your browser does not support speech recognition. Please use Chrome or Safari.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = zh ? 'zh-TW' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setShowForm(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleAdd = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const { id } = await createTodo({
        text: trimmed,
        projectId: selectedProject || null,
        dueAt: dueAt || null,
      });
      const newTodo: Todo = {
        id,
        text: trimmed,
        note: '',
        isDone: false,
        projectId: selectedProject || null,
        dueAt: dueAt || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTodos(prev => [newTodo, ...prev]);
      setInputText('');
      setDueAt('');
      setShowForm(false);
    } catch (e: any) {
      alert(e.message || (zh ? '新增失敗' : 'Failed to add todo'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (todo: Todo) => {
    const next = !todo.isDone;
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, isDone: next } : t));
    await updateTodo(todo.id, { isDone: next }).catch(() => {
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, isDone: todo.isDone } : t));
    });
  };

  const handleDelete = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    await deleteTodo(id).catch(() => {});
  };

  const formatDue = (dueAt: string | null) => {
    if (!dueAt) return null;
    const d = new Date(dueAt);
    const now = new Date();
    const isOverdue = d < now;
    const str = d.toLocaleString(zh ? 'zh-TW' : 'en-US', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
    return { str, isOverdue };
  };

  const pending = todos.filter(t => !t.isDone);
  const done = todos.filter(t => t.isDone);

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-stone-400" />
            {zh ? '待辦事項' : 'To-Do'}
            {pending.length > 0 && (
              <span className="text-[10px] font-mono bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full px-1.5 py-0.5">
                {pending.length}
              </span>
            )}
          </h2>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 font-sans">
            {zh ? '可以語音或文字新增，關聯到任何專案' : 'Add by voice or text, link to any project'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice button */}
          <button
            onClick={isListening ? stopVoice : startVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-sans font-semibold transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {isListening ? (zh ? '停止' : 'Stop') : (zh ? '語音' : 'Voice')}
          </button>
          {/* Add button */}
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-sans font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            {zh ? '新增' : 'Add'}
          </button>
        </div>
      </div>

      {/* Voice listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs font-sans text-red-600 dark:text-red-400">
          <div className="flex gap-0.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 bg-red-500 rounded-full animate-bounce" style={{ height: '12px', animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          {zh ? '正在聆聽…請說出你的待辦事項' : 'Listening… speak your todo'}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
              placeholder={zh ? '輸入待辦事項…' : 'What needs to be done?'}
              className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
            />
            <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            {/* Project selector */}
            {!filterProjectId && (
              <select
                value={selectedProject || ''}
                onChange={e => setSelectedProject(e.target.value || null)}
                className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-[11px] font-sans text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                <option value="">{zh ? '不關聯專案' : 'No project'}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}

            {/* Due date */}
            <div className="flex items-center gap-1.5 flex-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <input
                type="datetime-local"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-[11px] font-sans text-stone-700 dark:text-stone-300 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!inputText.trim() || saving}
            className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {zh ? '新增待辦' : 'Add Todo'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Pending todos */}
          {pending.length === 0 && !showForm && (
            <div className="text-center py-6 text-[11px] text-stone-400 font-sans">
              {zh ? '沒有待辦事項，按「新增」或「語音」來加入' : 'No todos yet — click Add or Voice to get started'}
            </div>
          )}

          {pending.map(todo => (
            <TodoRow
              key={todo.id}
              todo={todo}
              projects={projects}
              zh={zh}
              onToggle={() => handleToggle(todo)}
              onDelete={() => handleDelete(todo.id)}
              formatDue={formatDue}
            />
          ))}

          {/* Completed todos toggle */}
          {done.length > 0 && (
            <div>
              <button
                onClick={() => setShowDone(v => !v)}
                className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-sans py-1"
              >
                {showDone ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {zh ? `已完成 (${done.length})` : `Completed (${done.length})`}
              </button>
              {showDone && (
                <div className="space-y-1.5 mt-1.5 opacity-60">
                  {done.map(todo => (
                    <TodoRow
                      key={todo.id}
                      todo={todo}
                      projects={projects}
                      zh={zh}
                      onToggle={() => handleToggle(todo)}
                      onDelete={() => handleDelete(todo.id)}
                      formatDue={formatDue}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ─── TodoRow sub-component ────────────────────────────────────────────────────

function TodoRow({ todo, projects, zh, onToggle, onDelete, formatDue }: {
  todo: Todo;
  projects: Project[];
  zh: boolean;
  onToggle: () => void;
  onDelete: () => void;
  formatDue: (d: string | null) => { str: string; isOverdue: boolean } | null;
}) {
  const proj = todo.projectId ? projects.find(p => p.id === todo.projectId) : null;
  const due = formatDue(todo.dueAt);

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-colors group ${
      todo.isDone
        ? 'bg-stone-50/50 dark:bg-stone-900/20 border-stone-100 dark:border-stone-900'
        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
    }`}>
      <button onClick={onToggle} className="shrink-0 mt-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors">
        {todo.isDone
          ? <CheckSquare className="w-4 h-4 text-emerald-500" />
          : <Square className="w-4 h-4" />
        }
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-xs font-sans font-medium leading-snug ${
          todo.isDone ? 'line-through text-stone-400 dark:text-stone-600' : 'text-stone-800 dark:text-stone-200'
        }`}>
          {todo.text}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {proj && (
            <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded border text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800"
              style={{ borderLeftColor: proj.color, borderLeftWidth: '3px' }}>
              {proj.name}
            </span>
          )}
          {due && (
            <span className={`flex items-center gap-1 text-[10px] font-mono ${due.isOverdue ? 'text-red-500' : 'text-stone-400 dark:text-stone-500'}`}>
              <Calendar className="w-3 h-3" />
              {due.str}
              {due.isOverdue && (zh ? ' 已逾期' : ' overdue')}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="shrink-0 p-1 text-stone-300 dark:text-stone-700 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
