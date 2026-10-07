import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function Join() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 40%, hsl(32 95% 53%), transparent 60%)" }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/">
            <div className="inline-flex items-center gap-2 cursor-pointer mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-black">MK</span>
              </div>
              <span className="text-white font-black text-xl">Made Kids</span>
            </div>
          </Link>
          <h1 className="text-4xl font-black text-white mb-3">Join Made Kids</h1>
          <p className="text-white/60 text-lg">How would you like to get started?</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/coaches">
              <div className="bg-card rounded-3xl p-8 shadow-2xl cursor-pointer border-2 border-transparent hover:border-primary/40 transition-all h-full">
                <div className="text-5xl mb-4">👨‍👩‍👧</div>
                <h2 className="text-2xl font-black text-foreground mb-3">I'm a Parent</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Made Kids is a referral-only community. To join, you need a personal referral link from a coach in your network.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-5">
                  <p className="text-xs text-foreground font-semibold mb-1">🔗 How to get started:</p>
                  <p className="text-xs text-muted-foreground">Browse our coach directory, find a coach whose approach fits your family, and ask them for their referral link.</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2 mb-6">
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Daily MK Box video insights</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Recite lesson learnt & Perform challenge</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Points, streaks & quarterly trip rewards</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> $5/month or $50/year</li>
                </ul>
                <div className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-2xl font-black text-center transition-colors">
                  Browse Coach Directory →
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/coach/signup">
              <div className="bg-card rounded-3xl p-8 shadow-2xl cursor-pointer border-2 border-transparent hover:border-primary/40 transition-all h-full">
                <div className="text-5xl mb-4">🏆</div>
                <h2 className="text-2xl font-black text-foreground mb-3">I'm a Coach</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Refer families to the platform and earn 70% of every membership fee. Upload daily video insights for your kid proteges.
                </p>
                <ul className="text-xs text-muted-foreground space-y-2 mb-6">
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Unique referral link to share</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Earn 70% of every membership fee</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> Upload daily insights for your proteges</li>
                  <li className="flex items-center gap-2"><span className="text-primary font-bold">✓</span> No membership payment required</li>
                </ul>
                <div className="w-full bg-secondary hover:bg-secondary/80 border border-white/20 text-white py-3 rounded-2xl font-black text-center transition-colors">
                  Register as Coach →
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <p className="text-center text-white/50 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login">
            <span className="text-primary font-semibold hover:underline cursor-pointer">Sign in here</span>
          </Link>
        </p>
      </motion.div>
      </div>
      <Footer />
    </div>
  );
}
