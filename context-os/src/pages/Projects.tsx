import React from 'react';
import { 
  FolderPlus, 
  Github, 
  FileText, 
  Video, 
  Globe2, 
  Sparkles, 
  FileCode2, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Project, Source, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface ProjectsProps {
  projects: Project[];
  sources: Source[];
  onViewProject: (id: string) => void;
  onCreateProjectClick: () => void;
  lang: Language;
}

export default function Projects({ 
  projects, 
  sources, 
  onViewProject, 
  onCreateProjectClick, 
  lang 
}: ProjectsProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div id="projects-page" className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-8 bg-stone-50/60 dark:bg-stone-950/20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {t.projects}
          </h1>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1">
            {lang === 'zh-TW' 
              ? '管理各個專案的獨立知識庫，並隨時打包輸出成 AI 專屬 Context'
              : 'Orchestrate customized knowledge bases for different software, research, or content workflows.'}
          </p>
        </div>
        <button
          id="btn-create-project-page"
          onClick={onCreateProjectClick}
          className="bg-stone-950 dark:bg-stone-50 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-950 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 shadow-sm cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t.createProject}</span>
        </button>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectSources = sources.filter(s => s.projectId === project.id);
          const githubCount = projectSources.filter(s => s.type === 'github').length;
          const pdfCount = projectSources.filter(s => s.type === 'pdf').length;
          const urlCount = projectSources.filter(s => s.type === 'url').length;
          const videoCount = projectSources.filter(s => ['youtube', 'instagram', 'tiktok'].includes(s.type)).length;

          const currentStatus = project.status || 'idea';
          const getStatusText = (status: string) => {
            switch (status) {
              case 'idea': return lang === 'zh-TW' ? '想法構思' : 'Idea';
              case 'planning': return lang === 'zh-TW' ? '計畫籌備' : 'Planning';
              case 'in_progress': return lang === 'zh-TW' ? '進行中' : 'In Progress';
              case 'done': return lang === 'zh-TW' ? '已完成' : 'Completed';
              default: return status;
            }
          };

          const getStatusStyle = (status: string) => {
            switch (status) {
              case 'idea': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20';
              case 'planning': return 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/20';
              case 'in_progress': return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20';
              case 'done': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20';
              default: return 'bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800';
            }
          };

          return (
            <div
              key={project.id}
              id={`project-card-${project.id}`}
              onClick={() => onViewProject(project.id)}
              className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-700 rounded-xl shadow-sm p-6 cursor-pointer transition-all duration-150 flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <h2 className="font-sans text-sm font-bold text-stone-900 dark:text-stone-100 group-hover:text-stone-950 dark:group-hover:text-white transition-colors duration-150 truncate">
                      {project.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border ${getStatusStyle(currentStatus)}`}>
                      {getStatusText(currentStatus)}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 dark:text-stone-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150" />
                  </div>
                </div>

                <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-3 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {project.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-[9px] font-sans font-medium px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Counters & Footer */}
              <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* GitHub */}
                  {githubCount > 0 && (
                    <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500" title="GitHub repos">
                      <Github className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">{githubCount}</span>
                    </div>
                  )}
                  {/* PDF */}
                  {pdfCount > 0 && (
                    <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500" title="PDF Documents">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">{pdfCount}</span>
                    </div>
                  )}
                  {/* Web URLs */}
                  {urlCount > 0 && (
                    <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500" title="URLs">
                      <Globe2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">{urlCount}</span>
                    </div>
                  )}
                  {/* Video Reels */}
                  {videoCount > 0 && (
                    <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500" title="Reels / Videos">
                      <Video className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono font-semibold">{videoCount}</span>
                    </div>
                  )}

                  {/* Empty state counter fallback */}
                  {projectSources.length === 0 && (
                    <span className="text-[10px] font-mono text-stone-400 dark:text-stone-600">
                      Empty Memory
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400 dark:text-stone-600">
                  <span className="font-bold text-stone-600 dark:text-stone-400">{projectSources.length}</span>
                  <span>items</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty project container button */}
        <div 
          onClick={onCreateProjectClick}
          className="border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[190px] transition-colors duration-150"
        >
          <Layers className="w-6 h-6 text-stone-400 dark:text-stone-600 mb-2" />
          <span className="font-sans text-xs font-semibold text-stone-700 dark:text-stone-300">
            {lang === 'zh-TW' ? '新增其它專案...' : 'Create Another...'}
          </span>
          <span className="font-sans text-[10px] text-stone-400 dark:text-stone-500 mt-1 max-w-[180px]">
            {lang === 'zh-TW' ? '建立一個新的獨立語境知識庫' : 'Set up a new workspace with distinct indexing.'}
          </span>
        </div>
      </div>
    </div>
  );
}
