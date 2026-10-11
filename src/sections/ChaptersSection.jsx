import React, { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

const CHAPTERS = [
  {
    id: 'Weddings',
    num: '01',
    title: 'Sacred Weddings',
    tagline: 'Muhurthams, Heirloom Silks & Pure Vows',
    description:
      'From temple rituals at sunrise in Madurai to evening palace receptions, we preserve the unspoken romance and sacred weight of South Indian vows.',
    coverSlug: 'hero-timeless-vows',
    count: '240+ Stories',
  },
  {
    id: 'Baby & Kids',
    num: '02',
    title: 'Baby & Milestones',
    tagline: 'Maternity Serenity & Pure Wonder',
    description:
      'Gentle daylight maternity silhouettes and the joyful milestones of childhood. A safe, unhurried space where genuine innocence is preserved forever.',
    coverSlug: 'and-baby-makes-three',
    count: '120+ Milestones',
  },
  {
    id: 'Candid & Moments',
    num: '03',
    title: 'Candid & Heritage',
    tagline: 'Street Poetry & Soulful Portraits',
    description:
      'The quiet wisdom in ancient courtyards, dynamic stage performers in golden light, and authentic human character captured without artifice.',
    coverSlug: 'madurai-solitude-wisdom',
    count: '80+ Archives',
  },
];

export default function ChaptersSection({ photos = [] }) {
  const [activeHover, setActiveHover] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(null);

  // Lock body scroll when archival modal is open
  React.useEffect(() => {
    if (selectedChapter) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedChapter]);

  const getPhotosForChapter = (catId) => {
    return photos.filter((p) => {
      if (catId === 'Weddings') return p.category === 'Weddings';
      if (catId === 'Baby & Kids') return p.category === 'Baby & Kids';
      return p.category === 'Candid & Moments' || p.category === 'Heritage & Portraits';
    });
  };

  return (
    <section id="chapters" className="relative w-full min-h-screen bg-[#0E0D0C] py-24 px-6 sm:px-12 lg:px-20 select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 text-left">
        <div className="flex items-center gap-2.5 text-gold-400 mb-3">
          <span className="font-sans text-[10px] tracking-super-wide uppercase">
            CHAPTER 03 — PORTFOLIO REALMS
          </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-gold-500/20 pb-6">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FDFBF7] font-light">
            Three Realms of Memory<span className="text-gold-400 italic">.</span>
          </h2>
          <span className="font-sans text-xs text-ivory-300/60 uppercase tracking-widest">
            Interactive Chapter Accordion — Tap or Hover to Expand
          </span>
        </div>
      </div>

      {/* Interactive 3-Panel Accordion */}
      <div className="max-w-7xl mx-auto h-[560px] sm:h-[620px] flex flex-col lg:flex-row gap-4 sm:gap-6">
        {CHAPTERS.map((chap, idx) => {
          const isExpanded = activeHover === idx;
          const chapterPhotos = getPhotosForChapter(chap.id);
          const coverImgSrc = `/media/${chap.coverSlug}.webp`;

          return (
            <div
              key={chap.id}
              onMouseEnter={() => setActiveHover(idx)}
              onClick={() => setSelectedChapter(chap)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between p-8 sm:p-10 border border-gold-500/25 ${
                isExpanded ? 'lg:flex-[2.4] shadow-2xl border-gold-400/60' : 'lg:flex-1 opacity-85 lg:opacity-75'
              }`}
              data-cursor="EXPAND"
            >
              {/* Background Cover Image */}
              <div className="absolute inset-0 bg-charcoal-950">
                <img
                  src={coverImgSrc}
                  alt={chap.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    isExpanded ? 'scale-105 filter brightness-85' : 'scale-100 filter brightness-60'
                  }`}
                  loading="lazy"
                />
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-[#0B0A09]/50 to-transparent" />
              </div>

              {/* Top Chapter Tag & Counter */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl sm:text-3xl text-gold-300 font-light">
                    {chap.num}
                  </span>
                  <div className="w-[1px] h-5 bg-gold-400/40" />
                  <span className="font-sans text-[10px] tracking-widest text-ivory-200/80 uppercase">
                    {chap.count}
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full border border-gold-400/40 bg-charcoal-900/60 backdrop-blur-md flex items-center justify-center text-gold-300 group-hover:scale-110 transition-transform">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 text-left">
                <span className="font-sans text-[10px] tracking-super-wide uppercase text-gold-400 block mb-1">
                  {chap.tagline}
                </span>

                <h3 className="font-serif text-2xl sm:text-4xl text-[#FFFBF5] font-normal mb-3">
                  {chap.title}
                </h3>

                <p
                  className={`font-sans text-xs text-ivory-200/80 leading-relaxed max-w-lg transition-all duration-500 ${
                    isExpanded ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
                >
                  {chap.description}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-sans tracking-widest text-gold-300 uppercase">
                  <span>Open Full Gallery ({chapterPhotos.length} Frames)</span>
                  <ArrowUpRight size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Immersive Chapter Lightbox Gallery Modal with Guaranteed Smooth Scroll */}
      {selectedChapter && (
        <div
          className="fixed inset-0 z-50 bg-[#0B0A09]/98 backdrop-blur-3xl overflow-y-auto"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={() => setSelectedChapter(null)}
        >
          <div
            className="min-h-full max-w-7xl mx-auto p-6 sm:p-12 lg:p-16 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between border-b border-gold-500/20 pb-6 mb-8 text-left">
              <div>
                <span className="font-sans text-[10px] tracking-super-wide text-gold-400 uppercase">
                  CHAPTER {selectedChapter.num} — ARCHIVAL GALLERY
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-ivory-100 font-light mt-1">
                  {selectedChapter.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedChapter(null)}
                className="flex items-center gap-2 text-xs font-sans tracking-widest text-gold-300 border border-gold-400/40 px-5 py-2.5 rounded-full hover:bg-gold-500/10 transition-colors"
              >
                <X size={15} />
                <span>RETURN TO CHAPTERS</span>
              </button>
            </div>

            {/* Responsive Gallery Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 my-6">
              {getPhotosForChapter(selectedChapter.id).map((photo, i) => (
                <div
                  key={photo.id || i}
                  className="group relative rounded-xl overflow-hidden glass-panel border border-gold-500/20 aspect-[4/5] flex flex-col justify-end p-6"
                >
                  <img
                    src={`/media/${photo.slug}.webp`}
                    alt={photo.alt || photo.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent opacity-85" />

                  <div className="relative z-10 text-left">
                    <span className="font-sans text-[9px] tracking-super-wide text-gold-400 uppercase block">
                      {photo.location} · {photo.date}
                    </span>
                    <h4 className="font-serif text-xl text-ivory-100 font-normal mt-1 mb-1">
                      {photo.title}
                    </h4>
                    <p className="font-sans text-[11px] text-ivory-300/70 line-clamp-2">
                      {photo.story}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer inside modal */}
            <div className="w-full pt-10 pb-6 text-center">
              <a
                href="#contact"
                onClick={() => setSelectedChapter(null)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-oxblood-800 to-oxblood-900 hover:from-oxblood-700 hover:to-oxblood-800 text-gold-100 text-xs font-sans tracking-widest uppercase px-8 py-3.5 rounded-full border border-gold-400/40 shadow-lg"
              >
                <span>Inquire About {selectedChapter.title} Coverage</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
