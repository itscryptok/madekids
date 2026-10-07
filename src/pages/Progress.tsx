import { motion } from "framer-motion";
import { useGetMyProgress, useGetStreak, useGetProgressSummary } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

export default function Progress() {
  const { data: progress, isLoading } = useGetMyProgress();
  const { data: streak } = useGetStreak();
  const { data: summary } = useGetProgressSummary();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  const completionHistory = streak?.completionHistory ?? [];
  const last30 = completionHistory.slice(0, 30).reverse();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-foreground mb-1">Progress</h1>
          <p className="text-muted-foreground mb-8">Your child's journey to becoming exceptional</p>
        </motion.div>

        {/* Big stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Points", value: progress?.totalPoints ?? 0, primary: true },
            { label: "Current Streak", value: `${streak?.currentStreak ?? 0}d`, primary: false },
            { label: "Longest Streak", value: `${streak?.longestStreak ?? 0}d`, primary: false },
            { label: "Days Active", value: progress?.daysActiveThisQuarter ?? 0, primary: false },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`rounded-2xl p-5 ${stat.primary ? "bg-primary text-white" : "bg-card border border-card-border"}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${stat.primary ? "text-white/70" : "text-muted-foreground"}`}>{stat.label}</p>
              <p className={`text-3xl font-black ${stat.primary ? "text-white" : "text-foreground"}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quarterly summary */}
        {summary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-secondary text-white rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm font-semibold">{summary.quarterLabel} Summary</p>
                <p className="text-2xl font-black">{summary.totalPoints} pts this quarter</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">Rank</p>
                <p className="text-3xl font-black text-primary">#{summary.rank}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Completion Rate</p>
                <p className="font-black text-lg">{summary.completionRate}%</p>
                <div className="h-1.5 bg-white/20 rounded-full mt-2">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${summary.completionRate}%` }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Improvement Score</p>
                <p className="font-black text-lg">{summary.improvementScore}</p>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-xs mb-1">Reward Eligible</p>
                <p className={`font-black text-lg ${summary.eligibleForReward ? "text-primary" : "text-white/40"}`}>
                  {summary.eligibleForReward ? "YES" : "Not yet"}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Activity calendar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-card border border-card-border rounded-3xl p-6 mb-6">
          <h2 className="font-black text-foreground text-lg mb-4">Activity Calendar (Last 30 Days)</h2>
          <div className="grid grid-cols-10 gap-1.5">
            {last30.map((day, i) => {
              const allDone = day.videoCompleted && day.recitationCompleted && day.challengeCompleted;
              const someDone = day.videoCompleted || day.recitationCompleted || day.challengeCompleted;
              const label = new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={i} title={`${label}: ${day.pointsEarned} pts`}
                  className={`aspect-square rounded-md ${allDone ? "bg-primary" : someDone ? "bg-primary/40" : "bg-muted"}`} />
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-muted rounded" /> None</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary/40 rounded" /> Partial</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary rounded" /> All 3 done</span>
          </div>
        </motion.div>

        {/* This week breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "This Week", value: progress?.pointsThisWeek ?? 0 },
            { label: "This Month", value: progress?.pointsThisMonth ?? 0 },
            { label: "This Quarter", value: progress?.pointsThisQuarter ?? 0 },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className="bg-card border border-card-border rounded-2xl p-5">
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-3xl font-black text-foreground">{s.value}</p>
              <p className="text-muted-foreground text-xs mt-1">points</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
