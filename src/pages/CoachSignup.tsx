import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const inputCls = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
const labelCls = "block text-sm font-semibold text-foreground mb-2";

export default function CoachSignup() {
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<"account" | "profile">("account");

  // Account fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [lifeTake, setLifeTake] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  async function handleAccountSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setPending(true);
    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, parentPin: "0000" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed."); return; }
      setToken(data.token);
      setUserId(data.user.id);
      setDisplayName(name);
      setStep("profile");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!displayName.trim()) { setError("Coach name is required."); return; }
    setPending(true);
    try {
      const res = await fetch(`${BASE}/api/coaches/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          displayName,
          bio,
          profileTitle,
          location,
          yearsExperience: yearsExperience || undefined,
          experience,
          lifeTake,
          specialties,
          profilePictureUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Could not create coach profile."); return; }
      login({ id: userId!, name, email, role: "parent" } as any, token);
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl">

          <div className="flex items-center mb-8 gap-4">
            <button onClick={() => step === "profile" ? setStep("account") : navigate("/join")}
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
              <h1 className="text-2xl font-black text-white">
                {step === "account" ? "Coach Sign Up" : "Your Coach Profile"}
              </h1>
              <p className="text-white/60 text-sm">
                {step === "account" ? "Step 1 of 2 — Create your account" : "Step 2 of 2 — Build your coaching profile"}
              </p>
            </div>
            <div className="w-10" />
          </div>

          {/* Progress bar */}
          <div className="flex gap-2 mb-6">
            <div className="h-1.5 flex-1 rounded-full bg-primary" />
            <div className={`h-1.5 flex-1 rounded-full ${step === "profile" ? "bg-primary" : "bg-white/20"} transition-colors`} />
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-2xl">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3 mb-6">{error}</div>
            )}

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
              <p className="text-sm font-bold text-primary mb-1">🏆 Coach Referral Earnings</p>
              <p className="text-xs text-muted-foreground">Earn 70% of every $5/month or $50/year membership from parents you refer. Upload daily insight videos. No membership fee to join.</p>
            </div>

            {step === "account" ? (
              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      placeholder="At least 8 characters" className={inputCls + " pr-12"} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-lg">
                      {showPw ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={pending}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-[1.02]">
                  {pending ? "Creating account…" : "Continue →"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Identity */}
                <div>
                  <label className={labelCls}>Coach Name <span className="text-destructive">*</span></label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required
                    placeholder="e.g. Coach Michael" className={inputCls} />
                  <p className="text-xs text-muted-foreground mt-1">This becomes your profile path: /coaches/coach-michael</p>
                </div>

                <div>
                  <label className={labelCls}>Profile Title <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input type="text" value={profileTitle} onChange={e => setProfileTitle(e.target.value)}
                    placeholder="e.g. Youth Life Coach & Motivational Speaker" className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Location <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Lagos, Nigeria" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Years of Experience <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <input type="number" min="0" max="50" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)}
                      placeholder="e.g. 5" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Profile Picture URL <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <input type="url" value={profilePictureUrl} onChange={e => setProfilePictureUrl(e.target.value)}
                    placeholder="https://... (link to a photo of yourself)" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Short Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                    placeholder="A 1–2 sentence introduction parents will see on your card…"
                    className={inputCls + " resize-none"} />
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-4">Tell parents more about you</p>

                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Describe Your Experience <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <textarea value={experience} onChange={e => setExperience(e.target.value)} rows={3}
                        placeholder="What's your background? Have you worked with children, taught, mentored, counselled? Share your story…"
                        className={inputCls + " resize-none"} />
                    </div>

                    <div>
                      <label className={labelCls}>What's Your Take on Life? <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <textarea value={lifeTake} onChange={e => setLifeTake(e.target.value)} rows={3}
                        placeholder="What do you believe about life, growth, resilience, or the next generation? Share your personal philosophy…"
                        className={inputCls + " resize-none"} />
                    </div>

                    <div>
                      <label className={labelCls}>Areas of Focus / Specialties <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <input type="text" value={specialties} onChange={e => setSpecialties(e.target.value)}
                        placeholder="e.g. Emotional intelligence, Leadership, Resilience, Mindset (comma separated)"
                        className={inputCls} />
                      <p className="text-xs text-muted-foreground mt-1">Separate each specialty with a comma.</p>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={pending}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-[1.02]">
                  {pending ? "Submitting Application…" : "Submit Coach Application →"}
                </button>
              </form>
            )}

            <p className="text-center text-muted-foreground text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login?tab=coach"><span className="text-primary font-bold cursor-pointer hover:underline">Sign in as Coach</span></Link>
            </p>
            <p className="text-xs text-center text-muted-foreground mt-2">Your profile will be reviewed by our team before you can start uploading content.</p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
