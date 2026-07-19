import React, { useState } from 'react';
import { 
  FileCode2, 
  Check, 
  Clipboard, 
  Download, 
  Sparkles, 
  Layers, 
  Sliders,
  HelpCircle
} from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface ExportContextPageProps {
  projects: Project[];
  sources: Source[];
  lang: Language;
}

type ExportTarget = 'chatgpt' | 'claude' | 'gemini' | 'cursor';

export default function ExportContextPage({ projects, sources, lang }: ExportContextPageProps) {
  const t = TRANSLATIONS[lang];

  // Export Settings States
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [exportTarget, setExportTarget] = useState<ExportTarget>('claude');
  const [copied, setCopied] = useState(false);

  // Content Toggles
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeArchitecture, setIncludeArchitecture] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [includeTodos, setIncludeTodos] = useState(true);

  // Find selected project
  const project = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectSources = sources.filter(s => s.projectId === selectedProjectId && s.includeInContext);

  const generatePrompt = () => {
    if (!project) return '';

    let prompt = '';
    
    // Custom wrapper based on LLM platform optimization parameters
    if (exportTarget === 'claude') {
      prompt += `<system>\nYou are Claude, an expert developer and system analyst. The user has provided an indexed Context OS Project Memory structure below. Deeply study the technical notes, API constraints, and code samples before replying.\n</system>\n\n`;
    } else if (exportTarget === 'cursor') {
      prompt += `# CURSOR RULES ARCHITECTURE (.cursorrules)\n# Optimal context guidelines for localized workspace autocompletes\n\n`;
    } else if (exportTarget === 'gemini') {
      prompt += `[System Instruction: Prioritize strict adherence to the structured workspace contexts below. Use reasoning models to resolve conflicting dependencies.]\n\n`;
    }

    prompt += `=========================================\n`;
    prompt += `CONTEXT OS: PROJECT CONTEXT PACKAGE\n`;
    prompt += `PROJECT: ${project.name.toUpperCase()}\n`;
    prompt += `TYPE: ${project.type.toUpperCase()}\n`;
    prompt += `GENERATED TIMESTAMP: 2026-07-09 05:34 UTC\n`;
    prompt += `=========================================\n\n`;

    if (includeSummary) {
      prompt += `## 1. EXECUTIVE SUMMARY\n`;
      prompt += `${project.summary || project.description}\n\n`;
    }

    if (includeArchitecture) {
      prompt += `## 2. TECHNICAL ARCHITECTURE SPECIFICATION\n`;
      if (project.type === 'trading') {
        prompt += `- Core Infrastructure: Python, Pandas, vectorized BS equations.\n`;
        prompt += `- Strategy Scope: Options Market Maker hedging levels, GEX delta flips.\n`;
        prompt += `- Technical Standard: Arbitrage-free spline surface smoothing.\n\n`;
      } else if (project.type === 'software') {
        prompt += `- Core Infrastructure: TypeScript, Node.js, Express, Vite.\n`;
        prompt += `- API Standards: Server-side GoogleGenAI SDK tool calling, schema bindings.\n`;
        prompt += `- Technical Standard: ESM modules, esbuild compilation.\n\n`;
      } else {
        prompt += `- Core Infrastructure: Content engineering loops, marketing transcript analysis.\n`;
        prompt += `- Strategy Scope: Narrative visual rhythm pacing, retention hooks.\n`;
        prompt += `- Technical Standard: High-contrast title pacing overlays.\n\n`;
      }
    }

    if (includeSources && projectSources.length > 0) {
      prompt += `## 3. PRIMARY INDEXED SOURCES & SCHEMAS\n`;
      projectSources.forEach((s, idx) => {
        prompt += `### Source [${idx + 1}]: ${s.title}\n`;
        prompt += `- Platform/Category: ${s.platform.toUpperCase()} / ${s.category}\n`;
        prompt += `- Reference URL: ${s.url}\n`;
        prompt += `- Personal Note Annotation: "${s.note || 'No custom annotations written.'}"\n`;
        if (s.isAnalyzed) {
          prompt += `- AI Analysis Summary: ${s.aiSummary}\n`;
        }
        prompt += `\n`;
      });
    }

    if (includeInsights && projectSources.length > 0) {
      prompt += `## 4. DEEP TECH INSIGHTS SUMMARY\n`;
      projectSources.forEach((s) => {
        if (s.isAnalyzed && s.aiKeyPoints && s.aiKeyPoints.length > 0) {
          prompt += `### Key Takeaways from "${s.title}":\n`;
          s.aiKeyPoints.forEach(pt => {
            prompt += `- ${pt}\n`;
          });
          prompt += `\n`;
        }
      });
    }

    if (includeTodos) {
      prompt += `## 5. RECONSTRUCTED ACTION ITEMS & TODOs\n`;
      if (project?.type === 'trading') {
        prompt += `- [ ] Deep dive into dealer gamma flip zone mathematical logic\n`;
        prompt += `- [ ] Examine afternoon 0DTE volatility triggers on recent historical selloffs\n`;
        prompt += `- [x] Verify standard vectorized Black-Scholes computation module\n`;
      } else {
        prompt += `- [ ] Implement Gemini schema function bindings\n`;
        prompt += `- [x] Create core TypeScript Express server listening on port 3000\n`;
      }
    }

    prompt += `\n-----------------------------------------\n`;
    prompt += `Please reference the absolute rules, APIs, and schemas declared in this Context Package during our coding session. Minimize mock logic and follow the technical specifications strictly.`;

    return prompt;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatePrompt()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${project ? project.name.replace(/\s+/g, '-').toLowerCase() : 'context'}-prompt.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="export-context-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 bg-stone-50/60 dark:bg-stone-950/20 space-y-6">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5">
        <h1 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          {t.exportHeaderTitle}
        </h1>
        <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-3xl">
          {t.exportHeaderDesc}
        </p>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left selection control board */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm space-y-5 text-xs font-sans">
            
            {/* Choose project workspace */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Select Workspace Project
              </label>
              <select
                id="export-project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-lg p-2 font-medium text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Platform Optimizations */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Optimize Prompt For
              </label>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {([
                  { id: 'claude', label: 'Claude Pro' },
                  { id: 'chatgpt', label: 'ChatGPT-4o' },
                  { id: 'gemini', label: 'Gemini Advanced' },
                  { id: 'cursor', label: 'Cursor Rule' }
                ] as const).map(target => (
                  <button
                    key={target.id}
                    id={`btn-target-opt-${target.id}`}
                    onClick={() => setExportTarget(target.id)}
                    className={`p-2.5 rounded-lg border text-left font-sans font-semibold transition-colors cursor-pointer ${
                      exportTarget === target.id
                        ? 'bg-stone-900 border-stone-900 dark:bg-stone-100 dark:border-stone-100 text-white dark:text-stone-950'
                        : 'bg-stone-50 border-stone-200 dark:bg-stone-950 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:border-stone-400'
                    }`}
                  >
                    {target.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections toggles */}
            <div className="space-y-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <label className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider block mb-1">
                Include Prompt Content Sections
              </label>

              <label className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="chk-summary"
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-850 text-stone-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Project Executive Summary</span>
              </label>

              <label className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="chk-arch"
                  type="checkbox"
                  checked={includeArchitecture}
                  onChange={(e) => setIncludeArchitecture(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-850 text-stone-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Technical Architecture Spec</span>
              </label>

              <label className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="chk-sources"
                  type="checkbox"
                  checked={includeSources}
                  onChange={(e) => setIncludeSources(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-850 text-stone-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Raw Imported Source Metadata ({projectSources.length})</span>
              </label>

              <label className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="chk-insights"
                  type="checkbox"
                  checked={includeInsights}
                  onChange={(e) => setIncludeInsights(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-850 text-stone-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Deep Tech Insights Extracted</span>
              </label>

              <label className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300 cursor-pointer">
                <input
                  id="chk-todos"
                  type="checkbox"
                  checked={includeTodos}
                  onChange={(e) => setIncludeTodos(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-850 text-stone-950 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Action Items & TODOs Checklist</span>
              </label>
            </div>

            {/* Actions triggers */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <button
                id="btn-export-copy-clipboard"
                onClick={handleCopy}
                className="w-full py-2.5 bg-stone-950 hover:bg-stone-800 dark:bg-stone-50 dark:hover:bg-stone-200 text-white dark:text-stone-950 font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                <span>{copied ? t.promptCopied : t.copyPrompt}</span>
              </button>

              <button
                id="btn-export-download-md"
                onClick={handleDownload}
                className="w-full py-2 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/45 font-sans font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadMarkdown}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right prompt live preview block */}
        <div className="lg:col-span-7">
          <div className="bg-stone-900 rounded-xl p-5 border border-stone-800 shadow-inner flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                <FileCode2 className="w-3.5 h-3.5 text-stone-400" />
                <span>Prompt Live Compiler Preview</span>
              </div>
              <span className="text-[10px] font-mono text-stone-600">Markdown format</span>
            </div>

            {/* Preview text container */}
            <div className="flex-1 overflow-y-auto font-mono text-[10.5px] text-stone-300 leading-relaxed whitespace-pre-wrap select-all">
              {project ? generatePrompt() : 'Select a project to preview context prompt.'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
