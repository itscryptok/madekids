import { useState, useRef, useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetTodayContent, useSubmitRecording, useGetMyProgress } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import Layout from "@/components/Layout";

type RecordingType = "recitation" | "challenge";

export default function RecordingPage({ type }: { type: RecordingType }) {
  const { user } = useAuth();
  const { data: content } = useGetTodayContent();
  const { data: progress } = useGetMyProgress();
  const { mutate: submitRecording, isPending: isSubmitting } = useSubmitRecording({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
      }
    }
  });

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const isSubscribed = (user as any)?.subscriptionStatus === "active";
  const alreadyDone = progress?.modulesCompletedToday?.includes(type) ?? false;

  const prompt = type === "recitation" ? content?.recitationPrompt : content?.challengeDescription;
  const title = type === "recitation" ? "Recitation Recording" : "Challenge Recording";
  const subtitle = type === "recitation"
    ? "Record your voice as you recite what you have learned from today's video."
    : "Record your voice as you perform today's challenge.";

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch {
      setError("Microphone access was blocked. Please allow microphone permission in your browser settings and try again.");
    }
  };

  const retryMicrophone = () => {
    setError("");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);
    setDuration(0);
  };

  const handleSubmit = async () => {
    if (!audioBlob || !content) return;
    const childId = (progress as any)?.childId;
    if (!childId) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      submitRecording({
        data: {
          childId,
          contentId: content.id,
          type,
          audioDataUrl: reader.result as string,
          durationSeconds: duration,
        }
      });
    };
    reader.readAsDataURL(audioBlob);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!isSubscribed) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-3">Membership required</h2>
          <p className="text-muted-foreground mb-8">Start your Made Kids membership to record your voice, earn points, and enter the quarterly reward draw.</p>
          <Link href="/subscribe">
            <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all hover:scale-105">
              Start Membership — $5/month
            </button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (alreadyDone && !submitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-primary text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">{title} already done!</h2>
          <p className="text-muted-foreground mb-6">You already completed this module today. Come back tomorrow!</p>
          <button onClick={() => navigate("/dashboard")} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-white text-4xl">✓</span>
          </div>
          <h2 className="text-3xl font-black text-foreground mb-2">Recording Submitted!</h2>
          <p className="text-muted-foreground mb-2">+10 points earned!</p>
          <p className="text-muted-foreground mb-8">Great job. Keep showing up every day.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
              Back to Dashboard
            </button>
            {type === "recitation" && (
              <button onClick={() => navigate("/record/challenge")} className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors">
                Do the Challenge
              </button>
            )}
          </div>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground mb-8">{subtitle}</p>
        </motion.div>

        {/* Prompt */}
        {prompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-secondary text-white rounded-2xl p-6 mb-8">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
              {type === "recitation" ? "Recitation Prompt" : "Today's Challenge"}
            </p>
            <p className="text-lg font-semibold leading-relaxed">{prompt}</p>
          </motion.div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-destructive text-xl mt-0.5">🎙️</span>
            <div className="flex-1">
              <p className="text-destructive text-sm font-medium mb-2">{error}</p>
              <button
                onClick={retryMicrophone}
                className="text-xs font-bold text-destructive border border-destructive/40 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Recorder */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-card border border-card-border rounded-3xl p-8 text-center">
          
          {!audioUrl ? (
            <>
              {/* Record button */}
              <div className="relative mb-6">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all shadow-xl ${
                    isRecording
                      ? "bg-destructive hover:bg-destructive/90 scale-110"
                      : "bg-primary hover:bg-primary/90 hover:scale-110"
                  }`}
                >
                  {isRecording ? (
                    <span className="w-8 h-8 bg-white rounded-sm" />
                  ) : (
                    <span className="text-white text-3xl">◉</span>
                  )}
                </button>
                {isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-4 border-destructive/40 animate-ping" />
                  </div>
                )}
              </div>
              
              {isRecording ? (
                <>
                  <p className="text-foreground font-black text-2xl mb-1">{formatTime(elapsed)}</p>
                  <p className="text-muted-foreground text-sm">Recording... tap to stop</p>
                </>
              ) : (
                <>
                  <p className="text-foreground font-bold text-lg mb-1">Tap to start recording</p>
                  <p className="text-muted-foreground text-sm">Make sure you're in a quiet place</p>
                </>
              )}
            </>
          ) : (
            <>
              {/* Playback */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary text-2xl">◉</span>
                </div>
                <p className="text-foreground font-bold mb-1">Recording ready ({formatTime(duration)})</p>
                <p className="text-muted-foreground text-sm mb-4">Play it back or submit</p>
                <audio src={audioUrl} controls className="w-full rounded-xl mb-4" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={resetRecording} className="flex-1 border-2 border-border text-foreground py-3 rounded-xl font-bold hover:border-primary/40 transition-colors">
                  Record Again
                </button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isSubmitting ? "Submitting..." : "Submit Recording"}
                </button>
              </div>
            </>
          )}
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">Completing this module earns you +10 points</p>
        </div>
      </div>
    </Layout>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
