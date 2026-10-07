import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}${path}`;

type CoachData = {
  coach: {
    id: number; displayName: string; slug: string; referralCode: string;
    bio: string | null; approved: boolean; balanceCents: number; stripeAccountId: string | null;
    contactEmail: string | null; instagramHandle: string | null; whatsappNumber: string | null; website: string | null;
  };
  proteges: Array<{ id: number; name: string; age: number; totalPoints: number; currentStreak: number }>;
  insights: Array<{ id: number; date: string; title: string; videoUrl: string; recitationPrompt: string; challengeDescription: string }>;
  earnings: Array<{ id: number; amountCents: number; source: string; createdAt: string }>;
  withdrawals: Array<{ id: number; amountCents: number; status: string; requestedAt: string }>;
  totalEarnings: number;
};

type ConnectStatus = {
  connected: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountId?: string;
};

export default function CoachDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [data, setData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "insights" | "earnings">("overview");
  const [msg, setMsg] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);

  const [insightForm, setInsightForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "", videoUrl: "", recitationPrompt: "", challengeDescription: "",
  });

  const [contactForm, setContactForm] = useState({ contactEmail: "", instagramHandle: "", whatsappNumber: "", website: "" });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactMsg, setContactMsg] = useState("");

  const token = localStorage.getItem("mk_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) return;
    fetch(api("/api/coaches/me"), { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.coach) { navigate("/coach/register"); return; }
        if (d.coach.slug !== slug) { navigate(`/coach/${d.coach.slug}`); return; }
        setData(d);
        setLoading(false);
        setContactForm({
          contactEmail: d.coach.contactEmail || "",
          instagramHandle: d.coach.instagramHandle || "",
          whatsappNumber: d.coach.whatsappNumber || "",
          website: d.coach.website || "",
        });
        // Check Stripe Connect status
        fetch(api("/api/coaches/connect/status"), { headers })
          .then(r => r.json())
          .then(s => setConnectStatus(s))
          .catch(() => {});
      })
      .catch(() => {
        setError("Failed to load coach data.");
        setLoading(false);
      });
  }, [user, slug]);

  // Handle Stripe Connect return
  useEffect(() => {
    const params = new URLSearchParams(search);
    const connectResult = params.get("connect");
    if (connectResult === "success") {
      setMsg("Bank account connected! Checking status…");
      fetch(api("/api/coaches/connect/status"), { headers })
        .then(r => r.json())
        .then(s => {
          setConnectStatus(s);
          setMsg(s.payoutsEnabled ? "Bank account connected and ready!" : "Account linked. Stripe may still need to verify your details.");
          setTimeout(() => setMsg(""), 5000);
        });
      navigate(`/coach/${slug}`, { replace: true });
    } else if (connectResult === "refresh") {
      setMsg("Onboarding session expired. Please try connecting again.");
      setTimeout(() => setMsg(""), 5000);
      navigate(`/coach/${slug}`, { replace: true });
    }
  }, [search]);

  async function submitInsight(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch(api("/api/coaches/insights"), {
      method: "POST", headers, body: JSON.stringify(insightForm),
    });
    const d = await r.json();
    if (r.ok) {
      setMsg(d.updated ? "Insight updated!" : "Insight published!");
      setData(prev => prev ? {
        ...prev,
        insights: d.updated
          ? prev.insights.map(i => i.id === d.id ? d : i)
          : [d, ...prev.insights]
      } : prev);
      setInsightForm(f => ({ ...f, title: "", videoUrl: "", recitationPrompt: "", challengeDescription: "" }));
      setTimeout(() => setMsg(""), 2000);
    }
  }

  async function deleteInsight(id: number) {
    await fetch(api(`/api/coaches/insights/${id}`), { method: "DELETE", headers });
    setData(prev => prev ? { ...prev, insights: prev.insights.filter(i => i.id !== id) } : prev);
  }

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    const dollars = parseFloat(withdrawAmount);
    if (isNaN(dollars) || dollars <= 0) { setMsg("Please enter a valid amount."); return; }
    const amountCents = Math.round(dollars * 100);
    if (amountCents > data.coach.balanceCents) { setMsg("Amount exceeds your available balance."); return; }
    setWithdrawing(true);
    const r = await fetch(api("/api/coaches/withdraw"), {
      method: "POST", headers, body: JSON.stringify({ amountCents }),
    });
    const d = await r.json();
    if (r.ok) {
      setMsg(d.message);
      setData(prev => prev ? {
        ...prev,
        coach: { ...prev.coach, balanceCents: prev.coach.balanceCents - amountCents },
        withdrawals: [d.withdrawal, ...prev.withdrawals],
      } : prev);
      setWithdrawAmount("");
      setShowWithdrawForm(false);
    } else {
      setMsg(d.message || "Withdrawal failed.");
    }
    setWithdrawing(false);
    setTimeout(() => setMsg(""), 5000);
  }

  async function startConnectOnboarding() {
    setConnectLoading(true);
    try {
      const r = await fetch(api("/api/coaches/connect/onboard"), { method: "POST", headers });
      const d = await r.json();
      if (r.ok && d.url) {
        window.location.href = d.url;
      } else {
        setMsg(d.error || "Failed to start bank setup.");
        setTimeout(() => setMsg(""), 4000);
      }
    } catch {
      setMsg("Failed to start bank setup.");
      setTimeout(() => setMsg(""), 4000);
    }
    setConnectLoading(false);
  }

  const referralLink = data ? `${window.location.origin}${BASE}/register?ref=${data.coach.referralCode}` : "";

  async function saveContactInfo(e: React.FormEvent) {
    e.preventDefault();
    setContactSaving(true);
    setContactMsg("");
    try {
      const res = await fetch(api("/api/coaches/me/profile"), {
        method: "PATCH",
        headers,
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactMsg("Contact info saved!");
        setTimeout(() => setContactMsg(""), 3000);
      } else {
        setContactMsg("Failed to save. Please try again.");
      }
    } catch {
      setContactMsg("Network error. Please try again.");
    }
    setContactSaving(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setMsg("Referral link copied!");
    setTimeout(() => setMsg(""), 2000);
  }

  if (!user) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <p className="text-white">Please <Link href="/login"><span className="text-primary underline">sign in</span></Link> to view your coach dashboard.</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-destructive">{error || "Coach profile not found."}</p>
    </div>
  );

  const { coach, proteges, insights, earnings, withdrawals, totalEarnings } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer">
                <span className="text-white font-black text-sm">MK</span>
              </div>
            </Link>
            <span className="text-white font-black">{coach.displayName}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${coach.approved ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
              {coach.approved ? "Coach ✓" : "Pending Approval"}
            </span>
          </div>
          <Link href="/dashboard"><span className="text-white/60 hover:text-white text-sm cursor-pointer">← Family View</span></Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {msg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-green-500/10 border border-green-500/20 text-green-600 text-sm rounded-xl p-3">
            {msg}
          </motion.div>
        )}

        {!coach.approved && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-amber-600 font-bold text-sm">⏳ Your coach account is pending admin approval</p>
            <p className="text-amber-600/70 text-xs mt-1">You can share your referral link now. Uploading insights will be enabled once approved.</p>
          </div>
        )}

        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-white/80 text-xs font-semibold mb-1">ℹ️ Quarterly Award</p>
          <p className="text-white/50 text-xs leading-relaxed">
            Quarterly winners currently receive a cash reward. Once the Made Kids community reaches 5,000 active families, the prize expands to fully funded trips to destinations like Disney World and Universal Studios. Every family your proteges bring in moves us closer to that milestone.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-xs font-semibold">Proteges</p>
            <p className="text-3xl font-black text-foreground">{proteges.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-xs font-semibold">Insights Published</p>
            <p className="text-3xl font-black text-foreground">{insights.length}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-muted-foreground text-xs font-semibold">Total Earned</p>
            <p className="text-3xl font-black text-green-600">${(totalEarnings / 100).toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <p className="text-muted-foreground text-xs font-semibold">Available Balance</p>
              <p className="text-3xl font-black text-primary">${(coach.balanceCents / 100).toFixed(2)}</p>
            </div>
            {coach.balanceCents > 0 && connectStatus?.payoutsEnabled && (
              <button onClick={() => setShowWithdrawForm(v => !v)}
                className="mt-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                {showWithdrawForm ? "Cancel" : "Withdraw"}
              </button>
            )}
            {coach.balanceCents > 0 && !connectStatus?.payoutsEnabled && (
              <p className="text-xs text-amber-500 mt-2 font-semibold">Connect bank to withdraw</p>
            )}
          </div>
        </div>

        {/* Bank Account / Stripe Connect */}
        <div className={`mb-6 border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
          connectStatus?.payoutsEnabled
            ? "bg-green-500/5 border-green-500/20"
            : connectStatus?.detailsSubmitted
            ? "bg-amber-500/5 border-amber-500/20"
            : "bg-card border-border"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
              connectStatus?.payoutsEnabled ? "bg-green-500/20" :
              connectStatus?.detailsSubmitted ? "bg-amber-500/20" : "bg-muted"
            }`}>
              {connectStatus?.payoutsEnabled ? "✅" : connectStatus?.detailsSubmitted ? "⏳" : "🏦"}
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {connectStatus?.payoutsEnabled
                  ? "Bank account connected"
                  : connectStatus?.detailsSubmitted
                  ? "Verification in progress"
                  : "Connect your bank account"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {connectStatus?.payoutsEnabled
                  ? "Withdrawals go directly to your bank via Stripe."
                  : connectStatus?.detailsSubmitted
                  ? "Stripe is reviewing your details. Payouts will enable shortly."
                  : "Link your bank through Stripe to receive automatic payouts when you withdraw."}
              </p>
            </div>
          </div>
          {!connectStatus?.payoutsEnabled && (
            <button
              onClick={startConnectOnboarding}
              disabled={connectLoading}
              className="shrink-0 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {connectLoading ? "Redirecting…" : connectStatus?.detailsSubmitted ? "Continue Setup" : "Set Up Payouts"}
            </button>
          )}
        </div>

        {showWithdrawForm && connectStatus?.payoutsEnabled && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-foreground mb-1">Withdraw to Bank</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Available: <span className="text-primary font-bold">${(coach.balanceCents / 100).toFixed(2)}</span>. Funds are sent instantly to your connected bank.
            </p>
            <form onSubmit={requestWithdrawal} className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-muted-foreground">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
                  <input
                    type="number" min="0.01" step="0.01"
                    max={(coach.balanceCents / 100).toFixed(2)}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder={`0.00 – ${(coach.balanceCents / 100).toFixed(2)}`}
                    required
                    className="w-full bg-muted border border-border rounded-xl pl-7 pr-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <button
                onClick={() => setWithdrawAmount((coach.balanceCents / 100).toFixed(2))}
                type="button"
                className="text-xs text-primary font-bold border border-primary/30 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors whitespace-nowrap">
                Max
              </button>
              <button type="submit" disabled={withdrawing}
                className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap">
                {withdrawing ? "Sending…" : "Send to Bank"}
              </button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">Funds are transferred via Stripe and typically arrive in 1–2 business days.</p>
          </motion.div>
        )}

        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <p className="font-bold text-foreground mb-2">Your Referral Link</p>
          <div className="flex gap-2">
            <input readOnly value={referralLink}
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono" />
            <button onClick={copyLink} className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">Copy</button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Share this link directly with parents you've agreed to mentor. They'll use it to create their account.</p>
        </div>

        {/* Contact Info */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <p className="font-bold text-foreground mb-1">Your Contact Info</p>
          <p className="text-xs text-muted-foreground mb-4">Parents browse your public profile and use these to reach you before you share your referral link.</p>
          <form onSubmit={saveContactInfo} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                <input type="email" value={contactForm.contactEmail} onChange={e => setContactForm(f => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="coach@example.com"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Instagram</label>
                <input type="text" value={contactForm.instagramHandle} onChange={e => setContactForm(f => ({ ...f, instagramHandle: e.target.value }))}
                  placeholder="@yourhandle"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">WhatsApp Number</label>
                <input type="text" value={contactForm.whatsappNumber} onChange={e => setContactForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                  placeholder="+1234567890 (with country code)"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Website</label>
                <input type="text" value={contactForm.website} onChange={e => setContactForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="yourwebsite.com"
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={contactSaving}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                {contactSaving ? "Saving…" : "Save Contact Info"}
              </button>
              {contactMsg && <span className={`text-sm font-semibold ${contactMsg.includes("saved") ? "text-green-500" : "text-destructive"}`}>{contactMsg}</span>}
            </div>
          </form>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border pb-4">
          {[["overview", "Proteges"], ["insights", "Daily Insights"], ["earnings", "Earnings"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div>
            <h2 className="font-bold text-foreground mb-4">Your Proteges ({proteges.length})</h2>
            {proteges.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground">
                <p className="text-4xl mb-3">🌱</p>
                <p className="font-bold">No proteges yet</p>
                <p className="text-sm mt-1">Share your referral link with parents to get started.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {proteges.map(p => (
                  <div key={p.id} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-black">{p.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Age {p.age} · {p.totalPoints} pts · {p.currentStreak} day streak</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "insights" && (
          <div>
            {coach.approved && (
              <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-foreground mb-4">Upload Daily Insight for Proteges</h3>
                <form onSubmit={submitInsight} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Date</label>
                      <input type="date" value={insightForm.date} onChange={e => setInsightForm(f => ({ ...f, date: e.target.value }))} required className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-muted-foreground">Title</label>
                      <input type="text" value={insightForm.title} onChange={e => setInsightForm(f => ({ ...f, title: e.target.value }))} required placeholder="Today's insight topic" className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Video URL</label>
                    <input type="url" value={insightForm.videoUrl} onChange={e => setInsightForm(f => ({ ...f, videoUrl: e.target.value }))} required placeholder="YouTube embed or direct video URL" className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Recitation Prompt</label>
                    <textarea value={insightForm.recitationPrompt} onChange={e => setInsightForm(f => ({ ...f, recitationPrompt: e.target.value }))} required rows={2} placeholder="What should the child recite after watching?" className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-muted-foreground">Challenge Description</label>
                    <textarea value={insightForm.challengeDescription} onChange={e => setInsightForm(f => ({ ...f, challengeDescription: e.target.value }))} required rows={2} placeholder="What's today's challenge for your proteges?" className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                  </div>
                  <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                    Publish Insight
                  </button>
                </form>
              </div>
            )}

            <h3 className="font-bold text-foreground mb-3">Published Insights ({insights.length})</h3>
            <div className="space-y-3">
              {insights.map(ins => (
                <div key={ins.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm text-foreground">{ins.date} — {ins.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ins.recitationPrompt}</p>
                  </div>
                  <button onClick={() => deleteInsight(ins.id)} className="text-destructive text-xs border border-destructive/20 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors ml-4 shrink-0">Delete</button>
                </div>
              ))}
              {insights.length === 0 && (
                <div className="bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                  <p className="text-4xl mb-3">💡</p>
                  <p className="font-bold text-foreground mb-1">No insights published yet</p>
                  <p className="text-sm text-muted-foreground">Use the form above to upload today's insight. Your proteges will see it instead of the default Made Kids content. Publish one insight per day — each entry replaces the previous one for that date.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "earnings" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-foreground mb-3">Earnings History</h3>
              <div className="space-y-2">
                {earnings.map(e => (
                  <div key={e.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize">{e.source}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-green-600 font-bold">+${(e.amountCents / 100).toFixed(2)}</span>
                  </div>
                ))}
                {earnings.length === 0 && <p className="text-muted-foreground text-sm">No earnings yet. Share your referral link to start earning!</p>}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3">Withdrawal History</h3>
              <div className="space-y-2">
                {withdrawals.map(w => (
                  <div key={w.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">${(w.amountCents / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      w.status === "completed" ? "bg-green-500/10 text-green-600" :
                      w.status === "failed" ? "bg-red-500/10 text-red-600" :
                      "bg-amber-500/10 text-amber-600"
                    }`}>{w.status}</span>
                  </div>
                ))}
                {withdrawals.length === 0 && <p className="text-muted-foreground text-sm">No withdrawals yet.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
