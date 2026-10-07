import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [parentPin, setParentPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [coachName, setCoachName] = useState("");
  const [codeChecked, setCodeChecked] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
      fetch(`${BASE}/api/coaches/by-code/${ref}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.displayName) setCoachName(d.displayName); })
        .catch(() => {})
        .finally(() => setCodeChecked(true));
    } else {
      setCodeChecked(true);
    }
  }, []);

  const handleUsernameInput = (val: string) => {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ""));
  };

  const handlePinInput = (val: string, setter: (v: string) => void) => {
    setter(val.replace(/\D/g, "").slice(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username && username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^\d{4}$/.test(parentPin)) {
      setError("Parent PIN must be exactly 4 digits.");
      return;
    }
    if (parentPin !== confirmPin) {
      setError("PINs do not match. Please re-enter.");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, username, password, parentPin, referralCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
      } else {
        login(data.user, data.token);
        navigate("/subscribe");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (!codeChecked) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!referralCode) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 60% 30%, hsl(32 95% 53%), transparent 50%)" }} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">

            <div className="text-center mb-8">
              <Link href="/">
                <div className="inline-flex items-center gap-2 cursor-pointer mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-black text-sm">MK</span>
                  </div>
                  <span className="text-white font-black text-lg">Made Kids</span>
                </div>
              </Link>
            </div>

            <div className="bg-card rounded-3xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <h1 className="text-2xl font-black text-foreground mb-2">Referral Link Required</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Made Kids is a referral-only community. Parents can only join through a direct referral link shared by a coach in their life network.
                </p>
              </div>

              <div className="bg-muted border border-border rounded-2xl p-4 mb-6 text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>
                  Browse our coach directory, find a coach whose values and approach resonate with your family, and request their unique referral link directly from them.
                </p>
                <p className="text-xs border-t border-border pt-3">
                  <span className="font-semibold text-foreground">Important:</span> While we list and display reviews of coaches on this platform, our coaches are <span className="font-semibold text-foreground">independent operators</span> who use our tools to run their own coaching practices. Made Kids is not responsible for the conduct, advice, or actions of any individual coach. Please do your own research before choosing one.
                </p>
              </div>

              <Link href="/coaches">
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Browse Coach Directory →
                </button>
              </Link>

              <p className="text-center text-muted-foreground text-sm mt-4">
                Already have an account?{" "}
                <Link href="/login"><span className="text-primary font-bold cursor-pointer hover:underline">Sign in</span></Link>
              </p>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, hsl(32 95% 53%), transparent 50%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">

        <div className="flex items-center mb-8 gap-4">
          <button onClick={() => navigate("/join")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0">
            ←
          </button>
          <div className="text-center flex-1">
            <Link href="/">
              <div className="inline-flex items-center gap-2 cursor-pointer mb-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">MK</span>
                </div>
                <span className="text-white font-black text-lg">Made Kids</span>
              </div>
            </Link>
            <h1 className="text-2xl font-black text-white">Create Your Account</h1>
            <p className="text-white/60 text-sm">Step 1 of 2 — Set up your family account</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-2xl">
          {coachName && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-sm font-bold text-primary">Referred by {coachName}</p>
                <p className="text-xs text-muted-foreground">Your child will be mentored by {coachName} after signup.</p>
              </div>
            </div>
          )}
          {!coachName && referralCode && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <p className="text-sm font-bold text-primary">Referral code: {referralCode}</p>
                <p className="text-xs text-muted-foreground">You're joining via a coach's referral link.</p>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                placeholder="Parent's full name"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">@</span>
                <input type="text" value={username} onChange={e => handleUsernameInput(e.target.value)}
                  placeholder="yourname (optional)"
                  className="w-full bg-muted border border-border rounded-xl pl-8 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Letters, numbers and underscores only.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold text-primary mb-1">🔐 Set Your Parent PIN</p>
                <p className="text-xs text-muted-foreground">A secret 4-digit code that unlocks your private Parent Zone. Never share it with your child.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Parent PIN</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={parentPin}
                    onChange={e => handlePinInput(e.target.value, setParentPin)} required placeholder="4 digits"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl tracking-widest" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Confirm PIN</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={confirmPin}
                    onChange={e => handlePinInput(e.target.value, setConfirmPin)} required placeholder="4 digits"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl tracking-widest" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] mt-2">
              {isPending ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login"><span className="text-primary font-bold cursor-pointer hover:underline">Sign in</span></Link>
          </p>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
