import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Phone, MapPin } from 'lucide-react';

const InstagramIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const CHAPTERS = [
  { id: 'hero', num: '01', title: 'Beginning' },
  { id: 'frozen', num: '02', title: 'Frozen Moments' },
  { id: 'chapters', num: '03', title: 'Portfolios' },
  { id: 'cinema', num: '04', title: 'Cinema Reel' },
  { id: 'story', num: '05', title: 'Philosophy' },
  { id: 'process', num: '06', title: 'Artisan Process' },
  { id: 'packages', num: '07', title: 'Curations' },
  { id: 'contact', num: '08', title: 'The Studio' },
];

export default function Navigation({ activeSection = 'hero' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const activeChapterObj = CHAPTERS.find((c) => c.id === activeSection) || CHAPTERS[0];

  return (
    <>
      {/* 1. Header Navigation Bar (Transforms to sleek floating dock on scroll) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out pointer-events-none w-full max-w-full overflow-hidden ${
          scrolled ? 'py-2.5 px-3 sm:px-8' : 'py-3.5 sm:py-5 px-3.5 sm:px-12'
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto w-full flex items-center justify-between transition-all duration-500 ${
            scrolled
              ? 'max-w-4xl rounded-full bg-[#0E0D0C]/90 backdrop-blur-2xl border border-gold-600/20 px-3.5 sm:px-6 py-2 shadow-[0_16px_45px_rgba(0,0,0,0.95)]'
              : 'max-w-7xl border border-transparent'
          }`}
        >
          {/* Brand Logo & Monogram */}
          <a
            href="#hero"
            className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105"
            aria-label="Time Freeze Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden p-0.5 border border-gold-500/20 bg-[#141211] shadow-gold-subtle group-hover:border-gold-400/40 transition-colors">
              <img
                src="/brand/logo-badge.png"
                alt="TF Logo"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-xs sm:text-sm tracking-widest-luxury text-gold-300 font-medium">
                TIME FREEZE
              </span>
              <span className="font-sans text-[8px] tracking-super-wide text-ivory-300/60 uppercase">
                Fine Art Studio
              </span>
            </div>
          </a>

          {/* Center Chapter Indicator (Appears when scrolled) */}
          <div
            className={`hidden md:flex items-center gap-2 text-[10px] font-sans tracking-widest uppercase transition-opacity duration-300 ${
              scrolled ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-gold-400 font-semibold">{activeChapterObj.num}</span>
            <span className="text-gold-500/40">·</span>
            <span className="text-ivory-200/80">{activeChapterObj.title}</span>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-sans tracking-widest text-gold-200 bg-gradient-to-r from-oxblood-800 to-oxblood-900 hover:from-oxblood-700 hover:to-oxblood-800 border border-gold-600/30 hover:border-gold-500/50 px-3.5 py-1.5 rounded-full backdrop-blur-md transition-all shadow-sm"
            >
              <span>Book Shoot</span>
              <ArrowUpRight size={12} className="text-gold-400" />
            </a>

            {/* "Menu" Pill Button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="group flex items-center gap-2 text-[11px] font-sans tracking-widest uppercase text-gold-200 bg-[#141211]/90 hover:bg-oxblood-950 border border-gold-600/30 hover:border-gold-500/50 px-3.5 sm:px-4 py-1.5 rounded-full backdrop-blur-md transition-all"
              aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
            >
              <span className="font-medium text-[10.5px]">
                {menuOpen ? 'Close' : 'Menu'}
              </span>
              {menuOpen ? (
                <X size={13} className="text-gold-300 rotate-90 transition-transform" />
              ) : (
                <Menu size={13} className="text-gold-400 group-hover:text-gold-200" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Slim Vertical Chapter Indicator (Desktop Right Side — smoothly reveals ONLY after scrolling past hero) */}
      <aside
        className={`fixed right-6 sm:right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3.5 pointer-events-none select-none transition-all duration-500 ${
          scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
        }`}
      >
        <div className="text-[9px] font-sans tracking-widest text-gold-400/50 uppercase rotate-90 mb-2">
          Chapter
        </div>
        <div className="w-[1px] h-10 bg-gold-500/20" />
        <div className="flex flex-col gap-2.5">
          {CHAPTERS.map((ch) => {
            const isActive = activeSection === ch.id;
            return (
              <a
                key={ch.id}
                href={`#${ch.id}`}
                className="pointer-events-auto group relative flex items-center justify-end py-1"
                aria-label={`Jump to ${ch.title}`}
              >
                <span className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-[9.5px] font-sans tracking-widest text-gold-200 bg-[#141211]/95 border border-gold-500/30 px-2 py-0.5 rounded whitespace-nowrap shadow-md">
                  {ch.num} — {ch.title}
                </span>
                <span
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'w-2 h-2 bg-gold-300 shadow-gold-glow scale-125'
                      : 'w-1.5 h-1.5 bg-gold-500/30 group-hover:bg-gold-400'
                  }`}
                />
              </a>
            );
          })}
        </div>
        <div className="w-[1px] h-10 bg-gold-500/20" />
      </aside>

      {/* 3. Full-Screen Maroon Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 bg-[#120202]/95 backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between p-5 sm:p-14 lg:p-20 overflow-y-auto overflow-x-hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[min(500px,100vw)] h-[min(500px,100vw)] rounded-full bg-oxblood-600/20 blur-[140px] pointer-events-none overflow-hidden" />

        {/* Top bar inside menu */}
        <div className="relative z-10 flex items-center justify-between border-b border-gold-500/20 pb-4 sm:pb-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img src="/brand/logo-badge.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <span className="font-serif text-base sm:text-lg tracking-widest-luxury text-gold-300">
              TIME FREEZE
            </span>
          </div>
          <button
            onClick={closeMenu}
            className="text-[11px] sm:text-xs font-sans tracking-widest text-gold-400/80 hover:text-gold-200 border border-gold-500/30 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full"
          >
            CLOSE ✕
          </button>
        </div>

        {/* Navigation Chapters */}
        <nav className="relative z-10 py-6 sm:py-14 my-auto">
          <ul className="flex flex-col gap-3 sm:gap-6 max-w-4xl">
            {CHAPTERS.map((item) => (
              <li key={item.id} className="group overflow-hidden">
                <a
                  href={`#${item.id}`}
                  onClick={closeMenu}
                  className="flex items-baseline gap-3 sm:gap-8 transition-transform duration-500 group-hover:translate-x-3"
                >
                  <span className="font-sans text-[11px] sm:text-sm text-gold-500/60 tracking-widest">
                    {item.num}
                  </span>
                  <span className="font-serif text-2xl sm:text-5xl lg:text-6xl font-light text-ivory-100 group-hover:text-gold-gradient transition-all duration-300">
                    {item.title}
                  </span>
                  <ArrowUpRight
                    size={22}
                    className="opacity-0 group-hover:opacity-100 text-gold-400 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0"
                  />
                </a>
                <div className="w-full h-[1px] bg-gradient-to-r from-gold-500/30 via-oxblood-700 to-transparent mt-3" />
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Studio Details */}
        <div className="relative z-10 border-t border-gold-500/20 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-ivory-200/70 font-sans tracking-wider text-left">
          <div className="flex flex-col gap-1.5">
            <span className="text-gold-400 font-medium tracking-widest uppercase text-[10px]">Direct Desk</span>
            <a href="tel:+919025299312" className="hover:text-gold-300 transition-colors">
              +91 90252 99312
            </a>
            <a
              href="https://wa.me/919025299312?text=Hello%20Time%20Freeze%20Studio,%20I%20would%20like%20to%20inquire%20about%20a%20photography%20shoot."
              target="_blank"
              rel="noreferrer"
              className="text-gold-400 hover:text-gold-200 flex items-center gap-1.5"
            >
              <span>WhatsApp Inquiry</span>
              <ArrowUpRight size={11} />
            </a>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-gold-400 font-medium tracking-widest uppercase text-[10px]">Studio Locations</span>
            <span>Heritage Palace Enclave, Madurai</span>
            <span>Race Course Road, Coimbatore</span>
          </div>

          <div className="flex flex-col gap-1.5 sm:items-end">
            <span className="text-gold-400 font-medium tracking-widest uppercase text-[10px]">Portfolio Vault</span>
            <a
              href="https://instagram.com/time_freeze__"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-300 flex items-center gap-1"
            >
              <InstagramIcon size={12} />
              <span>@time_freeze__</span>
            </a>
            <a href="/admin" className="text-gold-500/40 hover:text-gold-400 transition-colors text-[10px] mt-2">
              Studio Admin CMS →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
