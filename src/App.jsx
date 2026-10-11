import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';

import SplashScreen from './components/SplashScreen';
import CustomCursor from './components/CustomCursor';
import Navigation from './components/Navigation';

import HeroSection from './sections/HeroSection';
import FrozenMomentsSection from './sections/FrozenMomentsSection';
import ChaptersSection from './sections/ChaptersSection';
import CinemaReelSection from './sections/CinemaReelSection';
import StorySection from './sections/StorySection';
import ProcessSection from './sections/ProcessSection';
import PackagesSection from './sections/PackagesSection';
import ReviewsSection from './sections/ReviewsSection';
import ContactSection from './sections/ContactSection';

import AdminApp from './admin/AdminApp';
import manifestData from './data/manifest.json';
import { DEFAULT_SITE_CONTENT } from './data/defaultSiteContent';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  const [splashDone, setSplashDone] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [photos, setPhotos] = useState(manifestData);

  // Synchronize route changes
  useEffect(() => {
    const handlePopState = () => {
      setIsAdmin(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch dynamic content & photos from worker / dev API
  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => {
        if (data.content && Object.keys(data.content).length > 0) {
          setContent(data.content);
        }
      })
      .catch(() => {});

    fetch('/api/photos')
      .then((res) => res.json())
      .then((data) => {
        if (data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize Lenis smooth scroll for client site
  useEffect(() => {
    if (isAdmin) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isAdmin]);

  // Section Observer for Chapter tracker
  useEffect(() => {
    if (isAdmin) return;

    const sectionIds = ['hero', 'frozen', 'chapters', 'cinema', 'story', 'process', 'packages', 'contact'];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [isAdmin, splashDone]);

  // If on admin route
  if (isAdmin) {
    return (
      <AdminApp
        onExitAdmin={() => {
          window.history.pushState({}, '', '/');
          setIsAdmin(false);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0B0A09] text-[#F5EFE6]">
      {/* 1. Cinematic Splash Screen */}
      {!splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}

      {/* 2. Custom Magnetic Luxury Cursor */}
      <CustomCursor />

      {/* 3. Floating Navigation Monogram & Chapter Tracker (Reveals only after splash screen completes) */}
      {splashDone && <Navigation activeSection={activeSection} />}

      {/* 4. Sequential Narrative Chapters */}
      <main>
        <HeroSection content={content} photos={photos} />
        <FrozenMomentsSection photos={photos} />
        <ChaptersSection photos={photos} />
        <CinemaReelSection content={content} />
        <StorySection content={content} />
        <ProcessSection content={content} />
        <PackagesSection content={content} />
        <ReviewsSection content={content} />
        <ContactSection content={content} />
      </main>
    </div>
  );
}
