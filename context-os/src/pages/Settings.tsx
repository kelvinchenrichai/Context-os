import React, { useState } from 'react';
import { 
  Laptop, 
  Globe2, 
  Check, 
  CreditCard, 
  Zap, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Download,
  HelpCircle,
  Sun,
  Moon,
  Tag,
  Plus,
  Pencil,
  Trash2,
  X
} from 'lucide-react';
import { Language, Theme, Category, Source } from '../types';
import { TRANSLATIONS } from '../data';

interface SettingsProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onRestartTour: () => void;
  categories: Category[];
  sources: Source[];
  onCreateCategory: (name: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onNavigatePlan: () => void;
  onNavigateApiKeys: () => void;
}

export default function Settings({ 
  lang, setLang, theme, setTheme, onRestartTour,
  categories, sources, onCreateCategory, onRenameCategory, onDeleteCategory,
  onNavigatePlan, onNavigateApiKeys
}: SettingsProps) {
  const t = TRANSLATIONS[lang];
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const categoryUsageCount = (catName: string) => sources.filter(s => s.category === catName).length;

  const startEditingCategory = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const confirmEditingCategory = () => {
    if (editingCatId && editingCatName.trim()) {
      onRenameCategory(editingCatId, editingCatName.trim());
    }
    setEditingCatId(null);
    setEditingCatName('');
  };

  const handleAddCategory = () => {
    if (newCatName.trim()) {
      onCreateCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  const handleDeleteCategoryClick = (cat: Category) => {
    const usage = categoryUsageCount(cat.name);
    if (usage > 0) {
      const confirmMsg = lang === 'zh-TW'
        ? `「${cat.name}」目前有 ${usage} 筆資料使用中，刪除後這些資料會改標成「Uncategorized」。確定要刪除嗎？`
        : `"${cat.name}" is used by ${usage} source(s). Deleting it will re-tag them as "Uncategorized". Continue?`;
      if (!window.confirm(confirmMsg)) return;
    }
    onDeleteCategory(cat.id);
  };

  const handleInstallPwaMock = () => {
    alert(lang === 'zh-TW'
      ? 'iOS Safari：點下方「分享」→「加入主畫面」\nAndroid Chrome：點網址列右邊的安裝圖示，或選單→「安裝應用程式」'
      : 'iOS Safari: tap Share → Add to Home Screen\nAndroid Chrome: tap the install icon in the address bar, or Menu → Install App');
  };

  return (
    <div id="settings-page" className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto space-y-8 bg-white dark:bg-stone-950">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5">
        <h1 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          {t.settings}
        </h1>
        <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
          {lang === 'zh-TW' ? '管理您的個人帳戶、多國語言切換、顯示主題與專業 SaaS 訂閱方案' : 'Orchestrate display styles, localization metrics, and commercial tiers.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left configurations list */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-stone-50/55 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-850 rounded-xl p-5 space-y-5 text-xs font-sans">
            
            {/* Language Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5" />
                <span>Language (語言)</span>
              </label>
              <div className="flex gap-2">
                <button
                  id="btn-lang-en"
                  onClick={() => setLang('en')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-sans font-semibold transition-colors cursor-pointer ${
                    lang === 'en'
                      ? 'bg-stone-950 border-stone-950 dark:bg-stone-50 dark:border-stone-50 text-white dark:text-stone-950'
                      : 'bg-white border-stone-200 dark:bg-stone-900 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-450'
                  }`}
                >
                  English
                </button>
                <button
                  id="btn-lang-tw"
                  onClick={() => setLang('zh-TW')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-sans font-semibold transition-colors cursor-pointer ${
                    lang === 'zh-TW'
                      ? 'bg-stone-950 border-stone-950 dark:bg-stone-50 dark:border-stone-50 text-white dark:text-stone-950'
                      : 'bg-white border-stone-200 dark:bg-stone-900 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-450'
                  }`}
                >
                  繁體中文
                </button>
              </div>
            </div>

            {/* Theme selection */}
            <div className="space-y-2.5 pt-4 border-t border-stone-150">
              <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>Display Theme (顯示主題)</span>
              </label>
              
              <div className="flex gap-2">
                <button
                  id="btn-theme-light"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-sans font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                    theme === 'light'
                      ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{lang === 'zh-TW' ? '淺色模式' : 'Light Mode'}</span>
                </button>
                <button
                  id="btn-theme-dark"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-sans font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                    theme === 'dark'
                      ? 'bg-stone-100 border-stone-300 text-stone-900 dark:bg-stone-100 dark:border-stone-100 dark:text-stone-950 shadow-sm'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 dark:bg-stone-900 dark:border-stone-800 dark:text-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{lang === 'zh-TW' ? '深色模式' : 'Dark Mode'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-stone-100/50 dark:bg-stone-900/40 rounded-lg border border-stone-200 dark:border-stone-800 space-y-1">
                <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal">
                  {theme === 'light' 
                    ? (lang === 'zh-TW' 
                      ? '淺色模式 (Light Mode)：精緻的冷調白與極佳對比度的深灰文字，結構與邊框層次分明，閱讀與操作清晰明瞭。' 
                      : 'Light Mode: A premium cool-white background combined with rich, high-contrast dark text and distinct slate borders.')
                    : (lang === 'zh-TW' 
                      ? '深色模式 (Dark Mode)：奢華的深空黑（GitHub Dark 同級質感），搭配高對比度的極光白與亮灰文字，層次立體，資訊一目了然。' 
                      : 'Dark Mode: Modeled directly after high-contrast luxury slate-dark UI, featuring rich crisp text and defined boundaries.')}
                </p>
              </div>
            </div>

            {/* Walkthrough / Tour Restart Button */}
            <div className="space-y-2 pt-4 border-t border-stone-150 dark:border-stone-800">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Feature Guide (功能引導)</span>
              </label>
              <button
                id="btn-trigger-tour-settings"
                onClick={onRestartTour}
                className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-center font-sans font-semibold transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{lang === 'zh-TW' ? '重新啟動功能導覽' : 'Restart Walkthrough'}</span>
              </button>
            </div>

            {/* Profile context summary */}
            <div className="pt-4 border-t border-stone-150 dark:border-stone-800 space-y-1 text-stone-500">
              <span className="block text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider">Account ID</span>
              <p className="font-mono text-[10px] text-stone-900 dark:text-stone-100">usr_kelvin_2026</p>
            </div>

          </div>
        </div>

        {/* Right commercial packages and PWA installation panels */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Quick links to sub-pages */}
          <section className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              {lang === 'zh-TW' ? '進階設定' : 'Advanced Settings'}
            </h3>
            <div className="space-y-2">
              <button
                onClick={onNavigatePlan}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-sans hover:border-stone-400 dark:hover:border-stone-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-stone-400" />
                  <div className="text-left">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">
                      {lang === 'zh-TW' ? '方案與用量' : 'Plan & Usage'}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                      {lang === 'zh-TW' ? '查看用量、升級或切換方案' : 'View usage and manage your subscription'}
                    </p>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-stone-300 dark:text-stone-700 group-hover:text-stone-500 dark:group-hover:text-stone-400" />
              </button>

              <button
                onClick={onNavigateApiKeys}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-sans hover:border-stone-400 dark:hover:border-stone-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-stone-400" />
                  <div className="text-left">
                    <p className="font-semibold text-stone-800 dark:text-stone-200">
                      {lang === 'zh-TW' ? 'Advanced Model Control（BYOK）' : 'Advanced Model Control (BYOK)'}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                      {lang === 'zh-TW' ? '使用自己的 API Key，Power 方案限定' : 'Bring your own API key — Power Plan only'}
                    </p>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-stone-300 dark:text-stone-700 group-hover:text-stone-500 dark:group-hover:text-stone-400" />
              </button>
            </div>
          </section>

          {/* Category Management Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {lang === 'zh-TW' ? '分類管理' : 'Category Management'}
              </h3>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 -mt-2">
              {lang === 'zh-TW' 
                ? '這些分類會出現在「新增來源」與「建立專案」的分類選單裡。重新命名會同步更新所有使用該分類的資料。' 
                : 'These appear in the category picker across Save/Share/Create Project. Renaming updates every source using it.'}
            </p>

            <div className="border border-stone-200 dark:border-stone-800 rounded-xl divide-y divide-stone-150 dark:divide-stone-800 overflow-hidden">
              {categories.map((cat) => (
                <div key={cat.id} id={`category-row-${cat.id}`} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-stone-900 text-xs font-sans">
                  {editingCatId === cat.id ? (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={editingCatName}
                        onChange={(e) => setEditingCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); confirmEditingCategory(); }
                          if (e.key === 'Escape') { setEditingCatId(null); }
                        }}
                        className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-md px-2 py-1 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-500"
                      />
                      <button onClick={confirmEditingCategory} className="p-1.5 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingCatId(null)} className="p-1.5 rounded-md border border-stone-200 dark:border-stone-800 text-stone-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-stone-800 dark:text-stone-200 truncate">{cat.name}</span>
                      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 shrink-0">
                        {categoryUsageCount(cat.name)} {lang === 'zh-TW' ? '筆' : 'used'}
                      </span>
                      <button
                        id={`category-rename-${cat.id}`}
                        onClick={() => startEditingCategory(cat)}
                        className="shrink-0 p-1.5 rounded-md text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`category-delete-${cat.id}`}
                        onClick={() => handleDeleteCategoryClick(cat)}
                        className="shrink-0 p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {/* Add new category row */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50/60 dark:bg-stone-950/40">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                  placeholder={lang === 'zh-TW' ? '新增分類名稱…' : 'New category name…'}
                  className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md px-2 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
                />
                <button
                  id="btn-add-category"
                  onClick={handleAddCategory}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-[11px] font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'zh-TW' ? '新增' : 'Add'}</span>
                </button>
              </div>
            </div>
          </section>

          {/* PWA Section */}
          <section className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-stone-700 dark:text-stone-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-sans text-xs font-bold text-stone-900 dark:text-stone-100">
                  {t.pwaTitle}
                </h3>
                <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  {t.pwaDesc}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-start gap-2.5">
              <button
                id="btn-settings-install-pwa"
                onClick={handleInstallPwaMock}
                disabled={isPwaInstalled}
                className={`px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
                  isPwaInstalled 
                    ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                    : 'bg-stone-950 dark:bg-stone-50 hover:bg-stone-850 dark:hover:bg-stone-250 text-white dark:text-stone-950 cursor-pointer'
                }`}
              >
                {isPwaInstalled ? 'PWA Installed to Simulated Desktop' : 'Install Standalone App'}
              </button>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
