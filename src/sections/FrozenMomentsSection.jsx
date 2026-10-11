import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowLeft } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FrozenMomentsSection({ photos = [] }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [activePhoto, setActivePhoto] = useState(null);

  const galleryPhotos = photos.length > 0 ? photos.slice(0, 8) : [];

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = track.querySelectorAll('.frozen-card');
    const totalScroll = track.scrollWidth - window.innerWidth + 180;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          start: 'top top',
          end: () => `+=${totalScroll}`,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, {
        x: () => -totalScroll,
        ease: 'none',
      });

      // Card snap to focus as it passes center
      cards.forEach((card, index) => {
        const image = card.querySelector('.frozen-img');
        const badge = card.querySelector('.freeze-badge');

        ScrollTrigger.create({
          trigger: card,
          containerAnimation: tl,
          start: 'left center+=180',
          end: 'right center-=180',
          onEnter: () => snapIntoFocus(card, image, badge),
          onEnterBack: () => snapIntoFocus(card, image, badge),
          onLeave: () => resetBlur(card, image, badge, index),
          onLeaveBack: () => resetBlur(card, image, badge, index),
        });
      });
    }, section);

    function snapIntoFocus(card, img, badge) {
      if (!img) return;
      gsap.to(img, {
        filter: 'blur(0px) grayscale(0%)',
        scale: 1.04,
        rotation: 0,
        duration: 0.45,
        ease: 'power2.out',
      });
      if (badge) {
        gsap.to(badge, { opacity: 1, y: 0, duration: 0.3 });
      }
      card.classList.add('border-gold-glow');
    }

    function resetBlur(card, img, badge, index) {
      if (!img) return;
      const rot = index % 2 === 0 ? 3 : -3;
      gsap.to(img, {
        filter: 'blur(6px) grayscale(35%)',
        scale: 0.95,
        rotation: rot,
        duration: 0.45,
        ease: 'power2.out',
      });
      if (badge) {
        gsap.to(badge, { opacity: 0, y: 6, duration: 0.3 });
      }
      card.classList.remove('border-gold-glow');
    }

    return () => ctx.revert();
  }, [galleryPhotos]);

  return (
    <section
      id="frozen"
      ref={sectionRef}
      className="relative w-full h-screen bg-[#0B0A09] overflow-hidden flex flex-col justify-between py-6 sm:py-8 select-none"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] rounded-full bg-gold-500/10 blur-[150px] pointer-events-none" />

      {/* Top Header Row (Fixed height & distinct spacing) */}
      <div className="relative z-10 px-6 sm:px-12 lg:px-20 max-w-7xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-2.5 text-gold-400 mb-1 text-left">
          <span className="font-sans text-[10px] tracking-super-wide uppercase">
            CHAPTER 02 — SUSPENDED IN STILLNESS
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 text-left">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FDFBF7] font-light">
            Frozen Moments<span className="text-gold-400 font-serif italic">.</span>
          </h2>
          <p className="font-sans text-[11px] sm:text-xs text-ivory-300/70 max-w-md tracking-wide">
            Scroll horizontally. As each frame reaches the center axis, clarity snaps into sharp stillness.
          </p>
        </div>
      </div>

      {/* Horizontal Pinned Track — Calibrated Heights so it NEVER collides with bottom bar */}
      <div className="relative z-10 w-full overflow-hidden flex-1 min-h-0 flex items-center my-1">
        <div
          ref={trackRef}
          className="flex items-center gap-6 sm:gap-8 pl-6 sm:pl-16 pr-32 w-max"
        >
          {galleryPhotos.map((photo, idx) => {
            const rot = idx % 2 === 0 ? 3 : -3;
            const imgSrc = `/media/${photo.slug}.webp`;

            return (
              <div
                key={photo.id || idx}
                onClick={() => setActivePhoto(photo)}
                className="frozen-card relative w-[280px] sm:w-[340px] md:w-[380px] h-[360px] sm:h-[420px] max-h-[52vh] rounded-2xl overflow-hidden glass-panel border border-gold-500/20 transition-colors duration-500 flex flex-col justify-end p-5 sm:p-6 group cursor-pointer shrink-0 shadow-xl"
                data-cursor="FREEZE"
              >
                {/* Image Layer */}
                <div className="absolute inset-0 overflow-hidden bg-charcoal-950">
                  <img
                    src={imgSrc}
                    alt={photo.alt || photo.title}
                    className="frozen-img w-full h-full object-cover transition-transform duration-700 ease-out"
                    style={{
                      filter: 'blur(6px) grayscale(35%)',
                      transform: `scale(0.95) rotate(${rot}deg)`,
                    }}
                    loading="lazy"
                  />
                  {/* Dark gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/45 to-transparent opacity-90" />
                </div>

                {/* Snap Status Badge */}
                <div className="freeze-badge absolute top-4 right-4 z-20 opacity-0 transform translate-y-2 transition-all duration-300 bg-oxblood-900/85 border border-gold-400/50 px-2.5 py-1 rounded-full text-[9px] font-sans tracking-widest text-gold-300 flex items-center gap-1.5 shadow-gold-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-ping" />
                  <span>TIME FROZEN</span>
                </div>

                {/* Card Editorial Info (Pinned inside bottom glass pocket) */}
                <div className="relative z-20 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-[9px] tracking-super-wide text-gold-400 uppercase">
                      {photo.category}
                    </span>
                    <span className="text-ivory-300/40 text-[10px]">·</span>
                    <span className="font-sans text-[9px] tracking-widest text-ivory-300/60 uppercase">
                      {photo.location || 'South India'}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl text-ivory-100 font-normal leading-snug mb-1.5 group-hover:text-gold-200 transition-colors">
                    {photo.title}
                  </h3>

                  <p className="font-sans text-[10.5px] text-ivory-300/70 line-clamp-2 leading-relaxed mb-3">
                    {photo.story || photo.subtitle}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs font-sans tracking-widest text-gold-400/80 group-hover:text-gold-300 transition-colors">
                    <span className="text-[9.5px] uppercase">Inspect Frame</span>
                    <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Axis Bar (Distinct floating dock, zero overlap) */}
      <div className="relative z-20 px-6 sm:px-12 lg:px-20 max-w-7xl w-full mx-auto shrink-0 pb-1">
        <div className="bg-[#12100E]/85 backdrop-blur-md border border-gold-500/15 rounded-full px-5 py-2 flex items-center justify-between text-[10px] font-sans tracking-widest text-ivory-300/60 uppercase shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
            <span>Horizontal Axis Timeline</span>
          </div>
          <span>Drag or Scroll to Traverse Frames</span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-[#0A0505]/95 backdrop-blur-2xl flex items-center justify-center p-6 sm:p-12"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col md:flex-row rounded-2xl overflow-hidden glass-panel border border-gold-400/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-3/5 bg-charcoal-950 flex items-center justify-center p-4">
              <img
                src={`/media/${activePhoto.slug}.webp`}
                alt={activePhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="md:w-2/5 p-8 flex flex-col justify-between bg-charcoal-900/90 text-left">
              <div>
                <button
                  onClick={() => setActivePhoto(null)}
                  className="text-xs text-gold-400/70 hover:text-gold-200 uppercase tracking-widest mb-6 block"
                >
                  ✕ Close Frame
                </button>
                <span className="font-sans text-[10px] tracking-super-wide text-gold-400 uppercase block mb-1">
                  {activePhoto.category} · {activePhoto.date}
                </span>
                <h3 className="font-serif text-2xl text-ivory-50 font-normal mb-3">
                  {activePhoto.title}
                </h3>
                <p className="font-sans text-xs text-ivory-200/80 leading-relaxed mb-6">
                  {activePhoto.story}
                </p>
                <div className="border-t border-gold-500/20 pt-4 space-y-2 text-[11px] font-sans text-ivory-300/60">
                  <div>
                    <span className="text-gold-400 font-medium">Client: </span>
                    {activePhoto.client || 'Private Archive'}
                  </div>
                  <div>
                    <span className="text-gold-400 font-medium">Location: </span>
                    {activePhoto.location || 'South India'}
                  </div>
                </div>
              </div>

              <a
                href="#contact"
                onClick={() => setActivePhoto(null)}
                className="mt-8 text-center text-xs font-sans tracking-widest uppercase text-gold-200 bg-oxblood-800 hover:bg-oxblood-700 py-3 rounded-full border border-gold-500/40 transition-colors"
              >
                Inquire For Similar Shoot
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
