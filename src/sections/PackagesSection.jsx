import React, { useRef, useState } from 'react';
import { Check, ArrowUpRight, Crown } from 'lucide-react';

function TiltCard({ pkg, isFeatured }) {
  const cardRef = useRef(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const onMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -9;
    const rY = ((x - centerX) / centerX) * 9;

    setRotX(rX);
    setRotY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const onMouseLeave = () => {
    setRotX(0);
    setRotY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || window.innerWidth < 768);

  const whatsappMessage = encodeURIComponent(
    `Hello Time Freeze Studio! I would like to inquire about the "${pkg.title}" package (${pkg.price}).`
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={isTouch ? undefined : onMouseMove}
      onMouseLeave={isTouch ? undefined : onMouseLeave}
      className={`relative rounded-3xl p-6 sm:p-10 transition-transform duration-200 ease-out flex flex-col justify-between ${
        isFeatured
          ? 'glass-panel-deep border-2 border-gold-400/60 shadow-oxblood-deep'
          : 'glass-panel border border-gold-500/25'
      }`}
      style={
        isTouch
          ? undefined
          : {
              transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }
      }
      data-cursor="TILT"
    >
      {/* Glare Sheen Reflection */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 245, 214, 0.45) 0%, transparent 60%)`,
          opacity: glarePos.opacity,
        }}
      />

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-300 text-charcoal-950 font-sans text-[10px] font-semibold tracking-widest-luxury uppercase px-4 py-1 rounded-full shadow-gold-subtle flex items-center gap-1.5">
          <Crown size={11} />
          <span>SIGNATURE CURATION</span>
        </div>
      )}

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-[10px] tracking-super-wide text-gold-400 uppercase">
            {pkg.eyebrow}
          </span>
          <span className="font-sans text-[10.5px] text-ivory-300/60 tracking-wider">
            {pkg.period}
          </span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl text-ivory-50 font-normal mb-3">
          {pkg.title}
        </h3>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-serif text-3xl sm:text-4xl text-gold-gradient font-medium">
            {pkg.price}
          </span>
          <span className="font-sans text-[11px] text-ivory-300/60">starting curation</span>
        </div>

        <p className="font-sans text-xs text-ivory-200/80 leading-relaxed mb-6">
          {pkg.text}
        </p>

        {/* Feature List */}
        <div className="border-t border-gold-500/20 pt-6 space-y-3.5">
          {pkg.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs font-sans text-ivory-200/90 font-light">
              <Check size={14} className="text-gold-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Action Button */}
      <div className="mt-8 pt-6 border-t border-gold-500/15">
        <a
          href={`https://wa.me/919025299312?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className={`w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-xs font-sans tracking-widest uppercase transition-all duration-300 ${
            isFeatured
              ? 'bg-gradient-to-r from-oxblood-700 to-oxblood-900 hover:from-oxblood-600 hover:to-oxblood-800 text-gold-100 border border-gold-400/50 shadow-gold-subtle'
              : 'bg-charcoal-800 hover:bg-oxblood-900 text-gold-200 border border-gold-500/30'
          }`}
        >
          <span>{pkg.action || 'Reserve Collection'}</span>
          <ArrowUpRight size={13} className="text-gold-300" />
        </a>
      </div>
    </div>
  );
}

export default function PackagesSection({ content }) {
  const pkgs = content?.packages || {};
  const packageList = pkgs.packages || [
    {
      eyebrow: 'THE INTIMATE SESSION',
      title: 'Milestone & Maternity',
      price: '₹35,000',
      period: 'Half-Day Session',
      text: 'Designed for maternity portraits, newborn milestones, cake smashes, and intimate couple editorial sessions.',
      items: [
        'Up to 3 hours of daylight studio or outdoor location coverage',
        'One bespoke styled concept and moodboard consultation',
        '35 hand-retouched signature fine-art digital portraits',
        'Private high-resolution online gallery with download access',
        'Full personal printing & heirloom rights',
      ],
      action: 'Inquire for Milestone Shoot',
      featured: false,
    },
    {
      eyebrow: 'THE SIGNATURE HEIRLOOM',
      title: 'The Wedding Story',
      price: '₹1,45,000',
      period: 'Full Day Wedding & Muhurtham',
      text: 'Our most coveted curation for wedding days, sacred muhurthams, and evening reception celebrations.',
      items: [
        'Dual senior lead photography team (candid + traditional craft)',
        'Full-day coverage from dawn rituals to evening celebrations',
        'Teaser highlight preview gallery delivered within 5 days',
        '350+ signature color-graded high-resolution photographs',
        'Handmade 12x18 archival leather-bound velvet album (40 pages)',
        'Pre-wedding couple shoot included complimentary',
      ],
      action: 'Reserve Your Wedding Date',
      featured: true,
    },
    {
      eyebrow: 'THE GRAND DESTINATION',
      title: 'Two-Day Celebration & Cinema',
      price: '₹2,65,000',
      period: 'Multi-Day Complete Coverage',
      text: 'For destination weddings, multi-ceremony celebrations (Haldi, Sangeet, Muhurtham, Reception) with 4K cinema films.',
      items: [
        'Complete multi-shooter photo & 4K cinema team across 2 full days',
        'Cinematic 4K wedding teaser film + 20-minute feature narrative',
        'Drone aerial cinematography (subject to venue permission)',
        'Two archival master albums + two miniature parents albums',
        'Raw archival footage vault delivered on dedicated SSD',
      ],
      action: 'Inquire for Destination Wedding',
      featured: false,
    },
  ];

  return (
    <section id="packages" className="relative w-full min-h-screen bg-[#0E0D0C] py-16 sm:py-28 px-4 sm:px-12 lg:px-20 select-none overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[min(500px,90vw)] h-[min(500px,90vw)] rounded-full bg-gold-500/10 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2.5 text-gold-400 mb-3">
            <span className="font-sans text-[10px] tracking-super-wide uppercase">
              {pkgs.eyebrow || 'INVESTMENT & CURATIONS — 07'}
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FDFBF7] font-light leading-tight">
            {pkgs.headingLead || 'Thoughtful collections for'}{' '}
            <span className="italic font-normal text-gold-gradient block sm:inline">
              {pkgs.headingAccent || 'lasting memories.'}
            </span>
          </h2>
          <p className="font-sans text-xs text-ivory-300/70 mt-4 tracking-wide leading-relaxed">
            {pkgs.subtitle ||
              'Every celebration has its own cadence and style. Here are our starting curations; we tailor final coverage to your unique plans.'}
          </p>
        </div>

        {/* 3D Stacked Tilt Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 items-stretch">
          {packageList.map((pkg, idx) => (
            <TiltCard key={idx} pkg={pkg} isFeatured={pkg.featured} />
          ))}
        </div>

        {/* Note */}
        <div className="text-center mt-12 text-[11px] font-sans text-ivory-300/50">
          All collections include color correction, high-resolution downloads, and a private online client gallery.
        </div>
      </div>
    </section>
  );
}
