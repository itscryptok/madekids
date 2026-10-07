import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const api = (path: string) => `${BASE}${path}`;

export default function CoachRegister() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [coach, setCoach] = useState<any>(null);
  const [checkingCoach, setCheckingCoach] = useState(true);

  const token = localStorage.getItem("mk_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) return;
    fetch(api("/api/coaches/me"), { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.coach) setCoach(data.coach);
        setCheckingCoach(false);
      })
      .catch(() => setCheckingCoach(false));
  }, [user]);

  if (!user) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="text-center text-white">
        <p className="mb-4">Please sign in to become a coach.</p>
        <Link href="/login"><span className="text-primary underline">Sign In</span></Link>
      </div>
    </div>
  );

  if (checkingCoach) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (coach) {
    navigate(`/coach/${coach.slug}`);
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const r = await fetch(api("/api/coaches/register"), {
        method: "POST", headers, body: JSON.stringify({ displayName, bio }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.message || "Something went wrong."); return; }
      navigate(`/coach/${data.slug}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 60% 40%, hsl(32 95% 53%), transparent 50%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center gap-2 cursor-pointer mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black">MK</span>
              </div>
              <span className="text-white font-black text-xl">Made Kids</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Become a Coach</h1>
          <p className="text-white/60">Register as a coach and start impacting young lives</p>
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-2xl">
          {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-6">{error}</div>}

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm font-bold text-primary mb-2">🏆 How Coach Referrals Work</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• You get a unique referral link to share with parents</li>
              <li>• Parents who sign up with your link become your kid proteges</li>
              <li>• You upload daily video insights specifically for your proteges</li>
              <li>• Earn 70% of every membership fee from your proteges</li>
              <li>• Withdraw earnings directly to your Stripe account</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Your Coach Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                placeholder="e.g. Coach Michael"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <p className="text-xs text-muted-foreground mt-1">This becomes your profile path: /coach/coach-michael</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Short Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                placeholder="Tell parents about your background and approach..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <button type="submit" disabled={pending}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-[1.02]">
              {pending ? "Creating Coach Profile…" : "Become a Coach →"}
            </button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">Your account will be pending admin approval before you can upload content.</p>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
