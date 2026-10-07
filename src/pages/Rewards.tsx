import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListRewards, useGetProgressSummary } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

export default function Rewards() {
  const { data: rewards, isLoading } = useListRewards();
  const { data: summary } = useGetProgressSummary();
  const [yeahActive, setYeahActive] = useState(false);

  const activeReward = rewards?.find(r => r.isActive);
  const mkcReward = rewards?.find(r => r.quarterLabel === "Annual — MKC");
  const upcomingRewards = rewards?.filter(r => !r.isActive && r.quarterLabel !== "Annual — MKC") ?? [];

  const handleChant = () => {
    setYeahActive(true);
    setTimeout(() => setYeahActive(false), 1800);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-foreground mb-1">Rewards</h1>
          <p className="text-muted-foreground mb-8">The most improved kids each quarter win a real cash reward. Once our community reaches 5,000 active families, the prize upgrades to fully funded trips to Disney World, Universal Studios and more.</p>
        </motion.div>

        {/* Eligibility status */}
        {summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className={`rounded-2xl p-5 mb-8 ${summary.eligibleForReward ? "bg-primary" : "bg-card border border-card-border"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold ${summary.eligibleForReward ? "text-white/70" : "text-muted-foreground"}`}>Your reward eligibility</p>
                <p className={`text-2xl font-black ${summary.eligibleForReward ? "text-white" : "text-foreground"}`}>
                  {summary.eligibleForReward ? "Eligible for a trip!" : "Keep going!"}
                </p>
                {!summary.eligibleForReward && (
                  <p className="text-muted-foreground text-sm mt-1">Your improvement score: {summary.improvementScore} / 70 needed</p>
                )}
                {!summary.eligibleForReward && (
                  <p className="text-muted-foreground text-xs mt-1 opacity-70">Score is based on consistency — daily completions, streaks, and participation across the quarter.</p>
                )}
              </div>
              <div className={`text-5xl ${summary.eligibleForReward ? "" : "opacity-30"}`}>
                {summary.eligibleForReward ? "✦" : "◆"}
              </div>
            </div>
          </motion.div>
        )}

        {/* Active quarterly reward */}
        {isLoading ? (
          <div className="h-64 bg-muted rounded-3xl animate-pulse mb-6" />
        ) : activeReward ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-secondary rounded-3xl overflow-hidden mb-8 shadow-xl">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> {activeReward.quarterLabel} — Active Now
                  </span>
                  <h2 className="text-3xl font-black text-white">{activeReward.title}</h2>
                  <p className="text-white/60 mt-1">{activeReward.destination}</p>
                </div>
                <div className="text-6xl">🏰</div>
              </div>
              <p className="text-white/70 leading-relaxed mb-6">{activeReward.description}</p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Winners selected</p>
                    <p className="text-white font-black text-xl">{activeReward.winnersCount} kids</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Quarter ends</p>
                    <p className="text-white font-black text-xl">June 30</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest">Reward</p>
                    <p className="text-white font-black text-sm">Fully funded trip or cash</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* ✦ MKC Convention — special annual reward */}
        {mkcReward && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl"
            style={{ background: "linear-gradient(135deg, hsl(226 71% 14%), hsl(226 71% 22%))" }}>

            {/* Background glow */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, hsl(32 95% 53%), transparent 55%)" }} />

            <div className="relative z-10 p-8">
              {/* Badge */}
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  ✦ Annual — Top Honour
                </span>
                <span className="text-white/40 text-xs font-semibold">Yearly Event</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                <div className="flex-1">
                  <h2 className="text-4xl font-black text-white leading-tight mb-1">Made-Kids Convention</h2>
                  <p className="text-primary font-black text-xl tracking-widest mb-4">MKC</p>
                  <p className="text-white/70 leading-relaxed">{mkcReward.description}</p>
                </div>
                <div className="text-7xl shrink-0 self-center md:self-start">🏟️</div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
                <div className="text-center">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Spots</p>
                  <p className="text-white font-black text-2xl">{mkcReward.winnersCount}</p>
                  <p className="text-white/40 text-xs">top performers</p>
                </div>
                <div className="text-center border-x border-white/10">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Frequency</p>
                  <p className="text-white font-black text-2xl">1×</p>
                  <p className="text-white/40 text-xs">per year</p>
                </div>
                <div className="text-center">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Includes</p>
                  <p className="text-white font-black text-sm leading-tight">Travel +<br/>Access</p>
                </div>
              </div>

              {/* ✦ Call & Response Chant */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">The MKC Chant — Tap to call it</p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <motion.button
                    onClick={handleChant}
                    whileTap={{ scale: 0.93 }}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-xl tracking-wide shadow-xl transition-colors select-none"
                  >
                    Beyond Intellect
                  </motion.button>

                  <span className="text-white/30 font-black text-2xl">→</span>

                  <AnimatePresence mode="wait">
                    {yeahActive ? (
                      <motion.div
                        key="yeah"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        exit={{ scale: 1.3, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 18 }}
                        className="bg-white text-secondary px-8 py-4 rounded-2xl font-black text-2xl shadow-2xl select-none"
                      >
                        YEAH! 🙌
                      </motion.div>
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-2 border-dashed border-white/20 text-white/30 px-8 py-4 rounded-2xl font-black text-xl select-none"
                      >
                        Yeah
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-white/30 text-xs mt-4">Every MKC kicks off with the call. Learn it now.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* How to win */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="bg-card border border-card-border rounded-3xl p-6 mb-8">
          <h2 className="font-black text-foreground text-xl mb-5">How to Win</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Show up every day", desc: "Log in and complete all 3 modules: Watch, Recite, and Challenge." },
              { step: "02", title: "Build your streak", desc: "Consecutive days of full completion boost your improvement score." },
              { step: "03", title: "Earn points", desc: "Each completed module earns 10 points. All 3 daily = 30 points." },
              { step: "04", title: "Be selected", desc: "Each quarter, we select the 3 most improved kids and arrange their trip. The very best earn a spot at MKC." },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="text-primary font-black text-lg w-8 shrink-0">{s.step}</span>
                <div>
                  <p className="font-bold text-foreground">{s.title}</p>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming quarterly trips */}
        {upcomingRewards.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <h2 className="font-black text-foreground text-xl mb-4">Upcoming Trips</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingRewards.map((reward) => (
                <div key={reward.id} className="bg-card border border-card-border rounded-2xl p-5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">{reward.quarterLabel}</p>
                  <h3 className="font-black text-foreground text-lg">{reward.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{reward.destination}</p>
                  <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{reward.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
