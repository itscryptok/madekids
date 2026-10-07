import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyProgress, useGetStreak, useGetTodayContent } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ParentNote = { id: number; content: string; createdAt: string; parentName: string };

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { data: progress, isLoading: progressLoading } = useGetMyProgress();
  const { data: streak } = useGetStreak();
  const { data: todayContent } = useGetTodayContent();
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [openNoteId, setOpenNoteId] = useState<number | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      setPaymentSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
      let attempts = 0;
      const poll = async () => {
        setRefreshing(true);
        await refreshUser();
        attempts++;
        const stored = localStorage.getItem("mk_user");
        const isNowActive = stored ? JSON.parse(stored)?.subscriptionStatus === "active" : false;
        if (!isNowActive && attempts < 6) {
          setTimeout(poll, 2000);
        } else {
          setRefreshing(false);
        }
      };
      poll();
    }
  }, []);

  const modules = ["video", "recitation", "challenge"];
  const moduleLabels: Record<string, string> = { video: "Watch Insight", recitation: "Recite", challenge: "Challenge" };
  const moduleLinks: Record<string, string> = { video: "/mk-box", recitation: "/record/recitation", challenge: "/record/challenge" };
  const moduleIcons: Record<string, string> = { video: "▶", recitation: "◉", challenge: "★" };

  const completedToday = progress?.modulesCompletedToday ?? [];
  const allDone = completedToday.length === 3;

  useEffect(() => {
    const token = localStorage.getItem("mk_token");
    if (!token) return;
    fetch(`${BASE}/api/child-notes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setNotes(d))
      .catch(() => {});
  }, []);

  const isSubscribed = (user as any)?.subscriptionStatus === "active";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Payment success / confirming banner */}
        {paymentSuccess && !isSubscribed && refreshing && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-4 mb-6">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <p className="font-black text-foreground text-sm">Confirming your membership…</p>
              <p className="text-muted-foreground text-xs mt-0.5">This usually takes just a moment.</p>
            </div>
          </motion.div>
        )}
        {paymentSuccess && isSubscribed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-2xl px-5 py-4 mb-6">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-black text-foreground text-sm">Welcome to Made Kids!</p>
              <p className="text-muted-foreground text-xs mt-0.5">Your membership is now active. Your child's first MK Box is ready below.</p>
            </div>
          </motion.div>
        )}

        {/* Subscription banner — hide when post-payment confirmation is running */}
        {!isSubscribed && !paymentSuccess && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="font-black text-foreground text-sm">Your membership hasn't started yet</p>
              <p className="text-muted-foreground text-xs mt-0.5">Subscribe to unlock the MK Box, voice recordings, and points tracking for your child.</p>
            </div>
            <Link href="/subscribe">
              <button className="bg-primary text-white text-sm font-black px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shrink-0">
                Start Membership
              </button>
            </Link>
          </motion.div>
        )}

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-black text-foreground">Good {getTimeOfDay()}, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-1">{allDone ? "All modules done today! You're incredible." : "Your child's MK Box is ready for today."}</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Points", value: progressLoading ? "—" : (progress?.totalPoints ?? 0), accent: true },
            { label: "Current Streak", value: progressLoading ? "—" : `${streak?.currentStreak ?? 0} days`, accent: false },
            { label: "This Week", value: progressLoading ? "—" : (progress?.pointsThisWeek ?? 0), accent: false },
            { label: "This Quarter", value: progressLoading ? "—" : (progress?.pointsThisQuarter ?? 0), accent: false },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-5 ${stat.accent ? "bg-primary text-white" : "bg-card border border-card-border"}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${stat.accent ? "text-white/70" : "text-muted-foreground"}`}>{stat.label}</p>
              <p className={`text-3xl font-black ${stat.accent ? "text-white" : "text-foreground"}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Today's MK Box */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Content card */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-secondary rounded-3xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
              <span className="text-white/60 text-sm font-semibold uppercase tracking-widest">Today's MK Box</span>
            </div>
            {todayContent ? (
              <>
                <h2 className="text-2xl font-black mb-2">{todayContent.title}</h2>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-sm mb-4">
                  <span>{todayContent.theme}</span>
                </div>
                <p className="text-white/60 text-sm mb-6 leading-relaxed">{todayContent.description}</p>
                <Link href="/mk-box">
                  <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105">
                    Open MK Box
                  </button>
                </Link>
              </>
            ) : (
              <div className="animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-3 w-3/4" />
                <div className="h-4 bg-white/10 rounded mb-2 w-1/2" />
                <div className="h-10 bg-white/10 rounded w-32 mt-4" />
              </div>
            )}
          </motion.div>

          {/* Modules progress */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-card border border-card-border rounded-3xl p-6">
            <h2 className="font-black text-foreground text-lg mb-5">Today's Modules</h2>
            <div className="space-y-3">
              {modules.map((mod) => {
                const done = completedToday.includes(mod);
                return (
                  <Link key={mod} href={moduleLinks[mod]}>
                    <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] ${done ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/40"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${done ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        {done ? "✓" : moduleIcons[mod]}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${done ? "text-primary" : "text-foreground"}`}>{moduleLabels[mod]}</p>
                        <p className="text-xs text-muted-foreground">{done ? "Completed" : "Tap to begin"}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${done ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>+10 pts</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {allDone && (
              <div className="mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-primary font-black">All done for today! +30 points earned!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Notes from parent — accordion */}
        {notes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✉️</span>
              <h2 className="font-black text-foreground text-lg">Notes from Your Parent</h2>
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{notes.length}</span>
            </div>
            <div className="space-y-2">
              {notes.map((note, i) => {
                const isOpen = openNoteId === note.id;
                const dateStr = new Date(note.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                const preview = note.content.length > 60 ? note.content.slice(0, 60) + "…" : note.content;
                return (
                  <motion.div key={note.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-card border border-card-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setOpenNoteId(isOpen ? null : note.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-base flex-shrink-0">✉️</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-semibold truncate">{isOpen ? note.content.split(" ").slice(0, 6).join(" ") + "…" : preview}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{dateStr}</p>
                      </div>
                      <span className={`text-primary text-xs font-bold transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 border-t border-card-border">
                            <p className="text-foreground text-sm leading-relaxed">{note.content}</p>
                            <p className="text-muted-foreground text-xs mt-3">From {note.parentName} · {new Date(note.createdAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Event Gallery card */}
        <Link href="/gallery">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mb-4 bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">📸</div>
              <div>
                <p className="font-black text-foreground">Event Gallery</p>
                <p className="text-xs text-muted-foreground mt-0.5">Quarterly trips · Annual Made-Kids Convention · Top Honor Award</p>
              </div>
            </div>
            <span className="text-sm font-bold text-primary border border-primary/30 px-4 py-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shrink-0">
              View Gallery
            </span>
          </motion.div>
        </Link>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/progress", label: "View Progress", sub: "Streaks & points history", icon: "★" },
            { href: "/leaderboard", label: "Rankings", sub: "See where you stand", icon: "◆" },
            { href: "/rewards", label: "Win Trips", sub: "Disney World, Universal & more", icon: "✦" },
            { href: "/parent-zone", label: "Parent Zone", sub: "Tips, notes & recordings", icon: "🔐" },
            { href: "/reviews", label: "Reviews", sub: "See what families are saying", icon: "⭐" },
          ].map((link, i) => (
            <Link key={link.href} href={link.href}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-card border border-card-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="text-primary text-2xl mb-3 group-hover:scale-110 transition-transform">{link.icon}</div>
                <p className="font-bold text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{link.sub}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
