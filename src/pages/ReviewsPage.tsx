import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type ReviewRow = {
  id: number;
  targetType: string;
  rating: number;
  comment: string;
  authorName: string;
  coachName: string | null;
  createdAt: string;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-lg ${s <= rating ? "text-amber-400" : "text-muted"}`}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/reviews`)
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setReviews(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground mb-1">Reviews</h1>
              <p className="text-muted-foreground">What Made Kids families are saying about the program and their coaches.</p>
            </div>
            <Link href="/parent-zone">
              <button className="bg-primary text-white font-black px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shrink-0">
                ✍️ Write a Review
              </button>
            </Link>
          </div>

          {avgRating && (
            <div className="mt-6 flex items-center gap-4 bg-card border border-card-border rounded-2xl px-6 py-4 w-fit">
              <div className="text-center">
                <p className="text-4xl font-black text-foreground">{avgRating}</p>
                <p className="text-xs text-muted-foreground mt-0.5">out of 5</p>
              </div>
              <div>
                <StarDisplay rating={Math.round(parseFloat(avgRating))} />
                <p className="text-sm text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-card-border rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-3" />
                <div className="h-16 bg-muted rounded mb-3" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-3xl">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-black text-foreground mb-2">No reviews yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Be the first family to share your Made Kids experience.</p>
            <Link href="/parent-zone">
              <button className="bg-primary text-white font-black px-8 py-3 rounded-2xl hover:bg-primary/90 transition-colors">
                Write the First Review
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-card-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <StarDisplay rating={r.rating} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    r.targetType === "coach"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary/10 text-secondary-foreground border border-border"
                  }`}>
                    {r.targetType === "coach" && r.coachName ? `Coach ${r.coachName}` : "Platform Review"}
                  </span>
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-4">"{r.comment}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                    {r.authorName[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{r.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
