import React, { useEffect, useState } from 'react';
import { ExternalLink, Copy, Loader2 } from 'lucide-react';
import { getToken, fetchPublicProject, copyPublicProject, PublicProject } from '../api';
import { Language } from '../types';

const GOOGLE_LOGIN_URL = 'https://context-os-api.kelvinchenrichai.workers.dev/auth/google/start';
export const PENDING_COPY_KEY = 'keepo_pending_copy_slug';

interface PublicProjectPageProps {
  slug: string;
  lang: Language;
}

export default function PublicProjectPage({ slug, lang }: PublicProjectPageProps) {
  const zh = lang === 'zh-TW';

  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    fetchPublicProject(slug)
      .then(setProject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Resume a copy that was interrupted by a login redirect: if we now have a
  // token and this page's slug matches what the visitor was trying to copy
  // before logging in, finish the job automatically instead of making them
  // click "copy" a second time.
  useEffect(() => {
    if (!project || !slug) return;
    if (localStorage.getItem(PENDING_COPY_KEY) === slug && getToken()) {
      localStorage.removeItem(PENDING_COPY_KEY);
      handleCopy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, slug]);

  const handleCopy = async () => {
    if (!slug) return;
    if (!getToken()) {
      // Not logged in — remember what we were trying to copy, then continue
      // the OAuth flow. AuthCallback checks for this and resumes the copy
      // automatically once login completes.
      localStorage.setItem(PENDING_COPY_KEY, slug);
      window.location.assign(GOOGLE_LOGIN_URL);
      return;
    }
    setCopying(true);
    setError('');
    try {
      const { id } = await copyPublicProject(slug);
      // Full page load, not client-side navigate: the main App's in-memory
      // projects/sources state was loaded once at mount and has no idea
      // this brand-new project exists yet — a soft navigate would land on
      // ProjectDetail before it's in that list, showing "Project not found."
      window.location.href = `/projects/${id}?welcome=1`;
    } catch (e: any) {
      setError(e.message || (zh ? '複製失敗，請稍後再試' : 'Copy failed, please try again'));
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <img src="/mascot/mascot-thinking.svg" alt="" className="w-16 h-16 animate-mascot" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <img src="/mascot/mascot-sorry.svg" alt="" className="w-20 h-20 mx-auto animate-mascot" />
          <p className="text-sm text-stone-500 dark:text-stone-400 font-sans">
            {zh ? '這個分享連結不存在，或已經取消公開。' : 'This share link doesn\'t exist or is no longer public.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <img src="/icons/icon-standard.svg" alt="Keepo" className="w-10 h-10 rounded-xl mx-auto" />
          <p className="text-[11px] font-mono text-stone-400 uppercase tracking-widest">記波 Keepo</p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-3.5 h-3.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: project.color }} />
            <div className="min-w-0">
              <h1 className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100">{project.name}</h1>
              {project.description && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-400 font-sans">
            <span>{project.sources.length} {zh ? '筆資料' : 'sources'}</span>
            {project.copyCount > 0 && (
              <span>· {zh ? `已被複製 ${project.copyCount} 次` : `copied ${project.copyCount} times`}</span>
            )}
          </div>

          <button
            onClick={handleCopy}
            disabled={copying}
            className="w-full py-3 bg-keepo-600 dark:bg-keepo-400 text-white dark:text-keepo-950 rounded-xl text-sm font-sans font-bold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {copying
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Copy className="w-4 h-4" />}
            {copying
              ? (zh ? '複製中…' : 'Copying…')
              : (zh ? '複製到我的 Keepo' : 'Copy to my Keepo')}
          </button>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        <div className="space-y-3">
          {project.sources.map((s, i) => (
            <div key={i} className="bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-850 rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-sans text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{s.title}</h3>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              {s.aiSummary && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">{s.aiSummary}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
