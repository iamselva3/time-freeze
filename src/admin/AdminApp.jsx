import React, { useState, useEffect } from 'react';
import {
  Layout,
  Sliders,
  BookOpen,
  Image as ImageIcon,
  Film,
  Layers,
  ListOrdered,
  Package,
  MessageSquareQuote,
  MapPin,
  Cloud,
  Save,
  ExternalLink,
  Trash2,
  Plus,
  RefreshCw,
  LogOut,
  Check,
  Upload,
} from 'lucide-react';

export default function AdminApp({ onExitAdmin }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('tf_admin_token') || ''
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [storageData, setStorageData] = useState(null);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Auth login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        sessionStorage.setItem('tf_admin_token', data.token);
        showToast('Welcome back! Time Freeze Studio Admin is active.');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Authentication service unreachable');
    }
  };

  const handleLogout = () => {
    setToken('');
    sessionStorage.removeItem('tf_admin_token');
  };

  // Fetch content, photos, and storage
  const loadData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/photos'),
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();
      if (cData.content) setContent(cData.content);
      if (pData.photos) setPhotos(pData.photos);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  const loadStorage = async () => {
    try {
      const res = await fetch('/api/r2/storage');
      const data = await res.json();
      if (data.success) setStorageData(data);
    } catch (e) {
      console.error('Failed to load storage gauge:', e);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
      loadStorage();
      showToast('Welcome back! Studio Admin is active.');
    }
  }, [token]);

  // Save changes to KV / R2
  const handleSaveContent = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });
      if (res.ok) {
        showToast('Successfully published changes to Cloudflare KV & R2!');
      } else {
        showToast('Save failed. Check permissions.');
      }
    } catch (e) {
      showToast('Error syncing changes.');
    } finally {
      setSaving(false);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id) => {
    if (!confirm('Are you sure you want to remove this photograph from R2 archive?')) return;
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
        showToast('Photograph purged from R2 storage.');
        loadStorage();
      }
    } catch {
      showToast('Error deleting photo.');
    }
  };

  // Toggle Featured photo
  const handleToggleFeatured = async (photo) => {
    const updated = { ...photo, featured: !photo.featured };
    try {
      const res = await fetch(`/api/photos/${photo.id || photo.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: updated.featured }),
      });
      if (res.ok) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? updated : p))
        );
        showToast(`Photograph featured flag updated.`);
      }
    } catch {
      showToast('Error updating photo.');
    }
  };

  // Cutout upload
  const handleCutoutUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    showToast('Uploading new hero cutout to R2...');
    try {
      const res = await fetch('/api/hero-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setContent((prev) => ({
          ...prev,
          hero: { ...prev.hero, cutoutImage: data.url },
        }));
        showToast('New hero cutout layer uploaded to Cloudflare R2!');
      }
    } catch {
      showToast('Cutout upload failed.');
    }
  };

  // -------------------------------------------------------------
  // Login Gate
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0505] flex items-center justify-center p-6 select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-40 pointer-events-none" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-oxblood-900/40 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full glass-panel-deep p-8 sm:p-10 rounded-3xl border border-gold-400/40 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-full p-2 border border-gold-400/60 bg-charcoal-900/90 mx-auto mb-4 flex items-center justify-center shadow-gold-subtle">
            <img src="/brand/logo-badge.png" alt="Logo" className="w-full h-full object-contain" />
          </div>

          <h2 className="font-serif text-2xl text-ivory-50 font-medium">
            Time Freeze CMS 2.0
          </h2>
          <p className="font-sans text-xs text-gold-400/70 uppercase tracking-widest mt-1 mb-8">
            Studio Master Administration
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Studio Master Password"
                className="w-full bg-charcoal-900 border border-gold-500/30 focus:border-gold-300 rounded-xl px-4 py-3 text-xs text-ivory-100 placeholder:text-ivory-300/40 outline-none text-center tracking-widest"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-sans">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-oxblood-700 to-oxblood-900 hover:from-oxblood-600 hover:to-oxblood-800 text-gold-100 font-sans text-xs tracking-widest uppercase border border-gold-400/40 shadow-gold-subtle transition-all"
            >
              Authenticate & Enter Studio
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gold-500/20">
            <button
              onClick={onExitAdmin}
              className="text-xs font-sans tracking-widest text-gold-400/60 hover:text-gold-300 uppercase transition-colors"
            >
              ← Return to Client Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-[#0A0505] flex items-center justify-center text-gold-300 font-serif text-xl">
        Loading Time Freeze Studio CMS...
      </div>
    );
  }

  // Sidebar Sections Configuration
  const SECTIONS = [
    { id: 'hero', label: 'Hero & Cutout', icon: Layout },
    { id: 'splash', label: 'Splash Settings', icon: Sliders },
    { id: 'story', label: 'Story & Philosophy', icon: BookOpen },
    { id: 'photos', label: 'Photo Library', icon: ImageIcon, badge: photos.length },
    { id: 'cinema', label: 'Cinema Reel', icon: Film },
    { id: 'chapters', label: 'Portfolio Chapters', icon: Layers },
    { id: 'process', label: 'Process Steps', icon: ListOrdered },
    { id: 'packages', label: 'Packages & Pricing', icon: Package },
    { id: 'reviews', label: 'Client Reviews', icon: MessageSquareQuote },
    { id: 'contact', label: 'Contact & Studio', icon: MapPin },
    { id: 'cloudflare', label: 'Cloudflare & R2', icon: Cloud },
  ];

  const filteredPhotos =
    selectedCategory === 'All'
      ? photos
      : photos.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0E0707] text-[#F5EFE6] flex flex-col font-sans select-none">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 glass-panel-deep border border-gold-400/70 text-gold-200 text-xs px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Check size={14} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header Navigation */}
      <header className="h-16 border-b border-gold-500/20 bg-charcoal-950/90 backdrop-blur-xl px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <img src="/brand/logo-badge.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-serif text-lg tracking-widest-luxury text-gold-300 font-medium">
            TIME FREEZE
          </span>
          <span className="bg-oxblood-900/80 text-gold-400 border border-gold-500/30 text-[9px] font-sans font-semibold tracking-wider px-2 py-0.5 rounded-full ml-1">
            CMS 2.0
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSaveContent}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-oxblood-700 to-oxblood-900 hover:from-oxblood-600 hover:to-oxblood-800 text-gold-100 text-xs font-sans tracking-widest uppercase px-5 py-2 rounded-full border border-gold-400/40 shadow-gold-subtle transition-all"
          >
            <Save size={13} />
            <span>{saving ? 'Publishing...' : 'Publish Live'}</span>
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 text-xs font-sans tracking-widest text-ivory-300/80 hover:text-gold-300 border border-gold-500/25 px-4 py-2 rounded-full hover:bg-charcoal-900 transition-colors"
          >
            <span>View Client Site</span>
            <ExternalLink size={12} />
          </button>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-ivory-300/60 hover:text-red-400 p-2"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============================================================== */}
        {/* 1. LEFT SIDEBAR */}
        {/* ============================================================== */}
        <nav className="w-64 border-r border-gold-500/20 bg-charcoal-950/70 p-4 flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="space-y-1">
            <div className="text-[10px] font-sans tracking-widest text-gold-400/60 uppercase px-3 py-2 text-left">
              Studio Sections
            </div>
            {SECTIONS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans tracking-wide transition-all ${
                    isActive
                      ? 'bg-oxblood-900/70 text-gold-200 border border-gold-400/40 font-medium'
                      : 'text-ivory-300/70 hover:text-gold-300 hover:bg-charcoal-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={14} className={isActive ? 'text-gold-300' : 'text-gold-500/50'} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-charcoal-800 text-gold-400 border border-gold-500/20">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom R2 Status */}
          <div className="pt-4 border-t border-gold-500/15">
            <div className="glass-panel p-3 rounded-xl border border-gold-500/20 text-left">
              <div className="flex items-center justify-between text-[10px] font-sans text-gold-300 mb-1">
                <span>R2 Storage: time-freeze</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[10px] text-ivory-300/60">
                {storageData?.usedFormatted || 'Active'} / 10.00 GB
              </div>
            </div>
          </div>
        </nav>

        {/* ============================================================== */}
        {/* 2. MIDDLE EDITOR PANE WITH ZERO RAW JSON */}
        {/* ============================================================== */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 border-r border-gold-500/20 bg-[#0E0707] text-left">
          {/* A: Hero & Cutout */}
          {activeTab === 'hero' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Hero Section & Cutout Layer</h3>
              <p className="text-xs text-ivory-300/70">
                Manage hero typography, transparent couple portrait cutout, and statistics counters.
              </p>

              {/* Cutout Upload Box */}
              <div className="glass-panel p-6 rounded-2xl border border-gold-500/30">
                <span className="text-[10px] font-sans tracking-widest text-gold-400 uppercase block mb-2">
                  Active Cutout Portrait
                </span>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-28 rounded-lg bg-charcoal-900 border border-gold-500/20 overflow-hidden flex items-end justify-center p-1">
                    <img
                      src="/brand/hero-cutout.png"
                      alt="Cutout"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 bg-charcoal-800 hover:bg-oxblood-900 border border-gold-400/40 text-gold-200 text-xs px-4 py-2 rounded-full cursor-pointer transition-colors">
                      <Upload size={13} />
                      <span>Upload New Cutout (.PNG / .WebP)</span>
                      <input
                        type="file"
                        accept="image/png,image/webp"
                        className="hidden"
                        onChange={handleCutoutUpload}
                      />
                    </label>
                    <p className="text-[10px] text-ivory-300/50 mt-2">
                      Upload transparent PNG generated by background removal tool.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Kicker Eyebrow Tagline
                  </label>
                  <input
                    type="text"
                    value={content.hero?.kicker || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, kicker: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Main Title Line 1
                  </label>
                  <input
                    type="text"
                    value={content.hero?.titleLine1 || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, titleLine1: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Accent Word (Gold Italic)
                    </label>
                    <input
                      type="text"
                      value={content.hero?.titleLine2Em || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, titleLine2Em: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Title Line 2 Suffix
                    </label>
                    <input
                      type="text"
                      value={content.hero?.titleLine2Text || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, titleLine2Text: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Hero Description Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero?.description || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, description: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* B: Splash Settings */}
          {activeTab === 'splash' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Splash Intro Choreography</h3>
              <p className="text-xs text-ivory-300/70">
                Configure the calm, aesthetic opening screen and session behavior.
              </p>

              <div className="glass-panel p-6 rounded-2xl border border-gold-500/30 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-sans text-xs text-ivory-100 font-medium block">
                      Enable Calm Splash Screen
                    </span>
                    <span className="text-[10px] text-ivory-300/60">
                      Renders the slow, meditative logo reveal once per session.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={content.splash?.enabled ?? true}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        splash: { ...content.splash, enabled: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-gold-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Duration (Milliseconds)
                  </label>
                  <input
                    type="number"
                    value={content.splash?.durationMs || 3200}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        splash: { ...content.splash, durationMs: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Tagline Subtitle
                  </label>
                  <input
                    type="text"
                    value={content.splash?.tagline || 'A moment held perfectly still.'}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        splash: { ...content.splash, tagline: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 focus:border-gold-300 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C: Story & Philosophy */}
          {activeTab === 'story' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Story & Studio Philosophy</h3>
              <p className="text-xs text-ivory-300/70">
                Edit the studio manifesto, photographer details, and philosophy paragraphs.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Eyebrow Header
                  </label>
                  <input
                    type="text"
                    value={content.story?.eyebrow || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        story: { ...content.story, eyebrow: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Title Lead
                    </label>
                    <input
                      type="text"
                      value={content.story?.titleLead || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          story: { ...content.story, titleLead: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Title Accent (Gold Italic)
                    </label>
                    <input
                      type="text"
                      value={content.story?.titleAccent || ''}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          story: { ...content.story, titleAccent: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Paragraph 1
                  </label>
                  <textarea
                    rows={3}
                    value={content.story?.paragraph1 || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        story: { ...content.story, paragraph1: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Paragraph 2
                  </label>
                  <textarea
                    rows={3}
                    value={content.story?.paragraph2 || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        story: { ...content.story, paragraph2: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Photographer Name
                    </label>
                    <input
                      type="text"
                      value={content.story?.photographerName || 'Bhuvan'}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          story: { ...content.story, photographerName: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Photographer Title
                    </label>
                    <input
                      type="text"
                      value={content.story?.photographerTitle || 'Founder & Principal Artist'}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          story: { ...content.story, photographerTitle: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D: Photo Library */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-ivory-100">
                    Photo Archive ({photos.length} Suites)
                  </h3>
                  <p className="text-xs text-ivory-300/70">
                    Direct Cloudflare R2 bucket integration. Filter, order, and curate portfolio appearances.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['All', 'Weddings', 'Baby & Kids', 'Candid & Moments'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] font-sans tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                        selectedCategory === cat
                          ? 'bg-gold-500 text-charcoal-950 border-gold-400 font-semibold'
                          : 'border-gold-500/20 text-ivory-300/70 hover:border-gold-400/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id || photo.slug}
                    className="glass-panel rounded-2xl overflow-hidden border border-gold-500/25 flex flex-col justify-between group"
                  >
                    <div className="relative aspect-[4/5] bg-charcoal-950 overflow-hidden">
                      <img
                        src={`/media/${photo.slug}.webp`}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-charcoal-950/80 border border-gold-500/30 text-[9px] font-sans tracking-widest text-gold-300 px-2 py-0.5 rounded-full">
                        {photo.category}
                      </span>
                      <button
                        onClick={() => handleDeletePhoto(photo.id || photo.slug)}
                        title="Delete from R2"
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-800 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-serif text-base text-ivory-100 truncate">
                        {photo.title}
                      </h4>
                      <p className="text-[10.5px] text-ivory-300/60 line-clamp-1">
                        {photo.location} · {photo.client}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-gold-500/15">
                        <button
                          onClick={() => handleToggleFeatured(photo)}
                          className={`text-[9px] font-sans tracking-widest uppercase px-2.5 py-1 rounded-full border transition-colors ${
                            photo.featured
                              ? 'bg-oxblood-900 border-gold-400 text-gold-300'
                              : 'border-gold-500/20 text-ivory-300/40'
                          }`}
                        >
                          {photo.featured ? '★ Featured' : 'Standard'}
                        </button>
                        <span className="text-[9px] text-gold-400/70 font-mono">
                          {photo.dimensions?.width}x{photo.dimensions?.height}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E: Packages & Pricing (CLEAN VISUAL FORMS — NO RAW JSON) */}
          {activeTab === 'packages' && (
            <div className="max-w-3xl space-y-8">
              <div>
                <h3 className="font-serif text-2xl text-ivory-100">Packages & Pricing Curations</h3>
                <p className="text-xs text-ivory-300/70">
                  Edit rates, deliverable lists, and descriptions without writing JSON.
                </p>
              </div>

              {/* Package cards editor */}
              <div className="space-y-6">
                {(content.packages?.packages || []).map((pkg, pIdx) => (
                  <div
                    key={pIdx}
                    className="glass-panel p-6 rounded-2xl border border-gold-500/30 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gold-500/20 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg text-gold-300 font-medium">
                          Package {pIdx + 1}
                        </span>
                        <label className="flex items-center gap-2 text-xs text-ivory-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkg.featured || false}
                            onChange={(e) => {
                              const updated = [...content.packages.packages];
                              updated[pIdx].featured = e.target.checked;
                              setContent({
                                ...content,
                                packages: { ...content.packages, packages: updated },
                              });
                            }}
                            className="w-4 h-4 accent-gold-400"
                          />
                          <span className="text-[10px] uppercase tracking-wider text-gold-400">
                            ★ Signature Featured
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                          Collection Title
                        </label>
                        <input
                          type="text"
                          value={pkg.title || ''}
                          onChange={(e) => {
                            const updated = [...content.packages.packages];
                            updated[pIdx].title = e.target.value;
                            setContent({
                              ...content,
                              packages: { ...content.packages, packages: updated },
                            });
                          }}
                          className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                          Price (e.g. ₹1,45,000)
                        </label>
                        <input
                          type="text"
                          value={pkg.price || ''}
                          onChange={(e) => {
                            const updated = [...content.packages.packages];
                            updated[pIdx].price = e.target.value;
                            setContent({
                              ...content,
                              packages: { ...content.packages, packages: updated },
                            });
                          }}
                          className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none font-semibold text-gold-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                          Eyebrow Tag
                        </label>
                        <input
                          type="text"
                          value={pkg.eyebrow || ''}
                          onChange={(e) => {
                            const updated = [...content.packages.packages];
                            updated[pIdx].eyebrow = e.target.value;
                            setContent({
                              ...content,
                              packages: { ...content.packages, packages: updated },
                            });
                          }}
                          className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                          Session Duration / Period
                        </label>
                        <input
                          type="text"
                          value={pkg.period || ''}
                          onChange={(e) => {
                            const updated = [...content.packages.packages];
                            updated[pIdx].period = e.target.value;
                            setContent({
                              ...content,
                              packages: { ...content.packages, packages: updated },
                            });
                          }}
                          className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                        Summary Text
                      </label>
                      <textarea
                        rows={2}
                        value={pkg.text || ''}
                        onChange={(e) => {
                          const updated = [...content.packages.packages];
                          updated[pIdx].text = e.target.value;
                          setContent({
                            ...content,
                            packages: { ...content.packages, packages: updated },
                          });
                        }}
                        className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none resize-none"
                      />
                    </div>

                    {/* Deliverables list */}
                    <div>
                      <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-2">
                        Deliverables & Inclusions
                      </label>
                      <div className="space-y-2">
                        {(pkg.items || []).map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const updated = [...content.packages.packages];
                                updated[pIdx].items[iIdx] = e.target.value;
                                setContent({
                                  ...content,
                                  packages: { ...content.packages, packages: updated },
                                });
                              }}
                              className="flex-1 bg-charcoal-900 border border-gold-500/20 rounded-lg px-3 py-1.5 text-xs text-ivory-200 outline-none"
                            />
                            <button
                              onClick={() => {
                                const updated = [...content.packages.packages];
                                updated[pIdx].items = updated[pIdx].items.filter(
                                  (_, i) => i !== iIdx
                                );
                                setContent({
                                  ...content,
                                  packages: { ...content.packages, packages: updated },
                                });
                              }}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...content.packages.packages];
                            updated[pIdx].items.push('New inclusion item');
                            setContent({
                              ...content,
                              packages: { ...content.packages, packages: updated },
                            });
                          }}
                          className="inline-flex items-center gap-1.5 text-[10.5px] font-sans text-gold-400 hover:text-gold-200 mt-1"
                        >
                          <Plus size={12} />
                          <span>Add Inclusions Item</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* F: Client Reviews (CLEAN FORM) */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-ivory-100">Client Reviews</h3>
                  <p className="text-xs text-ivory-300/70">
                    Add or update heartfelt words from couples and families.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {(content.testimonials?.list || []).map((rev, rIdx) => (
                  <div
                    key={rIdx}
                    className="glass-panel p-6 rounded-2xl border border-gold-500/25 space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                          Client Names
                        </label>
                        <input
                          type="text"
                          value={rev.name || ''}
                          onChange={(e) => {
                            const updated = [...content.testimonials.list];
                            updated[rIdx].name = e.target.value;
                            setContent({
                              ...content,
                              testimonials: { ...content.testimonials, list: updated },
                            });
                          }}
                          className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2 text-xs text-ivory-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                          Location / City
                        </label>
                        <input
                          type="text"
                          value={rev.place || ''}
                          onChange={(e) => {
                            const updated = [...content.testimonials.list];
                            updated[rIdx].place = e.target.value;
                            setContent({
                              ...content,
                              testimonials: { ...content.testimonials, list: updated },
                            });
                          }}
                          className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2 text-xs text-ivory-100 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                        Testimonial Quote
                      </label>
                      <textarea
                        rows={3}
                        value={rev.quote || ''}
                        onChange={(e) => {
                          const updated = [...content.testimonials.list];
                          updated[rIdx].quote = e.target.value;
                          setContent({
                            ...content,
                            testimonials: { ...content.testimonials, list: updated },
                          });
                        }}
                        className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl p-3 text-xs text-ivory-100 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* G: Contact & Studio Info (CLEAN FORM) */}
          {activeTab === 'contact' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Contact & Studio Desk</h3>
              <p className="text-xs text-ivory-300/70">
                Update phone numbers, WhatsApp lines, studio hours, and addresses.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      Direct Phone
                    </label>
                    <input
                      type="text"
                      value={content.general?.phone || '+91 90252 99312'}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          general: { ...content.general, phone: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                      WhatsApp Number (Format: +91...)
                    </label>
                    <input
                      type="text"
                      value={content.general?.whatsappNumber || '+919025299312'}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          general: { ...content.general, whatsappNumber: e.target.value },
                        })
                      }
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Studio Desk Email
                  </label>
                  <input
                    type="email"
                    value={content.general?.email || 'studio@timefreeze.in'}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        general: { ...content.general, email: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Madurai Flagship Studio Address
                  </label>
                  <input
                    type="text"
                    value={content.general?.address || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        general: { ...content.general, address: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Coimbatore Studio Lounge Address
                  </label>
                  <input
                    type="text"
                    value={content.general?.secondaryStudio || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        general: { ...content.general, secondaryStudio: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* H: Cloudflare & R2 Storage Monitor */}
          {activeTab === 'cloudflare' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">
                Cloudflare R2 & KV Infrastructure
              </h3>
              <p className="text-xs text-ivory-300/70">
                Real-time connection status and free space monitor for the active bucket.
              </p>

              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gold-500/30 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-sans tracking-widest text-gold-400 uppercase block mb-1">
                      Bucket Target
                    </span>
                    <span className="font-serif text-2xl text-ivory-50">
                      time-freeze
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Connected & Live</span>
                  </div>
                </div>

                {/* Storage Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-sans text-ivory-200">
                    <span>Used: {storageData?.usedFormatted || '0.00 MB'}</span>
                    <span>Free: {storageData?.freeFormatted || '10.00 GB'}</span>
                  </div>
                  <div className="w-full h-3 bg-charcoal-900 rounded-full overflow-hidden border border-gold-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-oxblood-600 via-gold-500 to-gold-300 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(1, storageData?.percentUsed || 1)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-sans text-ivory-300/50">
                    <span>Tier: Cloudflare Free 10 GB</span>
                    <span>{storageData?.percentFree || 99.9}% Remaining</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gold-500/20 flex items-center justify-between">
                  <span className="text-xs text-ivory-300/70">
                    Stored Image Variants: {storageData?.objectCount || photos.length * 6} files
                  </span>
                  <button
                    onClick={loadStorage}
                    className="inline-flex items-center gap-1.5 text-xs font-sans text-gold-300 hover:text-gold-100 transition-colors"
                  >
                    <RefreshCw size={12} />
                    <span>Refresh Gauge</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* I: Other Sections: Process Steps, Cinema Reel, Chapters */}
          {activeTab === 'cinema' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Cinema Reel Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Heading Lead
                  </label>
                  <input
                    type="text"
                    value={content.cinema?.headingLead || 'Moments that'}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cinema: { ...content.cinema, headingLead: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Heading Accent (Gold)
                  </label>
                  <input
                    type="text"
                    value={content.cinema?.headingAccent || 'breathe in 4K.'}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cinema: { ...content.cinema, headingAccent: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl px-4 py-2.5 text-xs text-ivory-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-sans tracking-widest text-gold-400 uppercase mb-1">
                    Reel Description
                  </label>
                  <textarea
                    rows={3}
                    value={content.cinema?.description || ''}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        cinema: { ...content.cinema, description: e.target.value },
                      })
                    }
                    className="w-full bg-charcoal-900 border border-gold-500/20 rounded-xl p-3 text-xs text-ivory-100 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'process' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Process Steps Editor</h3>
              <div className="space-y-4">
                {(content.process?.steps || []).map((step, sIdx) => (
                  <div key={sIdx} className="glass-panel p-4 rounded-xl border border-gold-500/20 space-y-2">
                    <span className="text-[10px] font-mono text-gold-400">Step {step.num}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={step.lead}
                        onChange={(e) => {
                          const updated = [...content.process.steps];
                          updated[sIdx].lead = e.target.value;
                          setContent({ ...content, process: { ...content.process, steps: updated } });
                        }}
                        className="bg-charcoal-900 border border-gold-500/20 rounded-lg px-3 py-1.5 text-xs text-ivory-100"
                        placeholder="Lead word"
                      />
                      <input
                        type="text"
                        value={step.accent}
                        onChange={(e) => {
                          const updated = [...content.process.steps];
                          updated[sIdx].accent = e.target.value;
                          setContent({ ...content, process: { ...content.process, steps: updated } });
                        }}
                        className="bg-charcoal-900 border border-gold-500/20 rounded-lg px-3 py-1.5 text-xs text-ivory-100"
                        placeholder="Accent word"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={step.description}
                      onChange={(e) => {
                        const updated = [...content.process.steps];
                        updated[sIdx].description = e.target.value;
                        setContent({ ...content, process: { ...content.process, steps: updated } });
                      }}
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-lg p-2 text-xs text-ivory-100 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="font-serif text-2xl text-ivory-100">Portfolio Chapters</h3>
              <div className="space-y-4">
                {(content.chapters?.categories || []).map((chap, cIdx) => (
                  <div key={cIdx} className="glass-panel p-4 rounded-xl border border-gold-500/20 space-y-2">
                    <span className="text-[10px] font-sans text-gold-400 uppercase font-semibold">
                      Chapter {cIdx + 1}
                    </span>
                    <input
                      type="text"
                      value={chap.title}
                      onChange={(e) => {
                        const updated = [...content.chapters.categories];
                        updated[cIdx].title = e.target.value;
                        setContent({ ...content, chapters: { ...content.chapters, categories: updated } });
                      }}
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-lg px-3 py-1.5 text-xs text-ivory-100"
                      placeholder="Title"
                    />
                    <input
                      type="text"
                      value={chap.subtitle}
                      onChange={(e) => {
                        const updated = [...content.chapters.categories];
                        updated[cIdx].subtitle = e.target.value;
                        setContent({ ...content, chapters: { ...content.chapters, categories: updated } });
                      }}
                      className="w-full bg-charcoal-900 border border-gold-500/20 rounded-lg px-3 py-1.5 text-xs text-ivory-100"
                      placeholder="Subtitle"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* ============================================================== */}
        {/* 3. RIGHT REAL-TIME PREVIEW PANE */}
        {/* ============================================================== */}
        <aside className="hidden xl:flex w-[420px] flex-col border-l border-gold-500/20 bg-charcoal-950/80 shrink-0">
          <div className="p-4 border-b border-gold-500/20 flex items-center justify-between text-xs font-sans">
            <span className="text-gold-300 font-medium">Real-time Live Section Preview</span>
            <span className="text-[10px] text-ivory-300/50 uppercase">Viewport: 420px</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden glass-panel-deep border border-gold-400/40 p-6 shadow-2xl text-left">
              <span className="text-[9px] font-sans tracking-widest text-gold-400 uppercase block mb-1">
                {content.hero?.kicker}
              </span>
              <h2 className="font-serif text-2xl text-ivory-100 font-light mb-2">
                {content.hero?.titleLine1}{' '}
                <span className="italic text-gold-gradient font-normal">
                  {content.hero?.titleLine2Em}
                </span>{' '}
                {content.hero?.titleLine2Text}
              </h2>
              <p className="text-[11px] font-sans text-ivory-300/70 leading-relaxed line-clamp-3 mb-4">
                {content.hero?.description}
              </p>

              <div className="rounded-xl overflow-hidden bg-charcoal-900 border border-gold-500/20 aspect-[4/3] flex items-end justify-center p-2">
                <img
                  src="/brand/hero-cutout.png"
                  alt="Live Cutout"
                  className="max-h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
