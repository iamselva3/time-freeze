import React, { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const heroSlides = [
  {
    id: 'muhurtham',
    src: '/brand/hero-cutout.png',
    fallback: '/media/hero-cutout.png',
    alt: 'Arjun & Divya in Sacred Muhurtham Golden Light',
    title: 'Sacred Muhurtham',
    couple: 'Arjun & Divya',
    archiveTag: 'SOUTH INDIAN HEIRLOOM ARCHIVES',
  },
  {
    id: 'heritage',
    src: '/brand/hero-cutout-2.png',
    fallback: '/media/hero-cutout-2.png',
    alt: 'Meenakshi in Royal Crimson & Gold Bridal Lehenga',
    title: 'Royal Bridal Heritage',
    couple: 'Meenakshi',
    archiveTag: 'ROYAL BRIDAL ARCHIVES',
  },
  {
    id: 'maternity',
    src: '/brand/hero-cutout-3.png',
    fallback: '/media/hero-cutout-3.png',
    alt: 'Rohan & Ananya in Cherished Sapphire Light',
    title: 'Cherished Beginnings',
    couple: 'Rohan & Ananya',
    archiveTag: 'FAMILY HEIRLOOM ARCHIVES',
  },
];

export default function HeroSection({ content, photos }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef(null);
  const touchCurrentX = useRef(null);
  const isMouseDown = useRef(false);

  // Natural smooth mouse parallax
  useEffect(() => {
    let animId;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 2;
      targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', onMouseMove);

    const lerp = (a, b, n) => a + (b - a) * n;
    const update = () => {
      currentX = lerp(currentX, targetX, 0.04);
      currentY = lerp(currentY, targetY, 0.04);
      setMousePos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(update);
    };
    update();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Slide navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Continuous Auto-Advance Timer: swipes every 5 seconds automatically
  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isDragging, currentSlide]);

  // Touch Swipe Handlers (Mobile & Tablet)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    const delta = touchCurrentX.current - touchStartX.current;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const delta = touchCurrentX.current - touchStartX.current;
      if (delta < -45) {
        nextSlide();
      } else if (delta > 45) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  // Mouse Drag Handlers (Desktop smooth swipe)
  const handleMouseDown = (e) => {
    isMouseDown.current = true;
    touchStartX.current = e.clientX;
    touchCurrentX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current || touchStartX.current === null) return;
    touchCurrentX.current = e.clientX;
    const delta = touchCurrentX.current - touchStartX.current;
    setDragOffset(delta);
  };

  const handleMouseUp = () => {
    if (isMouseDown.current && touchStartX.current !== null && touchCurrentX.current !== null) {
      const delta = touchCurrentX.current - touchStartX.current;
      if (delta < -45) {
        nextSlide();
      } else if (delta > 45) {
        prevSlide();
      }
    }
    isMouseDown.current = false;
    touchStartX.current = null;
    touchCurrentX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const heroData = content?.hero || {};
  const stats = heroData.stats || [
    { number: '240+', label: 'SACRED STORIES' },
    { number: '99%', label: 'HAPPY FAMILIES' },
    { number: '10+', label: 'YEARS OF CRAFT' },
    { number: '16+', label: 'CITIES ARCHIVED' },
  ];

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#0B0A09] select-none pt-20 sm:pt-24 lg:pt-16 pb-8 px-4 sm:px-12 lg:px-20"
      style={{
        background: 'linear-gradient(135deg, #090807 0%, #12100E 50%, #070605 100%)',
      }}
    >
      {/* Background Texture & Ambient Warm Gold Light */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />

      {/* Gentle Warm Gold Halo behind the subjects */}
      <div
        className="absolute rounded-full pointer-events-none blur-[140px] mix-blend-screen transition-opacity duration-700"
        style={{
          width: 'min(750px, 85vw)',
          height: 'min(750px, 85vw)',
          background: 'radial-gradient(circle, rgba(232, 197, 122, 0.20) 0%, rgba(180, 130, 80, 0.06) 50%, transparent 72%)',
          transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)`,
          right: '8%',
          top: '8%',
        }}
      />

      {/* Subtle Floating Golden Dust */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0)`,
        }}
      >
        {[
          { top: '22%', left: '16%', size: '3px', opacity: 0.6 },
          { top: '38%', left: '55%', size: '2px', opacity: 0.4 },
          { top: '65%', left: '22%', size: '3px', opacity: 0.5 },
          { top: '18%', left: '78%', size: '2px', opacity: 0.4 },
          { top: '78%', left: '68%', size: '3.5px', opacity: 0.6 },
        ].map((pt, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-gold-200 pointer-events-none animate-pulse-slow"
            style={{
              top: pt.top,
              left: pt.left,
              width: pt.size,
              height: pt.size,
              opacity: pt.opacity,
              boxShadow: '0 0 10px 1px #FCE095',
            }}
          />
        ))}
      </div>

      {/* ============================================================== */}
      {/* MAIN EDITORIAL HERO STAGE                                      */}
      {/* ============================================================== */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between">
        {/* Center Grid: Left Editorial Typography + Right Large Hero Portrait Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center flex-1 mt-0 sm:mt-1 mb-2">
          {/* Left Column: Timeless Editorial Typography (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left pointer-events-auto">
            <span className="font-sans text-[10px] tracking-super-wide text-gold-400/80 uppercase font-medium mb-2.5 sm:mb-3 block">
              {heroData.kicker || 'SACRED WEDDINGS & HEIRLOOM PORTRAITS'}
            </span>

            <h1
              className="font-serif font-light text-[#FDFBF7] tracking-wide leading-[1.08] mb-4 sm:mb-6"
              style={{ fontSize: 'clamp(2.1rem, 6.5vw, 4.4rem)' }}
            >
              {heroData.titleLine1 || 'TIME FREEZES.'}{' '}
              <span className="italic font-normal text-gold-gradient block sm:inline">
                {heroData.titleLine2Em || 'LOVE'}
              </span>{' '}
              {heroData.titleLine2Text || 'ENDURES.'}
            </h1>

            <p className="font-sans font-light text-xs sm:text-base text-ivory-200/80 leading-relaxed mb-6 sm:mb-8 max-w-lg">
              {heroData.description ||
                'Unposed elegance, painterly golden light, and heirloom photographs for the days you never want to let go.'}
            </p>

            {/* Primary Booking Call-To-Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-oxblood-800 to-oxblood-900 hover:from-oxblood-700 hover:to-oxblood-800 text-gold-100 font-sans text-xs tracking-widest uppercase px-6 sm:px-7 py-3.5 sm:py-4 rounded-full border border-gold-500/30 shadow-gold-subtle hover:shadow-gold-glow transition-all duration-300 group"
                data-cursor="BOOK"
              >
                <span>{heroData.ctaText || 'Reserve Your Shoot'}</span>
                <ArrowUpRight
                  size={14}
                  className="text-gold-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>

              <a
                href="#chapters"
                className="inline-flex items-center justify-center gap-2 glass-panel hover:bg-gold-500/10 text-gold-200 text-xs font-sans tracking-widest uppercase px-5 sm:px-6 py-3.5 sm:py-4 rounded-full border border-gold-500/20 hover:border-gold-400/40 transition-all duration-300"
              >
                <span>Explore Portfolios</span>
              </a>
            </div>

            {/* Photographer Byline */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gold-500/15 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gold-400 shrink-0" />
              <span className="font-sans text-[9.5px] sm:text-[10px] tracking-widest text-ivory-300/60 uppercase">
                Directed by Bhuvan · Principal Fine Art Photographer
              </span>
            </div>
          </div>

          {/* Right Column: LARGE, STATELY CUTOUT PORTRAITS WITH SMOOTH SWIPE & WORDS BEHIND (6 cols) */}
          <div
            className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[320px] sm:min-h-[480px] lg:min-h-[580px] pointer-events-auto cursor-grab active:cursor-grabbing my-3 lg:my-0"
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* AESTHETIC EDITORIAL WORDS BEHIND THE PHOTO (Creates Magazine Cover Depth) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
              style={{
                transform: `translate3d(${mousePos.x * 15}px, ${mousePos.y * 10}px, 0)`,
              }}
            >
              <span
                className="font-serif text-[13vw] sm:text-[14vw] lg:text-[11vw] font-light tracking-[0.08em] sm:tracking-[0.16em] uppercase whitespace-nowrap leading-none select-none transition-all duration-700"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(246, 227, 176, 0.16) 0%, rgba(232, 197, 122, 0.08) 50%, rgba(255, 255, 255, 0.01) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TIME FREEZE
              </span>
              <span className="font-sans text-[8px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.45em] text-gold-400/30 uppercase mt-0 sm:-mt-4 transition-opacity duration-700">
                {heroSlides[currentSlide].archiveTag}
              </span>
            </div>

            {/* Portrait Stage Container with Crossfade & Parallax Slide */}
            <div className="relative z-10 w-full max-w-[320px] sm:max-w-[480px] lg:max-w-[600px] h-[320px] sm:h-[480px] lg:h-[600px] flex items-center justify-center pointer-events-none select-none">
              {heroSlides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                const isLeft = (currentSlide - 1 + heroSlides.length) % heroSlides.length === idx;

                let offsetCss = 'translate3d(0, 0, 0)';
                if (isActive) {
                  const dragFactor = isDragging ? dragOffset * 0.35 : 0;
                  offsetCss = `translate3d(${mousePos.x * -18 + dragFactor}px, ${mousePos.y * -8}px, 0)`;
                } else if (isLeft) {
                  offsetCss = 'translate3d(-35px, 0, 0)';
                } else {
                  offsetCss = 'translate3d(35px, 0, 0)';
                }

                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive
                        ? 'opacity-100 scale-100 z-10'
                        : 'opacity-0 scale-[0.96] z-0 pointer-events-none'
                    }`}
                    style={{ transform: offsetCss }}
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="w-full h-auto object-contain max-h-[50vh] sm:max-h-[72vh] lg:max-h-[78vh] transition-all duration-700 pointer-events-none"
                      style={{
                        filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.45))',
                      }}
                      loading="eager"
                      fetchPriority={isActive ? 'high' : 'low'}
                      draggable="false"
                      onError={(e) => {
                        if (slide.fallback && e.target.src !== window.location.origin + slide.fallback) {
                          e.target.src = slide.fallback;
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Floating Luxury Prev/Next Chevrons */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between z-20 pointer-events-none px-1 sm:px-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className="pointer-events-auto w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-gold-500/20 border border-gold-500/25 hover:border-gold-400/60 flex items-center justify-center text-gold-300 hover:text-gold-100 transition-all duration-300 active:scale-95 shadow-lg backdrop-blur-md group"
                aria-label="Previous Portrait"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className="pointer-events-auto w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-gold-500/20 border border-gold-500/25 hover:border-gold-400/60 flex items-center justify-center text-gold-300 hover:text-gold-100 transition-all duration-300 active:scale-95 shadow-lg backdrop-blur-md group"
                aria-label="Next Portrait"
              >
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Bottom Swipe Indicators & Editorial Capsule */}
            <div className="relative z-20 mt-2 sm:mt-5 flex flex-col items-center gap-1.5 sm:gap-2 pointer-events-auto">
              <style>{`
                @keyframes heroProgressFill {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>

              {/* Pagination Pills with 5-second auto-swipe progress bar */}
              <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-gold-500/25 shadow-lg">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(i);
                    }}
                    aria-label={`View ${slide.title}`}
                    className={`h-1.5 sm:h-2 rounded-full relative overflow-hidden transition-all duration-300 ${
                      i === currentSlide
                        ? 'w-8 sm:w-10 bg-gold-950/60 border border-gold-400/40'
                        : 'w-1.5 sm:w-2 bg-gold-400/25 hover:bg-gold-400/50'
                    }`}
                  >
                    {i === currentSlide && (
                      <span
                        key={`bar-${currentSlide}`}
                        className="absolute inset-0 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-200 rounded-full"
                        style={{
                          animation: 'heroProgressFill 5000ms linear forwards',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Minimalist Slide Meta */}
              <div className="flex items-center gap-2 text-[9px] sm:text-[10px] tracking-widest uppercase text-ivory-300/60 font-sans">
                <span className="text-gold-400 font-medium">0{currentSlide + 1} / 0{heroSlides.length}</span>
                <span>·</span>
                <span className="text-ivory-200 tracking-wider font-light">{heroSlides[currentSlide].title}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM METADATA & STATS STRIP                                  */}
        {/* ============================================================== */}
        <div className="pt-5 sm:pt-6 border-t border-gold-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 mt-4 sm:mt-6">
          {/* Stats Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-10">
            {stats.map((st, i) => (
              <div key={i} className="flex flex-col text-left">
                <span className="font-serif text-xl sm:text-2xl lg:text-3xl text-gold-gradient font-medium">
                  {st.number}
                </span>
                <span className="font-sans text-[8.5px] sm:text-[9px] tracking-super-wide text-ivory-300/60 uppercase mt-0.5">
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          {/* South Indian Heritage Note */}
          <div className="text-left sm:text-right">
            <span className="font-serif italic text-[11px] sm:text-xs text-ivory-300/70 block">
              "Honest stories, unhurried light, and photographs that feel like home."
            </span>
            <span className="font-sans text-[8.5px] sm:text-[9px] tracking-widest text-gold-400 uppercase font-semibold block mt-1">
              EST. 2016 — TIME FREEZE STUDIO
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

