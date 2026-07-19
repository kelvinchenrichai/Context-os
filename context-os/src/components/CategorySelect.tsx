import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Category, Language } from '../types';

interface CategorySelectProps {
  id?: string;
  categories: Category[];
  value: string;
  onChange: (name: string) => void;
  onCreate: (name: string) => void;
  lang: Language;
}

const NEW_CATEGORY_VALUE = '__new__';

export default function CategorySelect({ id, categories, value, onChange, onCreate, lang }: CategorySelectProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState('');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === NEW_CATEGORY_VALUE) {
      setIsCreating(true);
      setDraftName('');
      return;
    }
    onChange(e.target.value);
  };

  const confirmCreate = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    // Reuse an existing category if the name already exists (case-insensitive)
    const existing = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (!existing) {
      onCreate(trimmed);
    }
    onChange(existing ? existing.name : trimmed);
    setIsCreating(false);
    setDraftName('');
  };

  if (isCreating) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmCreate(); }
            if (e.key === 'Escape') { setIsCreating(false); setDraftName(''); }
          }}
          placeholder={lang === 'zh-TW' ? '輸入新分類名稱…' : 'New category name…'}
          className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-500"
        />
        <button
          type="button"
          onClick={confirmCreate}
          className="shrink-0 p-2 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-90"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => { setIsCreating(false); setDraftName(''); }}
          className="shrink-0 p-2 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={handleSelectChange}
      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs font-sans text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400 dark:focus:border-stone-700"
    >
      {categories.map((cat) => (
        <option key={cat.id} value={cat.name}>
          {cat.name}
        </option>
      ))}
      {/* If the current value isn't a known category yet (e.g. legacy mock
          data), still show it so the select doesn't silently jump away. */}
      {value && !categories.some(c => c.name === value) && (
        <option value={value}>{value}</option>
      )}
      <option value={NEW_CATEGORY_VALUE}>
        {lang === 'zh-TW' ? '＋ 新增分類…' : '+ New category…'}
      </option>
    </select>
  );
}
