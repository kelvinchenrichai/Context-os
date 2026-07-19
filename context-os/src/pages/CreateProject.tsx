import React, { useState } from 'react';
import { Layers, ArrowLeft, Check, FolderPlus } from 'lucide-react';
import { ProjectType, ProjectStatus, Category, Language } from '../types';
import { TRANSLATIONS } from '../data';
import CategorySelect from '../components/CategorySelect';

interface CreateProjectProps {
  categories: Category[];
  onCreateCategory: (name: string) => void;
  onSave: (name: string, description: string, type: ProjectType, color: string, defaultCategory: string, status: ProjectStatus) => void;
  onBack: () => void;
  lang: Language;
}

export default function CreateProject({ categories, onCreateCategory, onSave, onBack, lang }: CreateProjectProps) {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>('software');
  const [color, setColor] = useState('#4F46E5'); // Indigo default
  const [defaultCategory, setDefaultCategory] = useState(categories[0]?.name || '');
  const [status, setStatus] = useState<ProjectStatus>('idea');

  const colorsList = [
    '#4F46E5', // Indigo
    '#0891B2', // Cyan
    '#DB2777', // Pink
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#18181B', // Charcoal/Dark
  ];

  const typesList: { id: ProjectType; label: string }[] = lang === 'zh-TW' ? [
    { id: 'software', label: '軟體開發 (Software)' },
    { id: 'trading', label: '量化交易 (Trading)' },
    { id: 'content', label: '媒體內容 (Content)' },
    { id: 'research', label: '學術研究 (Research)' },
    { id: 'business', label: '商業企劃 (Business)' },
    { id: 'personal', label: '個人收藏 (Personal)' },
  ] : [
    { id: 'software', label: 'Software' },
    { id: 'trading', label: 'Trading' },
    { id: 'content', label: 'Content' },
    { id: 'research', label: 'Research' },
    { id: 'business', label: 'Business' },
    { id: 'personal', label: 'Personal' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name, description, type, color, defaultCategory, status);
  };

  return (
    <div id="create-project-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto space-y-6 bg-white dark:bg-stone-950">
      
      {/* Back button */}
      <button 
        id="btn-create-project-back"
        onClick={onBack}
        className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-sans font-semibold transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'zh-TW' ? '返回專案列表' : 'Back to projects'}</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="font-sans text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {t.createProject}
        </h1>
        <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
          {lang === 'zh-TW' ? '配置一個全新獨立的 AI 記憶核心' : 'Define an isolated container with custom category triggers.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {t.projectName}
          </label>
          <input
            id="create-project-name-input"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Cursor Project Core"
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
          />
        </div>

        {/* Project Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {t.projectDesc}
          </label>
          <textarea
            id="create-project-desc-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail the technical architecture, target goals or specific references stored in this context container..."
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700 resize-none"
          />
        </div>

        {/* Project Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {t.projectType}
          </label>
          <select
            id="create-project-type-select"
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
          >
            {typesList.map((tItem) => (
              <option key={tItem.id} value={tItem.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
                {tItem.label}
              </option>
            ))}
          </select>
        </div>

        {/* Project Progress Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {lang === 'zh-TW' ? '專案目前進度' : 'Project Progress Status'}
          </label>
          <select
            id="create-project-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
          >
            <option value="idea" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '想法構思階段 (Idea / Concept)' : 'Idea / Concept'}
            </option>
            <option value="planning" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '計畫籌備中 (Planning)' : 'Planning'}
            </option>
            <option value="in_progress" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '專案執行中 (In Progress)' : 'In Progress'}
            </option>
            <option value="done" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
              {lang === 'zh-TW' ? '已完成結案 (Done / Completed)' : 'Completed / Done'}
            </option>
          </select>
        </div>

        {/* Default Category */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {t.defaultCategory}
          </label>
          <CategorySelect
            id="create-project-cat-select"
            categories={categories}
            value={defaultCategory}
            onChange={setDefaultCategory}
            onCreate={onCreateCategory}
            lang={lang}
          />
        </div>

        {/* Brand Color Theme Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {lang === 'zh-TW' ? '專案代表色' : 'Project Color Theme'}
          </label>
          <div className="flex flex-wrap gap-2.5">
            {colorsList.map((c) => (
              <button
                key={c}
                id={`create-project-color-${c.replace('#', '')}`}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-900 flex justify-end gap-3">
          <button
            id="btn-create-project-cancel"
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-sans font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/40 cursor-pointer"
          >
            {lang === 'zh-TW' ? '取消' : 'Cancel'}
          </button>
          <button
            id="btn-create-project-submit"
            type="submit"
            className="px-4 py-2 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer"
          >
            {lang === 'zh-TW' ? '確認建立' : 'Create Context Core'}
          </button>
        </div>
      </form>
    </div>
  );
}
