import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const parentSteps = [
  {
    number: "01",
    icon: "🔗",
    title: "Connect With a Coach",
    body: "Made Kids is a referral-only community — every parent joins through an independent coach's personal referral link. Browse the coaches directory, read each coach's profile, and find one whose values and approach align with your family. Use their contact details — email, Instagram, WhatsApp, or website — to reach out directly. The coach decides who they take on; if they agree to mentor your child, they'll share their personal referral link with you.",
  },
  {
    number: "02",
    icon: "📝",
    title: "Register as a Parent",
    body: "Sign up in minutes. Create your account with your name, username, email, and a secure parent PIN. Your chosen coach is automatically linked to your child's profile during registration.",
  },
  {
    number: "03",
    icon: "💳",
    title: "Choose a Membership",
    body: "Pick the plan that works for you — $5/month or $50/year (save $10). Your subscription is billed securely through Stripe and can be cancelled any time.",
  },
  {
    number: "04",
    icon: "📦",
    title: "Open the Daily MK Box",
    body: "Every day, a fresh MK Box unlocks for your child. Inside is a carefully curated video insight delivered by a coach — covering emotional intelligence, resilience, mindset, and character.",
  },
  {
    number: "05",
    icon: "🎬",
    title: "Watch the Insight",
    body: "Your child watches the full video. The platform ensures the content is fully viewed — fast-forwarding won't earn points. Full attention is rewarded.",
  },
  {
    number: "06",
    icon: "🎤",
    title: "Record the Recitation",
    body: "After watching, your child records a voice note reciting what they just learned. This builds retention, confidence, and the habit of speaking what they believe.",
  },
  {
    number: "07",
    icon: "⚡",
    title: "Complete the Daily Challenge",
    body: "Each day comes with a personal challenge — a specific action, reflection, or behaviour to carry out. Your child records a voice note completing it. This is where character is actually forged.",
  },
  {
    number: "08",
    icon: "🏅",
    title: "Earn Points & Build Streaks",
    body: "Complete all three modules — watch, recite, challenge — to earn full points for the day. Keep going daily to build a streak. Points determine your child's position on the quarterly leaderboard.",
  },
  {
    number: "09",
    icon: "🏆",
    title: "Win the Quarterly Reward",
    body: "The most improved kids each quarter win a real cash reward. Once the Made Kids community reaches 5,000 active families, the quarterly prize upgrades to fully funded trips to destinations like Disney World and Universal Studios. Winners are contacted directly — and every family who joins brings the community one step closer to that milestone.",
  },
  {
    number: "10",
    icon: "🌟",
    title: "Annual Made-Kids Convention",
    body: "Once a year, the top performing kids from around the world are honoured at the Made-Kids Convention — a celebration of growth, achievement, and excellence. Top honour award recipients are recognised in front of the entire Made-Kids community.",
  },
];

const coachSteps = [
  {
    number: "01",
    icon: "🙋",
    title: "Apply as a Life Coach",
    body: "Teachers, mentors, parents, youth workers, and community leaders who believe in the next generation are welcome to apply. Register at madekidsmk.com/coach/signup and submit your profile. Every application is reviewed and approved by our team before you go live.",
  },
  {
    number: "02",
    icon: "🔗",
    title: "Get Your Unique Referral Link",
    body: "Once approved, you receive a personal referral link. This is your key to building your coaching network. Every parent who signs up through your link automatically becomes part of your protege family.",
  },
  {
    number: "03",
    icon: "📣",
    title: "Set Up Your Profile & Let Parents Connect With You",
    body: "Add your contact details — email, Instagram, WhatsApp, website — to your coach profile so interested parents can find and reach you. Parents browse the coaches directory, read your profile, and contact you directly. You decide who you take on. Once you agree to mentor a child, share your personal referral link with that parent. They use it to register and their child is automatically assigned to you.",
  },
  {
    number: "04",
    icon: "👧",
    title: "Their Kids Become Your Proteges",
    body: "When a parent signs up through your link, their child is automatically assigned to you as your protege. You can view their progress, points, and streaks directly on your coach dashboard.",
  },
  {
    number: "05",
    icon: "📹",
    title: "Upload Daily Video Insights",
    body: "Once approved, you can upload daily video insights for your proteges. These are the videos your kids watch every day inside their MK Box. You're not just earning — you're actively coaching and shaping lives.",
  },
  {
    number: "06",
    icon: "💰",
    title: "Earn 70% of Every Membership",
    body: "Here's the real opportunity. For every parent in your network who subscribes — whether monthly ($5) or annually ($50) — you automatically earn 70% of that membership fee. Made Kids keeps 30% to run the platform. Your earnings are credited instantly when a subscription is confirmed.",
  },
  {
    number: "07",
    icon: "🏦",
    title: "Withdraw Directly to Your Bank",
    body: "Connect your bank account securely through Stripe on your coach dashboard. When you're ready to withdraw, click withdraw — and the funds are transferred directly to your bank. No middlemen, no waiting for admin approval.",
  },
];

function StepCard({ number, icon, title, body, delay = 0 }: { number: string; icon: string; title: string; body: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-5"
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="w-px flex-1 bg-border mt-3" />
      </div>
      <div className="pb-10">
        <p className="text-primary text-xs font-black mb-1">{number}</p>
        <h3 className="font-black text-foreground text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"parents" | "coaches">("parents");

  useEffect(() => {
    const sections = [
      document.getElementById("parents"),
      document.getElementById("coaches"),
    ].filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id as "parents" | "coaches");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: "parents" | "coaches") {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">MK</span>
              </div>
              <span className="text-white font-black text-lg">Made Kids</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-white/80 hover:text-white text-sm font-semibold transition-colors">Sign In</button>
            </Link>
            <Link href="/coaches">
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Browse Coaches</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-secondary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-semibold">Complete Guide</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              How Made Kids Works
            </h1>
            <p className="text-white/60 text-xl leading-relaxed">
              Everything you need to know — whether you're a parent enrolling your child, or an independent life coach building your network and income.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tab anchors */}
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-3">
          <button
            onClick={() => scrollTo("parents")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === "parents" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
            For Parents
          </button>
          <button
            onClick={() => scrollTo("coaches")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === "coaches" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
            For Life Coaches
          </button>
        </div>
      </div>

      {/* Parents Section */}
      <section id="parents" className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
            <p className="text-primary text-sm font-black mb-2 uppercase tracking-wider">For Parents</p>
            <h2 className="text-4xl font-black text-foreground mb-4">From Sign-Up to the Champion's Stage</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Your child's journey from enrolment all the way to winning quarterly rewards and standing on the convention stage — here's every step.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-primary/10 border border-primary/20 text-primary font-black px-4 py-2 rounded-xl text-sm">Connect</span>
              <span className="text-primary font-black text-lg">→</span>
              <span className="bg-primary/10 border border-primary/20 text-primary font-black px-4 py-2 rounded-xl text-sm">Enroll</span>
              <span className="text-primary font-black text-lg">→</span>
              <span className="bg-primary/10 border border-primary/20 text-primary font-black px-4 py-2 rounded-xl text-sm">Build</span>
            </div>
          </motion.div>

          <div>
            {parentSteps.map((s, i) => (
              <StepCard key={i} {...s} delay={i * 0.05} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-primary rounded-3xl p-8 text-center mt-4">
            <p className="text-white/80 text-lg mb-6">Ready to enrol your child? Start by finding the right coach.</p>
            <Link href="/coaches">
              <button className="bg-white text-primary px-8 py-3 rounded-2xl font-black hover:scale-105 transition-transform shadow-lg">
                Browse Coach Directory →
              </button>
            </Link>
            <p className="text-white/50 text-xs mt-4">Quarterly winners currently receive a cash reward. The program expands to fully funded trips to Disney World, Universal Studios and more once the Made Kids community reaches 5,000 active families — your membership is part of making that happen.</p>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-muted h-2" />

      {/* Coaches Section */}
      <section id="coaches" className="py-20 bg-secondary">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-14">
            <p className="text-primary text-sm font-black mb-2 uppercase tracking-wider">For Life Coaches & Mentors</p>
            <h2 className="text-4xl font-black text-white mb-4">Coach the Next Generation. Get Paid for It.</h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              Made Kids gives independent mentors and community leaders a full coaching toolkit — MK Box delivery, voice recording challenges, a live protege dashboard, and automated bank payouts — to coach the younger generation and get paid for it. Every coach is reviewed and approved by our team. Here's how it works.
            </p>
            <div className="flex flex-wrap gap-3">
              {["MK Box delivery", "Protege dashboard", "Voice recording system", "Direct bank payouts"].map(tool => (
                <span key={tool} className="bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">{tool}</span>
              ))}
            </div>
          </motion.div>

          <div>
            {coachSteps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex gap-5"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl shrink-0">
                    {s.icon}
                  </div>
                  {i < coachSteps.length - 1 && <div className="w-px flex-1 bg-white/10 mt-3" />}
                </div>
                <div className="pb-10">
                  <p className="text-primary text-xs font-black mb-1">{s.number}</p>
                  <h3 className="font-black text-white text-lg mb-2">{s.title}</h3>
                  <p className="text-white/60 leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Earnings example */}
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10">
            <h3 className="text-white font-black text-xl mb-6">What Could You Earn?</h3>
            <div className="space-y-4">
              {[
                { proteges: 10, label: "10 families", monthly: "$35/mo", yearly: "$350/yr" },
                { proteges: 50, label: "50 families", monthly: "$175/mo", yearly: "$1,750/yr" },
                { proteges: 200, label: "200 families", monthly: "$700/mo", yearly: "$7,000/yr" },
                { proteges: 1000, label: "1,000 families", monthly: "$3,500/mo", yearly: "$35,000/yr" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                  <p className="text-white font-semibold">{row.label}</p>
                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-primary font-black">{row.monthly}</p>
                      <p className="text-white/40 text-xs">monthly plans</p>
                    </div>
                    <div>
                      <p className="text-primary font-black">{row.yearly}</p>
                      <p className="text-white/40 text-xs">annual plans</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-4">Based on 70% of $5/month or $50/year per subscription.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <Link href="/coach/signup">
              <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl text-lg font-black transition-all hover:scale-105 shadow-xl">
                Join as a coach
              </button>
            </Link>
            <p className="text-white/40 text-sm mt-4">Free to join. Earnings start from your first referred subscription.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
