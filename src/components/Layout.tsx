import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "⬡" },
  { href: "/mk-box", label: "MK Box", icon: "▶" },
  { href: "/progress", label: "Progress", icon: "★" },
  { href: "/leaderboard", label: "Rankings", icon: "◆" },
  { href: "/rewards", label: "Rewards", icon: "✦" },
  { href: "/parent-zone", label: "Parent Zone", icon: "🔐" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const isAdmin = (user as any)?.role === "admin";
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
  const token = localStorage.getItem("mk_token");
  const [coachSlug, setCoachSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch(`${BASE}/api/coaches/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.coach?.slug) setCoachSlug(d.coach.slug); })
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-secondary shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">MK</span>
              </div>
              <span className="text-white font-black text-lg tracking-tight hidden sm:block">Made Kids</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  location.startsWith(item.href)
                    ? "bg-primary text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
            {coachSlug && (
              <Link href={`/coach/${coachSlug}`}>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  location.startsWith("/coach")
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-primary/10"
                }`}>
                  Coach ★
                </span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  location.startsWith("/admin")
                    ? "bg-primary text-white"
                    : "text-primary hover:bg-primary/10"
                }`}>
                  Admin ◆
                </span>
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/account">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 bg-primary/20 hover:bg-primary/30 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-white font-black text-sm">{user?.name?.[0] ?? "U"}</span>
                </div>
                <span className="text-white/70 text-sm hidden sm:block group-hover:text-white transition-colors">{user?.name?.split(" ")[0]}</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="text-white/40 hover:text-white text-sm font-medium transition-colors">
              Sign out
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex items-center justify-around bg-secondary/90 border-t border-white/10 pb-1 px-2 overflow-x-auto gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center py-1.5 px-2 rounded-lg cursor-pointer shrink-0 ${
                location.startsWith(item.href) ? "text-primary" : "text-white/50"
              }`}>
                <span className="text-base">{item.icon}</span>
                <span className="text-xs mt-0.5 whitespace-nowrap">{item.label}</span>
              </div>
            </Link>
          ))}
          {coachSlug && (
            <Link href={`/coach/${coachSlug}`}>
              <div className={`flex flex-col items-center py-1.5 px-2 rounded-lg cursor-pointer shrink-0 ${
                location.startsWith("/coach") ? "text-primary" : "text-primary/60"
              }`}>
                <span className="text-base">★</span>
                <span className="text-xs mt-0.5">Coach</span>
              </div>
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin">
              <div className={`flex flex-col items-center py-1.5 px-2 rounded-lg cursor-pointer shrink-0 ${
                location.startsWith("/admin") ? "text-primary" : "text-primary/60"
              }`}>
                <span className="text-base">◆</span>
                <span className="text-xs mt-0.5">Admin</span>
              </div>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
