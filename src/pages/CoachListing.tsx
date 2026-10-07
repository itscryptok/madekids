import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CoachCard = {
  id: number;
  displayName: string;
  slug: string;
  bio: string | null;
  profileTitle: string | null;
  location: string | null;
  yearsExperience: number | null;
  specialties: string | null;
  profilePictureUrl: string | null;
  contactEmail: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  website: string | null;
  avgRating: number;
  reviewCount: number;
  protegeCount: number;
};

function Avatar({ coach }: { coach: CoachCard }) {
  if (coach.profilePictureUrl) {
    return (
      <img
        src={coach.profilePictureUrl}
        alt={coach.displayName}
        className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
      />
    );
  }
  return (
    <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
      <span className="text-primary font-black text-3xl">{coach.displayName.charAt(0)}</span>
    </div>
  );
}

function ContactIcons({ coach }: { coach: CoachCard }) {
  const items = [
    coach.contactEmail && { href: `mailto:${coach.contactEmail}`, label: "Email", icon: "✉️" },
    coach.instagramHandle && { href: `https://instagram.com/${coach.instagramHandle.replace(/^@/, "")}`, label: "Instagram", icon: "📸" },
    coach.whatsappNumber && { href: `https://wa.me/${coach.whatsappNumber.replace(/\D/g, "")}`, label: "WhatsApp", icon: "💬" },
    coach.website && { href: coach.website.startsWith("http") ? coach.website : `https://${coach.website}`, label: "Website", icon: "🌐" },
  ].filter(Boolean) as { href: string; label: string; icon: string }[];

  if (items.length === 0) return (
    <p className="text-xs text-muted-foreground text-center py-1">No contact info yet — view profile for details</p>
  );
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {items.map(item => (
        <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
          title={item.label}
          className="flex items-center gap-1.5 bg-muted hover:bg-primary/10 border border-border hover:border-primary/30 text-foreground hover:text-primary px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
          <span>{item.icon}</span> {item.label}
        </a>
      ))}
    </div>
  );
}

export default function CoachListing() {
  const [coaches, setCoaches] = useState<CoachCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/coaches`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setCoaches(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = coaches.filter(c => {
    const q = search.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(q) ||
      (c.profileTitle ?? "").toLowerCase().includes(q) ||
      (c.location ?? "").toLowerCase().includes(q) ||
      (c.specialties ?? "").toLowerCase().includes(q) ||
      (c.bio ?? "").toLowerCase().includes(q)
    );
  });

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
            <Link href="/login"><button className="text-white/80 hover:text-white text-sm font-semibold transition-colors">Sign In</button></Link>
            <Link href="/coach/signup"><button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Become a Coach</button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 pb-12 bg-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm font-semibold">Certified Made-Kids Coaches</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-4">Connect with a Coach</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              Every Made-Kids coach is an independent life mentor who guides children through their daily insights and challenges. Browse profiles, reach out directly via their contact details, and request their personal referral link to join. Coaches are ranked by rating and popularity.
            </p>
            <div className="max-w-md mx-auto">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, location, or specialty…"
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Listing */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-foreground font-bold text-xl">No coaches found</p>
              <p className="text-muted-foreground mt-2">{search ? "Try a different search term." : "No approved coaches yet. Check back soon."}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((coach, i) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-3xl p-6 flex flex-col hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar coach={coach} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-foreground text-lg leading-tight">{coach.displayName}</h3>
                      {coach.profileTitle && <p className="text-primary text-sm font-semibold mt-0.5 truncate">{coach.profileTitle}</p>}
                      {coach.location && <p className="text-muted-foreground text-xs mt-0.5">📍 {coach.location}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {coach.yearsExperience && (
                      <div className="inline-flex items-center gap-1 bg-primary/5 border border-primary/10 rounded-full px-3 py-1">
                        <span className="text-primary text-xs font-bold">{coach.yearsExperience} yrs</span>
                      </div>
                    )}
                    {coach.avgRating > 0 && (
                      <div className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">{coach.avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-xs">({coach.reviewCount})</span>
                      </div>
                    )}
                    {coach.protegeCount > 0 && (
                      <div className="inline-flex items-center gap-1 bg-muted border border-border rounded-full px-3 py-1">
                        <span className="text-xs">👧</span>
                        <span className="text-muted-foreground text-xs font-semibold">{coach.protegeCount} {coach.protegeCount === 1 ? "protege" : "proteges"}</span>
                      </div>
                    )}
                  </div>

                  {coach.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-3">{coach.bio}</p>
                  )}

                  {coach.specialties && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {coach.specialties.split(",").map(s => s.trim()).filter(Boolean).slice(0, 4).map(s => (
                        <span key={s} className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 space-y-3">
                    <ContactIcons coach={coach} />
                    <Link href={`/coaches/${coach.slug}`}>
                      <button className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl font-bold text-sm transition-all">
                        View Full Profile →
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Become a Coach CTA */}
      <section className="py-16 bg-secondary">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-white/50 text-sm mb-3">Want to coach on Made Kids?</p>
          <h2 className="text-3xl font-black text-white mb-4">Become a Life Coach & Mentor</h2>
          <p className="text-white/60 mb-6">Earn 70% of every membership from parents you refer. Guide kids, upload daily insights, and build your network.</p>
          <Link href="/coach/signup">
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:scale-105">
              Join as a coach
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
