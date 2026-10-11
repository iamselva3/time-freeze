import React, { useState, useEffect } from 'react';
import { Play, Pause, Film, Volume2, VolumeX } from 'lucide-react';

const REEL_FRAMES = [
  {
    title: 'Sacred Vows in Morning Light',
    client: 'Divya & Arjun',
    location: 'Madurai Palace',
    time: '00:14',
    url: '/media/hero-timeless-vows?w=1200&fmt=webp',
  },
  {
    title: 'The Open Breeze Romance',
    client: 'Ananya & Rohit',
    location: 'Anamalai Foothills',
    time: '01:08',
    url: '/media/open-breeze-golden-light?w=1200&fmt=webp',
  },
  {
    title: 'Marigold Haldi Celebration',
    client: 'Nishanth & Nandha',
    location: 'Coimbatore',
    time: '02:35',
    url: '/media/haldi-stories-golden-joy?w=1200&fmt=webp',
  },
  {
    title: 'The Performer in Amber Stage Light',
    client: 'Classical Performer',
    location: 'Madurai Auditorium',
    time: '03:42',
    url: '/media/kick-of-being-performer?w=1200&fmt=webp',
  },
];

export default function CinemaReelSection({ content }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % REEL_FRAMES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const active = REEL_FRAMES[currentFrame];

  return (
    <section id="cinema" className="relative w-full min-h-screen bg-[#0B0A09] py-24 px-6 sm:px-12 lg:px-20 select-none flex flex-col justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full bg-gold-500/10 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-12 border-b border-gold-500/20 pb-6">
          <div>
            <div className="flex items-center gap-2.5 text-gold-400 mb-2">
              <Film size={13} />
              <span className="font-sans text-[10px] tracking-super-wide uppercase">
                CHAPTER 04 — MOTION HEIRLOOMS
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#FDFBF7] font-light">
              Stories that <span className="italic text-gold-gradient font-normal">breathe in 4K</span>.
            </h2>
          </div>
          <p className="font-sans text-xs text-ivory-300/70 max-w-sm tracking-wide">
            Still photography halts the tender second; our 4K cinema films preserve the rhythm of laughter, sacred chants, and the warmth of unspoken vows.
          </p>
        </div>

        {/* 2.39:1 Anamorphic Cinema Viewer */}
        <div
          className="relative w-full aspect-[16/9] sm:aspect-[2.39/1] rounded-2xl overflow-hidden glass-panel border border-gold-400/40 shadow-2xl group cursor-pointer"
          data-cursor={isPlaying ? 'PAUSE' : 'PLAY'}
          onClick={() => setIsPlaying((prev) => !prev)}
        >
          {/* Top & Bottom Film Sprocket Perforations */}
          <div className="absolute inset-x-0 top-0 h-6 bg-charcoal-950/90 z-20 flex items-center justify-between px-4 border-b border-gold-500/10">
            <div className="flex items-center gap-4">
              <span className="text-[8px] font-mono tracking-widest text-gold-400/60 uppercase">
                TIME FREEZE CINEMA ARCHIVE · 4K 24FPS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[8px] font-mono text-ivory-300/50">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>REC {active.time}</span>
            </div>
          </div>

          {/* Active Cinema Frame Slideshow */}
          <div className="absolute inset-0 bg-charcoal-950">
            {REEL_FRAMES.map((frame, idx) => (
              <img
                key={idx}
                src={frame.url}
                alt={frame.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  idx === currentFrame ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                style={{
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '1200ms',
                }}
              />
            ))}

            {/* Letterbox subtle cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-charcoal-950/60 opacity-80" />
          </div>

          {/* Center Play/Pause HUD overlay */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-gold-300/60 bg-charcoal-900/60 backdrop-blur-md flex items-center justify-center text-gold-300 group-hover:scale-110 transition-transform duration-300 shadow-gold-subtle">
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="translate-x-0.5" />}
            </div>
          </div>

          {/* Bottom Information Bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-transparent">
            <div>
              <span className="text-[9.5px] font-sans tracking-widest text-gold-400 uppercase block mb-1">
                {active.client} · {active.location}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-ivory-50 font-normal">
                {active.title}
              </h3>
            </div>

            {/* Frame pagination pips */}
            <div className="flex items-center gap-2">
              {REEL_FRAMES.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentFrame(i);
                  }}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === currentFrame ? 'w-8 bg-gold-300' : 'w-2 bg-gold-500/30'
                  }`}
                  aria-label={`Jump to frame ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
