import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function SplashScreen({ onComplete, forcePlay = false }) {
  const containerRef = useRef(null);
  const badgeRef = useRef(null);
  const monogramRef = useRef(null);
  const textRef = useRef(null);
  const auraRef = useRef(null);
  const lineRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    // Check session storage if not forced
    if (!forcePlay && typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('tf_splash_seen');
      if (seen === 'true') {
        onComplete();
        return;
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sessionStorage.setItem('tf_splash_seen', 'true');
      onComplete();
      return;
    }

    // Preload hero assets in background
    ['/brand/hero-cutout.png', '/brand/logo-badge.png', '/media/hero-timeless-vows.webp'].forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const container = containerRef.current;
    const badge = badgeRef.current;
    const monogram = monogramRef.current;
    const text = textRef.current;
    const aura = auraRef.current;
    const line = lineRef.current;

    // Master Calm & Meditative GSAP Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('tf_splash_seen', 'true');
        onComplete();
      },
    });
    timelineRef.current = tl;

    // Initial silent state
    tl.set(container, { opacity: 1 })
      .set(aura, { scale: 0.6, opacity: 0 })
      .set(badge, { scale: 0.94, opacity: 0 })
      .set(monogram, { opacity: 0, y: 10 })
      .set(line, { scaleX: 0, opacity: 0 })
      .set(text, { opacity: 0, y: 12 });

    // 1. Soft ambient breathing aura emerges calmly (0.8s)
    tl.to(aura, {
      opacity: 0.45,
      scale: 1.1,
      duration: 1.4,
      ease: 'power2.out',
    });

    // 2. The maroon circular badge and gold monogram fade in gently (1.2s)
    tl.to(
      badge,
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
      },
      '-=1.0'
    );

    tl.to(
      monogram,
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power2.out',
      },
      '-=0.9'
    );

    // 3. Delicate horizontal gold hairline draws open (0.6s)
    tl.to(line, {
      scaleX: 1,
      opacity: 0.7,
      duration: 0.8,
      ease: 'power2.inOut',
    }, '-=0.4');

    // 4. "TIME FREEZE" and tagline reveal quietly (0.8s)
    tl.to(
      text,
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
      },
      '-=0.5'
    );

    // 5. Meditative hold in still beauty (~1.2s)
    tl.to({}, { duration: 1.2 });

    // 6. Smooth, calm dissolve into the hero scene (0.9s)
    tl.to(
      [badge, text, line],
      {
        opacity: 0,
        y: -10,
        duration: 0.8,
        ease: 'power2.in',
      }
    );

    tl.to(
      container,
      {
        opacity: 0,
        duration: 0.7,
        ease: 'power2.inOut',
      },
      '-=0.4'
    );

    return () => {
      tl.kill();
    };
  }, [forcePlay, onComplete]);

  const handleSkip = () => {
    if (timelineRef.current) {
      timelineRef.current.progress(1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0A09] overflow-hidden select-none"
    >
      {/* Background Film Grain */}
      <div className="absolute inset-0 bg-noise pointer-events-none opacity-30" />

      {/* Gentle Breathing Warm Amber Aura */}
      <div
        ref={auraRef}
        className="absolute w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full pointer-events-none blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(232, 197, 122, 0.3) 0%, rgba(122, 0, 0, 0.25) 50%, transparent 75%)',
        }}
      />

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 z-50 text-[10.5px] font-sans tracking-widest text-gold-400/60 hover:text-gold-200 border border-gold-500/20 hover:border-gold-400/50 px-4 py-2 rounded-full backdrop-blur-md bg-charcoal-900/40 transition-all duration-300"
      >
        SKIP INTRO ✕
      </button>

      {/* Center Calm Composition */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center max-w-sm sm:max-w-md p-6">
        {/* Maroon Circular Badge with Gold Trim */}
        <div
          ref={badgeRef}
          className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-2 mb-6 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 45% 40%, #8A0404 0%, #630202 55%, #350101 100%)',
            boxShadow: '0 0 50px rgba(122, 0, 0, 0.45), inset 0 0 25px rgba(0, 0, 0, 0.6)',
            border: '1.5px solid rgba(232, 197, 122, 0.55)',
          }}
        >
          {/* Inner hairline ring */}
          <div className="absolute inset-2 rounded-full border border-gold-400/25 pointer-events-none" />

          {/* Gold TF Monogram */}
          <div ref={monogramRef} className="w-16 sm:w-20 h-auto flex items-center justify-center">
            <img
              src="/brand/logo-gold-monogram.png"
              alt="Time Freeze Monogram"
              className="w-full h-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>

        {/* Delicate Golden Hairline */}
        <div ref={lineRef} className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400/70 to-transparent mb-5" />

        {/* Quiet Display Wordmark */}
        <div ref={textRef} className="space-y-1.5">
          <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-widest-luxury text-gold-gradient">
            TIME FREEZE
          </h1>
          <p className="font-sans text-[9.5px] sm:text-[10px] tracking-super-wide text-ivory-200/70 uppercase">
            A moment held perfectly still
          </p>
        </div>
      </div>
    </div>
  );
}
