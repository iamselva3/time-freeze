import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const devVarsPath = path.join(projectRoot, '.dev.vars');
const originalsDir = path.join(projectRoot, 'originals');

if (!fs.existsSync(originalsDir)) {
  fs.mkdirSync(originalsDir, { recursive: true });
}

// 1. Load credentials
function loadEnv() {
  const env = {
    CLOUDFLARE_ACCOUNT_ID: '',
    CLOUDFLARE_API_TOKEN: '',
    R2_BUCKET_NAME: 'time-freeze',
    R2_ACCESS_KEY_ID: '',
    R2_SECRET_ACCESS_KEY: '',
    R2_PUBLIC_DOMAIN: '',
    KV_NAMESPACE_ID: '',
  };

  if (fs.existsSync(devVarsPath)) {
    const lines = fs.readFileSync(devVarsPath, 'utf8').split('\n');
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        const k = line.slice(0, eqIdx).trim();
        const v = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (v) env[k] = v;
      }
    }
  }
  return env;
}

// 2. AWS SigV4 Signer for Cloudflare R2
function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function uploadToR2({ accountId, accessKeyId, secretAccessKey, bucket, key, buffer, contentType }) {
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
  const endpoint = `https://${host}/${bucket}/${encodedKey}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';

  const bodyHash = sha256(buffer);
  const canonicalUri = `/${bucket}/${encodedKey}`;

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${bodyHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

  const canonicalRequest =
    `PUT\n` +
    `${canonicalUri}\n` +
    `\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${bodyHash}`;

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign =
    `AWS4-HMAC-SHA256\n` +
    `${amzDate}\n` +
    `${credentialScope}\n` +
    `${sha256(canonicalRequest)}`;

  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    Host: host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': bodyHash,
    'Content-Type': contentType || 'application/octet-stream',
    'Cache-Control': 'public, max-age=31536000, immutable',
    Authorization: authHeader,
  };

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers,
    body: buffer,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`R2 Upload failed for ${key} HTTP ${res.status}: ${errorText || res.statusText}`);
  }

  return true;
}

// 3. Image catalog mapping
const PHOTO_DEFINITIONS = [
  {
    localFile: 'Marriage/hero.jpg',
    slug: 'hero-timeless-vows',
    category: 'Weddings',
    chapter: '01',
    title: 'Timeless Vows in Temple Gold',
    subtitle: 'Sacred muhurtham in pure heirloom silk',
    alt: 'Traditional couple fine art portrait by Time Freeze Studio',
    client: 'Divya & Arjun',
    location: 'Madurai Heritage Palace',
    date: 'December 2025',
    story: 'Captured at golden sunrise amidst ambient temple lamps, preserving the stillness and depth of a once-in-a-lifetime vow.',
    featured: true,
    isCover: true,
    order: 0,
  },
  {
    localFile: 'Marriage/Between shy smiles and warm laughter,their love slowly found its forever. ✨Time Freeze where mom.jpg',
    slug: 'between-shy-smiles-forever',
    category: 'Weddings',
    chapter: '01',
    title: 'Where Love Found Its Forever',
    subtitle: 'Quiet grace and unhurried smiles',
    alt: 'Bride and groom intimate candid ceremony portrait by Time Freeze Studio',
    client: 'Kavya & Pradeep',
    location: 'Chettinad Heritage Mansion',
    date: 'November 2025',
    story: 'Between shy glances and warm laughter, their connection unfolded gently in the soft afternoon verandah light.',
    featured: true,
    isCover: false,
    order: 1,
  },
  {
    localFile: 'Marriage/Where love meets the open breeze. 🤍Golden light, endless smiles, and a moment that feels like f (1).jpg',
    slug: 'open-breeze-golden-light',
    category: 'Weddings',
    chapter: '01',
    title: 'Where Love Meets the Open Breeze',
    subtitle: 'Golden hour warmth and open skies',
    alt: 'Sunset outdoor pre-wedding session by Time Freeze Studio',
    client: 'Ananya & Rohit',
    location: 'Anamalai Foothills, Tamil Nadu',
    date: 'January 2026',
    story: 'Wind whispering through the trees, genuine unposed laughter, and a sunset that cast an amber glow over everything.',
    featured: true,
    isCover: false,
    order: 2,
  },
  {
    localFile: 'Marriage/Between shy smiles and warm laughter,their love slowly found its forever. ✨Time Freeze where mom (1).jpg',
    slug: 'sacred-vows-intimate',
    category: 'Weddings',
    chapter: '01',
    title: 'Sacred Petals & Gentle Touch',
    subtitle: 'Candid wedding moments held in stillness',
    alt: 'Emotional couple embrace during wedding rituals by Time Freeze',
    client: 'Divya & Arjun',
    location: 'Madurai',
    date: 'December 2025',
    story: 'Every tradition holds an unspoken depth. We remain quiet observers so the true memory stays untarnished.',
    featured: false,
    isCover: false,
    order: 3,
  },
  {
    localFile: 'maternity/And baby makes three! ✨For enquiry-9025299312@bhuvan.official #babyshower #photographer #photogr.jpg',
    slug: 'and-baby-makes-three',
    category: 'Baby & Kids',
    chapter: '02',
    title: 'And Baby Makes Three',
    subtitle: 'Maternal serenity and quiet anticipation',
    alt: 'Fine art maternity indoor shoot by Time Freeze Studio',
    client: 'Pooja & Vikram',
    location: 'Time Freeze Studio, Madurai',
    date: 'February 2026',
    story: 'Gentle morning light illuminating the curve of expectant life, celebrating the calm before a joyous beginning.',
    featured: true,
    isCover: true,
    order: 4,
  },
  {
    localFile: 'maternity/Little bit of a heaven sent down to earth 🖤✨ ( Athvitha birthday stories part - 2)📸- @bhuvan.o.jpg',
    slug: 'athvitha-birthday-stories',
    category: 'Baby & Kids',
    chapter: '02',
    title: 'Heaven Sent Down to Earth',
    subtitle: 'Athvitha milestone celebration & pure innocence',
    alt: 'Child fine art portrait by Time Freeze Studio',
    client: 'Little Athvitha',
    location: 'Madurai Botanical Courtyard',
    date: 'January 2026',
    story: 'Eyes wide with wonder and genuine laughter. Childhood passes in a blink; here it is held forever still.',
    featured: true,
    isCover: false,
    order: 5,
  },
  {
    localFile: 'maternity/And baby makes three! ✨For enquiry-9025299312@bhuvan.official #babyshower #photographer #photogr (1).jpg',
    slug: 'gentle-maternity-embrace',
    category: 'Baby & Kids',
    chapter: '02',
    title: 'The Maternal Embrace',
    subtitle: 'Tender expectations and loving hands',
    alt: 'Maternity portrait session by Time Freeze Studio',
    client: 'Pooja & Vikram',
    location: 'Time Freeze Studio',
    date: 'February 2026',
    story: 'Soft textures, warm directional daylight, and the sacred bond between parents waiting for their miracle.',
    featured: false,
    isCover: false,
    order: 6,
  },
  {
    localFile: 'model/Haldi stories part -2 ✨💛Contact for booking - 9025299312 @bhuvan.official📸 - @nishanth_nandha .jpg',
    slug: 'haldi-stories-golden-joy',
    category: 'Weddings',
    chapter: '01',
    title: 'Haldi Stories — Golden Joy',
    subtitle: 'Euphoric marigold petals and festive cheer',
    alt: 'Vibrant Haldi celebration captured by Time Freeze',
    client: 'Nishanth & Nandha',
    location: 'Coimbatore Heritage Lawn',
    date: 'November 2025',
    story: 'Laughter erupting like sunlight as loved ones shower yellow turmeric blossoms upon the smiling groom.',
    featured: true,
    isCover: false,
    order: 7,
  },
  {
    localFile: 'model/Haldi stories part -2 ✨💛Contact for booking - 9025299312 @bhuvan.official📸 - @nishanth_nandha  (1).jpg',
    slug: 'marigold-haldi-laughter',
    category: 'Weddings',
    chapter: '01',
    title: 'Marigold Haldi Cascade',
    subtitle: 'Unfiltered happiness in vivid yellow',
    alt: 'Haldi splashing and candid smiles by Time Freeze Studio',
    client: 'Nishanth & Nandha',
    location: 'Coimbatore',
    date: 'November 2025',
    story: 'Pure energy, genuine surprise, and color so rich it leaps straight from the frame.',
    featured: false,
    isCover: false,
    order: 8,
  },
  {
    localFile: 'model/A day filled with traditions, laughter, blessings, and the kind of memories that grow more preci (1).jpg',
    slug: 'traditions-blessings-precious',
    category: 'Heritage & Portraits',
    chapter: '03',
    title: 'Traditions & Blessings',
    subtitle: 'Heirloom ethnic portraiture and fine art lighting',
    alt: 'Traditional South Indian ritual portrait by Time Freeze Studio',
    client: 'Meenakshi & Family',
    location: 'Madurai Heritage Hall',
    date: 'October 2025',
    story: 'Ancestral blessings, jasmine garlands, and family heritage preserved with editorial craft.',
    featured: true,
    isCover: true,
    order: 9,
  },
  {
    localFile: 'Random/Beauty is always around us,all we have to do is notice!📸 - @bhuvan.official.jpg',
    slug: 'beauty-in-the-everyday',
    category: 'Candid & Moments',
    chapter: '03',
    title: 'Beauty in the Everyday',
    subtitle: 'Chiaroscuro ambient lighting and quiet presence',
    alt: 'Atmospheric candid portrait by Time Freeze Studio',
    client: 'Fine Art Editorial',
    location: 'Madurai Temple Street',
    date: 'January 2026',
    story: 'Light filtering through ancient teak doors, illuminating a peaceful pause in the flow of time.',
    featured: true,
    isCover: false,
    order: 10,
  },
  {
    localFile: 'Random/Just the kick of being a performer ✨🔥Thanks for the great click @bhuvan.official @time_freeze__.jpg',
    slug: 'kick-of-being-performer',
    category: 'Candid & Moments',
    chapter: '03',
    title: "The Performer's Soul",
    subtitle: 'Dynamic motion frozen in golden stage light',
    alt: 'Stage artist dramatic motion freeze portrait by Time Freeze',
    client: 'Classical Performer',
    location: 'Madurai Auditorium',
    date: 'December 2025',
    story: 'The exact microsecond of peak expression—sweat, spirit, and stage intensity suspended in amber light.',
    featured: true,
    isCover: false,
    order: 11,
  },
  {
    localFile: 'Random/தனிமையிலே இனிமை காண முடியுமா!#india #incridibleindia #tamilnadu #madhurai #oldage #lonliness  #b (1).jpg',
    slug: 'madurai-solitude-wisdom',
    category: 'Candid & Moments',
    chapter: '03',
    title: 'Wisdom in the Ancient Courtyard',
    subtitle: 'Soulful documentary portrait in historic Madurai',
    alt: 'Elderly gentleman contemplative portrait in Madurai by Time Freeze',
    client: 'Madurai Heritage Series',
    location: 'Madurai Old City',
    date: 'September 2025',
    story: 'Eight decades of living written into honest facial lines, illuminated by the timeless Tamil sun.',
    featured: true,
    isCover: true,
    order: 12,
  },
  {
    localFile: 'Random/தனிமையிலே இனிமை காண முடியுமா!#india #incridibleindia #tamilnadu #madhurai #oldage #lonliness  #b.jpg',
    slug: 'ancient-madurai-heritage-portrait',
    category: 'Candid & Moments',
    chapter: '03',
    title: 'Heirloom Heritage of Madurai',
    subtitle: 'Timeless presence captured in natural ambient shadow',
    alt: 'Fine art documentary portrait by Time Freeze Studio',
    client: 'Madurai Heritage Series',
    location: 'Madurai Old City',
    date: 'September 2025',
    story: 'A meditative study in stillness. Photography is the only art that halts the passage of time without altering the truth.',
    featured: false,
    isCover: false,
    order: 13,
  },
];

// 4. Color and LQIP extractors
async function getDominantColor(imageBuffer) {
  const { data } = await sharp(imageBuffer)
    .resize(1, 1, { fit: 'cover' })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const r = data[0].toString(16).padStart(2, '0');
  const g = data[1].toString(16).padStart(2, '0');
  const b = data[2].toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

async function getLQIP(imageBuffer) {
  const lqipBuffer = await sharp(imageBuffer)
    .resize(20, 25, { fit: 'cover' })
    .blur(3)
    .webp({ quality: 20 })
    .toBuffer();
  return `data:image/webp;base64,${lqipBuffer.toString('base64')}`;
}

// 5. Main processing loop
async function run() {
  console.log('\n========================================================');
  console.log('   TIME FREEZE STUDIO — CLOUDFLARE R2 IMAGE PIPELINE');
  console.log('========================================================\n');

  const env = loadEnv();
  console.log('Target Bucket:', env.R2_BUCKET_NAME);
  console.log('Account ID:   ', env.CLOUDFLARE_ACCOUNT_ID ? '✓ ' + env.CLOUDFLARE_ACCOUNT_ID.slice(0, 8) + '...' : '✗ missing');
  console.log('Access Key ID:', env.R2_ACCESS_KEY_ID ? '✓ ' + env.R2_ACCESS_KEY_ID.slice(0, 8) + '...' : '✗ missing');

  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error('Missing Cloudflare R2 credentials in .dev.vars');
  }

  // Backup originals to /originals/
  console.log('\nBacking up originals to /originals/...');
  for (const item of PHOTO_DEFINITIONS) {
    const srcPath = path.join(projectRoot, item.localFile);
    if (fs.existsSync(srcPath)) {
      const backupPath = path.join(originalsDir, path.basename(item.localFile));
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(srcPath, backupPath);
      }
    }
  }

  const manifest = [];
  const targetWidths = [480, 800, 1200, 1800, 2400];

  for (let idx = 0; idx < PHOTO_DEFINITIONS.length; idx++) {
    const def = PHOTO_DEFINITIONS[idx];
    const srcPath = path.join(projectRoot, def.localFile);

    if (!fs.existsSync(srcPath)) {
      console.warn(`[WARN] Skipping missing file: ${def.localFile}`);
      continue;
    }

    console.log(`\n[${idx + 1}/${PHOTO_DEFINITIONS.length}] Processing "${def.title}" (${def.slug})...`);
    const inputBuffer = fs.readFileSync(srcPath);
    const meta = await sharp(inputBuffer).metadata();
    const origWidth = meta.width || 1200;
    const origHeight = meta.height || 1500;
    const orientation = origWidth > origHeight ? 'landscape' : (origHeight > origWidth ? 'portrait' : 'square');
    const aspectRatio = origHeight ? Number((origWidth / origHeight).toFixed(3)) : 0.8;

    const dominantColor = await getDominantColor(inputBuffer);
    const lqip = await getLQIP(inputBuffer);

    const widthsToGenerate = targetWidths.filter(w => w <= origWidth);
    if (!widthsToGenerate.includes(origWidth)) widthsToGenerate.push(origWidth);
    widthsToGenerate.sort((a, b) => a - b);

    const variants = {
      webp: {},
      avif: {},
    };

    // Category folder for R2 key
    const categoryFolder = def.category.toLowerCase().replace(/[^a-z0-9]/g, '-');

    for (const w of widthsToGenerate) {
      // 1. WebP
      const webpBuffer = await sharp(inputBuffer)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      const webpKey = `time-freeze/${categoryFolder}/${def.slug}/${w}.webp`;
      await uploadToR2({
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket: env.R2_BUCKET_NAME,
        key: webpKey,
        buffer: webpBuffer,
        contentType: 'image/webp',
      });
      variants.webp[w] = `/media/${def.slug}?w=${w}&fmt=webp`;

      // 2. AVIF
      const avifBuffer = await sharp(inputBuffer)
        .resize(w, null, { withoutEnlargement: true })
        .avif({ quality: 80, effort: 4 })
        .toBuffer();

      const avifKey = `time-freeze/${categoryFolder}/${def.slug}/${w}.avif`;
      await uploadToR2({
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket: env.R2_BUCKET_NAME,
        key: avifKey,
        buffer: avifBuffer,
        contentType: 'image/avif',
      });
      variants.avif[w] = `/media/${def.slug}?w=${w}&fmt=avif`;

      process.stdout.write(`  ✓ ${w}px (webp: ${(webpBuffer.length / 1024).toFixed(0)}KB, avif: ${(avifBuffer.length / 1024).toFixed(0)}KB)\n`);
    }

    // Thumbnail key for admin / fast grids
    const thumbKey = `time-freeze/${categoryFolder}/${def.slug}/480.webp`;
    const primaryKey = `time-freeze/${categoryFolder}/${def.slug}/${widthsToGenerate[widthsToGenerate.length - 1]}.webp`;

    const photoEntry = {
      id: `tf-${def.slug}`,
      slug: def.slug,
      category: def.category,
      chapter: def.chapter,
      title: def.title,
      subtitle: def.subtitle,
      alt: def.alt,
      client: def.client,
      location: def.location,
      date: def.date,
      story: def.story,
      dimensions: {
        width: origWidth,
        height: origHeight,
      },
      orientation,
      aspectRatio,
      dominantColor,
      lqip,
      key: primaryKey,
      thumbnailKey: thumbKey,
      url: `/media/${def.slug}`,
      thumbnailUrl: `/media/${def.slug}?w=480&fmt=webp`,
      variants,
      availableWidths: widthsToGenerate,
      featured: def.featured,
      isCover: def.isCover,
      order: def.order,
      visibility: true,
      createdAt: new Date().toISOString(),
    };

    manifest.push(photoEntry);
  }

  // Upload hero cutout to R2
  const heroCutoutSrc = path.join(projectRoot, 'public', 'brand', 'hero-cutout.png');
  if (fs.existsSync(heroCutoutSrc)) {
    console.log('\nProcessing and uploading Hero Cutout layers...');
    const cutoutBuf = fs.readFileSync(heroCutoutSrc);
    const cutoutMeta = await sharp(cutoutBuf).metadata();

    const cutoutWebp = await sharp(cutoutBuf).webp({ quality: 90 }).toBuffer();
    await uploadToR2({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucket: env.R2_BUCKET_NAME,
      key: 'time-freeze/brand/hero-cutout.png',
      buffer: cutoutBuf,
      contentType: 'image/png',
    });
    await uploadToR2({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucket: env.R2_BUCKET_NAME,
      key: 'time-freeze/brand/hero-cutout.webp',
      buffer: cutoutWebp,
      contentType: 'image/webp',
    });
    console.log(`  ✓ Hero cutout PNG & WebP uploaded to R2 (${cutoutMeta.width}x${cutoutMeta.height})`);
  }

  // Upload brand badge and monogram
  const badgeSrc = path.join(projectRoot, 'public', 'brand', 'logo-badge.png');
  if (fs.existsSync(badgeSrc)) {
    const badgeBuf = fs.readFileSync(badgeSrc);
    await uploadToR2({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucket: env.R2_BUCKET_NAME,
      key: 'time-freeze/brand/logo-badge.png',
      buffer: badgeBuf,
      contentType: 'image/png',
    });
    console.log('  ✓ Brand circular badge uploaded to R2');
  }

  // Upload manifest.json to R2
  console.log('\nUploading master manifest.json to Cloudflare R2...');
  const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8');
  await uploadToR2({
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET_NAME,
    key: 'time-freeze/manifest.json',
    buffer: manifestBuffer,
    contentType: 'application/json',
  });
  console.log('  ✓ time-freeze/manifest.json uploaded to R2!');

  // Save manifest locally in src/data/manifest.json
  const dataDir = path.join(projectRoot, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(path.join(dataDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('  ✓ Local copy saved in src/data/manifest.json');

  // Also sync directly into Cloudflare KV TIME_FREEZE_META
  if (env.KV_NAMESPACE_ID && env.CLOUDFLARE_API_TOKEN) {
    console.log('\nSeeding photos:index into Cloudflare KV TIME_FREEZE_META...');
    const kvUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${env.KV_NAMESPACE_ID}/values/photos:index`;
    const kvRes = await fetch(kvUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manifest),
    });
    const kvData = await kvRes.json();
    if (kvData.success) {
      console.log('  ✓ Successfully synced photos:index into Cloudflare KV!');
    } else {
      console.warn('  ✗ Cloudflare KV sync warning:', kvData.errors);
    }
  }

  console.log('\n========================================================');
  console.log(`  🎉 SUCCESS! Processed ${manifest.length} photo suites to R2 bucket "${env.R2_BUCKET_NAME}"`);
  console.log('========================================================\n');
}

run().catch((err) => {
  console.error('\n❌ Error during processing & upload:', err);
  process.exit(1);
});
