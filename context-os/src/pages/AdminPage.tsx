import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Globe2, ScrollText, Loader2, X, Check } from 'lucide-react';
import {
  fetchAdminStats, fetchAdminUsers, updateAdminUser, fetchAdminPublicProjects,
  unpublishAdminProject, fetchAdminAuditLog,
  AdminStats, AdminUser, AdminPublicProject, AdminAuditLogEntry,
} from '../api';

type Tab = 'dashboard' | 'users' | 'public' | 'log';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [publicProjects, setPublicProjects] = useState<AdminPublicProject[]>([]);
  const [auditLog, setAuditLog] = useState<AdminAuditLogEntry[]>([]);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editPlan, setEditPlan] = useState('free');
  const [editBonusAnalyses, setEditBonusAnalyses] = useState('0');
  const [editBonusImages, setEditBonusImages] = useState('0');
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      const [s, u, p, l] = await Promise.all([
        fetchAdminStats(), fetchAdminUsers(), fetchAdminPublicProjects(), fetchAdminAuditLog(),
      ]);
      setStats(s); setUsers(u); setPublicProjects(p); setAuditLog(l);
    } catch (e: any) {
      if (e.message === 'Forbidden') setForbidden(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditPlan(u.plan);
    setEditBonusAnalyses(String(u.bonus_analyses));
    setEditBonusImages(String(u.bonus_images));
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await updateAdminUser(editingUser.id, {
        plan: editPlan,
        bonusAnalyses: parseInt(editBonusAnalyses, 10) || 0,
        bonusImages: parseInt(editBonusImages, 10) || 0,
      });
      setEditingUser(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async (id: string) => {
    if (!confirm('Unpublish this project? The public link will stop working.')) return;
    await unpublishAdminProject(id);
    await loadAll();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen px-4">
        <p className="text-sm text-stone-500">你的帳號沒有管理員權限。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
      <div>
        <h1 className="font-sans text-xl font-bold text-stone-900 dark:text-stone-100">Admin</h1>
        <p className="text-xs text-stone-400 mt-1">內部管理後台 — 只有 ADMIN_EMAILS 白名單裡的帳號能看到這頁。</p>
      </div>

      <div className="flex gap-1 border-b border-stone-200 dark:border-stone-800">
        {([
          ['dashboard', '儀表板', TrendingUp],
          ['users', '用戶管理', Users],
          ['public', '公開內容', Globe2],
          ['log', '操作紀錄', ScrollText],
        ] as [Tab, string, any][]).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-semibold border-b-2 -mb-px transition-colors ${
              tab === id
                ? 'border-keepo-600 dark:border-keepo-400 text-keepo-600 dark:text-keepo-400'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="總用戶數" value={stats.totalUsers} />
          <StatCard label="近7天新增" value={stats.newUsers7d} />
          <StatCard label="近30天新增" value={stats.newUsers30d} />
          <StatCard label="本月AI分析" value={stats.thisMonthAnalyses} />
          <StatCard label="本月圖片上傳" value={stats.thisMonthImages} />
          <StatCard label="公開專案數" value={stats.publicProjectsCount} />
          <StatCard label="總複製次數" value={stats.totalCopies} />
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1.5">各方案人數</p>
            {Object.entries(stats.usersByPlan).map(([plan, count]) => (
              <p key={plan} className="text-xs text-stone-700 dark:text-stone-300">{plan}: {count}</p>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-mono uppercase text-[10px]">
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">方案</th>
                <th className="text-left p-3">本月分析</th>
                <th className="text-left p-3">本月圖片</th>
                <th className="text-left p-3">加碼額度</th>
                <th className="text-left p-3">最後活動</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-stone-100 dark:border-stone-850 last:border-0">
                  <td className="p-3 text-stone-700 dark:text-stone-300">{u.email}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{u.plan}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{u.ai_analyses_used}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{u.images_used}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">+{u.bonus_analyses} / +{u.bonus_images}</td>
                  <td className="p-3 text-stone-400">{new Date(u.updated_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button onClick={() => openEdit(u)} className="text-keepo-600 dark:text-keepo-400 font-semibold">調整</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'public' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-mono uppercase text-[10px]">
                <th className="text-left p-3">專案名稱</th>
                <th className="text-left p-3">作者</th>
                <th className="text-left p-3">複製次數</th>
                <th className="text-left p-3">建立時間</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {publicProjects.map(p => (
                <tr key={p.id} className="border-b border-stone-100 dark:border-stone-850 last:border-0">
                  <td className="p-3 text-stone-700 dark:text-stone-300">{p.name}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{p.owner_email}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{p.copy_count}</td>
                  <td className="p-3 text-stone-400">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-3 flex items-center gap-3">
                    <a href={`/p/${p.public_slug}`} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">開啟</a>
                    <button onClick={() => handleUnpublish(p.id)} className="text-red-500 font-semibold">取消公開</button>
                  </td>
                </tr>
              ))}
              {publicProjects.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-stone-400">目前沒有公開專案</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'log' && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-mono uppercase text-[10px]">
                <th className="text-left p-3">時間</th>
                <th className="text-left p-3">操作者</th>
                <th className="text-left p-3">動作</th>
                <th className="text-left p-3">對象</th>
                <th className="text-left p-3">變更前</th>
                <th className="text-left p-3">變更後</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map(l => (
                <tr key={l.id} className="border-b border-stone-100 dark:border-stone-850 last:border-0">
                  <td className="p-3 text-stone-400 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{l.admin_email}</td>
                  <td className="p-3 text-stone-700 dark:text-stone-300">{l.action}</td>
                  <td className="p-3 text-stone-500 font-mono text-[11px]">{l.target_user_id}</td>
                  <td className="p-3 text-stone-500 font-mono text-[11px] max-w-[200px] truncate">{l.before_value}</td>
                  <td className="p-3 text-stone-500 font-mono text-[11px] max-w-[200px] truncate">{l.after_value}</td>
                </tr>
              ))}
              {auditLog.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-stone-400">目前沒有操作紀錄</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">{editingUser.email}</h3>
              <button onClick={() => setEditingUser(null)}><X className="w-4 h-4 text-stone-400" /></button>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-stone-400 uppercase">方案</label>
              <select
                value={editPlan}
                onChange={e => setEditPlan(e.target.value)}
                className="w-full border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
              >
                <option value="free">free</option>
                <option value="pro">pro (Plus)</option>
                <option value="power">power (Pro/BYOK)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase">加碼分析次數</label>
                <input
                  type="number"
                  value={editBonusAnalyses}
                  onChange={e => setEditBonusAnalyses(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-stone-400 uppercase">加碼圖片張數</label>
                <input
                  type="number"
                  value={editBonusImages}
                  onChange={e => setEditBonusImages(e.target.value)}
                  className="w-full border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
            <button
              onClick={saveEdit}
              disabled={saving}
              className="w-full py-2 bg-keepo-600 dark:bg-keepo-400 text-white dark:text-keepo-950 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              儲存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
      <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
    </div>
  );
}
