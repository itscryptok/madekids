import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Subscribe() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const token = localStorage.getItem("mk_token");

  const handleSubscribe = async () => {
    setIsPending(true);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planType: plan }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Could not start checkout. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, hsl(32 95% 53%), transparent 60%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl">
        <div className="flex items-center mb-8 gap-4">
          <button onClick={() => navigate("/dashboard")}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0">
            ←
          </button>
          <div className="text-center flex-1">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xl">
              <span className="text-white font-black">MK</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 mb-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-white/80 text-sm font-semibold">Step 2 of 2 — Choose your plan</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Start Your Membership</h1>
            <p className="text-white/60 text-sm">
              Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! Pick the plan that works for your family.
            </p>
          </div>
          <div className="w-10" />
        </div>

        <div className="bg-card rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-6">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button type="button" onClick={() => setPlan("monthly")}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative ${plan === "monthly" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <p className="font-bold text-foreground text-sm mb-1">Monthly</p>
              <p className="text-3xl font-black text-primary">$5</p>
              <p className="text-xs text-muted-foreground">per month</p>
              <p className="text-xs text-muted-foreground mt-2">Billed monthly. Cancel any time.</p>
              {plan === "monthly" && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
            <button type="button" onClick={() => setPlan("annual")}
              className={`p-6 rounded-2xl border-2 transition-all text-left relative ${plan === "annual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-black px-3 py-0.5 rounded-full whitespace-nowrap">SAVE $10</span>
              </div>
              <p className="font-bold text-foreground text-sm mb-1">Annual</p>
              <p className="text-3xl font-black text-primary">$50</p>
              <p className="text-xs text-muted-foreground">per year</p>
              <p className="text-xs text-muted-foreground mt-2">Best value — 2 months free.</p>
              {plan === "annual" && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          </div>

          <div className="bg-muted rounded-2xl p-5 mb-6">
            <h3 className="font-black text-foreground mb-3">Everything included:</h3>
            <ul className="space-y-2">
              {[
                "Daily MK Box video insights",
                "Recite lesson learnt & Perform challenge",
                "Points, streaks & leaderboard",
                "Quarterly trip rewards (Disney World, Universal Studios & more, or cash equivalent)",
                "Made-Kids Convention (MKC) eligibility",
                "Parent Zone with recording approval",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-primary font-bold shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 mb-5">
            <span className="text-primary text-lg shrink-0">🔒</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your child's voice recordings are stored securely and only accessible to you and their assigned coach. Cancel anytime — no questions asked.
            </p>
          </div>

          <button onClick={handleSubscribe} disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
            {isPending ? "Starting membership..." : `Start ${plan === "monthly" ? "$5/month" : "$50/year"} Membership`}
          </button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            You can also{" "}
            <button onClick={() => navigate("/dashboard")} className="text-primary font-semibold hover:underline">
              skip for now
            </button>
            {" "}and subscribe later from your account settings.
          </p>
        </div>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
