import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";

type UserRow = {
  id: number;
  name: string;
  email: string;
  username: string | null;
  subscriptionStatus: string;
  plan: string | null;
  createdAt: string;
  childrenCount: number;
  progress: {
    videosWatched: number;
    recitationsRecorded: number;
    challengesRecorded: number;
    totalCompleted: number;
  };
};

type ContentRow = {
  id: number;
  date: string;
  title: string;
  theme: string;
  videoUrl: string;
};

type CoachRow = {
  id: number;
  displayName: string;
  slug: string;
  referralCode: string;
  approved: boolean;
  isDefault: boolean;
  balanceCents: number;
  parentName: string;
  parentEmail: string;
  protegeCount: number;
  insightCount: number;
  totalWithdrawn: number;
  createdAt: string;
};

type Settings = {
  welcome_video_url?: string;
  coach_name?: string;
};

type TabKey = "overview" | "users" | "coaches" | "content" | "settings";

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingContentId, setDeletingContentId] = useState<number | null>(null);
  const [deletingCoachId, setDeletingCoachId] = useState<number | null>(null);
  const [approvingCoachId, setApprovingCoachId] = useState<number | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [newContent, setNewContent] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "", description: "", videoUrl: "", recitationPrompt: "",
    challengeDescription: "", theme: "", duration: 420, pointsValue: 30,
  });
  const [savingContent, setSavingContent] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);
  const [contentError, setContentError] = useState("");

  const token = localStorage.getItem("mk_token");
  const isAdmin = (user as any)?.role === "admin";

  useEffect(() => {
    if (!isAdmin) { navigate("/dashboard"); return; }
    loadAll();
  }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, contentRes, settingsRes, coachesRes] = await Promise.all([
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/content", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/coaches", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (contentRes.ok) setContent(await contentRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (coachesRes.ok) setCoaches(await coachesRes.json());
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.filter(u => u.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const approveCoach = async (id: number) => {
    setApprovingCoachId(id);
    try {
      const res = await fetch(`/api/admin/coaches/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCoaches(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
    } finally {
      setApprovingCoachId(null);
    }
  };

  const rejectCoach = async (id: number) => {
    if (!confirm("Revoke approval for this coach?")) return;
    setApprovingCoachId(id);
    try {
      const res = await fetch(`/api/admin/coaches/${id}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCoaches(prev => prev.map(c => c.id === id ? { ...c, approved: false } : c));
    } finally {
      setApprovingCoachId(null);
    }
  };

  const deleteCoach = async (id: number) => {
    if (!confirm("Delete this coach profile and all their data? This cannot be undone.")) return;
    setDeletingCoachId(id);
    try {
      await fetch(`/api/admin/coaches/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setCoaches(prev => prev.filter(c => c.id !== id));
    } finally {
      setDeletingCoachId(null);
    }
  };

  const deleteContent = async (id: number) => {
    if (!confirm("Delete this daily content entry?")) return;
    setDeletingContentId(id);
    try {
      await fetch(`/api/admin/content/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setContent(prev => prev.filter(c => c.id !== id));
    } finally {
      setDeletingContentId(null);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const saveContent = async () => {
    setContentError("");
    if (!newContent.title || !newContent.videoUrl || !newContent.recitationPrompt || !newContent.challengeDescription || !newContent.theme) {
      setContentError("Please fill in all required fields.");
      return;
    }
    setSavingContent(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newContent),
      });
      if (res.ok) {
        setContentSaved(true);
        setTimeout(() => setContentSaved(false), 3000);
        setNewContent({ date: new Date().toISOString().split("T")[0], title: "", description: "", videoUrl: "", recitationPrompt: "", challengeDescription: "", theme: "", duration: 420, pointsValue: 30 });
        const updated = await fetch("/api/admin/content", { headers: { Authorization: `Bearer ${token}` } });
        if (updated.ok) setContent(await updated.json());
      } else {
        const d = await res.json();
        setContentError(d.message || "Failed to save content.");
      }
    } finally {
      setSavingContent(false);
    }
  };

  const totalVideos = users.reduce((s, u) => s + u.progress.videosWatched, 0);
  const totalRecitations = users.reduce((s, u) => s + u.progress.recitationsRecorded, 0);
  const totalChallenges = users.reduce((s, u) => s + u.progress.challengesRecorded, 0);
  const activeUsers = users.filter(u => u.subscriptionStatus === "active").length;
  const pendingCoaches = coaches.filter(c => !c.approved && !c.isDefault);
  const approvedCoaches = coaches.filter(c => c.approved && !c.isDefault);

  const tabs: { key: TabKey; label: string; icon: string; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: "⬡" },
    { key: "users", label: "Users", icon: "◉" },
    { key: "coaches", label: "Coaches", icon: "🏆", badge: pendingCoaches.length },
    { key: "content", label: "Daily Content", icon: "▶" },
    { key: "settings", label: "Settings", icon: "◆" },
  ];

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">◆</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">Made Kids — Management Dashboard</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1.5 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-max py-2.5 px-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap relative ${activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {tab.icon} {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs font-black rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* OVERVIEW */}
          {activeTab === "overview" && !loading && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Members", value: users.length, accent: true },
                  { label: "Active Subscribers", value: activeUsers, accent: false },
                  { label: "Approved Coaches", value: approvedCoaches.length, accent: false },
                  { label: "Pending Approvals", value: pendingCoaches.length, accent: false },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className={`rounded-2xl p-5 ${stat.accent ? "bg-primary text-white" : "bg-card border border-card-border"}`}>
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${stat.accent ? "text-white/70" : "text-muted-foreground"}`}>{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.accent ? "text-white" : "text-foreground"}`}>{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "Daily Videos Watched", value: totalVideos, icon: "▶", color: "text-primary" },
                  { label: "Recitations Recorded", value: totalRecitations, icon: "◉", color: "text-primary" },
                  { label: "Challenges Recorded", value: totalChallenges, icon: "★", color: "text-primary" },
                ].map((s, i) => (
                  <div key={i} className="bg-card border border-card-border rounded-2xl p-5 flex items-center gap-4">
                    <div className={`text-3xl ${s.color}`}>{s.icon}</div>
                    <div>
                      <p className="text-2xl font-black text-foreground">{s.value}</p>
                      <p className="text-muted-foreground text-xs">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {pendingCoaches.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-6">
                  <p className="font-black text-foreground mb-1">⚠️ {pendingCoaches.length} coach application{pendingCoaches.length > 1 ? "s" : ""} awaiting review</p>
                  <p className="text-muted-foreground text-sm mb-3">Review and approve or reject them in the Coaches tab.</p>
                  <button onClick={() => setActiveTab("coaches")}
                    className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                    Go to Coaches
                  </button>
                </div>
              )}

              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-black text-foreground mb-4">Recent Members</h3>
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-sm">{u.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{u.name}</p>
                      <p className="text-muted-foreground text-xs truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.subscriptionStatus === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {u.subscriptionStatus}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* USERS */}
          {activeTab === "users" && !loading && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                {users.length === 0 && (
                  <div className="text-center py-16 bg-card border border-card-border rounded-3xl">
                    <p className="text-muted-foreground">No users yet.</p>
                  </div>
                )}
                {users.map(u => (
                  <div key={u.id} className="bg-card border border-card-border rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black shrink-0">{u.name[0]}</div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground">{u.name}</p>
                          {u.username && <p className="text-primary text-sm font-semibold">@{u.username}</p>}
                          <p className="text-muted-foreground text-xs truncate">{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${u.subscriptionStatus === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {u.plan ?? u.subscriptionStatus}
                        </span>
                        <button onClick={() => deleteUser(u.id)} disabled={deletingId === u.id}
                          className="text-destructive text-xs font-bold hover:bg-destructive/10 px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
                          {deletingId === u.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 bg-muted rounded-xl p-3">
                      {[
                        { label: "Children", value: u.childrenCount },
                        { label: "Videos", value: u.progress.videosWatched },
                        { label: "Recitations", value: u.progress.recitationsRecorded },
                        { label: "Challenges", value: u.progress.challengesRecorded },
                      ].map((stat, i) => (
                        <div key={i} className="text-center">
                          <p className="font-black text-foreground text-lg">{stat.value}</p>
                          <p className="text-muted-foreground text-xs">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-muted-foreground text-xs mt-2">
                      Joined {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* COACHES */}
          {activeTab === "coaches" && !loading && (
            <motion.div key="coaches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {pendingCoaches.length > 0 && (
                <>
                  <h2 className="font-black text-foreground text-lg mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                    Pending Approval ({pendingCoaches.length})
                  </h2>
                  <div className="space-y-4 mb-8">
                    {pendingCoaches.map(c => (
                      <CoachCard key={c.id} coach={c}
                        onApprove={() => approveCoach(c.id)}
                        onReject={() => rejectCoach(c.id)}
                        onDelete={() => deleteCoach(c.id)}
                        isActioning={approvingCoachId === c.id}
                        isDeleting={deletingCoachId === c.id}
                      />
                    ))}
                  </div>
                </>
              )}

              <h2 className="font-black text-foreground text-lg mb-4">
                Approved Coaches ({approvedCoaches.length})
              </h2>
              {approvedCoaches.length === 0 ? (
                <div className="text-center py-12 bg-card border border-card-border rounded-3xl">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="text-lg font-black text-foreground mb-1">No approved coaches yet</h3>
                  <p className="text-muted-foreground text-sm">Coach applications will appear here once submitted.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedCoaches.map(c => (
                    <CoachCard key={c.id} coach={c}
                      onApprove={() => approveCoach(c.id)}
                      onReject={() => rejectCoach(c.id)}
                      onDelete={() => deleteCoach(c.id)}
                      isActioning={approvingCoachId === c.id}
                      isDeleting={deletingCoachId === c.id}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* DAILY CONTENT */}
          {activeTab === "content" && !loading && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-card-border rounded-3xl p-6 mb-6">
                <h2 className="font-black text-foreground text-lg mb-5">Upload Daily Insight</h2>
                {contentError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-4">{contentError}</div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Date *</label>
                    <input type="date" value={newContent.date} onChange={e => setNewContent(p => ({ ...p, date: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Theme *</label>
                    <input type="text" value={newContent.theme} onChange={e => setNewContent(p => ({ ...p, theme: e.target.value }))}
                      placeholder="e.g. Courage, Gratitude, Focus"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">Title *</label>
                    <input type="text" value={newContent.title} onChange={e => setNewContent(p => ({ ...p, title: e.target.value }))}
                      placeholder="Today's insight title"
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">Video URL * <span className="font-normal text-muted-foreground">(YouTube or direct link)</span></label>
                    <input type="url" value={newContent.videoUrl} onChange={e => setNewContent(p => ({ ...p, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=... or https://..."
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                    <textarea value={newContent.description} onChange={e => setNewContent(p => ({ ...p, description: e.target.value }))}
                      placeholder="Brief description of today's insight..."
                      rows={3}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Recitation Prompt *</label>
                    <textarea value={newContent.recitationPrompt} onChange={e => setNewContent(p => ({ ...p, recitationPrompt: e.target.value }))}
                      placeholder="What should kids recite?"
                      rows={3}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Challenge Description *</label>
                    <textarea value={newContent.challengeDescription} onChange={e => setNewContent(p => ({ ...p, challengeDescription: e.target.value }))}
                      placeholder="What is today's challenge?"
                      rows={3}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Video Duration (seconds)</label>
                    <input type="number" value={newContent.duration} onChange={e => setNewContent(p => ({ ...p, duration: parseInt(e.target.value) || 420 }))}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Points Value</label>
                    <input type="number" value={newContent.pointsValue} onChange={e => setNewContent(p => ({ ...p, pointsValue: parseInt(e.target.value) || 30 }))}
                      className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <button onClick={saveContent} disabled={savingContent}
                  className={`mt-5 px-8 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 ${contentSaved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90"}`}>
                  {savingContent ? "Saving..." : contentSaved ? "✓ Saved!" : "Publish Daily Insight"}
                </button>
              </div>

              <h2 className="font-black text-foreground text-lg mb-4">All Daily Content ({content.length})</h2>
              <div className="space-y-3">
                {content.map(c => (
                  <div key={c.id} className="bg-card border border-card-border rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm shrink-0">▶</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{c.title}</p>
                      <p className="text-muted-foreground text-xs">{c.date} · {c.theme}</p>
                    </div>
                    <button onClick={() => deleteContent(c.id)} disabled={deletingContentId === c.id}
                      className="text-destructive text-xs font-bold hover:bg-destructive/10 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 shrink-0">
                      {deletingContentId === c.id ? "..." : "Delete"}
                    </button>
                  </div>
                ))}
                {content.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">No content uploaded yet.</div>
                )}
              </div>
            </motion.div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && !loading && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-card border border-card-border rounded-3xl p-6 mb-6">
                <h2 className="font-black text-foreground text-lg mb-2">Coach MK Welcome Video</h2>
                <p className="text-muted-foreground text-sm mb-5">This video appears at the top of every new member's dashboard for their first 3 days. Paste a YouTube URL or direct video link.</p>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Welcome Video URL</label>
                  <input type="url" value={settings.welcome_video_url ?? ""}
                    onChange={e => setSettings(p => ({ ...p, welcome_video_url: e.target.value }))}
                    placeholder="https://youtube.com/embed/... or https://..."
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-2" />
                  <p className="text-xs text-muted-foreground">For YouTube, use the embed URL: https://www.youtube.com/embed/VIDEO_ID</p>
                </div>

                {settings.welcome_video_url && (
                  <div className="mt-4 rounded-2xl overflow-hidden aspect-video bg-black">
                    {settings.welcome_video_url.includes("youtube") || settings.welcome_video_url.includes("youtu.be") ? (
                      <iframe src={settings.welcome_video_url} className="w-full h-full" allowFullScreen />
                    ) : (
                      <video src={settings.welcome_video_url} controls className="w-full h-full" />
                    )}
                  </div>
                )}
              </div>

              <div className="bg-card border border-card-border rounded-3xl p-6 mb-6">
                <h2 className="font-black text-foreground text-lg mb-5">Coach Details</h2>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Coach Name</label>
                  <input type="text" value={settings.coach_name ?? ""}
                    onChange={e => setSettings(p => ({ ...p, coach_name: e.target.value }))}
                    placeholder="Coach MK"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>

              <button onClick={saveSettings} disabled={savingSettings}
                className={`px-8 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50 ${settingsSaved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90"}`}>
                {savingSettings ? "Saving..." : settingsSaved ? "✓ Settings Saved!" : "Save Settings"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function CoachCard({
  coach,
  onApprove,
  onReject,
  onDelete,
  isActioning,
  isDeleting,
}: {
  coach: CoachRow;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  isActioning: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className={`bg-card border-2 rounded-2xl p-5 transition-all ${coach.approved ? "border-card-border" : "border-amber-500/40 bg-amber-500/5"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg shrink-0">
            {coach.displayName[0]}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground">{coach.displayName}</p>
            <p className="text-muted-foreground text-xs truncate">{coach.parentEmail}</p>
            <p className="text-primary text-xs font-semibold">/{coach.slug} · Code: {coach.referralCode}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${coach.approved ? "bg-primary/10 text-primary" : "bg-amber-500/20 text-amber-700 dark:text-amber-400"}`}>
          {coach.approved ? "✓ Approved" : "Pending"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-muted rounded-xl p-3 mb-4">
        {[
          { label: "Families", value: coach.protegeCount },
          { label: "Insights", value: coach.insightCount },
          { label: "Withdrawn", value: `$${(coach.totalWithdrawn / 100).toFixed(2)}` },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <p className="font-black text-foreground text-lg">{stat.value}</p>
            <p className="text-muted-foreground text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!coach.approved && (
          <button onClick={onApprove} disabled={isActioning}
            className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isActioning ? "..." : "✓ Approve"}
          </button>
        )}
        {coach.approved && (
          <button onClick={onReject} disabled={isActioning}
            className="bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-500/30 transition-colors disabled:opacity-50">
            {isActioning ? "..." : "Revoke Approval"}
          </button>
        )}
        <a href={`/coach/${coach.slug}`} target="_blank" rel="noopener noreferrer"
          className="text-xs font-bold px-4 py-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">
          View Profile →
        </a>
        <button onClick={onDelete} disabled={isDeleting}
          className="text-destructive text-xs font-bold hover:bg-destructive/10 px-3 py-2 rounded-xl transition-colors disabled:opacity-50 ml-auto">
          {isDeleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
