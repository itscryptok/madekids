import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const features = [
  {
    icon: "🧠",
    title: "Emotionally Intelligent",
    desc: "A key requirement for a fulfilled life. We teach children to understand, manage, and express their feelings."
  },
  {
    icon: "💪",
    title: "Beyond Intellect",
    desc: "Classroom smartness is one thing. Being forged to withstand and overcome life situations is another."
  },
  {
    icon: "🎯",
    title: "Daily Challenges",
    desc: "To build desirable character traits and self-confidence, go through three modules every day: watch, recite, and perform. Get points for completing all three."
  },
  {
    icon: "🏆",
    title: "Real Rewards",
    desc: "The most improved kids each quarter win a real cash reward. When the community reaches 5,000 families, the prize upgrades to fully funded trips to Disney World, Universal Studios and more."
  },
];

const steps = [
  { step: "01", title: "Log in daily", desc: "Open your MK Box every day to receive fresh video insight." },
  { step: "02", title: "Watch the insight", desc: "The platform ensures your child watches the full video — fast-forwarding won't earn points." },
  { step: "03", title: "Record your recitation", desc: "Your child records their voice reciting what they learned." },
  { step: "04", title: "Perform the challenge", desc: "Complete the daily challenge and record it as a voice note." },
  { step: "05", title: "Earn points", desc: "Get points for all three modules as you build your ranking to be selected as the winner for the quarterly Amusement park ticket fun reward." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">MK</span>
            </div>
            <span className="text-white font-black text-lg">Made Kids</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/how-it-works">
              <button className="text-white/80 hover:text-white text-sm font-semibold transition-colors hidden sm:block">How It Works</button>
            </Link>
            <Link href="/coaches">
              <button className="text-white/80 hover:text-white text-sm font-semibold transition-colors hidden sm:block">Connect with a Coach</button>
            </Link>
            <Link href="/login">
              <button className="text-white/80 hover:text-white text-sm font-semibold transition-colors">Sign In</button>
            </Link>
            <Link href="/join">
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-secondary min-h-screen flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, hsl(32 95% 53%), transparent 50%), radial-gradient(circle at 80% 20%, hsl(32 95% 53%), transparent 40%)" }} />
        {/* Faded brain graphic */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none select-none" aria-hidden="true">
          <svg viewBox="0 0 500 500" width="600" height="600" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M250 60 C180 60 120 100 100 160 C70 160 50 185 50 215 C30 225 20 250 25 275 C15 290 15 310 30 325 C25 345 35 370 55 380 C65 410 90 430 120 430 C135 450 160 460 185 455 C200 470 225 475 250 470 C275 475 300 470 315 455 C340 460 365 450 380 430 C410 430 435 410 445 380 C465 370 475 345 470 325 C485 310 485 290 475 275 C480 250 470 225 450 215 C455 185 435 160 405 160 C385 100 320 60 250 60Z" />
            <path d="M250 100 C200 100 160 125 145 165 M355 165 C340 125 300 100 250 100" stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
            <circle cx="170" cy="200" r="12" opacity="0.4" />
            <circle cx="330" cy="200" r="12" opacity="0.4" />
            <circle cx="140" cy="270" r="8" opacity="0.3" />
            <circle cx="360" cy="270" r="8" opacity="0.3" />
            <circle cx="200" cy="350" r="10" opacity="0.3" />
            <circle cx="300" cy="350" r="10" opacity="0.3" />
            <path d="M170 200 Q210 230 250 220 Q290 210 330 200" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M140 270 Q195 300 250 290 Q305 280 360 270" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M170 200 L140 270 M330 200 L360 270" stroke="white" strokeWidth="1.5" fill="none" opacity="0.2" />
            <path d="M200 350 Q225 330 250 335 Q275 340 300 350" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            <path d="M140 270 L200 350 M360 270 L300 350" stroke="white" strokeWidth="1.5" fill="none" opacity="0.2" />
            <path d="M250 100 L250 220 M250 290 L250 390" stroke="white" strokeWidth="1" fill="none" opacity="0.15" strokeDasharray="5,5" />
            <path d="M100 215 Q120 250 140 270" stroke="white" strokeWidth="2" fill="none" opacity="0.25" />
            <path d="M400 215 Q380 250 360 270" stroke="white" strokeWidth="2" fill="none" opacity="0.25" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-semibold">Building exceptional minds</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Raising<br />
              <span className="text-primary">Exceptionally</span><br />
              Made Kids
            </h1>
            <div className="flex items-center gap-3 mb-10">
              <span className="text-white font-black text-lg">Connect</span>
              <span className="text-primary font-black text-xl">→</span>
              <span className="text-white font-black text-lg">Enroll</span>
              <span className="text-primary font-black text-xl">→</span>
              <span className="text-white font-black text-lg">Build</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/coaches">
                <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl text-lg font-black transition-all hover:scale-105 shadow-xl">
                  Parents connect with a coach →
                </button>
              </Link>
              <Link href="/coach/signup">
                <button className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all">
                  Join as a coach
                </button>
              </Link>
            </div>
            <p className="text-white/70 text-lg max-w-2xl leading-relaxed mb-4">
              Being an exceptional kid goes beyond just classroom smartness. Intentionally re-training the mind to build emotional intelligence, self-discipline and self-confidence can help any child excel even under the roughest life conditions. Give these independent life coaches a chance to help.
            </p>
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-4 py-2">
              <span className="text-xl">🎢</span>
              <span className="text-white/80 text-sm">Enroll through our platform and your child earns a chance to win a fully funded quarterly fun trip ticket to Amusement parks like Disney World, Universal Studios &amp; more, when we hit 5,000 active families membership every month.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">What Makes MK Different</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We don't just educate. We forge.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-card-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-foreground text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">How the Challenge Works</h2>
            <p className="text-white/60 text-lg">Three modules. Every day. Consistent growth.</p>
          </motion.div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-primary font-black text-2xl shrink-0">{s.step}</span>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
                  <p className="text-white/60">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/how-it-works#parents">
              <button className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-2xl font-semibold transition-all hover:scale-105">
                Read More →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-primary rounded-3xl p-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
              <div className="text-6xl mb-6">🏰</div>
              <h2 className="text-4xl font-black text-white mb-4">Win a Real Trip Every Quarter</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
                Every quarter, the most improved kids win a real reward. Right now, winners receive a cash reward. When our community hits 5,000 active families, the prize upgrades to fully funded trips to Disney World, Universal Studios and more. Every subscription brings us closer.
              </p>
              <Link href="/coaches">
                <button className="bg-white text-primary px-10 py-4 rounded-2xl text-lg font-black hover:scale-105 transition-transform shadow-xl">
                  Connect with a Coach to Get Started
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-muted">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">One family. One subscription. Unlimited growth.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-card border border-card-border rounded-3xl p-8">
              <p className="text-muted-foreground font-semibold mb-2">Monthly</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-foreground">$5</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Daily video insights", "Voice recording challenges", "Points & streak tracking", "Quarterly reward eligibility"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="text-primary font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/coaches">
                <button className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors">Connect with a Coach →</button>
              </Link>
            </div>
            <div className="bg-secondary rounded-3xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-black px-4 py-1 rounded-full">BEST VALUE</span>
              </div>
              <p className="text-white/60 font-semibold mb-2">Annual</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-black text-white">$50</span>
                <span className="text-white/60">/year</span>
              </div>
              <p className="text-primary text-sm font-semibold mb-6">Save $10 vs monthly</p>
              <ul className="space-y-3 mb-8">
                {["Everything in Monthly", "Save $10 per year", "Priority leaderboard ranking", "Exclusive quarterly rewards access"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <span className="text-primary font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/coaches">
                <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">Connect with a Coach →</button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Coach CTA */}
      <section className="py-20 bg-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary font-semibold mb-3 text-sm uppercase tracking-wider">For Coaches & Mentors</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                Become a Life Coach & Mentor
              </h2>
              <p className="text-white/60 text-lg leading-relaxed mb-4">
                Made Kids gives independent mentors and community leaders a full coaching toolkit — MK Box delivery, voice recording challenges, a live protege dashboard, and automated bank payouts. Apply, get approved, then set up your profile so parents can find and reach out to you directly.
              </p>
              <p className="text-white/60 leading-relaxed mb-8">
                When you agree to mentor a child, share your personal referral link — the parent registers through our platform and their child is automatically assigned to you. You earn <span className="text-primary font-bold">70% of every subscription</span> from every family you bring in, paid directly to your bank.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/coach/signup">
                  <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105">
                    Join as a coach
                  </button>
                </Link>
                <Link href="/how-it-works#coaches">
                  <button className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-2xl font-semibold transition-all">
                    Read More →
                  </button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "📋", label: "Full coach dashboard & protege tracker" },
                { icon: "📹", label: "Upload daily video insights via the platform" },
                { icon: "🎙️", label: "Kids complete voice challenges in the MK Box" },
                { icon: "💰", label: "Earn 70% — paid straight to your bank" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <p className="text-white font-semibold text-sm leading-snug">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
