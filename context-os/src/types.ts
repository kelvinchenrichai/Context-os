export type ProjectType = 'software' | 'trading' | 'content' | 'research' | 'business' | 'personal';
export type ProjectStatus = 'idea' | 'planning' | 'in_progress' | 'done';

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  sourceCount: number;
  tags: string[];
  summary: string;
  status?: ProjectStatus;
}

export type SourceType =
  | 'github'
  | 'pdf'
  | 'markdown'
  | 'image'
  | 'url'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'api'
  | 'prompt'
  | 'note';

export type SourcePlatform =
  | 'github'
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'douyin'
  | 'website'
  | 'pdf'
  | 'image'
  | 'api'
  | 'prompt'
  | 'other';

export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Source {
  id: string;
  projectId: string;
  title: string;
  url: string;
  type: SourceType;
  platform: SourcePlatform;
  category: string;
  tags: string[];
  note: string;
  importance: ImportanceLevel;
  useCase: string;
  aiSummary: string;
  aiKeyPoints: string[];
  aiSuggestedTags: string[];
  aiRelations: string[]; // Related source IDs
  isAnalyzed: boolean;
  includeInContext: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  projectId: string;
  count: number;
}

export type Theme = 'dark' | 'light';
export type Language = 'en' | 'zh-TW';

export interface TranslationDict {
  dashboard: string;
  projects: string;
  library: string;
  tags: string;
  search: string;
  export: string;
  settings: string;
  capture: string;
  save: string;
  addSource: string;
  quickCapturePlaceholder: string;
  recentCaptures: string;
  recentProjects: string;
  allProjects: string;
  createProject: string;
  editProject: string;
  projectName: string;
  projectDesc: string;
  projectType: string;
  defaultCategory: string;
  importance: string;
  useCase: string;
  saveSuccess: string;
  aiAnalyzing: string;
  emptyStateTitle: string;
  emptyStateDesc: string;
  shareTitle: string;
  shareSubtitle: string;
  promptCopied: string;
  copyPrompt: string;
  downloadMarkdown: string;
}

export interface Reminder {
  id: string;
  projectId: string; // "global" or specific project id
  title: string;
  time: string; // ISO date-time or string like "2026-07-09T14:30"
  type: 'text' | 'voice';
  audioUrl?: string; // Voice memo simulated recording data placeholder
  isCompleted: boolean;
  createdAt: string;
}
