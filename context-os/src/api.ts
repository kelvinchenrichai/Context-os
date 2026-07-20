// api.ts — all communication with the Cloudflare Worker backend

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://context-os-api.kelvinchenrichai.workers.dev';

// ─── Token storage ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('context_os_token');
}

export function setToken(token: string) {
  localStorage.setItem('context_os_token', token);
}

export function clearToken() {
  localStorage.removeItem('context_os_token');
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
  });

  const data = await res.json() as { success: boolean; data: T; error?: { message: string } };

  if (!data.success) {
    throw new Error(data.error?.message || 'API error');
  }

  return data.data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function devLogin(email: string, name: string): Promise<{ token: string; userId: string }> {
  return apiFetch('/auth/dev-login', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
}

export async function getMe(): Promise<{
  id: string; email: string; name: string; plan: string; ai_analyses_used: number;
}> {
  return apiFetch('/api/v1/me');
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function fetchProjects() {
  return apiFetch<any[]>('/api/v1/projects');
}

export async function createProject(data: Record<string, unknown>) {
  return apiFetch<{ id: string }>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: string, data: Record<string, unknown>) {
  return apiFetch<{ id: string }>(`/api/v1/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/v1/projects/${id}`, { method: 'DELETE' });
}

// ─── Sources ──────────────────────────────────────────────────────────────────

export async function fetchSources(projectId?: string) {
  const qs = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<any[]>(`/api/v1/sources${qs}`);
}

export async function createSource(data: Record<string, unknown>) {
  return apiFetch<{ id: string }>('/api/v1/sources', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSource(id: string, data: Record<string, unknown>) {
  return apiFetch<{ id: string }>(`/api/v1/sources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSource(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/v1/sources/${id}`, { method: 'DELETE' });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchCategories() {
  return apiFetch<any[]>('/api/v1/categories');
}

export async function createCategory(name: string, projectId = 'global') {
  return apiFetch<{ id: string }>('/api/v1/categories', {
    method: 'POST',
    body: JSON.stringify({ name, projectId }),
  });
}

export async function renameCategory(id: string, name: string) {
  return apiFetch<{ id: string }>(`/api/v1/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteCategory(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/v1/categories/${id}`, { method: 'DELETE' });
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchSources(q: string) {
  return apiFetch<any[]>(`/api/v1/search?q=${encodeURIComponent(q)}`);
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────

export async function analyzeSource(sourceId: string): Promise<{
  summary: string;
  keyPoints: string[];
  suggestedTags: string[];
  suggestedCategory: string;
  useCase: string;
}> {
  return apiFetch('/api/v1/sources/analyze', {
    method: 'POST',
    body: JSON.stringify({ sourceId }),
  });
}

// ─── Source project management ────────────────────────────────────────────────

export async function getSourceProjects(sourceId: string): Promise<{ primaryProjectId: string; linkedProjectIds: string[] }> {
  return apiFetch(`/api/v1/sources/${sourceId}/projects`);
}

export async function moveSource(sourceId: string, targetProjectId: string): Promise<{ moved: boolean; from: string; to: string }> {
  return apiFetch(`/api/v1/sources/${sourceId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ targetProjectId }),
  });
}

export async function linkSource(sourceId: string, projectId: string): Promise<{ linked: boolean }> {
  return apiFetch(`/api/v1/sources/${sourceId}/link`, {
    method: 'POST',
    body: JSON.stringify({ projectId }),
  });
}

export async function unlinkSource(sourceId: string, projectId: string): Promise<{ unlinked: boolean }> {
  return apiFetch(`/api/v1/sources/${sourceId}/link/${projectId}`, { method: 'DELETE' });
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export interface Todo {
  id: string;
  text: string;
  note: string;
  isDone: boolean;
  projectId: string | null;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchTodos(projectId?: string): Promise<Todo[]> {
  const qs = projectId ? `?projectId=${projectId}` : '';
  return apiFetch<Todo[]>(`/api/v1/todos${qs}`);
}

export async function createTodo(data: { text: string; note?: string; projectId?: string | null; dueAt?: string | null }): Promise<{ id: string }> {
  return apiFetch('/api/v1/todos', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTodo(id: string, data: Partial<{ text: string; note: string; isDone: boolean; dueAt: string | null; projectId: string | null }>): Promise<{ id: string }> {
  return apiFetch(`/api/v1/todos/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteTodo(id: string): Promise<{ deleted: boolean }> {
  return apiFetch(`/api/v1/todos/${id}`, { method: 'DELETE' });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function saveExport(data: Record<string, unknown>) {
  return apiFetch<{ id: string }>('/api/v1/exports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
