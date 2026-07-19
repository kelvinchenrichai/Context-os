import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Project, 
  Source, 
  Category,
  ApiKey,
  ApiProvider,
  PlanId,
  PLAN_LIMITS,
  Language, 
  Theme, 
  ProjectType, 
  ProjectStatus,
  ImportanceLevel, 
  SourceType, 
  SourcePlatform 
} from './types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_SOURCES, 
  INITIAL_CATEGORIES,
  TRANSLATIONS 
} from './data';

// Component imports
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import { MobileHeader, MobileDrawer } from './components/MobileHeaderAndDrawer';
import PwaInstallPrompt from './components/PwaInstallPrompt';

// Page imports
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import SaveURL from './pages/SaveURL';
import ShareReceiver from './pages/ShareReceiver';
import Library from './pages/Library';
import SourceDetail from './pages/SourceDetail';
import TagsPage from './pages/TagsPage';
import SearchPage from './pages/SearchPage';
import ExportContextPage from './pages/ExportContextPage';
import Settings from './pages/Settings';
import PlanPage from './pages/PlanPage';
import ApiKeysPage from './pages/ApiKeysPage';
import OnboardingTour from './components/OnboardingTour';

// Maps a route pathname to the legacy "tab id" vocabulary that Sidebar /
// BottomNav / MobileDrawer already know how to highlight. Keeping this
// mapping isolated here means none of those components had to change.
function pathToTabId(pathname: string): string {
  if (pathname === '/') return 'dashboard';
  if (pathname.startsWith('/capture')) return 'save-url';
  if (pathname === '/projects/new') return 'create-project';
  if (pathname.startsWith('/projects/')) return 'project-detail';
  if (pathname === '/projects') return 'projects';
  if (pathname.startsWith('/sources/')) return 'source-detail';
  if (pathname.startsWith('/library')) return 'library';
  if (pathname.startsWith('/tags')) return 'tags';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/export')) return 'export';
  if (pathname.startsWith('/settings/plan')) return 'settings';
  if (pathname.startsWith('/settings/api-keys')) return 'settings';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/share')) return 'share';
  return 'dashboard';
}

// Reverse mapping used by Sidebar/BottomNav's setActiveTab(id) callback so
// clicking a nav item performs a real navigation instead of a state flip.
function tabIdToPath(tab: string): string {
  switch (tab) {
    case 'dashboard': return '/';
    case 'save-url': return '/capture';
    case 'projects': return '/projects';
    case 'create-project': return '/projects/new';
    case 'library': return '/library';
    case 'tags': return '/tags';
    case 'search': return '/search';
    case 'export': return '/export';
    case 'settings': return '/settings';
    case 'share': return '/share';
    default: return '/';
  }
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = pathToTabId(location.pathname);
  const setActiveTab = (tab: string) => navigate(tabIdToPath(tab));

  // 1. Language and Theme States
  const [lang, setLang] = useState<Language>('zh-TW');
  const [theme, setTheme] = useState<Theme>(() => {
    const cachedTheme = localStorage.getItem('context_os_theme') as Theme;
    return cachedTheme || 'light';
  });

  // 2. Core Persistent Data States (synchronized via localStorage)
  const [projects, setProjects] = useState<Project[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [plan, setPlanState] = useState<PlanId>(() => {
    return (localStorage.getItem('context_os_plan') as PlanId) || 'free';
  });
  const [aiAnalysesUsed, setAiAnalysesUsed] = useState<number>(() => {
    return parseInt(localStorage.getItem('context_os_ai_analyses') || '0', 10);
  });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    try { return JSON.parse(localStorage.getItem('context_os_api_keys') || '[]'); } catch { return []; }
  });

  // 3. Onboarding Tour / Mobile Drawer States
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Trigger onboarding tour for first-time visitors
  useEffect(() => {
    const isCompleted = localStorage.getItem('context_os_tour_completed');
    if (isCompleted !== 'true') {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize data from localStorage or fallback to standard data
  useEffect(() => {
    const cachedProjects = localStorage.getItem('context_os_projects');
    const cachedSources = localStorage.getItem('context_os_sources');

    if (cachedProjects) {
      setProjects(JSON.parse(cachedProjects));
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem('context_os_projects', JSON.stringify(INITIAL_PROJECTS));
    }

    if (cachedSources) {
      setSources(JSON.parse(cachedSources));
    } else {
      setSources(INITIAL_SOURCES);
      localStorage.setItem('context_os_sources', JSON.stringify(INITIAL_SOURCES));
    }

    const cachedCategories = localStorage.getItem('context_os_categories');
    if (cachedCategories) {
      setCategories(JSON.parse(cachedCategories));
    } else {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem('context_os_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
  }, []);

  // Update theme tag on DocumentElement for proper Tailwind dark mode selection
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('context_os_theme', theme);
  }, [theme]);

  // Sync state helpers
  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('context_os_projects', JSON.stringify(updatedProjects));
  };

  const saveSourcesToStorage = (updatedSources: Source[]) => {
    setSources(updatedSources);
    localStorage.setItem('context_os_sources', JSON.stringify(updatedSources));
  };

  const saveCategoriesToStorage = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    localStorage.setItem('context_os_categories', JSON.stringify(updatedCategories));
  };

  const setPlan = (p: PlanId) => {
    setPlanState(p);
    localStorage.setItem('context_os_plan', p);
  };

  const saveApiKeys = (keys: ApiKey[]) => {
    setApiKeys(keys);
    localStorage.setItem('context_os_api_keys', JSON.stringify(keys));
  };

  const handleAddApiKey = (provider: ApiProvider, rawKey: string, label: string) => {
    const masked = rawKey.slice(0, 6) + '••••••••' + rawKey.slice(-4);
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      provider,
      label,
      maskedKey: masked,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    saveApiKeys([...apiKeys, newKey]);
  };

  const handleDeleteApiKey = (id: string) => saveApiKeys(apiKeys.filter(k => k.id !== id));

  const handleToggleApiKey = (id: string) => saveApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));

  // 4. ACTION HANDLERS

  // Create Project handler
  const handleCreateProject = (
    name: string,
    description: string,
    type: ProjectType,
    color: string,
    defaultCategory: string,
    status: ProjectStatus
  ) => {
    // Free plan: max 3 projects
    const limit = PLAN_LIMITS[plan].maxProjects;
    if (limit !== -1 && projects.length >= limit) {
      alert(lang === 'zh-TW'
        ? `免費版最多只能建立 ${limit} 個專案。請升級方案以建立更多專案。`
        : `Your ${plan} plan allows up to ${limit} projects. Please upgrade to create more.`);
      navigate('/settings/plan');
      return;
    }
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      type,
      color,
      icon: 'Layers',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceCount: 0,
      tags: [type.toUpperCase()],
      summary: `Automated Context workspace for ${name} software specifications.`,
      status
    };

    const updated = [newProject, ...projects];
    saveProjectsToStorage(updated);
    navigate('/projects');
  };

  // Delete Project handler
  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    const updatedSources = sources.filter(s => s.projectId !== id);
    saveProjectsToStorage(updatedProjects);
    saveSourcesToStorage(updatedSources);
    navigate('/projects');
  };

  // Update Project status handler
  const handleUpdateProjectStatus = (id: string, status: ProjectStatus) => {
    const updated = projects.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p);
    saveProjectsToStorage(updated);
  };

  // Create Category handler (also used as the inline "+ New category" quick-add)
  const handleCreateCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const alreadyExists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (alreadyExists) return;
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      projectId: 'global',
      count: 0,
    };
    saveCategoriesToStorage([...categories, newCategory]);
  };

  // Rename Category handler — also updates every Source currently tagged
  // with the old name so nothing goes out of sync.
  const handleRenameCategory = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const target = categories.find(c => c.id === id);
    if (!target || target.name === trimmed) return;

    const updatedCategories = categories.map(c => c.id === id ? { ...c, name: trimmed } : c);
    saveCategoriesToStorage(updatedCategories);

    const updatedSources = sources.map(s => s.category === target.name ? { ...s, category: trimmed } : s);
    saveSourcesToStorage(updatedSources);
  };

  // Delete Category handler — any Source still using it falls back to
  // "Uncategorized" rather than being left pointing at a deleted category.
  const handleDeleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;

    const updatedCategories = categories.filter(c => c.id !== id);
    saveCategoriesToStorage(updatedCategories);

    const updatedSources = sources.map(s => s.category === target.name ? { ...s, category: 'Uncategorized' } : s);
    saveSourcesToStorage(updatedSources);
  };

  // Save/Capture Source handler
  const handleSaveSource = (sourceData: {
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
    analyzeNow: boolean;
    includeInContext: boolean;
  }) => {
    const newSource: Source = {
      id: `src-${Date.now()}`,
      projectId: sourceData.projectId,
      title: sourceData.title,
      url: sourceData.url,
      type: sourceData.type,
      platform: sourceData.platform,
      category: sourceData.category,
      tags: sourceData.tags.length > 0 ? sourceData.tags : [sourceData.type.toUpperCase()],
      note: sourceData.note,
      importance: sourceData.importance,
      useCase: sourceData.useCase,
      aiSummary: sourceData.analyzeNow 
        ? `Successfully analyzed with high-fidelity indexing on July 9, 2026. This technical reference contains core integration formulas, API schema parameters, or production guidelines relevant to your workspace workflows.`
        : 'Analysis pending. Click manual index to query.',
      aiKeyPoints: sourceData.analyzeNow 
        ? [
            'Extracted core operational schemas.',
            'Mapped structural elements to active project dependencies.',
            'Prepared and optimized for direct LLM context prompts.'
          ]
        : [],
      aiSuggestedTags: [sourceData.platform.toUpperCase(), sourceData.category.replace(/\s+/g, '')],
      aiRelations: [],
      isAnalyzed: sourceData.analyzeNow,
      includeInContext: sourceData.includeInContext,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Increment AI analyses counter
    if (sourceData.analyzeNow) {
      const next = aiAnalysesUsed + 1;
      setAiAnalysesUsed(next);
      localStorage.setItem('context_os_ai_analyses', String(next));
    }

    const updated = [newSource, ...sources];
    saveSourcesToStorage(updated);

    // Update tags on corresponding project dynamically
    const updatedProjects = projects.map(p => {
      if (p.id === sourceData.projectId) {
        const uniqueTags = Array.from(new Set([...p.tags, ...newSource.tags]));
        return {
          ...p,
          sourceCount: p.sourceCount + 1,
          tags: uniqueTags,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    saveProjectsToStorage(updatedProjects);
  };

  // Update/Edit Source details handler
  const handleUpdateSource = (id: string, updatedData: Partial<Source>) => {
    const updated = sources.map(s => s.id === id ? { ...s, ...updatedData, updatedAt: new Date().toISOString() } : s);
    saveSourcesToStorage(updated);
  };

  // Toggle Context inclusion inside workspace
  const handleToggleIncludeInContext = (id: string) => {
    const updated = sources.map(s => s.id === id ? { ...s, includeInContext: !s.includeInContext } : s);
    saveSourcesToStorage(updated);
  };

  // Delete Source handler
  const handleDeleteSource = (id: string) => {
    const sourceToDelete = sources.find(s => s.id === id);
    const updated = sources.filter(s => s.id !== id);
    saveSourcesToStorage(updated);

    if (sourceToDelete) {
      // Decrement counter on project
      const updatedProjects = projects.map(p => {
        if (p.id === sourceToDelete.projectId) {
          return {
            ...p,
            sourceCount: Math.max(0, p.sourceCount - 1),
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
      saveProjectsToStorage(updatedProjects);
    }

    navigate('/library');
  };

  // Quick URL capture from dashboard
  const handleSaveQuick = (url: string, projectId: string, analyzeNow: boolean) => {
    let platform: SourcePlatform = 'other';
    let type: SourceType = 'url';
    let title = `Resource: ${new URL(url).hostname}`;

    if (url.includes('github.com')) {
      platform = 'github';
      type = 'github';
      title = 'Imported GitHub Repository Spec';
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
      type = 'youtube';
      title = 'Captured Video Lecture';
    } else if (url.includes('instagram.com')) {
      platform = 'instagram';
      type = 'instagram';
      title = 'Short IG Reels Retention Loop';
    } else if (url.includes('tiktok.com')) {
      platform = 'tiktok';
      type = 'tiktok';
      title = 'Captured TikTok Content Hook';
    }

    handleSaveSource({
      projectId,
      title,
      url,
      type,
      platform,
      category: 'Reference Code',
      tags: [],
      note: 'Captured from Quick Capture Bar',
      importance: 'medium',
      useCase: '程式參考',
      analyzeNow,
      includeInContext: true,
    });
  };

  // 5. ROUTE-LEVEL WRAPPERS
  // Thin wrappers resolve the :projectId / :sourceId route params into the
  // actual entity and hand it down to the page component exactly the way
  // it already expects (no prop-shape changes inside the page files).

  const ProjectDetailRoute = () => {
    const { projectId } = useParams();
    const selectedProj = projects.find(p => p.id === projectId);
    if (!selectedProj) {
      return <div className="p-8 text-xs font-sans">Project not found.</div>;
    }
    return (
      <ProjectDetail
        project={selectedProj}
        sources={sources}
        onBack={() => navigate(-1)}
        onAddSourceClick={() => navigate(`/capture?projectId=${selectedProj.id}`)}
        onViewSource={(id) => navigate(`/sources/${id}`)}
        onDeleteProject={handleDeleteProject}
        onToggleIncludeInContext={handleToggleIncludeInContext}
        onUpdateProjectStatus={handleUpdateProjectStatus}
        lang={lang}
      />
    );
  };

  const SourceDetailRoute = () => {
    const { sourceId } = useParams();
    const selectedSrc = sources.find(s => s.id === sourceId);
    if (!selectedSrc) {
      return <div className="p-8 text-xs font-sans">Resource not found.</div>;
    }
    return (
      <SourceDetail
        source={selectedSrc}
        projects={projects}
        onBack={() => navigate(-1)}
        onDelete={handleDeleteSource}
        onUpdate={handleUpdateSource}
        lang={lang}
      />
    );
  };

  return (
    <div className="flex w-full min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      
      {/* Desktop Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} sourcesCount={sources.length} />

      {/* Main Content Pane Wrapper */}
      <main id="app-main-pane" className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 h-screen overflow-hidden">
        <MobileHeader lang={lang} setIsOpen={setIsMobileDrawerOpen} />

        <Routes>
          <Route path="/" element={
            <Dashboard
              projects={projects}
              sources={sources}
              onSaveQuick={handleSaveQuick}
              onViewSource={(id) => navigate(`/sources/${id}`)}
              onViewProject={(id) => navigate(`/projects/${id}`)}
              lang={lang}
              setActiveTab={setActiveTab}
              onStartTour={() => setIsTourOpen(true)}
            />
          } />

          <Route path="/projects" element={
            <Projects
              projects={projects}
              sources={sources}
              onViewProject={(id) => navigate(`/projects/${id}`)}
              onCreateProjectClick={() => navigate('/projects/new')}
              lang={lang}
            />
          } />

          <Route path="/projects/new" element={
            <CreateProject
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onSave={handleCreateProject}
              onBack={() => navigate(-1)}
              lang={lang}
            />
          } />

          <Route path="/projects/:projectId" element={<ProjectDetailRoute />} />

          <Route path="/capture" element={
            <SaveURL
              projects={projects}
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onSave={handleSaveSource}
              onBack={() => navigate(-1)}
              lang={lang}
            />
          } />

          <Route path="/share" element={
            <ShareReceiver
              projects={projects}
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onSaveShare={handleSaveSource}
              onBack={() => navigate('/')}
              lang={lang}
            />
          } />

          <Route path="/library" element={
            <Library
              projects={projects}
              sources={sources}
              onViewSource={(id) => navigate(`/sources/${id}`)}
              onToggleIncludeInContext={handleToggleIncludeInContext}
              lang={lang}
            />
          } />

          <Route path="/sources/:sourceId" element={<SourceDetailRoute />} />

          <Route path="/tags" element={
            <TagsPage
              sources={sources}
              projects={projects}
              onViewSource={(id) => navigate(`/sources/${id}`)}
              lang={lang}
            />
          } />

          <Route path="/search" element={
            <SearchPage
              sources={sources}
              projects={projects}
              onViewSource={(id) => navigate(`/sources/${id}`)}
              lang={lang}
            />
          } />

          <Route path="/export" element={
            <ExportContextPage
              projects={projects}
              sources={sources}
              lang={lang}
            />
          } />

          <Route path="/settings" element={
            <Settings
              lang={lang}
              setLang={setLang}
              theme={theme}
              setTheme={setTheme}
              onRestartTour={() => setIsTourOpen(true)}
              categories={categories}
              sources={sources}
              onCreateCategory={handleCreateCategory}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onNavigatePlan={() => navigate('/settings/plan')}
              onNavigateApiKeys={() => navigate('/settings/api-keys')}
            />
          } />

          <Route path="/settings/plan" element={
            <PlanPage
              lang={lang}
              plan={plan}
              setPlan={setPlan}
              projectCount={projects.length}
              sourceCount={sources.length}
              aiAnalysesUsed={aiAnalysesUsed}
              onBack={() => navigate('/settings')}
            />
          } />

          <Route path="/settings/api-keys" element={
            <ApiKeysPage
              lang={lang}
              apiKeys={apiKeys}
              onAddKey={handleAddApiKey}
              onDeleteKey={handleDeleteApiKey}
              onToggleKey={handleToggleApiKey}
              onBack={() => navigate('/settings')}
              isPowerPlan={plan === 'power'}
            />
          } />

          <Route path="*" element={<div className="p-8 text-xs font-sans text-stone-500">View not compiled.</div>} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation menu bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />

      {/* Mobile Sidebar Navigation Drawer */}
      <MobileDrawer 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        sourcesCount={sources.length} 
        isOpen={isMobileDrawerOpen} 
        setIsOpen={setIsMobileDrawerOpen} 
      />

      {/* PWA install prompt */}
      <PwaInstallPrompt lang={lang} />

      {/* Onboarding Tour overlay */}
      <OnboardingTour 
        lang={lang} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
      />

    </div>
  );
}
