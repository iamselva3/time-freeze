import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const mediaDir = path.join(projectRoot, 'public', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Read manifest to get exact slug mappings
const manifest = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'src', 'data', 'manifest.json'), 'utf8')
);

const PHOTO_MAPPINGS = [
  { file: 'Marriage/hero.jpg', slug: 'hero-timeless-vows' },
  {
    file: 'Marriage/Between shy smiles and warm laughter,their love slowly found its forever. ✨Time Freeze where mom.jpg',
    slug: 'between-shy-smiles-forever',
  },
  {
    file: 'Marriage/Where love meets the open breeze. 🤍Golden light, endless smiles, and a moment that feels like f (1).jpg',
    slug: 'open-breeze-golden-light',
  },
  {
    file: 'Marriage/Between shy smiles and warm laughter,their love slowly found its forever. ✨Time Freeze where mom (1).jpg',
    slug: 'sacred-vows-intimate',
  },
  {
    file: 'maternity/And baby makes three! ✨For enquiry-9025299312@bhuvan.official #babyshower #photographer #photogr.jpg',
    slug: 'and-baby-makes-three',
  },
  {
    file: 'maternity/Little bit of a heaven sent down to earth 🖤✨ ( Athvitha birthday stories part - 2)📸- @bhuvan.o.jpg',
    slug: 'athvitha-birthday-stories',
  },
  {
    file: 'maternity/And baby makes three! ✨For enquiry-9025299312@bhuvan.official #babyshower #photographer #photogr (1).jpg',
    slug: 'gentle-maternity-embrace',
  },
  {
    file: 'model/Haldi stories part -2 ✨💛Contact for booking - 9025299312 @bhuvan.official📸 - @nishanth_nandha .jpg',
    slug: 'haldi-stories-golden-joy',
  },
  {
    file: 'model/Haldi stories part -2 ✨💛Contact for booking - 9025299312 @bhuvan.official📸 - @nishanth_nandha  (1).jpg',
    slug: 'marigold-haldi-laughter',
  },
  {
    file: 'model/A day filled with traditions, laughter, blessings, and the kind of memories that grow more preci (1).jpg',
    slug: 'traditions-blessings-precious',
  },
  {
    file: 'Random/Beauty is always around us,all we have to do is notice!📸 - @bhuvan.official.jpg',
    slug: 'beauty-in-the-everyday',
  },
  {
    file: 'Random/Just the kick of being a performer ✨🔥Thanks for the great click @bhuvan.official @time_freeze__.jpg',
    slug: 'kick-of-being-performer',
  },
  {
    file: 'Random/தனிமையிலே இனிமை காண முடியுமா!#india #incridibleindia #tamilnadu #madhurai #oldage #lonliness  #b (1).jpg',
    slug: 'madurai-solitude-wisdom',
  },
  {
    file: 'Random/தனிமையிலே இனிமை காண முடியுமா!#india #incridibleindia #tamilnadu #madhurai #oldage #lonliness  #b.jpg',
    slug: 'ancient-madurai-heritage-portrait',
  },
];

async function exportPhotos() {
  console.log('Exporting all photos locally to public/media/...');

  for (const item of PHOTO_MAPPINGS) {
    let srcPath = path.join(projectRoot, item.file);
    if (!fs.existsSync(srcPath)) {
      srcPath = path.join(projectRoot, 'originals', path.basename(item.file));
    }
    if (!fs.existsSync(srcPath)) {
      console.warn('Could not find file:', item.file);
      continue;
    }

    const buf = fs.readFileSync(srcPath);

    // 1. Save direct /media/{slug}.webp
    await sharp(buf)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(mediaDir, `${item.slug}.webp`));

    // Also write without extension so /media/{slug} serves directly!
    fs.copyFileSync(
      path.join(mediaDir, `${item.slug}.webp`),
      path.join(mediaDir, `${item.slug}`)
    );

    // 2. Save sized variants /media/{slug}-480.webp, 800.webp, 1200.webp
    for (const w of [480, 800, 1200]) {
      await sharp(buf)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(mediaDir, `${item.slug}-${w}.webp`));
    }

    console.log(`✓ Exported local media for "${item.slug}"`);
  }

  // Also copy hero cutout
  const cutoutSrc = path.join(projectRoot, 'public', 'brand', 'hero-cutout.png');
  if (fs.existsSync(cutoutSrc)) {
    fs.copyFileSync(cutoutSrc, path.join(mediaDir, 'hero-cutout'));
    fs.copyFileSync(cutoutSrc, path.join(mediaDir, 'hero-cutout.png'));
  }

  console.log('🎉 All photos successfully exported locally to public/media!');
}

exportPhotos().catch(console.error);
