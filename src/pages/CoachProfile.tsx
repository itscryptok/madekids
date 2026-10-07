import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CoachPublic = {
  id: number;
  displayName: string;
  slug: string;
  bio: string | null;
  profileTitle: string | null;
  location: string | null;
  yearsExperience: number | null;
  experience: string | null;
  lifeTake: string | null;
  specialties: string | null;
  profilePictureUrl: string | null;
  referralCode: string;
  contactEmail: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  website: string | null;
};

function ContactSection({ coach }: { coach: CoachPublic }) {
  const links = [
    coach.contactEmail && {
      label: "Email",
      icon: "✉️",
      href: `mailto:${coach.contactEmail}`,
      display: coach.contactEmail,
    },
    coach.instagramHandle && {
      label: "Instagram",
      icon: "📸",
      href: `https://instagram.com/${coach.instagramHandle.replace(/^@/, "")}`,
      display: `@${coach.instagramHandle.replace(/^@/, "")}`,
    },
    coach.whatsappNumber && {
      label: "WhatsApp",
      icon: "💬",
      href: `https://wa.me/${coach.whatsappNumber.replace(/\D/g, "")}`,
      display: coach.whatsappNumber,
    },
    coach.website && {
      label: "Website",
      icon: "🌐",
      href: coach.website.startsWith("http") ? coach.website : `https://${coach.website}`,
      display: coach.website.replace(/^https?:\/\//, ""),
    },
  ].filter(Boolean) as { label: string; icon: string; href: string; display: string }[];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="bg-card border border-border rounded-3xl p-8">
      <h2 className="text-2xl font-black text-foreground mb-2">Get in Touch with {coach.displayName}</h2>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Made Kids is a referral-only platform. Reach out to {coach.displayName} directly through the channels below — once they've agreed to mentor your child, ask them for their personal referral link to create your account.
      </p>

      {links.length > 0 ? (
        <div className="space-y-3 mb-6">
          {links.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-muted hover:bg-muted/70 border border-border rounded-2xl px-5 py-4 transition-all group">
              <span className="text-2xl">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{link.label}</p>
                <p className="text-foreground font-bold text-sm truncate group-hover:text-primary transition-colors">{link.display}</p>
              </div>
              <span className="text-muted-foreground group-hover:text-primary transition-colors text-lg">→</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-muted border border-border rounded-2xl p-5 mb-6 text-center">
          <p className="text-muted-foreground text-sm">
            {coach.displayName} hasn't added public contact details yet. Try searching for them on social media or ask someone in your network who knows them.
          </p>
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-foreground leading-relaxed">
        <span className="font-bold">Important:</span> Our coaches are independent operators who use the Made Kids platform tools. We are not responsible for the conduct or advice of any individual coach. Please do your own research and only register through a coach you personally trust.
      </div>
    </motion.div>
  );
}

export default function CoachProfile({ slug }: { slug: string }) {
  const [coach, setCoach] = useState<CoachPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/coaches/${slug}/public`)
      .then(async r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const d = await r.json();
        setCoach(d);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

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
            <Link href="/coaches"><button className="text-white/80 hover:text-white text-sm font-semibold transition-colors">← All Coaches</button></Link>
            <Link href="/login"><button className="border border-white/20 text-white/80 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Sign In</button></Link>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notFound ? (
          <div className="text-center py-32">
            <p className="text-5xl mb-4">😕</p>
            <h1 className="text-2xl font-black text-foreground mb-3">Coach not found</h1>
            <p className="text-muted-foreground mb-6">This coach profile doesn't exist or hasn't been approved yet.</p>
            <Link href="/coaches"><button className="bg-primary text-white px-6 py-3 rounded-xl font-bold">Browse Coaches</button></Link>
          </div>
        ) : coach ? (
          <>
            {/* Profile Hero */}
            <section className="bg-secondary py-16">
              <div className="max-w-4xl mx-auto px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {coach.profilePictureUrl ? (
                      <img src={coach.profilePictureUrl} alt={coach.displayName}
                        className="w-36 h-36 rounded-3xl object-cover border-4 border-primary/20 shadow-2xl" />
                    ) : (
                      <div className="w-36 h-36 rounded-3xl bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                        <span className="text-primary font-black text-6xl">{coach.displayName.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-black text-white mb-1">{coach.displayName}</h1>
                    {coach.profileTitle && <p className="text-primary font-semibold text-lg mb-3">{coach.profileTitle}</p>}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                      {coach.location && <span className="text-white/60 text-sm">📍 {coach.location}</span>}
                      {coach.yearsExperience && <span className="text-white/60 text-sm">⭐ {coach.yearsExperience} years experience</span>}
                    </div>
                    {coach.bio && <p className="text-white/70 leading-relaxed mb-6">{coach.bio}</p>}
                    {coach.specialties && (
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                        {coach.specialties.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                          <span key={s} className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full font-medium">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-xl px-4 py-3">
                      <span className="text-lg">🔗</span>
                      <p className="text-white/80 text-sm">To join, contact {coach.displayName} and ask for their referral link.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Profile Detail */}
            <section className="py-16">
              <div className="max-w-4xl mx-auto px-6 space-y-10">
                {coach.experience && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h2 className="text-2xl font-black text-foreground mb-4">Experience</h2>
                    <div className="bg-card border border-border rounded-3xl p-6">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{coach.experience}</p>
                    </div>
                  </motion.div>
                )}

                {coach.lifeTake && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h2 className="text-2xl font-black text-foreground mb-4">Philosophy on Life</h2>
                    <div className="bg-card border border-border rounded-3xl p-6 border-l-4 border-l-primary">
                      <p className="text-muted-foreground leading-relaxed italic whitespace-pre-line">"{coach.lifeTake}"</p>
                    </div>
                  </motion.div>
                )}

                <ContactSection coach={coach} />
              </div>
            </section>
          </>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
