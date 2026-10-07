import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Recording = {
  id: number;
  type: "recitation" | "challenge";
  durationSeconds: number;
  audioUrl: string | null;
  approvedByParent: boolean | null;
  approvedAt: string | null;
  submittedAt: string;
};

type ParentNote = {
  id: number;
  content: string;
  createdAt: string;
};

const BEST_PRACTICE_TIPS = [
  {
    icon: "🎯",
    title: "Watch Together First",
    body: "Sit with your child for the first few minutes of each MK Box video. Asking \"What do you think this is about?\" before it starts primes their brain for active learning.",
  },
  {
    icon: "🗣️",
    title: "Celebrate the Voice, Not Perfection",
    body: "When reviewing recitations, praise effort and confidence over perfect recall. Say \"I love how you said that part!\" rather than correcting every word.",
  },
  {
    icon: "📅",
    title: "Same Time, Every Day",
    body: "Consistency beats intensity. Pick a 15-minute window (e.g. after school or before dinner) and protect it. Streaks are built by routine, not willpower.",
  },
  {
    icon: "🏆",
    title: "Connect Challenges to Real Life",
    body: "After your child records their challenge reflection, ask one follow-up question: \"How could you use that this week?\" One question doubles retention.",
  },
  {
    icon: "🔒",
    title: "Keep Your PIN Private",
    body: "Your 4-digit PIN is your family's safeguard. Never share it with your child so they know this is a trusted space where you can review their progress honestly.",
  },
  {
    icon: "🌟",
    title: "Approve Promptly",
    body: "Try to review and approve your child's recordings within 24 hours. Timely approval reinforces the habit loop — they feel seen, which drives them to record again tomorrow.",
  },
  {
    icon: "💬",
    title: "Talk About the Leaderboard Together",
    body: "Check the rankings together occasionally. Frame it as \"look how many kids are building themselves\" rather than pure competition — this builds a growth mindset.",
  },
  {
    icon: "✈️",
    title: "Make the Reward Real",
    body: "Put a picture of Disney World, Universal Studios, or a fun destination in your country somewhere your child sees every day. Tangible reminders of the goal keep motivation alive between streaks.",
  },
];

export default function ParentZone() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [activeTab, setActiveTab] = useState<"tips" | "approve" | "notes" | "reviews">("tips");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [approveError, setApproveError] = useState("");
  const [notes, setNotes] = useState<ParentNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  type CoachOption = { id: number; displayName: string; slug: string };
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [coachSearch, setCoachSearch] = useState("");
  const [reviewTarget, setReviewTarget] = useState<"platform" | string>("platform");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const token = localStorage.getItem("mk_token");

  const handleVerifyPin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      setPinError("Enter your 4-digit PIN.");
      return;
    }
    setIsVerifying(true);
    setPinError("");
    try {
      const res = await fetch(`${BASE}/api/auth/verify-pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPinError(data.message || "Incorrect PIN. Try again.");
        setPin("");
      } else {
        setUnlocked(true);
        loadRecordings();
        loadNotes();
        loadCoaches();
      }
    } catch {
      setPinError("Could not verify PIN. Check your connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  const loadRecordings = async () => {
    setLoadingRecordings(true);
    try {
      const res = await fetch(`${BASE}/api/recordings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } finally {
      setLoadingRecordings(false);
    }
  };

  const loadNotes = async () => {
    setLoadingNotes(true);
    try {
      const res = await fetch(`${BASE}/api/parent-notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes(await res.json());
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadCoaches = async () => {
    try {
      const res = await fetch(`${BASE}/api/coaches/public-list`);
      if (res.ok) setCoaches(await res.json());
    } catch {}
  };

  const submitReview = async () => {
    setReviewError("");
    if (!reviewRating) { setReviewError("Please select a star rating."); return; }
    if (!reviewComment.trim()) { setReviewError("Please write a comment."); return; }
    setSubmittingReview(true);
    try {
      const body: Record<string, unknown> = {
        rating: reviewRating,
        comment: reviewComment,
        targetType: reviewTarget === "platform" ? "platform" : "coach",
      };
      if (reviewTarget !== "platform") body.coachId = reviewTarget;
      const res = await fetch(`${BASE}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setReviewRating(0);
        setReviewComment("");
        setReviewTarget("platform");
        setCoachSearch("");
      } else {
        const d = await res.json();
        setReviewError(d.message || "Couldn't submit review. Please try again.");
      }
    } catch {
      setReviewError("Couldn't submit review. Check your connection.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`${BASE}/api/parent-notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: noteText }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes(prev => [note, ...prev]);
        setNoteText("");
      }
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async (id: number) => {
    setDeletingNoteId(id);
    try {
      const res = await fetch(`${BASE}/api/parent-notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes(prev => prev.filter(n => n.id !== id));
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    setApprovingId(id);
    setApproveError("");
    try {
      const res = await fetch(`${BASE}/api/recordings/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        setRecordings(prev =>
          prev.map(r =>
            r.id === id
              ? { ...r, approvedByParent: approved, approvedAt: approved ? new Date().toISOString() : null }
              : r
          )
        );
      } else {
        setApproveError("Couldn't save your decision. Please try again.");
      }
    } catch {
      setApproveError("Couldn't save your decision. Check your connection.");
    } finally {
      setApprovingId(null);
    }
  };

  const pendingRecordings = recordings.filter(r => r.approvedByParent === null || r.approvedByParent === undefined);
  const reviewedRecordings = recordings.filter(r => r.approvedByParent !== null && r.approvedByParent !== undefined);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔐</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">Parent Zone</h1>
              <p className="text-muted-foreground text-sm">Private area — only for parents</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!unlocked ? (
            <motion.div
              key="pin-gate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-sm mx-auto"
            >
              <div className="bg-card border border-card-border rounded-3xl p-8 text-center shadow-xl">
                <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔐</span>
                </div>
                <h2 className="text-2xl font-black text-foreground mb-2">Enter Parent PIN</h2>
                <p className="text-muted-foreground text-sm mb-8">
                  This area is protected. Enter the 4-digit PIN you set when signing up.
                </p>

                {/* PIN dots */}
                <div className="flex justify-center gap-3 mb-6">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        pin.length > i
                          ? "bg-primary border-primary"
                          : "border-border bg-muted"
                      }`}
                    />
                  ))}
                </div>

                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setPin(v);
                    setPinError("");
                    if (v.length === 4) {
                      setTimeout(() => {
                        const el = document.getElementById("pin-submit");
                        el?.focus();
                      }, 50);
                    }
                  }}
                  onKeyDown={e => { if (e.key === "Enter") handleVerifyPin(); }}
                  placeholder="••••"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-4 text-foreground text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                  autoFocus
                />

                {pinError && (
                  <p className="text-destructive text-sm mb-4 font-medium">{pinError}</p>
                )}

                <button
                  id="pin-submit"
                  onClick={handleVerifyPin}
                  disabled={isVerifying || pin.length < 4}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Unlock Parent Zone"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Tabs */}
              <div className="flex gap-2 mb-8 bg-muted rounded-2xl p-1.5">
                <button
                  onClick={() => setActiveTab("tips")}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "tips"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  💡 Tips
                </button>
                <button
                  onClick={() => setActiveTab("approve")}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all relative ${
                    activeTab === "approve"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ✅ Approve
                  {pendingRecordings.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-black rounded-full flex items-center justify-center">
                      {pendingRecordings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all relative ${
                    activeTab === "notes"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ✉️ Notes
                  {notes.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary/70 text-white text-xs font-black rounded-full flex items-center justify-center">
                      {notes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "reviews"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⭐ Reviews
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "notes" ? (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Compose */}
                    <div className="bg-card border border-card-border rounded-3xl p-6 mb-6 shadow-sm">
                      <h2 className="font-black text-foreground text-lg mb-1">Write a Note to Your Child</h2>
                      <p className="text-muted-foreground text-sm mb-4">Your child will see this in their account. Use it to encourage, challenge, or celebrate them.</p>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="e.g. I'm so proud of you for completing all three modules today! Keep it up ❤️"
                        rows={4}
                        className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                      />
                      <button
                        onClick={saveNote}
                        disabled={savingNote || !noteText.trim()}
                        className="bg-primary hover:bg-primary/90 text-white font-black px-6 py-3 rounded-2xl transition-all disabled:opacity-50"
                      >
                        {savingNote ? "Sending..." : "Send Note"}
                      </button>
                    </div>

                    {/* Notes list */}
                    {loadingNotes ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Loading notes...</p>
                      </div>
                    ) : notes.length === 0 ? (
                      <div className="text-center py-12 bg-card border border-card-border rounded-3xl">
                        <div className="text-5xl mb-4">✉️</div>
                        <h3 className="text-lg font-black text-foreground mb-1">No notes yet</h3>
                        <p className="text-muted-foreground text-sm">Write your first note above to encourage your child.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((note, i) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="bg-card border border-card-border rounded-2xl p-5 flex items-start gap-4"
                          >
                            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">✉️</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground text-sm leading-relaxed">{note.content}</p>
                              <p className="text-muted-foreground text-xs mt-2">
                                {new Date(note.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                                {" · "}
                                {new Date(note.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                              </p>
                            </div>
                            <button
                              onClick={() => deleteNote(note.id)}
                              disabled={deletingNoteId === note.id}
                              className="text-muted-foreground hover:text-destructive transition-colors text-sm px-2 py-1 rounded-lg hover:bg-destructive/10 disabled:opacity-40 flex-shrink-0"
                              title="Delete note"
                            >
                              {deletingNoteId === note.id ? "..." : "✕"}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : activeTab === "tips" ? (
                  <motion.div
                    key="tips"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    {BEST_PRACTICE_TIPS.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
                      >
                        <div className="text-3xl mb-3">{tip.icon}</div>
                        <h3 className="font-black text-foreground mb-2">{tip.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{tip.body}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : activeTab === "reviews" ? (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {reviewSubmitted ? (
                      <div className="bg-card border border-card-border rounded-3xl p-8 text-center shadow-sm mb-6">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-xl font-black text-foreground mb-2">Thank you for your review!</h3>
                        <p className="text-muted-foreground text-sm mb-6">Your feedback helps other families discover Made Kids.</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                          <button
                            onClick={() => setReviewSubmitted(false)}
                            className="bg-primary text-white font-black px-6 py-3 rounded-2xl hover:bg-primary/90 transition-colors"
                          >
                            Write Another Review
                          </button>
                          <Link href="/reviews">
                            <button className="bg-muted text-foreground font-bold px-6 py-3 rounded-2xl hover:bg-muted/80 transition-colors border border-border">
                              View All Reviews
                            </button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
                          <div>
                            <h2 className="font-black text-foreground text-lg mb-1">Leave a Review</h2>
                            <p className="text-muted-foreground text-sm">Share your experience with the community.</p>
                          </div>
                          <Link href="/reviews">
                            <button className="text-primary font-bold text-sm hover:underline shrink-0">View all reviews →</button>
                          </Link>
                        </div>

                        {/* Who are you reviewing? */}
                        <div className="mb-5">
                          <label className="block text-sm font-bold text-foreground mb-2">Who are you reviewing?</label>
                          <div className="space-y-2">
                            <button
                              onClick={() => { setReviewTarget("platform"); setCoachSearch(""); }}
                              className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                                reviewTarget === "platform"
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border bg-muted text-muted-foreground hover:border-primary/40"
                              }`}
                            >
                              🌐 The Made Kids Platform
                            </button>
                            {coaches.length > 0 && (
                              <div>
                                <input
                                  type="text"
                                  value={coachSearch}
                                  onChange={e => setCoachSearch(e.target.value)}
                                  placeholder="Search for your coach..."
                                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                                />
                                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                  {coaches
                                    .filter(c => c.displayName.toLowerCase().includes(coachSearch.toLowerCase()))
                                    .map(c => (
                                      <button
                                        key={c.id}
                                        onClick={() => setReviewTarget(String(c.id))}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                                          reviewTarget === String(c.id)
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-border bg-muted text-foreground hover:border-primary/40"
                                        }`}
                                      >
                                        👤 Coach {c.displayName}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Star rating */}
                        <div className="mb-5">
                          <label className="block text-sm font-bold text-foreground mb-2">Your rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                              <button
                                key={s}
                                onClick={() => setReviewRating(s)}
                                onMouseEnter={() => setReviewHover(s)}
                                onMouseLeave={() => setReviewHover(0)}
                                className={`text-3xl transition-transform hover:scale-110 ${
                                  s <= (reviewHover || reviewRating) ? "text-amber-400" : "text-muted"
                                }`}
                              >
                                ★
                              </button>
                            ))}
                            {reviewRating > 0 && (
                              <span className="text-sm text-muted-foreground self-center ml-1">
                                {["", "Poor", "Fair", "Good", "Great", "Excellent"][reviewRating]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-5">
                          <label className="block text-sm font-bold text-foreground mb-2">Your review</label>
                          <textarea
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            placeholder="Tell other families what you love about Made Kids..."
                            rows={4}
                            className="w-full bg-muted border border-border rounded-2xl px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          />
                        </div>

                        {reviewError && (
                          <p className="text-destructive text-sm font-medium mb-4">{reviewError}</p>
                        )}

                        <button
                          onClick={submitReview}
                          disabled={submittingReview}
                          className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 text-lg"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="approve"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {approveError && (
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-4 font-medium">
                        {approveError}
                      </div>
                    )}
                    {loadingRecordings ? (
                      <div className="text-center py-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading recordings...</p>
                      </div>
                    ) : recordings.length === 0 ? (
                      <div className="text-center py-16 bg-card border border-card-border rounded-3xl">
                        <div className="text-5xl mb-4">🎙️</div>
                        <h3 className="text-xl font-black text-foreground mb-2">No recordings yet</h3>
                        <p className="text-muted-foreground text-sm">Your child's voice recordings will appear here once they complete their daily modules.</p>
                      </div>
                    ) : (
                      <>
                        {pendingRecordings.length > 0 && (
                          <div className="mb-8">
                            <h2 className="font-black text-foreground text-lg mb-4 flex items-center gap-2">
                              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                              Needs Review ({pendingRecordings.length})
                            </h2>
                            <div className="space-y-4">
                              {pendingRecordings.map((rec) => (
                                <RecordingCard
                                  key={rec.id}
                                  rec={rec}
                                  onApprove={handleApprove}
                                  isActioning={approvingId === rec.id}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        {reviewedRecordings.length > 0 && (
                          <div>
                            <h2 className="font-black text-foreground text-lg mb-4 text-muted-foreground">
                              Previously Reviewed ({reviewedRecordings.length})
                            </h2>
                            <div className="space-y-4">
                              {reviewedRecordings.map((rec) => (
                                <RecordingCard
                                  key={rec.id}
                                  rec={rec}
                                  onApprove={handleApprove}
                                  isActioning={approvingId === rec.id}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function RecordingCard({
  rec,
  onApprove,
  isActioning,
}: {
  rec: Recording;
  onApprove: (id: number, approved: boolean) => void;
  isActioning: boolean;
}) {
  const label = rec.type === "recitation" ? "Recitation" : "Challenge Reflection";
  const icon = rec.type === "recitation" ? "🗣️" : "⭐";
  const date = new Date(rec.submittedAt).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
  const time = new Date(rec.submittedAt).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit",
  });

  const isApproved = rec.approvedByParent === true;
  const isRejected = rec.approvedByParent === false;
  const isPending = rec.approvedByParent === null || rec.approvedByParent === undefined;

  return (
    <div className={`bg-card border-2 rounded-2xl p-5 transition-all ${
      isApproved ? "border-green-500/30 bg-green-500/5" :
      isRejected ? "border-destructive/30 bg-destructive/5" :
      "border-border"
    }`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <p className="font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{date} at {time} · {rec.durationSeconds}s</p>
          </div>
        </div>
        <div>
          {isApproved && (
            <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">✓ Approved</span>
          )}
          {isRejected && (
            <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-1 rounded-full">✗ Not Approved</span>
          )}
          {isPending && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">Pending</span>
          )}
        </div>
      </div>

      {rec.audioUrl ? (
        <audio
          src={rec.audioUrl}
          controls
          className="w-full rounded-xl mb-4"
        />
      ) : (
        <div className="bg-muted rounded-xl p-3 mb-4 text-center text-sm text-muted-foreground">
          Audio not available for playback
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onApprove(rec.id, true)}
          disabled={isActioning || isApproved}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
            isApproved
              ? "bg-green-500 text-white"
              : "bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white border border-green-500/30"
          }`}
        >
          {isActioning ? "..." : "✓ Approve"}
        </button>
        <button
          onClick={() => onApprove(rec.id, false)}
          disabled={isActioning || isRejected}
          className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
            isRejected
              ? "bg-destructive text-white"
              : "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/30"
          }`}
        >
          {isActioning ? "..." : "✗ Not Approved"}
        </button>
      </div>
    </div>
  );
}
