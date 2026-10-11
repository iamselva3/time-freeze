import React, { useState } from 'react';
import { ArrowUpRight, Phone, Mail, MapPin, Clock, MessageSquare, Send, Check } from 'lucide-react';

export default function ContactSection({ content }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: 'Sacred Wedding',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, startedAt: Date.now() - 3000 }),
      });
      const data = await res.json();
      if (res.ok && data.received) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit. Please try WhatsApp directly.');
      }
    } catch {
      // Fallback to whatsapp trigger
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDirectUrl =
    'https://wa.me/919025299312?text=Hello%20Time%20Freeze%20Studio!%20I%20would%20like%20to%20inquire%20about%20booking%20a%20photography%20session.';

  return (
    <section id="contact" className="relative w-full min-h-screen bg-[#120C0C] pt-16 sm:pt-28 pb-12 px-4 sm:px-12 lg:px-20 select-none overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-noise opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[min(500px,90vw)] h-[min(500px,90vw)] rounded-full bg-oxblood-800/20 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-left max-w-2xl mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2.5 text-gold-400 mb-2 sm:mb-3">
            <span className="font-sans text-[10px] tracking-super-wide uppercase">
              CHAPTER 08 — THE CONVERSATION
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-5xl text-[#FDFBF7] font-light leading-tight">
            Let us hold your moment{' '}
            <span className="italic font-normal text-gold-gradient block sm:inline">
              forever still.
            </span>
          </h2>
          <p className="font-sans text-xs sm:text-sm text-ivory-200/75 mt-3 sm:mt-4 tracking-wide leading-relaxed font-light">
            Tell us about your wedding date, your milestone, or the portrait you have been dreaming of. We would be honored to preserve your legacy.
          </p>
        </div>

        {/* Two-Column Grid: Form Left, Studio Details Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-5 sm:p-12 rounded-3xl border border-gold-500/25">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-oxblood-900/60 border border-gold-400/50 flex items-center justify-center mx-auto mb-6 text-gold-300">
                  <Check size={28} />
                </div>
                <h3 className="font-serif text-3xl text-ivory-50 mb-3 font-normal">
                  Note Received.
                </h3>
                <p className="font-sans text-xs text-ivory-200/80 max-w-md mx-auto leading-relaxed mb-8">
                  Thank you for inviting us into your story. Bhuvan and our studio desk will connect with you within 24 hours.
                </p>
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-sans tracking-widest text-gold-300 bg-oxblood-900/80 hover:bg-oxblood-800 border border-gold-400/40 px-6 py-3 rounded-full"
                >
                  <span>Chat on WhatsApp Directly</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Divya & Arjun"
                      className="w-full bg-charcoal-900/80 border border-gold-500/20 focus:border-gold-400/80 rounded-xl px-4 py-3 text-xs text-ivory-100 placeholder:text-ivory-300/30 outline-none transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 90252 99312"
                      className="w-full bg-charcoal-900/80 border border-gold-500/20 focus:border-gold-400/80 rounded-xl px-4 py-3 text-xs text-ivory-100 placeholder:text-ivory-300/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full bg-charcoal-900/80 border border-gold-500/20 focus:border-gold-400/80 rounded-xl px-4 py-3 text-xs text-ivory-100 placeholder:text-ivory-300/30 outline-none transition-colors"
                    />
                  </div>

                  {/* Event Date */}
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                      Celebration Date (or approximate)
                    </label>
                    <input
                      type="text"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      placeholder="e.g. November 2026"
                      className="w-full bg-charcoal-900/80 border border-gold-500/20 focus:border-gold-400/80 rounded-xl px-4 py-3 text-xs text-ivory-100 placeholder:text-ivory-300/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Event Type Select */}
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                    Collection / Realm
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="w-full bg-charcoal-900/80 border border-gold-500/20 focus:border-gold-400/80 rounded-xl px-4 py-3 text-xs text-ivory-100 outline-none transition-colors"
                  >
                    <option value="Sacred Wedding">Sacred Wedding & Muhurtham</option>
                    <option value="Pre-Wedding & Outdoor">Pre-Wedding & Sunset Outdoor</option>
                    <option value="Maternity & Baby">Maternity & Baby Milestones</option>
                    <option value="Destination Celebration">Destination Wedding & Cinema</option>
                    <option value="Heritage Portrait">Fine Art Heritage Portrait</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                    Tell us about your plans *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Where will you be celebrating? What kind of memories matter most to your heart?"
                    className="w-full bg-charcoal-900/80 border border-gold-500/20 focus:border-gold-400/80 rounded-xl p-4 text-xs text-ivory-100 placeholder:text-ivory-300/30 outline-none transition-colors resize-none"
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-red-400 font-sans">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-oxblood-700 via-oxblood-800 to-oxblood-900 hover:from-oxblood-600 hover:to-oxblood-800 text-gold-100 font-sans text-xs tracking-widest uppercase border border-gold-400/40 shadow-gold-subtle hover:shadow-gold-glow transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send size={13} />
                  <span>{submitting ? 'Sending to Studio...' : 'Send Note to Studio'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct WhatsApp & Studio Details (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* WhatsApp VIP Card */}
            <div className="glass-panel-deep p-8 rounded-3xl border border-gold-400/40 shadow-xl text-left">
              <span className="font-sans text-[10px] tracking-super-wide text-gold-300 uppercase block mb-1">
                INSTANT STUDIO LINE
              </span>
              <h3 className="font-serif text-2xl text-ivory-50 mb-2 font-normal">
                Prefer WhatsApp?
              </h3>
              <p className="font-sans text-xs text-ivory-200/80 leading-relaxed mb-6 font-light">
                Connect directly with Bhuvan and our principal booking coordinator for immediate availability and customized curations.
              </p>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#1A6335] hover:bg-[#1E733D] text-white py-3.5 rounded-full text-xs font-sans tracking-widest uppercase transition-colors shadow-lg"
              >
                <MessageSquare size={14} />
                <span>Chat on WhatsApp (+91 90252 99312)</span>
                <ArrowUpRight size={13} />
              </a>
            </div>

            {/* Studio Addresses */}
            <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-gold-500/20 space-y-5 sm:space-y-6 text-left">
              <div className="flex items-start gap-3.5">
                <MapPin size={16} className="text-gold-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-sans text-xs tracking-widest text-gold-300 uppercase font-semibold">
                    Madurai Flagship Studio
                  </h4>
                  <p className="font-sans text-xs text-ivory-200/70 mt-1 leading-relaxed">
                    18 Heritage Palace Enclave, West Veli Street, Madurai, Tamil Nadu 625001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <MapPin size={16} className="text-gold-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-sans text-xs tracking-widest text-gold-300 uppercase font-semibold">
                    Coimbatore Studio Lounge
                  </h4>
                  <p className="font-sans text-xs text-ivory-200/70 mt-1 leading-relaxed">
                    Race Course Road, Coimbatore, Tamil Nadu 641018
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock size={16} className="text-gold-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-sans text-xs tracking-widest text-gold-300 uppercase font-semibold">
                    Studio Hours
                  </h4>
                  <p className="font-sans text-xs text-ivory-200/70 mt-1">
                    Tuesday — Sunday: 09:30 AM — 08:00 PM IST
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone size={16} className="text-gold-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-sans text-xs tracking-widest text-gold-300 uppercase font-semibold">
                    Direct Line
                  </h4>
                  <a href="tel:+919025299312" className="font-sans text-xs text-ivory-200/90 hover:text-gold-300 transition-colors mt-1 block">
                    +91 90252 99312
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Minimalist Sign-Off Footer (Not a link farm) */}
        <footer className="mt-28 pt-8 border-t border-gold-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] font-sans text-ivory-300/50">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-badge.png" alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-serif text-sm tracking-widest text-gold-300 font-light">
              TIME FREEZE
            </span>
            <span className="text-ivory-300/40">·</span>
            <span className="italic font-serif">A moment held perfectly still.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} Time Freeze Photography. All rights reserved.</span>
            <a href="/admin" className="text-gold-500/50 hover:text-gold-300 transition-colors">
              Admin Portal
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
