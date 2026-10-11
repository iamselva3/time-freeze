import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Sun, Heart, Archive } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PROCESS_STEPS = [
  {
    num: '01',
    lead: 'Share',
    accent: 'your heart.',
    icon: Calendar,
    title: 'The Consultation & Vision',
    description:
      'We meet over coffee in our Madurai lounge or through a video consultation to listen deeply to your story, family rituals, and the atmosphere you hold dear.',
    detail: 'Concept moodboard & ritual mapping included.',
  },
  {
    num: '02',
    lead: 'The Light &',
    accent: 'the timeline.',
    icon: Sun,
    title: 'Curating the Golden Hour',
    description:
      'We choreograph timing around soft natural morning light and dusk transitions, scouting architectural angles so your day flows unhurried and effortless.',
    detail: 'Full lighting blueprint coordinated with your planner.',
  },
  {
    num: '03',
    lead: 'Be in',
    accent: 'the moment.',
    icon: Heart,
    title: 'Unobtrusive Artistic Guidance',
    description:
      'During rituals and candids, we remain invisible observers. For portraits, our gentle guidance makes you forget the lens completely and simply laugh together.',
    detail: 'Zero stiff poses, 100% authentic connection.',
  },
  {
    num: '04',
    lead: 'Keep it',
    accent: 'for fifty years.',
    icon: Archive,
    title: 'The Archival Heirloom',
    description:
      'Within five days, your teaser preview arrives. Your complete signature color-graded gallery and handcrafted velvet leather album box arrive ready to relive across generations.',
    detail: 'Archival print box & high-res digital vault.',
  },
];

export default function ProcessSection({ content }) {
  const sectionRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const line = lineRef.current;
    if (!section || !line) return;

    const ctx = gsap.context(() => {
      // Animate drawing gold line down the timeline
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center+=100',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="relative w-full min-h-screen bg-[#0B0A09] py-16 sm:py-24 px-4 sm:px-12 lg:px-20 select-none overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[min(500px,90vw)] h-[min(500px,90vw)] rounded-full bg-gold-500/10 blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 text-gold-400 mb-2 sm:mb-3">
            <span className="font-sans text-[10px] tracking-super-wide uppercase">
              CHAPTER 06 — THE CRAFT
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-[#FDFBF7] font-light leading-tight">
            From first conversation to{' '}
            <span className="italic font-normal text-gold-gradient block sm:inline">
              heirloom treasure.
            </span>
          </h2>
          <p className="font-sans text-xs text-ivory-300/70 mt-3 sm:mt-4 tracking-wide leading-relaxed">
            Great photographs are born of trust and feeling completely at ease. Here is how we preserve your story, step by unhurried step.
          </p>
        </div>

        {/* Vertical Timeline with Drawing Gold Line */}
        <div className="relative py-4 sm:py-8">
          {/* Background track line */}
          <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-gold-500/15" />

          {/* Animated Gold Fill Line */}
          <div
            ref={lineRef}
            className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-gold-300 via-gold-500 to-oxblood-600 origin-top shadow-gold-subtle"
          />

          {/* Timeline Steps */}
          <div className="space-y-10 sm:space-y-24">
            {PROCESS_STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              const Icon = step.icon;

              return (
                <div
                  key={step.num}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Center Pip Node */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full glass-panel border border-gold-300/60 bg-charcoal-900 flex items-center justify-center z-10 shadow-gold-subtle">
                    <span className="font-serif text-[10px] sm:text-xs font-semibold text-gold-300">
                      {step.num}
                    </span>
                  </div>

                  {/* Step Card Content */}
                  <div
                    className={`pl-8 sm:pl-0 sm:w-1/2 w-full ${
                      isEven ? 'sm:pl-14 text-left' : 'sm:pr-14 sm:text-right'
                    }`}
                  >
                    <div className="glass-panel p-4 sm:p-8 rounded-2xl border border-gold-500/25 hover:border-gold-400/50 transition-colors duration-300 text-left">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <Icon size={13} className="text-gold-400" />
                        <span className="font-sans text-[9px] sm:text-[10px] tracking-super-wide text-gold-400 uppercase">
                          Step {step.num} · {step.title}
                        </span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-2xl text-ivory-50 font-normal mb-2 sm:mb-3">
                        {step.lead}{' '}
                        <span className="italic text-gold-gradient font-light">
                          {step.accent}
                        </span>
                      </h3>

                      <p className="font-sans text-[11.5px] sm:text-xs text-ivory-200/80 leading-relaxed mb-3 sm:mb-4">
                        {step.description}
                      </p>

                      <div className="border-t border-gold-500/15 pt-2 sm:pt-3">
                        <span className="font-sans text-[9.5px] sm:text-[10.5px] text-gold-400/80 italic">
                          {step.detail}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
