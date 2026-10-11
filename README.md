# Time Freeze — Fine Art Wedding & Portrait Photography Studio

A calm, elite, premium photography studio website and CMS 2.0 built for **Time Freeze** (Weddings, Baby & Kids, Heritage & Candid) using React, Tailwind CSS, GSAP, Lenis, and Cloudflare R2 & KV.

---

## ✦ Brand Identity & Palette
- **Concept**: *A moment held perfectly still.*
- **Palette**: Deep oxblood & maroon (`#7A0000` to `#4A0000`), Champagne gold (`#E8C57A`, `#FCE095`), Warm ivory (`#F5EFE6`), Charcoal canvas (`#120C0C`, `#0A0606`).
- **Typography**: Display serif (*Cormorant Garamond* / *Playfair Display*) paired with clean editorial sans (*Inter*).

---

## ✦ Architecture Overview

1. **Client Landing Page (`/`)**:
   - **Cinematic Splash Screen**: ~3s intro sequence with gold point bloom, expanding oxblood circle badge, SVG monogram stroke draw with metallic sheen, canvas particle explosion with a 300ms mid-air freeze, camera shutter flash, and aperture iris reveal.
   - **Hero Layered Scene**: Full-bleed dark composition with a background-removed couple portrait cutout on a golden-ratio axis, soft moving gold radial light, floating golden dust points, and restrained editorial typography.
   - **Frozen Moments**: Pinned horizontal scroll gallery where photos begin blurred/rotated and snap into crisp focus ("time freeze") when crossing the center axis.
   - **Portfolio Chapters**: Interactive accordion panels for Weddings, Baby & Kids, and Candid & Heritage with full-screen gallery modals.
   - **Cinema Reel**: 2.39:1 anamorphic film strip with custom cursor playback controls and sprocket perforations.
   - **Artisan Process**: Vertical timeline with dynamic scroll-driven drawing gold line.
   - **Packages & Pricing**: 3D tilt cards with real-time specular glare and direct WhatsApp booking triggers.
   - **Client Reviews**: Slow crossfading testimonials with ambient blur backdrop.
   - **Contact & Studio Desk**: Direct WhatsApp action, interactive booking form, studio locations (Madurai & Coimbatore), and quiet footer sign-off.

2. **Master Admin CMS 2.0 (`/admin`)**:
   - Rebranded luxury dark gold interface with editor on the left and Real-time Live Section Preview on the right.
   - Protected with token-based session authentication and rate-limited login.
   - **Sections**: Hero & Cutout, Splash Settings, Story & Philosophy, Photo Library (drag order, categories, featured flag, delete), Cinema Reel, Chapters, Process, Packages, Reviews, Contact, and Cloudflare & R2.
   - **Cloudflare & R2 Monitor**: Live storage gauge against Cloudflare's 10 GB free tier with real-time object counting and status checking.

3. **Cloudflare Infrastructure**:
   - **R2 Bucket**: `time-freeze` (immutable cache headers `Cache-Control: public, max-age=31536000, immutable`).
   - **Cloudflare KV**: `TIME_FREEZE_META` for fast global metadata, content schema (`site:content`), and photo index (`photos:index`).
   - **Worker API**: Serves `/api/content`, `/api/photos`, `/api/hero-image`, `/api/r2/storage`, `/api/contact`, and `/media/*`.

---

## ✦ Environment Variables

The application requires the following environment variables in `.dev.vars` (for local development and Vite emulator) and Cloudflare secrets (for production):

```env
ADMIN_PASSWORD=
JWT_SECRET=
WHATSAPP_NUMBER=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
R2_BUCKET_NAME=time-freeze
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_DOMAIN=
KV_NAMESPACE_ID=
ALLOWED_ORIGIN=*
```

> **Security Note**: Never commit `.dev.vars` or `.env` to Git. Both are listed in `.gitignore`.

---

## ✦ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Image Optimization & Cloudflare R2 Sync
Processes all raw photos in the workspace with `sharp` into WebP + AVIF across responsive widths, generates tiny blurred LQIP placeholders, extracts dominant colors, uploads to R2 bucket `time-freeze`, and seeds the manifest into Cloudflare KV:
```bash
node scripts/process-and-upload-images.mjs
```

### 3. Start Local Development Server
Starts the Vite dev server with built-in Cloudflare Worker and R2 SigV4 streaming proxy:
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174) for the client landing page or [http://localhost:5174/admin](http://localhost:5174/admin) for the Studio CMS.

### 4. Build for Production
Compiles the optimized React bundle into `./dist`:
```bash
npm run build
```

### 5. Deploy to Cloudflare Workers
Deploys the static assets and Worker backend to Cloudflare:
```bash
npx wrangler deploy
```

---

## ✦ Directory Structure

```text
time-freeze/
├── public/
│   ├── brand/
│   │   ├── logo-badge.svg           # High-resolution SVG circular badge
│   │   ├── logo-badge.png           # Transparent badge fallback
│   │   ├── logo-gold-monogram.svg   # Vectorized gold TF monogram for stroke drawing
│   │   ├── logo-gold-monogram.png   # Transparent gold monogram
│   │   ├── logo-wordmark.svg        # Horizontal luxury typography lockup
│   │   └── hero-cutout.png          # Feathered couple cutout for 3D parallax hero
│   └── robots.txt                   # Search crawler directives
├── scripts/
│   ├── process-and-upload-images.mjs # Sharp image pipeline & SigV4 R2 uploader
│   └── vectorize-monogram.py        # Contour vectorization script
├── src/
│   ├── admin/
│   │   └── AdminApp.jsx             # CMS 2.0 with Editor-Left / Live-Preview-Right
│   ├── components/
│   │   ├── SplashScreen.jsx         # 3s cinematic particle burst & aperture iris intro
│   │   ├── CustomCursor.jsx         # Smooth magnetic cursor with context badges
│   │   └── Navigation.jsx           # Floating monogram & full-screen menu overlay
│   ├── sections/
│   │   ├── HeroSection.jsx          # Layered parallax hero with off-center cutout
│   │   ├── FrozenMomentsSection.jsx # Pinned horizontal scroll with blur-to-sharp snap
│   │   ├── ChaptersSection.jsx      # 3 tall interactive accordion panels with gallery
│   │   ├── CinemaReelSection.jsx    # 2.39:1 anamorphic motion reel
│   │   ├── StorySection.jsx         # Philosophy split layout & photographer portrait
│   │   ├── ProcessSection.jsx       # Vertical timeline with animated drawing gold line
│   │   ├── PackagesSection.jsx      # 3D tilt cards with real-time specular glare
│   │   ├── ReviewsSection.jsx       # Crossfading testimonials over blurred photography
│   │   └── ContactSection.jsx       # Booking form, WhatsApp CTA, and quiet footer
│   ├── data/
│   │   ├── manifest.json            # Master photo manifest with LQIP and variants
│   │   └── defaultSiteContent.js    # Default copy and studio details
│   ├── worker/
│   │   └── index.js                 # Cloudflare Worker backend API & media streaming
│   ├── App.jsx                      # Root application & Lenis smooth scroll
│   ├── main.jsx                     # DOM mount point
│   └── index.css                    # Design system, glassmorphism & noise styling
├── originals/                       # Gitignored permanent local raw photo backup
├── wrangler.toml                    # Cloudflare Worker, KV, R2 & Asset configuration
├── vite.config.js                   # Vite config with local R2 proxy & API emulator
└── tailwind.config.js               # Tailored brand color tokens and typography scale
```
