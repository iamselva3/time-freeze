import React from 'react';
import { ArrowRight, Quote } from 'lucide-react';

export default function StorySection({ content }) {
  const story = content?.story || {};

  return (
    <section id="story" className="relative w-full min-h-screen bg-[#0E0D0C] py-28 px-6 sm:px-12 lg:px-20 select-none flex items-center">
      {/* Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gold-500/10 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="flex items-center gap-2.5 text-gold-400 mb-4">
          <span className="font-sans text-[10px] tracking-super-wide uppercase">
            {story.eyebrow || 'OUR PHILOSOPHY — CHAPTER 05'}
          </span>
        </div>

        {/* Split Layout: Portrait Left / Narrative Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Photographer Portrait Card (5 cols) */}
          <div className="lg:col-span-5 relative group">
            {/* Ambient Gold Halo */}
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-oxblood-700/40 via-gold-500/20 to-transparent blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative rounded-2xl overflow-hidden glass-panel border border-gold-400/40 aspect-[4/5] shadow-2xl">
              {/* Portrait Image (Using Soulful Heritage Portrait or Artist Photo) */}
              <img
                src="/media/ancient-madurai-heritage-portrait?w=800&fmt=webp"
                alt="Bhuvan, Founder of Time Freeze"
                className="w-full h-full object-cover filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-1000 ease-out"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />

              {/* Brass Plate Signature Tag */}
              <div className="absolute bottom-6 inset-x-6 z-10 glass-panel border border-gold-400/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg text-ivory-100 font-medium">
                    Bhuvan
                  </h4>
                  <span className="font-sans text-[9px] tracking-super-wide text-gold-400 uppercase">
                    Founder & Principal Artist
                  </span>
                </div>
                <div className="font-serif text-xs italic text-gold-300/80">
                  @bhuvan.official
                </div>
              </div>
            </div>
          </div>

          {/* Right: Narrative Philosophy (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FDFBF7] font-light leading-tight mb-8">
              {story.titleLead || 'Life happens in the'}{' '}
              <span className="italic font-normal text-gold-gradient block sm:inline">
                {story.titleAccent || 'unspoken second.'}
              </span>
            </h2>

            <div className="space-y-6 text-ivory-200/80 font-sans text-sm sm:text-base leading-relaxed font-light max-w-2xl">
              <p>
                {story.paragraph1 ||
                  'A shy glance across a bustling mandap, the sudden quiet tear when sacred vows are spoken, the breathless laughter before flower petals settle on the stone. These are not scripted poses — they are the sacred fragments of your family history.'}
              </p>
              <p>
                {story.paragraph2 ||
                  'At Time Freeze, we do not force stiff posture or artificial smiles. We step back as quiet, intuitive observers, working with ambient directional South Indian sunlight and deep, painterly tones so your grandchildren feel the warmth of today fifty years from now.'}
              </p>
            </div>

            {/* Quote Strip */}
            <div className="mt-8 pt-8 border-t border-gold-500/20 flex items-start gap-4">
              <Quote size={28} className="text-gold-400/50 shrink-0 mt-1" />
              <p className="font-serif italic text-base sm:text-lg text-gold-200/90 font-light leading-snug">
                “Photography is the only art that halts the passage of time without altering the truth.”
              </p>
            </div>

            {/* Gold Counter Strip */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gold-500/20">
              <div>
                <span className="font-serif text-3xl text-gold-gradient block font-normal">
                  10+
                </span>
                <span className="font-sans text-[9px] tracking-super-wide text-ivory-300/60 uppercase">
                  Years of Craft
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl text-gold-gradient block font-normal">
                  240+
                </span>
                <span className="font-sans text-[9px] tracking-super-wide text-ivory-300/60 uppercase">
                  Weddings Preserved
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl text-gold-gradient block font-normal">
                  99%
                </span>
                <span className="font-sans text-[9px] tracking-super-wide text-ivory-300/60 uppercase">
                  Returning Families
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl text-gold-gradient block font-normal">
                  16+
                </span>
                <span className="font-sans text-[9px] tracking-super-wide text-ivory-300/60 uppercase">
                  Cities Visited
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
