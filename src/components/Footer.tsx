import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-white/10 py-10 px-6 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">MK</span>
            </div>
            <span className="text-white font-black text-lg">Made Kids</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <a href="mailto:support@madekidsmk.com" className="hover:text-white transition-colors">
              support@madekidsmk.com
            </a>
            <Link href="/terms">
              <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            </Link>
            <Link href="/privacy">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/how-it-works">
              <span className="hover:text-white transition-colors cursor-pointer">How It Works</span>
            </Link>
            <Link href="/coaches">
              <span className="hover:text-white transition-colors cursor-pointer">Connect with a Coach</span>
            </Link>
            <Link href="/coach/signup">
              <span className="hover:text-white transition-colors cursor-pointer">Become a Coach</span>
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 mt-6 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Made Kids. All rights reserved. Building exceptional minds, one day at a time.
          <span className="mx-2">·</span>
          A product of{" "}
          <a href="https://cryptok.online" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 underline underline-offset-2 transition-colors">
            Cryp Tok Solutions
          </a>
        </div>
        <div className="mt-3 text-center text-xs text-white/30 max-w-2xl mx-auto leading-relaxed">
          Quarterly winners currently receive a cash reward. When the Made Kids community reaches 5,000 active families, the reward program expands to fully funded trips to destinations like Disney World and Universal Studios — your membership helps us get there.
        </div>
      </div>
    </footer>
  );
}
