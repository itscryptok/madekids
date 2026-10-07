import { motion } from "framer-motion";
import { useGetLeaderboard } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  const top3 = leaderboard?.slice(0, 3) ?? [];
  const rest = leaderboard?.slice(3) ?? [];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-foreground mb-1">Rankings</h1>
          <p className="text-muted-foreground mb-8">The most improved kids this quarter. Top performers win a real trip.</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : leaderboard?.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">◆</p>
            <p className="text-foreground font-bold text-lg">No rankings yet</p>
            <p className="text-muted-foreground">Be the first to complete today's modules!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="bg-secondary rounded-3xl p-6 mb-6">
                <p className="text-white/60 text-sm font-semibold uppercase tracking-widest text-center mb-6">Top Performers</p>
                <div className="flex items-end justify-center gap-4">
                  {/* 2nd place */}
                  {top3[1] && (
                    <div className="text-center flex-1">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-black ${top3[1].isCurrentUser ? "bg-primary text-white" : "bg-white/10 text-white"}`}>
                        {top3[1].childName[0]}
                      </div>
                      <p className="text-white/80 text-sm font-bold truncate">{top3[1].childName}</p>
                      <p className="text-white/50 text-xs">{top3[1].totalPoints} pts</p>
                      <div className="h-12 bg-white/10 rounded-t-lg mt-3 flex items-center justify-center">
                        <span className="text-white/60 font-black text-xl">2</span>
                      </div>
                    </div>
                  )}
                  {/* 1st place */}
                  {top3[0] && (
                    <div className="text-center flex-1">
                      <div className="text-2xl mb-1">✦</div>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-xl font-black ${top3[0].isCurrentUser ? "bg-primary text-white" : "bg-primary/80 text-white"}`}>
                        {top3[0].childName[0]}
                      </div>
                      <p className="text-white font-bold truncate">{top3[0].childName}</p>
                      <p className="text-white/60 text-xs">{top3[0].totalPoints} pts</p>
                      <div className="h-20 bg-primary rounded-t-lg mt-3 flex items-center justify-center">
                        <span className="text-white font-black text-2xl">1</span>
                      </div>
                    </div>
                  )}
                  {/* 3rd place */}
                  {top3[2] && (
                    <div className="text-center flex-1">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-black ${top3[2].isCurrentUser ? "bg-primary text-white" : "bg-white/10 text-white"}`}>
                        {top3[2].childName[0]}
                      </div>
                      <p className="text-white/80 text-sm font-bold truncate">{top3[2].childName}</p>
                      <p className="text-white/50 text-xs">{top3[2].totalPoints} pts</p>
                      <div className="h-8 bg-white/10 rounded-t-lg mt-3 flex items-center justify-center">
                        <span className="text-white/60 font-black text-xl">3</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Full list */}
            <div className="space-y-2">
              {leaderboard?.map((entry, i) => (
                <motion.div key={entry.childId}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    entry.isCurrentUser ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}>
                  <span className={`w-8 text-center font-black text-sm ${entry.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                    {entry.rank <= 3 ? ["✦", "●", "◆"][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${entry.isCurrentUser ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                    {entry.childName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${entry.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                      {entry.childName} {entry.isCurrentUser && "(You)"}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.streak} day streak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-foreground">{entry.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
          <p className="text-primary font-semibold text-sm">Top 3 most improved kids win a real trip every quarter.</p>
        </div>
      </div>
    </Layout>
  );
}
