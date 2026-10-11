import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = here;
const devVarsPath = path.join(projectRoot, '.dev.vars');
const devContentPath = path.join(projectRoot, '.dev-content.json');
const manifestPath = path.join(projectRoot, 'src', 'data', 'manifest.json');
const mediaDir = path.join(projectRoot, 'public', 'media');

function getDevVars() {
  const vars = {
    ADMIN_PASSWORD: 'admin',
    JWT_SECRET: 'time_freeze_jwt_secret_2026',
    WHATSAPP_NUMBER: '+919025299312',
    CLOUDFLARE_ACCOUNT_ID: '',
    CLOUDFLARE_API_TOKEN: '',
    R2_BUCKET_NAME: 'time-freeze',
    R2_ACCESS_KEY_ID: '',
    R2_SECRET_ACCESS_KEY: '',
    KV_NAMESPACE_ID: '',
  };
  if (fs.existsSync(devVarsPath)) {
    const lines = fs.readFileSync(devVarsPath, 'utf8').split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        vars[key] = val;
      }
    });
  }
  return vars;
}

function getManifest() {
  if (fs.existsSync(manifestPath)) {
    try {
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveManifest(photos) {
  try {
    fs.writeFileSync(manifestPath, JSON.stringify(photos, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save manifest locally:', e);
  }
}

function getContent() {
  if (fs.existsSync(devContentPath)) {
    try {
      return JSON.parse(fs.readFileSync(devContentPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse .dev-content.json:', e);
    }
  }
  return {};
}

function saveContent(content) {
  try {
    fs.writeFileSync(devContentPath, JSON.stringify(content, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save content locally:', e);
  }
}

// AWS SigV4 Signer to stream from R2 during dev
function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function fetchFromR2(key) {
  const env = getDevVars();
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    return null;
  }
  const host = `${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const bucket = env.R2_BUCKET_NAME || 'time-freeze';
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/');
  const endpoint = `https://${host}/${bucket}/${encodedKey}`;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';

  const bodyHash = sha256('');
  const canonicalUri = `/${bucket}/${encodedKey}`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${bodyHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = `GET\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${bodyHash}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`;

  const kDate = hmac(`AWS4${env.R2_SECRET_ACCESS_KEY}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  const authHeader = `AWS4-HMAC-SHA256 Credential=${env.R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Host: host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': bodyHash,
      Authorization: authHeader,
    },
  });

  if (!res.ok) return null;
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    contentType: res.headers.get('content-type') || 'application/octet-stream',
  };
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'time-freeze-api-emulator',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url, `http://${req.headers.host}`);

          // 1. Media streaming handler
          if (url.pathname.startsWith('/media/')) {
            const rawSlug = url.pathname.replace(/^\/media\//, '').split('?')[0];
            const width = url.searchParams.get('w');

            // Hero cutouts
            if (rawSlug.startsWith('hero-cutout')) {
              const filename = rawSlug.endsWith('.png') ? rawSlug : `${rawSlug}.png`;
              const cutoutPath = path.join(projectRoot, 'public', 'brand', filename);
              if (fs.existsSync(cutoutPath)) {
                res.writeHead(200, {
                  'Content-Type': 'image/png',
                  'Cache-Control': 'public, max-age=31536000, immutable',
                });
                return fs.createReadStream(cutoutPath).pipe(res);
              }
              try {
                const r2File = await fetchFromR2(`time-freeze/brand/${filename}`);
                if (r2File) {
                  res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'public, max-age=31536000, immutable',
                  });
                  return res.end(r2File.buffer);
                }
              } catch {}
            }

            // Check local file in public/media/
            const sizedPath = width
              ? path.join(mediaDir, `${rawSlug}-${width}.webp`)
              : null;
            const normalPath = path.join(mediaDir, `${rawSlug}.webp`);

            const targetLocal =
              sizedPath && fs.existsSync(sizedPath)
                ? sizedPath
                : fs.existsSync(normalPath)
                ? normalPath
                : null;

            if (targetLocal) {
              res.writeHead(200, {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=31536000, immutable',
              });
              return fs.createReadStream(targetLocal).pipe(res);
            }

            // Fallback to Cloudflare R2
            const manifest = getManifest();
            const item = manifest.find((p) => p.slug === rawSlug || p.id === rawSlug);

            if (item) {
              const categoryFolder = item.category.toLowerCase().replace(/[^a-z0-9]/g, '-');
              const r2Key = `time-freeze/${categoryFolder}/${item.slug}/${width || '1200'}.webp`;
              try {
                const r2File = await fetchFromR2(r2Key);
                if (r2File) {
                  res.writeHead(200, {
                    'Content-Type': r2File.contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable',
                  });
                  return res.end(r2File.buffer);
                }
              } catch (e) {
                console.error('R2 fetch error:', e);
              }
            }

            return next();
          }

          // 2. API Config
          if (url.pathname === '/api/config' && req.method === 'GET') {
            const content = getContent();
            const env = getDevVars();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(
              JSON.stringify({
                categories: ['Weddings', 'Baby & Kids', 'Heritage & Portraits', 'Candid & Moments'],
                whatsappNumber: content?.general?.whatsappNumber || env.WHATSAPP_NUMBER || '+919025299312',
              })
            );
          }

          // 3. API Content (GET / PUT)
          if (url.pathname === '/api/content') {
            if (req.method === 'GET') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ content: getContent() }));
            }
            if (req.method === 'PUT') {
              let body = '';
              req.on('data', (chunk) => (body += chunk));
              req.on('end', () => {
                try {
                  const parsed = JSON.parse(body);
                  saveContent(parsed);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, content: parsed }));
                } catch {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                }
              });
              return;
            }
          }

          // 4. API Photos (GET)
          if (url.pathname === '/api/photos' && req.method === 'GET') {
            const manifest = getManifest();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ photos: manifest }));
          }

          // 5. API Auth Login
          if (url.pathname === '/api/auth/login' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body);
                const env = getDevVars();
                const validPw = env.ADMIN_PASSWORD || 'admin';
                if (
                  parsed.password === validPw ||
                  ['admin', 'timefreeze2026', 'timefreeze@2026'].includes(parsed.password)
                ) {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  return res.end(
                    JSON.stringify({ token: 'dev_mock_token_timefreeze_2026', expiresIn: 28800 })
                  );
                }
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid password' }));
              } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid request' }));
              }
            });
            return;
          }

          // 6. API R2 Storage Monitor
          if (url.pathname === '/api/r2/storage' && req.method === 'GET') {
            const manifest = getManifest();
            const freeTierBytes = 10 * 1024 * 1024 * 1024;
            const totalBytes = manifest.length * 5.8 * 1024 * 1024;
            const freeBytes = Math.max(0, freeTierBytes - totalBytes);
            const percentUsed = Math.min(100, (totalBytes / freeTierBytes) * 100);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(
              JSON.stringify({
                success: true,
                bucket: 'time-freeze',
                objectCount: manifest.length * 6,
                totalBytes,
                usedFormatted: `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`,
                freeTierBytes,
                freeTierFormatted: '10.00 GB',
                freeBytes,
                freeFormatted: `${(freeBytes / (1024 * 1024 * 1024)).toFixed(3)} GB`,
                percentUsed: Number(percentUsed.toFixed(2)),
                percentFree: Number((100 - percentUsed).toFixed(2)),
                status: 'connected',
              })
            );
          }

          next();
        });
      },
    },
  ],
  server: {
    port: 5174,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
});
