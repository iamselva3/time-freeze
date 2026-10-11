import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
  {
    quote:
      'Time Freeze made our wedding day in Madurai feel like an unhurried dream. When we opened our heirloom gallery, we could literally hear the temple bells and feel the joyful tears all over again. Pure, quiet magic.',
    name: 'DIVYA & ARJUN',
    location: 'MADURAI HERITAGE PALACE',
    occasion: 'Sacred Muhurtham',
    bg: '/media/hero-timeless-vows?w=1200&fmt=webp',
  },
  {
    quote:
      'Bhuvan and his team have this supernatural ability to become invisible during the emotional moments. Our sunset session felt completely natural, zero stiff poses, just real us in golden light.',
    name: 'ANANYA & ROHIT',
    location: 'ANAMALAI FOOTHILLS',
    occasion: 'Pre-Wedding Celebration',
    bg: '/media/open-breeze-golden-light?w=1200&fmt=webp',
  },
  {
    quote:
      'From our maternity shoot to little Athvitha’s first birthday, Time Freeze is our family’s forever storyteller. The craft and respect they bring to traditional rituals is unmatched.',
    name: 'POOJA & VIKRAM',
    location: 'CHENNAI & MADURAI',
    occasion: 'Maternity & First Birthday',
    bg: '/media/and-baby-makes-three?w=1200&fmt=webp',
  },
];

export default function ReviewsSection({ content }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const active = REVIEWS[currentIndex];

  const prev = () => setCurrentIndex((c) => (c - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setCurrentIndex((c) => (c + 1) % REVIEWS.length);

  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] bg-[#0E0707] py-16 sm:py-24 px-4 sm:px-12 lg:px-20 overflow-hidden flex items-center justify-center select-none">
      {/* Background Blurred Image with slow zoom */}
      <div className="absolute inset-0 overflow-hidden">
        {REVIEWS.map((rev, i) => (
          <img
            key={i}
            src={rev.bg}
            alt={rev.name}
            className={`absolute inset-0 w-full h-full object-cover filter blur-[24px] brightness-[0.25] transition-opacity duration-1000 ease-in-out ${
              i === currentIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-[#0E0707]/80" />
        <div className="absolute inset-0 bg-noise opacity-40" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2.5 text-gold-400 mb-4 sm:mb-6">
          <span className="font-sans text-[10px] tracking-super-wide uppercase">
            HEARTFELT WORDS · CLIENT STORIES
          </span>
        </div>

        {/* Big subtle gold quote symbol */}
        <Quote size={36} className="mx-auto text-gold-400/25 mb-3 sm:mb-4 sm:w-14 sm:h-14" />

        {/* Crossfading Quote text */}
        <div className="min-h-[120px] sm:min-h-[160px] flex items-center justify-center px-2">
          <p className="font-serif text-lg sm:text-2xl md:text-3xl font-light text-ivory-50 leading-relaxed italic transition-all duration-700">
            “{active.quote}”
          </p>
        </div>

        {/* Client Author Info */}
        <div className="mt-8 transition-all duration-500">
          <h4 className="font-sans text-xs tracking-super-wide text-gold-300 uppercase font-semibold">
            {active.name}
          </h4>
          <span className="font-sans text-[10px] tracking-widest text-ivory-300/60 uppercase block mt-1">
            {active.occasion} · {active.location}
          </span>
        </div>

        {/* Navigation Arrows & Pagination */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full border border-gold-500/30 hover:border-gold-300 bg-charcoal-900/60 backdrop-blur-md flex items-center justify-center text-gold-400 hover:text-gold-200 transition-colors"
            aria-label="Previous Review"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentIndex ? 'w-6 bg-gold-300' : 'w-1.5 bg-gold-500/30'
                }`}
                aria-label={`Jump to review ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 rounded-full border border-gold-500/30 hover:border-gold-300 bg-charcoal-900/60 backdrop-blur-md flex items-center justify-center text-gold-400 hover:text-gold-200 transition-colors"
            aria-label="Next Review"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
