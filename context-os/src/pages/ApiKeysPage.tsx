import React, { useState } from 'react';
import { ArrowLeft, Key, Plus, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff, Zap } from 'lucide-react';
import { Language, ApiKey, ApiProvider } from '../types';

interface ApiKeysPageProps {
  lang: Language;
  apiKeys: ApiKey[];
  onAddKey: (provider: ApiProvider, rawKey: string, label: string) => void;
  onDeleteKey: (id: string) => void;
  onToggleKey: (id: string) => void;
  onBack: () => void;
  isPowerPlan: boolean;
}

const PROVIDERS: { id: ApiProvider; name: string; placeholder: string; docsUrl: string; color: string }[] = [
  { id: 'gemini',    name: 'Google Gemini',  placeholder: 'AIza…',   docsUrl: 'https://aistudio.google.com/apikey', color: 'text-blue-500' },
  { id: 'openai',    name: 'OpenAI',         placeholder: 'sk-…',    docsUrl: 'https://platform.openai.com/api-keys', color: 'text-emerald-500' },
  { id: 'anthropic', name: 'Anthropic Claude', placeholder: 'sk-ant-…', docsUrl: 'https://console.anthropic.com/settings/keys', color: 'text-violet-500' },
];

function maskKey(raw: string): string {
  if (raw.length <= 8) return '••••••••';
  return raw.slice(0, 6) + '••••••••' + raw.slice(-4);
}

export default function ApiKeysPage({ lang, apiKeys, onAddKey, onDeleteKey, onToggleKey, onBack, isPowerPlan }: ApiKeysPageProps) {
  const zh = lang === 'zh-TW';
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>('gemini');
  const [rawKey, setRawKey] = useState('');
  const [label, setLabel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, 'ok' | 'fail'>>({});

  const handleAdd = () => {
    if (!rawKey.trim()) return;
    onAddKey(selectedProvider, rawKey.trim(), label.trim() || `My ${PROVIDERS.find(p => p.id === selectedProvider)?.name} Key`);
    setRawKey('');
    setLabel('');
  };

  const handleTest = (key: ApiKey) => {
    setTestingId(key.id);
    // Mock test — in Phase 4 this will actually ping the provider
    setTimeout(() => {
      setTestResult(prev => ({ ...prev, [key.id]: Math.random() > 0.2 ? 'ok' : 'fail' }));
      setTestingId(null);
    }, 1200);
  };

  return (
    <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto space-y-8 bg-white dark:bg-stone-950">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-5">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Key className="w-5 h-5" />
            {zh ? 'Advanced Model Control（BYOK）' : 'Advanced Model Control (BYOK)'}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {zh ? '使用你自己的 API Key，選擇偏好的 AI 模型進行分析與匯出' : 'Use your own API keys to power AI analysis and context export with your preferred model'}
          </p>
        </div>
      </div>

      {/* Power plan gate */}
      {!isPowerPlan && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-sans">
          <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-800 dark:text-amber-300">
              {zh ? 'Power 方案專屬功能' : 'Power Plan Feature'}
            </p>
            <p className="text-amber-700 dark:text-amber-400 leading-relaxed">
              {zh
                ? 'BYOK 屬於 Power 方案。你目前仍可以在此預覽介面與設定，但 Key 在升級前不會實際生效。'
                : "BYOK is a Power Plan feature. You can still preview and configure keys here — they won't be active until you upgrade."}
            </p>
          </div>
        </div>
      )}

      {/* Existing keys */}
      {apiKeys.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            {zh ? '已儲存的 API Keys' : 'Saved API Keys'}
          </h2>
          <div className="border border-stone-200 dark:border-stone-800 rounded-xl divide-y divide-stone-100 dark:divide-stone-800 overflow-hidden">
            {apiKeys.map(key => {
              const provider = PROVIDERS.find(p => p.id === key.provider);
              const result = testResult[key.id];
              return (
                <div key={key.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-stone-900 text-xs font-sans">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${provider?.color}`}>{provider?.name}</span>
                      <span className="text-stone-400 dark:text-stone-500 truncate">{key.label}</span>
                      {!key.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-400">
                          {zh ? '停用' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-stone-400 dark:text-stone-500">{key.maskedKey}</p>
                  </div>

                  {/* Test result badge */}
                  {result === 'ok' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {result === 'fail' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}

                  {/* Test button */}
                  <button
                    onClick={() => handleTest(key)}
                    disabled={testingId === key.id}
                    className="shrink-0 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-800 text-[10px] font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 disabled:opacity-50"
                  >
                    {testingId === key.id ? '…' : (zh ? '測試' : 'Test')}
                  </button>

                  {/* Toggle active */}
                  <button
                    onClick={() => onToggleKey(key.id)}
                    className={`shrink-0 w-8 h-4.5 rounded-full transition-colors relative ${key.isActive ? 'bg-stone-900 dark:bg-stone-100' : 'bg-stone-200 dark:bg-stone-700'}`}
                  >
                    <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-stone-900 transition-transform ${key.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteKey(key.id)}
                    className="shrink-0 p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Add new key form */}
      <section className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {zh ? '新增 API Key' : 'Add New API Key'}
        </h2>

        <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4">
          {/* Provider selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
              {zh ? '選擇 AI 提供商' : 'Provider'}
            </label>
            <div className="flex gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg border text-[10.5px] font-sans font-semibold transition-all ${
                    selectedProvider === p.id
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                      : 'border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-400'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
              {zh ? '名稱（選填）' : 'Label (optional)'}
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder={zh ? '例如：個人 Gemini Key' : 'e.g. My personal Gemini key'}
              className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Key input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400">
                API Key
              </label>
              <a
                href={PROVIDERS.find(p => p.id === selectedProvider)?.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline"
              >
                {zh ? '去哪裡取得？' : 'Where to get it?'}
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={rawKey}
                onChange={e => setRawKey(e.target.value)}
                placeholder={PROVIDERS.find(p => p.id === selectedProvider)?.placeholder}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 pr-9 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed">
              {zh
                ? '⚠️ Key 僅儲存在你的瀏覽器 localStorage，不會傳送到任何伺服器。正式版會加密儲存。'
                : '⚠️ Keys are stored in browser localStorage only and never sent to any server. Production will use encrypted storage.'}
            </p>
          </div>

          <button
            onClick={handleAdd}
            disabled={!rawKey.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            {zh ? '儲存 Key' : 'Save Key'}
          </button>
        </div>
      </section>

    </div>
  );
}
