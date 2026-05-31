import { useState, useEffect } from 'react';
import { Menu, X, Zap, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-4 px-4 pointer-events-none transition-all duration-500 ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>

      {/* ── Gradient-border wrapper ───────────────────────────────────── */}
      <div
        className="pointer-events-auto w-full max-w-[800px] rounded-2xl transition-all duration-500"
        style={{
          padding: '1px',
          background: scrolled
            ? 'linear-gradient(135deg, rgba(239,108,62,0.65) 0%, rgba(235,214,204,0.9) 40%, rgba(15,118,110,0.5) 100%)'
            : 'linear-gradient(135deg, rgba(239,108,62,0.35) 0%, rgba(235,214,204,0.7) 45%, rgba(235,214,204,0.5) 100%)',
          boxShadow: scrolled
            ? '0 16px 48px -12px rgba(89,45,22,0.26), 0 4px 16px -4px rgba(239,108,62,0.15)'
            : '0 8px 32px -8px rgba(89,45,22,0.14)',
        }}
      >
        <nav
          className="flex items-center justify-between gap-4 rounded-[calc(1rem-1px)] px-3 py-2 transition-all duration-500"
          style={{
            background: scrolled ? 'rgba(255,247,242,0.96)' : 'rgba(255,247,242,0.80)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]"
              style={{
                background: 'linear-gradient(135deg, #f07c4c 0%, #d35a2f 100%)',
                boxShadow: '0 4px 14px rgba(239,108,62,0.48), inset 0 1px 0 rgba(255,255,255,0.22)',
              }}
            >
              <Zap className="h-4 w-4 text-white" fill="currentColor" />
            </div>
            <span
              className="text-[15px] font-bold tracking-tight"
              style={{ fontFamily: 'Sora, sans-serif', color: '#2a2127' }}
            >
              Zenflow
            </span>


          </a>

          {/* Center nav links */}
          <ul className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onMouseEnter={() => setHovered(link.label)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative block rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                  style={{
                    color: hovered === link.label ? '#2a2127' : '#75636f',
                    background: hovered === link.label ? 'rgba(239,108,62,0.09)' : 'transparent',
                  }}
                >
                  {link.label}
                  {/* Bottom accent line on hover */}
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[#ef6c3e] transition-all duration-200"
                    style={{ width: hovered === link.label ? '60%' : '0%', opacity: hovered === link.label ? 1 : 0 }}
                  />
                </a>
              </li>
            ))}
          </ul>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <a
              href="#"
              className="px-3.5 py-2 text-sm font-semibold text-[#75636f] hover:text-[#2a2127] rounded-xl hover:bg-[#ffe6d8]/60 transition-all duration-200"
            >
              Sign in
            </a>
            <a href="#pricing" className="nav-cta-btn">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl hover:bg-[#ffe6d8]/70 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X className="h-4 w-4 text-[#2a2127]" />
              : <Menu className="h-4 w-4 text-[#2a2127]" />
            }
          </button>
        </nav>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="pointer-events-auto mt-2 w-full max-w-[800px] rounded-2xl border border-[#ebd6cc] overflow-hidden"
          style={{
            background: 'rgba(255,247,242,0.97)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 16px 48px -12px rgba(89,45,22,0.24)',
          }}
        >
          <ul className="px-2 pt-2 pb-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-[#75636f] hover:bg-[#ffe6d8]/60 hover:text-[#2a2127] transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="px-3 pb-3 pt-1 flex flex-col gap-2">
            <a href="#" className="btn-secondary text-center text-sm py-2.5">Sign in</a>
            <a href="#pricing" className="btn-primary text-center text-sm py-2.5">Get started free</a>
          </div>
        </div>
      )}
    </header>
  );
}
