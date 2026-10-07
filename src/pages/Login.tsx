import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Login() {
  const [tab, setTab] = useState<"parent" | "coach">("parent");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "coach") setTab("coach");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);
    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials. Please try again.");
        return;
      }
      login(data.user, data.token);

      if (tab === "coach") {
        const coachRes = await fetch(`${BASE}/api/coaches/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (coachRes.ok) {
          const coachData = await coachRes.json();
          if (coachData?.coach?.slug) {
            navigate(`/coach/${coachData.coach.slug}`);
            return;
          }
        }
        navigate("/coach/signup");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 70%, hsl(32 95% 53%), transparent 50%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">

        <div className="flex items-center mb-8 gap-4">
          <button onClick={() => navigate("/")}
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
            <h1 className="text-3xl font-black text-white">Welcome back</h1>
          </div>
          <div className="w-10" />
        </div>

        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("parent"); setError(""); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === "parent" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              👨‍👩‍👧 Parent / Child
            </button>
            <button
              onClick={() => { setTab("coach"); setError(""); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${tab === "coach" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
              🏆 Coach
            </button>
          </div>

          <div className="p-8">
            <p className="text-muted-foreground text-sm text-center mb-6">
              Sign in with your email or username
            </p>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={e => setEmailOrUsername(e.target.value)}
                  required
                  placeholder="your@email.com or @username"
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-muted border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg">
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
              {tab === "parent" ? (
                <p>Don't have an account?{" "}
                  <Link href="/coaches"><span className="text-primary font-bold cursor-pointer hover:underline">Find a coach to get started</span></Link>
                </p>
              ) : (
                <p>No coach account yet?{" "}
                  <Link href="/coach/signup"><span className="text-primary font-bold cursor-pointer hover:underline">Register as Coach</span></Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
