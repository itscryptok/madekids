import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}${path}`;

type Stats = { totalUsers: number; activeSubscriptions: number; totalVideosWatched: number; totalRecordings: number };
type UserRow = {
  id: number; name: string; email: string; username?: string; subscriptionStatus: string;
  createdAt: string; childrenCount: number; progress: { videosWatched: number; recitationsRecorded: number; challengesRecorded: number };
};
type CoachRow = {
  id: number; displayName: string; slug: string; referralCode: string; approved: boolean;
  parentName: string; parentEmail: string; protegeCount: number; insightCount: number; balanceCents: number; totalWithdrawn: number; createdAt: string;
};
type ContentRow = { id: number; date: string; title: string; theme: string; videoUrl: string; pointsValue: number };

export default function Addy() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<"overview" | "users" | "coaches" | "content" | "settings">("overview");

  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [content, setContent] = useState<ContentRow[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [contentForm, setContentForm] = useState({
    date: new Date().toISOString().split("T")[0], title: "", description: "", videoUrl: "",
    recitationPrompt: "", challengeDescription: "", theme: "", duration: "420", pointsValue: "30",
  });
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  const addyToken = () => sessionStorage.getItem("addy_token") || "";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${addyToken()}` };
  const apiFetch = (path: string, init?: RequestInit) => fetch(api(path), { ...init, headers });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    try {
      const r = await fetch(api("/api/addy/auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (r.ok) {
        const d = await r.json();
        sessionStorage.setItem("addy_token", d.token);
        setAuthed(true);
      } else {
        const d = await r.json();
        setPwError(d.message || "Incorrect password.");
      }
    } catch {
      setPwError("Connection error. Please try again.");
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem("addy_token")) setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    if (tab === "overview") loadStats();
    if (tab === "users") loadUsers();
    if (tab === "coaches") loadCoaches();
    if (tab === "content") loadContent();
    if (tab === "settings") loadSettings();
  }, [authed, tab]);

  async function loadStats() {
    setLoading(true);
    const r = await fetch(api("/api/admin/stats"), { headers });
    if (r.ok) setStats(await r.json());
    setLoading(false);
  }

  async function loadUsers() {
    setLoading(true);
    const r = await fetch(api("/api/admin/users"), { headers });
    if (r.ok) setUsers(await r.json());
    setLoading(false);
  }

  async function loadCoaches() {
    setLoading(true);
    const r = await fetch(api("/api/admin/coaches"), { headers });
    if (r.ok) setCoaches(await r.json());
    setLoading(false);
  }

  async function loadContent() {
    setLoading(true);
    const r = await fetch(api("/api/admin/content"), { headers });
    if (r.ok) setContent(await r.json());
    setLoading(false);
  }

  async function loadSettings() {
    setLoading(true);
    const r = await fetch(api("/api/admin/settings"), { headers });
    if (r.ok) {
      const data = await r.json();
      setSettings(data);
      setSettingsForm(data);
    }
    setLoading(false);
  }

  async function deleteUser(id: number) {
    if (!confirm("Delete this user and all their data?")) return;
    await fetch(api(`/api/admin/users/${id}`), { method: "DELETE", headers });
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  async function approveCoach(id: number) {
    await fetch(api(`/api/admin/coaches/${id}/approve`), { method: "PATCH", headers });
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
    setMsg("Coach approved!");
    setTimeout(() => setMsg(""), 2000);
  }

  async function rejectCoach(id: number) {
    await fetch(api(`/api/admin/coaches/${id}/reject`), { method: "PATCH", headers });
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, approved: false } : c));
    setMsg("Coach rejected.");
    setTimeout(() => setMsg(""), 2000);
  }

  async function deleteCoach(id: number) {
    if (!confirm("Remove this coach account permanently?")) return;
    await fetch(api(`/api/admin/coaches/${id}`), { method: "DELETE", headers });
    setCoaches(prev => prev.filter(c => c.id !== id));
  }

  async function submitContent(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(api("/api/admin/content"), {
      method: "POST", headers,
      body: JSON.stringify({ ...contentForm, duration: parseInt(contentForm.duration), pointsValue: parseInt(contentForm.pointsValue) }),
    });
    if (r.ok) {
      setMsg("Content saved!");
      loadContent();
      setTimeout(() => setMsg(""), 2000);
    }
  }

  async function deleteContent(id: number) {
    await fetch(api(`/api/admin/content/${id}`), { method: "DELETE", headers });
    setContent(prev => prev.filter(c => c.id !== id));
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(api("/api/admin/settings"), {
      method: "PUT", headers, body: JSON.stringify(settingsForm),
    });
    if (r.ok) { setMsg("Settings saved!"); setTimeout(() => setMsg(""), 2000); }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-black text-2xl">MK</span>
            </div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-white/50 text-sm mt-1">Made Kids — Restricted Access</p>
          </div>
          <form onSubmit={handleLogin} className="bg-card rounded-2xl p-6 space-y-4">
            {pwError && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3">{pwError}</div>}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Admin Password</label>
              <input type="password" value={pw} onChange={e => setPw(e.target.value)} required autoFocus
                placeholder="Enter admin password"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold transition-colors">
              Enter Admin Panel
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: `Users (${users.length || "…"})` },
    { key: "coaches", label: `Coaches (${coaches.length || "…"})` },
    { key: "content", label: "Daily Content" },
    { key: "settings", label: "Settings" },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-white font-black text-sm">MK</span></div>
            <span className="text-white font-black">Admin Panel</span>
            <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">ADDY</span>
          </div>
          <div className="text-white/50 text-sm">Admin</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {msg && <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-xl p-3">{msg}</div>}

        <div className="flex gap-2 mb-6 border-b border-border pb-4 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${tab === t.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            <h2 className="text-xl font-black mb-4">Platform Overview</h2>
            {loading ? <p className="text-muted-foreground">Loading…</p> : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Members", value: stats.totalUsers },
                  { label: "Active Subscribers", value: stats.activeSubscriptions },
                  { label: "Videos Watched", value: stats.totalVideosWatched },
                  { label: "Recordings", value: stats.totalRecordings },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
                    <p className="text-muted-foreground text-xs font-semibold mb-1">{s.label}</p>
                    <p className="text-3xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-muted-foreground">No stats available yet.</p>}
          </div>
        )}

        {tab === "users" && (
          <div>
            <h2 className="text-xl font-black mb-4">All Parents</h2>
            {loading ? <p className="text-muted-foreground">Loading…</p> : (
              <div className="space-y-3">
                {users.map(u => (
                  <div key={u.id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{u.name} {u.username && <span className="text-muted-foreground text-sm">@{u.username}</span>}</p>
                      <p className="text-muted-foreground text-sm">{u.email}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className={`font-bold ${u.subscriptionStatus === "active" ? "text-green-600" : "text-amber-500"}`}>{u.subscriptionStatus}</span>
                        <span>{u.childrenCount} child{u.childrenCount !== 1 ? "ren" : ""}</span>
                        <span>{u.progress.videosWatched}v / {u.progress.recitationsRecorded}r / {u.progress.challengesRecorded}c</span>
                      </div>
                    </div>
                    <button onClick={() => deleteUser(u.id)} className="text-destructive text-xs border border-destructive/20 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">Delete</button>
                  </div>
                ))}
                {users.length === 0 && <p className="text-muted-foreground">No parent accounts yet.</p>}
              </div>
            )}
          </div>
        )}

        {tab === "coaches" && (
          <div>
            <h2 className="text-xl font-black mb-4">All Coaches</h2>
            {loading ? <p className="text-muted-foreground">Loading…</p> : (
              <div className="space-y-4">
                {coaches.map(c => (
                  <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-foreground text-lg">{c.displayName}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.approved ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>
                            {c.approved ? "Approved" : "Pending"}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm">{c.parentName} · {c.parentEmail}</p>
                        <p className="text-xs text-muted-foreground mt-1">Slug: /{c.slug} · Ref: <span className="font-mono font-bold">{c.referralCode}</span></p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{c.protegeCount} proteges</span>
                          <span>{c.insightCount} insights</span>
                          <span className="text-green-600 font-bold">Balance: ${(c.balanceCents / 100).toFixed(2)}</span>
                          <span>Withdrawn: ${(c.totalWithdrawn / 100).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!c.approved && (
                          <button onClick={() => approveCoach(c.id)} className="text-green-600 text-xs border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/10 transition-colors">Approve</button>
                        )}
                        {c.approved && (
                          <button onClick={() => rejectCoach(c.id)} className="text-amber-600 text-xs border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors">Suspend</button>
                        )}
                        <button onClick={() => deleteCoach(c.id)} className="text-destructive text-xs border border-destructive/20 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
                {coaches.length === 0 && <p className="text-muted-foreground">No coaches yet.</p>}
              </div>
            )}
          </div>
        )}

        {tab === "content" && (
          <div>
            <h2 className="text-xl font-black mb-4">Daily Content</h2>
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-foreground mb-4">Upload / Update Content</h3>
              <form onSubmit={submitContent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Date</label>
                    <input type="date" value={contentForm.date} onChange={e => setContentForm(f => ({ ...f, date: e.target.value }))} required className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Theme</label>
                    <input type="text" value={contentForm.theme} onChange={e => setContentForm(f => ({ ...f, theme: e.target.value }))} required placeholder="e.g. Resilience" className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Title</label>
                  <input type="text" value={contentForm.title} onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))} required className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Video URL (YouTube embed or direct)</label>
                  <input type="url" value={contentForm.videoUrl} onChange={e => setContentForm(f => ({ ...f, videoUrl: e.target.value }))} required className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Recitation Prompt</label>
                  <textarea value={contentForm.recitationPrompt} onChange={e => setContentForm(f => ({ ...f, recitationPrompt: e.target.value }))} required rows={2} className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Challenge Description</label>
                  <textarea value={contentForm.challengeDescription} onChange={e => setContentForm(f => ({ ...f, challengeDescription: e.target.value }))} required rows={2} className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">Save Content</button>
              </form>
            </div>

            <div className="space-y-3">
              {content.map(c => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-foreground">{c.date} — {c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.theme} · {c.pointsValue} pts</p>
                  </div>
                  <button onClick={() => deleteContent(c.id)} className="text-destructive text-xs border border-destructive/20 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div>
            <h2 className="text-xl font-black mb-4">Site Settings</h2>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl mb-6">
              <h3 className="font-bold mb-3">Default Coach MK</h3>
              <p className="text-sm text-muted-foreground mb-4">Ensure the default "Coach MK" account exists. All parents who register without a referral code are automatically assigned to Coach MK and their subscription fees are credited at 70%.</p>
              <div className="flex gap-3 flex-wrap">
                <button type="button" className="bg-secondary hover:bg-secondary/80 text-foreground px-5 py-2 rounded-xl font-bold text-sm transition-colors" onClick={async () => {
                  const res = await apiFetch("/api/admin/ensure-default-coach", { method: "POST" });
                  const data = await res.json();
                  if (res.ok) setMsg(data.created ? "Coach MK created successfully!" : "Coach MK already exists.");
                  else setMsg("Error: " + (data.message || "failed"));
                }}>Setup / Verify Coach MK</button>
                <button type="button" className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl font-bold text-sm transition-colors" onClick={async () => {
                  const res = await apiFetch("/api/stripe/seed-products", { method: "POST" });
                  const data = await res.json();
                  if (res.ok) setMsg(data.message || "Stripe products created: " + JSON.stringify(data));
                  else setMsg("Stripe seed error: " + (data.error || "unknown"));
                }}>Seed Stripe Products ($5/mo, $50/yr)</button>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl">
              <form onSubmit={saveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Coach MK Welcome Video URL</label>
                  <input type="url" value={settingsForm.welcome_video_url || ""} onChange={e => setSettingsForm(f => ({ ...f, welcome_video_url: e.target.value }))}
                    placeholder="https://youtube.com/embed/..." className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <p className="text-xs text-muted-foreground mt-1">Shown to new users on the Dashboard for 72 hours after signup.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-muted-foreground">Coach Display Name</label>
                  <input type="text" value={settingsForm.coach_name || ""} onChange={e => setSettingsForm(f => ({ ...f, coach_name: e.target.value }))}
                    placeholder="Coach MK" className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">Save Settings</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
