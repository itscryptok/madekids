import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetTodayContent, useMarkContentViewed, useGetMyProgress } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function MKBox() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data: content, isLoading } = useGetTodayContent();
  const { data: progress } = useGetMyProgress();
  const [coachInsight, setCoachInsight] = useState<{ title?: string; videoUrl?: string; recitationPrompt?: string; challengeDescription?: string } | null>(null);
  const [coachName, setCoachName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("mk_token");
    if (!token) return;
    fetch(`${BASE}/api/coaches/today-insight`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.insight) setCoachInsight(d.insight);
      if (d?.coachName) setCoachName(d.coachName);
    }).catch(() => {});
  }, []);

  const [submitError, setSubmitError] = useState("");

  const { mutate: markViewed, isPending: isSubmitting } = useMarkContentViewed({
    mutation: {
      onSuccess: () => {
        setVideoComplete(true);
        setSubmitError("");
      },
      onError: () => {
        setSubmitError("Couldn't save your progress. Check your connection and try again.");
      }
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fastForwardDetected, setFastForwardDetected] = useState(false);
  const [lastTime, setLastTime] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [videoComplete, setVideoComplete] = useState(false);

  const videoAlreadyDone = progress?.modulesCompletedToday?.includes("video") ?? false;

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    if (curr - lastTime > 10) {
      setFastForwardDetected(true);
    }
    setLastTime(curr);
    setCurrentTime(curr);
    if (!fastForwardDetected) {
      setWatchedSeconds(s => s + 1);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || (content?.duration ?? 420));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSubmitView = () => {
    if (!content) return;
    const childId = (progress as any)?.childId ?? 0;
    if (!childId) return;
    markViewed({
      contentId: content.id,
      data: {
        childId,
        watchedDuration: watchedSeconds,
        fastForwardDetected,
      }
    });
  };

  const activeVideoUrl = coachInsight?.videoUrl || content?.videoUrl || "";
  const activeTitle = coachInsight?.title || content?.title || "";
  const activeRecitationPrompt = coachInsight?.recitationPrompt || content?.recitationPrompt || "";
  const activeChallengeDescription = coachInsight?.challengeDescription || content?.challengeDescription || "";

  const effectiveDuration = duration || content?.duration || 420;
  const progress_pct = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;
  const isYouTube = activeVideoUrl.includes("youtube") || activeVideoUrl.includes("youtu.be");

  const isSubscribed = (progress as any)?.subscriptionStatus === "active" || (user as any)?.subscriptionStatus === "active";

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="aspect-video bg-muted rounded-3xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isLoading && !isSubscribed) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">Membership required</h2>
          <p className="text-muted-foreground mb-8">Start your Made Kids membership to access the daily MK Box, earn points, and enter the quarterly reward draw.</p>
          <Link href="/subscribe">
            <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all hover:scale-105">
              Start Membership — $5/month
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!content) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-black text-foreground mb-2">No content today</h2>
          <p className="text-muted-foreground">Check back tomorrow for your next MK Box.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Today's MK Box</span>
          </div>
          {coachName && (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-2">
              <span className="text-primary text-xs font-bold">🏆 From {coachName}</span>
            </div>
          )}
          <h1 className="text-3xl font-black text-foreground mb-1">{activeTitle}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">{content.theme}</span>
            <span className="text-muted-foreground text-sm">{Math.floor(effectiveDuration / 60)} min {effectiveDuration % 60} sec</span>
          </div>
        </motion.div>

        {/* Video player */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="bg-secondary rounded-3xl overflow-hidden mb-6 shadow-xl">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              src={activeVideoUrl.includes("youtube") ? undefined : activeVideoUrl}
            >
              {activeVideoUrl.includes("youtube") ? null : <source src={activeVideoUrl} />}
            </video>
            {activeVideoUrl.includes("youtube") && (
              <iframe
                className="w-full h-full absolute inset-0"
                src={`${activeVideoUrl}?enablejsapi=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {!activeVideoUrl.includes("youtube") && (
              <button onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                <div className={`w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-xl transition-all ${isPlaying ? "opacity-0" : "opacity-100"}`}>
                  <span className="text-white text-xl ml-1">▶</span>
                </div>
              </button>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs w-8">{formatTime(currentTime)}</span>
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress_pct}%` }} />
              </div>
              <span className="text-white/60 text-xs w-8">{formatTime(effectiveDuration)}</span>
            </div>
          </div>
        </motion.div>

        {/* Integrity notice */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
          className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 mb-6">
          <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
          <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
            <strong>Watch in full.</strong> Videos that are skipped or not watched completely are automatically flagged on the admin side — even if a participation point is recorded for you.
          </p>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-card-border rounded-2xl p-6 mb-6">
          <p className="text-foreground leading-relaxed">{content.description}</p>
        </motion.div>

        {/* Submit & proceed */}
        {videoAlreadyDone ? (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
            <p className="text-primary font-black text-lg mb-4">Video module completed today!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/record/recitation">
                <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">Go to Recitation</button>
              </Link>
              <Link href="/record/challenge">
                <button className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors">Go to Challenge</button>
              </Link>
            </div>
          </div>
        ) : videoComplete ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
            <p className="text-primary font-black text-lg mb-2">Great job! +10 points earned!</p>
            <p className="text-muted-foreground text-sm mb-6">Now complete the two voice recording modules to earn your remaining points.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/record/recitation">
                <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">Record Recitation</button>
              </Link>
              <Link href="/record/challenge">
                <button className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors">Record Challenge</button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            {isYouTube ? (
              <p className="text-muted-foreground text-sm mb-4">Watch the full video above, then tap to confirm you're done.</p>
            ) : (
              <p className="text-muted-foreground text-sm mb-4">Watch the full video, then mark it complete to earn your points.</p>
            )}
            {submitError && (
              <p className="text-destructive text-sm font-medium mb-4">{submitError}</p>
            )}
            <button
              onClick={handleSubmitView}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-105"
            >
              {isSubmitting ? "Saving..." : "Mark Video Complete"}
            </button>
          </div>
        )}

        {/* Recitation & Challenge prompts */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">Recitation Prompt</p>
            <p className="text-foreground font-medium">{activeRecitationPrompt || "Record a voice note about what you learnt from today's video."}</p>
          </div>
          <div className="bg-card border border-card-border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">Today's Challenge</p>
            <p className="text-foreground font-medium">{activeChallengeDescription || "Record a voice note about how you performed today's challenge."}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
