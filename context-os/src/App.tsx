import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Project, Source, Category, ApiKey, ApiProvider, PlanId, PLAN_LIMITS,
  Language, Theme, ProjectType, ProjectStatus, ImportanceLevel, SourceType, SourcePlatform
} from './types';
import { INITIAL_CATEGORIES, TRANSLATIONS } from './data';
import {
  getToken, setToken, clearToken, getMe,
  fetchProjects, createProject as apiCreateProject, updateProject as apiUpdateProject, deleteProject as apiDeleteProject,
  fetchSources, createSource as apiCreateSource, updateSource as apiUpdateSource, deleteSource as apiDeleteSource,
  fetchCategories, createCategory as apiCreateCategory, renameCategory as apiRenameCategory, deleteCategory as apiDeleteCategory,
  analyzeSource,
} from './api';

// Components
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import { MobileHeader, MobileDrawer } from './components/MobileHeaderAndDrawer';
import PwaInstallPrompt from './components/PwaInstallPrompt';

// Pages
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
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
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/share')) return 'share';
  return 'dashboard';
}

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

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; plan: string } | null>(null);

  // UI state
  const [lang, setLang] = useState<Language>('zh-TW');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('context_os_theme') as Theme) || 'light');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [plan, setPlanState] = useState<PlanId>('free');
  const [aiAnalysesUsed, setAiAnalysesUsed] = useState(0);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    try { return JSON.parse(localStorage.getItem('context_os_api_keys') || '[]'); } catch { return []; }
  });
  const [dataLoading, setDataLoading] = useState(false);

  // ─── Auth check on mount ──────────────────────────────────────────────────

  useEffect(() => {
    // If this is the OAuth callback page, skip the normal auth check
    // and let AuthCallback handle everything
    if (window.location.pathname === '/auth/callback') {
      setAuthLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    getMe().then(user => {
      setCurrentUser(user);
      setPlanState(user.plan as PlanId);
      setAiAnalysesUsed(user.ai_analyses_used || 0);
      setIsLoggedIn(true);
      setAuthLoading(false);
    }).catch(() => {
      clearToken();
      setAuthLoading(false);
    });
  }, []);

  // ─── Load data from API once logged in ───────────────────────────────────

  const loadData = useCallback(async () => {
    if (!isLoggedIn) return;
    setDataLoading(true);
    try {
      const [projs, srcs, cats] = await Promise.all([
        fetchProjects(),
        fetchSources(),
        fetchCategories(),
      ]);

      setProjects(projs.map(normalizeProject));
      setSources(srcs.map(normalizeSource));

      if (cats.length > 0) {
        setCategories(cats);
      } else {
        // Seed initial categories for new users
        setCategories(INITIAL_CATEGORIES);
        for (const cat of INITIAL_CATEGORIES) {
          await apiCreateCategory(cat.name).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setDataLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Theme ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('context_os_theme', theme);
  }, [theme]);

  // ─── Onboarding tour ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!isLoggedIn) return;
    // Only show tour if user has never completed it before
    // Use a user-specific key so different users on same browser each get the tour
    const userKey = `context_os_tour_completed_${currentUser?.id || 'anon'}`;
    const done = localStorage.getItem(userKey) || localStorage.getItem('context_os_tour_completed');
    if (done !== 'true') {
      setTimeout(() => setIsTourOpen(true), 1200);
    }
  }, [isLoggedIn]);

  // ─── Normalize API responses to frontend shape ────────────────────────────

  function normalizeProject(p: any): Project {
    return {
      id: p.id, name: p.name, description: p.description || '',
      type: p.type as ProjectType, color: p.color || '#4F46E5',
      icon: p.icon || 'Layers', summary: p.summary || '',
      status: (p.status as ProjectStatus) || ('active' as ProjectStatus),
      sourceCount: p.source_count ?? p.sourceCount ?? 0,
      tags: Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]'),
      createdAt: p.created_at || p.createdAt || new Date().toISOString(),
      updatedAt: p.updated_at || p.updatedAt || new Date().toISOString(),
    };
  }

  function normalizeSource(s: any): Source {
    return {
      id: s.id, projectId: s.project_id || s.projectId,
      title: s.title, url: s.url || '',
      type: s.type as SourceType, platform: s.platform as SourcePlatform,
      category: s.category || '', note: s.note || '',
      importance: s.importance as ImportanceLevel,
      useCase: s.use_case || s.useCase || '',
      tags: Array.isArray(s.tags) ? s.tags : JSON.parse(s.tags || '[]'),
      aiSummary: s.ai_summary || s.aiSummary || '',
      aiKeyPoints: Array.isArray(s.aiKeyPoints) ? s.aiKeyPoints : JSON.parse(s.ai_key_points || s.aiKeyPoints || '[]'),
      aiSuggestedTags: Array.isArray(s.aiSuggestedTags) ? s.aiSuggestedTags : JSON.parse(s.ai_suggested_tags || '[]'),
      aiRelations: Array.isArray(s.aiRelations) ? s.aiRelations : JSON.parse(s.ai_relations || '[]'),
      isAnalyzed: s.is_analyzed === 1 || s.isAnalyzed === true,
      includeInContext: s.include_in_context === 1 || s.includeInContext !== false,
      createdAt: s.created_at || s.createdAt || new Date().toISOString(),
      updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
    };
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    const user = await getMe();
    setCurrentUser(user);
    setPlanState(user.plan as PlanId);
    setIsLoggedIn(true);
    await loadData();
  };

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setProjects([]);
    setSources([]);
    navigate('/');
  };

  const handleCreateProject = async (
    name: string, description: string, type: ProjectType,
    color: string, _defaultCategory: string, status: ProjectStatus
  ) => {
    const limit = PLAN_LIMITS[plan].maxProjects;
    if (limit !== -1 && projects.length >= limit) {
      alert(lang === 'zh-TW'
        ? `免費版最多 ${limit} 個專案，請升級後繼續。`
        : `Free plan allows up to ${limit} projects. Please upgrade.`);
      navigate('/settings/plan');
      return;
    }
    try {
      const { id } = await apiCreateProject({ name, description, type, color, status, tags: [type.toUpperCase()] });
      await loadData();
      navigate(`/projects/${id}`);
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteProject = async (id: string) => {
    await apiDeleteProject(id);
    await loadData();
    navigate('/projects');
  };

  const handleUpdateProjectStatus = async (id: string, status: ProjectStatus) => {
    await apiUpdateProject(id, { status });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleSaveSource = async (sourceData: {
    projectId: string; title: string; url: string; type: SourceType; platform: SourcePlatform;
    category: string; tags: string[]; note: string; importance: ImportanceLevel;
    useCase: string; analyzeNow: boolean; includeInContext: boolean;
  }) => {
    try {
      const { id } = await apiCreateSource({
        ...sourceData,
        tags: sourceData.tags.length > 0 ? sourceData.tags : [sourceData.type.toUpperCase()],
        aiSummary: '',
        aiKeyPoints: [],
        aiSuggestedTags: [],
        aiRelations: [],
        isAnalyzed: false,
      });

      // If analyzeNow, wait for AI analysis to complete before refreshing data
      if (sourceData.analyzeNow && id) {
        try {
          await analyzeSource(id);
        } catch (e) {
          console.error('AI analysis failed:', e);
        }
      }

      await loadData();
    } catch (e: any) { alert(e.message); }
  };

  const handleUpdateSource = async (id: string, data: Partial<Source>) => {
    await apiUpdateSource(id, data);
    setSources(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const handleToggleIncludeInContext = async (id: string) => {
    const src = sources.find(s => s.id === id);
    if (!src) return;
    const next = !src.includeInContext;
    await apiUpdateSource(id, { includeInContext: next });
    setSources(prev => prev.map(s => s.id === id ? { ...s, includeInContext: next } : s));
  };

  const handleDeleteSource = async (id: string) => {
    await apiDeleteSource(id);
    await loadData();
    navigate('/library');
  };

  const handleSaveQuick = async (url: string, projectId: string, analyzeNow: boolean) => {
    let platform: SourcePlatform = 'other', type: SourceType = 'url';
    let title = `Resource: ${new URL(url).hostname}`;
    if (url.includes('github.com')) { platform = 'github'; type = 'github'; title = 'GitHub Repository'; }
    else if (url.includes('youtube.com') || url.includes('youtu.be')) { platform = 'youtube'; type = 'youtube'; title = 'YouTube Video'; }
    else if (url.includes('instagram.com')) { platform = 'instagram'; type = 'instagram'; title = 'Instagram Reel'; }
    else if (url.includes('tiktok.com')) { platform = 'tiktok'; type = 'tiktok'; title = 'TikTok Video'; }
    await handleSaveSource({ projectId, title, url, type, platform, category: 'Reference Code', tags: [], note: 'Quick capture', importance: 'medium', useCase: '', analyzeNow, includeInContext: true });
  };

  // Category handlers
  const handleCreateCategory = async (name: string) => {
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    const { id } = await apiCreateCategory(name);
    setCategories(prev => [...prev, { id, name, projectId: 'global', count: 0 }]);
  };

  const handleRenameCategory = async (id: string, newName: string) => {
    await apiRenameCategory(id, newName);
    const target = categories.find(c => c.id === id);
    if (target) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
      setSources(prev => prev.map(s => s.category === target.name ? { ...s, category: newName } : s));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    const usage = sources.filter(s => s.category === target.name).length;
    if (usage > 0) {
      const msg = lang === 'zh-TW'
        ? `「${target.name}」有 ${usage} 筆資料使用中，刪除後會改成「Uncategorized」。確定嗎？`
        : `"${target.name}" is used by ${usage} sources. They will become "Uncategorized". Continue?`;
      if (!window.confirm(msg)) return;
    }
    await apiDeleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    if (usage > 0) setSources(prev => prev.map(s => s.category === target.name ? { ...s, category: 'Uncategorized' } : s));
  };

  // API Keys (still localStorage until Phase 4)
  const saveApiKeys = (keys: ApiKey[]) => { setApiKeys(keys); localStorage.setItem('context_os_api_keys', JSON.stringify(keys)); };
  const handleAddApiKey = (provider: ApiProvider, rawKey: string, label: string) => {
    const masked = rawKey.slice(0, 6) + '••••••••' + rawKey.slice(-4);
    saveApiKeys([...apiKeys, { id: `key-${Date.now()}`, provider, label, maskedKey: masked, isActive: true, createdAt: new Date().toISOString() }]);
  };
  const handleDeleteApiKey = (id: string) => saveApiKeys(apiKeys.filter(k => k.id !== id));
  const handleToggleApiKey = (id: string) => saveApiKeys(apiKeys.map(k => k.id === id ? { ...k, isActive: !k.isActive } : k));
  const setPlan = (p: PlanId) => { setPlanState(p); localStorage.setItem('context_os_plan', p); };

  // ─── Route wrappers ───────────────────────────────────────────────────────

  const ProjectDetailRoute = () => {
    const { projectId } = useParams();
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return <div className="p-8 text-xs">Project not found.</div>;
    return (
      <ProjectDetail
        project={proj} sources={sources}
        onBack={() => navigate(-1)}
        onAddSourceClick={() => navigate(`/capture?projectId=${proj.id}`)}
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
    const src = sources.find(s => s.id === sourceId);
    if (!src) return <div className="p-8 text-xs">Source not found.</div>;
    return (
      <SourceDetail
        source={src} projects={projects}
        onBack={() => navigate(-1)}
        onDelete={handleDeleteSource}
        onUpdate={handleUpdateSource}
        onMoved={loadData}
        lang={lang}
      />
    );
  };

  // ─── Loading / Auth gates ─────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 mx-auto flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-white dark:text-stone-900">C</span>
          </div>
          <p className="text-xs text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Always allow /auth/callback to render regardless of login state
  if (location.pathname === '/auth/callback') {
    return <AuthCallback onLogin={handleLogin} />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ─── Main app ─────────────────────────────────────────────────────────────

  return (
    <div className="flex w-full min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} sourcesCount={sources.length} currentUser={currentUser} onLogout={handleLogout} />

      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 h-screen overflow-hidden">
        <MobileHeader lang={lang} setIsOpen={setIsMobileDrawerOpen} />

        {dataLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-stone-400">載入中...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <Dashboard projects={projects} sources={sources} onSaveQuick={handleSaveQuick}
                onViewSource={(id) => navigate(`/sources/${id}`)}
                onViewProject={(id) => navigate(`/projects/${id}`)}
                lang={lang} setActiveTab={setActiveTab} onStartTour={() => setIsTourOpen(true)} />
            } />
            <Route path="/projects" element={
              <Projects projects={projects} sources={sources}
                onViewProject={(id) => navigate(`/projects/${id}`)}
                onCreateProjectClick={() => navigate('/projects/new')} lang={lang} />
            } />
            <Route path="/projects/new" element={
              <CreateProject categories={categories} onCreateCategory={handleCreateCategory}
                onSave={handleCreateProject} onBack={() => navigate(-1)} lang={lang} />
            } />
            <Route path="/projects/:projectId" element={<ProjectDetailRoute />} />
            <Route path="/capture" element={
              <SaveURL projects={projects} categories={categories} onCreateCategory={handleCreateCategory}
                onSave={handleSaveSource} onBack={() => navigate(-1)} lang={lang} />
            } />
            <Route path="/share" element={
              <ShareReceiver projects={projects} categories={categories} onCreateCategory={handleCreateCategory}
                onSaveShare={handleSaveSource} onBack={() => navigate('/')} lang={lang} />
            } />
            <Route path="/library" element={
              <Library projects={projects} sources={sources}
                onViewSource={(id) => navigate(`/sources/${id}`)}
                onToggleIncludeInContext={handleToggleIncludeInContext} onRefresh={loadData} lang={lang} />
            } />
            <Route path="/sources/:sourceId" element={<SourceDetailRoute />} />
            <Route path="/tags" element={
              <TagsPage sources={sources} projects={projects}
                onViewSource={(id) => navigate(`/sources/${id}`)} lang={lang} />
            } />
            <Route path="/search" element={
              <SearchPage sources={sources} projects={projects}
                onViewSource={(id) => navigate(`/sources/${id}`)} lang={lang} />
            } />
            <Route path="/export" element={
              <ExportContextPage projects={projects} sources={sources} lang={lang} />
            } />
            <Route path="/settings" element={
              <Settings lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}
                onRestartTour={() => setIsTourOpen(true)}
                categories={categories} sources={sources}
                onCreateCategory={handleCreateCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
                onNavigatePlan={() => navigate('/settings/plan')}
                onNavigateApiKeys={() => navigate('/settings/api-keys')} />
            } />
            <Route path="/settings/plan" element={
              <PlanPage lang={lang} plan={plan} setPlan={setPlan}
                projectCount={projects.length} sourceCount={sources.length}
                aiAnalysesUsed={aiAnalysesUsed} onBack={() => navigate('/settings')} />
            } />
            <Route path="/settings/api-keys" element={
              <ApiKeysPage lang={lang} apiKeys={apiKeys}
                onAddKey={handleAddApiKey} onDeleteKey={handleDeleteApiKey}
                onToggleKey={handleToggleApiKey} onBack={() => navigate('/settings')}
                isPowerPlan={plan === 'power'} />
            } />
            <Route path="/auth/callback" element={
              <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-stone-100 mx-auto flex items-center justify-center">
                    <span className="font-mono text-sm font-bold text-white dark:text-stone-900">C</span>
                  </div>
                  <p className="text-xs text-stone-400">登入中...</p>
                </div>
              </div>
            } />
            <Route path="*" element={<div className="p-8 text-xs text-stone-500">Not found.</div>} />
          </Routes>
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
      <MobileDrawer activeTab={activeTab} setActiveTab={setActiveTab} lang={lang}
        sourcesCount={sources.length} isOpen={isMobileDrawerOpen} setIsOpen={setIsMobileDrawerOpen}
        currentUser={currentUser} onLogout={handleLogout} />
      <PwaInstallPrompt lang={lang} />
      <OnboardingTour lang={lang} activeTab={activeTab} setActiveTab={setActiveTab}
        isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}
