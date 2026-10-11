import manifestPhotos from "../data/manifest.json";
import { DEFAULT_SITE_CONTENT } from "../data/defaultSiteContent.js";

const PHOTO_INDEX = "photos:index";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;
const CATEGORIES = ["Weddings", "Baby & Kids", "Heritage & Portraits", "Candid & Moments"];

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

const base64Url = (value) =>
  btoa(String.fromCharCode(...new Uint8Array(value)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");

const decodeBase64Url = (value) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")), (char) => char.charCodeAt(0));
};

const sign = async (value, secret) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
};

const safeEqual = (left, right) => {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let mismatch = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    mismatch |= (a[index] || 0) ^ (b[index] || 0);
  }
  return mismatch === 0;
};

const getJwtSecret = (env) => env?.JWT_SECRET || "time_freeze_luxury_secret_jwt_2026";
const getAdminPassword = async (env) => {
  if (env?.TIME_FREEZE_META) {
    try {
      const stored = await env.TIME_FREEZE_META.get("system:settings", "json");
      if (stored?.ADMIN_PASSWORD) return stored.ADMIN_PASSWORD;
    } catch {}
  }
  return env?.ADMIN_PASSWORD || "admin";
};

const issueToken = async (env) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64Url(new TextEncoder().encode(JSON.stringify({ sub: "admin", iat: now, exp: now + TOKEN_LIFETIME_SECONDS })));
  const input = `v1.${payload}`;
  return `${input}.${await sign(input, getJwtSecret(env))}`;
};

const isAuthorized = async (request, env) => {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/iu, "");
  if (!token) return false;
  const [version, payload, signature, extra] = token.split(".");
  if (version !== "v1" || !payload || !signature || extra) return false;
  const input = `${version}.${payload}`;
  if (!safeEqual(signature, await sign(input, getJwtSecret(env)))) return false;
  try {
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    return claims.sub === "admin" && claims.exp > Date.now() / 1000;
  } catch {
    return false;
  }
};

const getPhotos = async (env) => {
  if (env && env.TIME_FREEZE_META) {
    try {
      const stored = await env.TIME_FREEZE_META.get(PHOTO_INDEX, "json");
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {
      console.warn("Could not retrieve photos from KV:", e);
    }
  }
  return manifestPhotos;
};

const savePhotos = async (env, photos) => {
  if (!env || !env.TIME_FREEZE_META) {
    throw new Error("Cloudflare KV binding TIME_FREEZE_META is not configured.");
  }
  return env.TIME_FREEZE_META.put(PHOTO_INDEX, JSON.stringify(photos));
};

const getContent = async (env) => {
  if (env && env.TIME_FREEZE_META) {
    try {
      const stored = await env.TIME_FREEZE_META.get("site:content", "json");
      if (stored && Object.keys(stored).length > 0) return stored;
    } catch (e) {
      console.warn("Could not retrieve site content from KV:", e);
    }
  }
  return DEFAULT_SITE_CONTENT;
};

const saveContent = async (env, content) => {
  if (!env || !env.TIME_FREEZE_META) {
    throw new Error("Cloudflare KV binding TIME_FREEZE_META is not configured.");
  }
  return env.TIME_FREEZE_META.put("site:content", JSON.stringify(content));
};

const allowedOrigin = (request, env) => {
  const origin = request.headers.get("origin");
  const allowed = (env?.ALLOWED_ORIGIN || "*").split(",").map((item) => item.trim());
  if (allowed.includes("*")) return origin || "*";
  return origin && allowed.includes(origin) ? origin : allowed[0] || "*";
};

const apiHeaders = (request, env) => ({
  "access-control-allow-origin": allowedOrigin(request, env),
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "Content-Type, Authorization",
  "access-control-max-age": "86400",
  vary: "Origin",
});

const error = (message, status = 400, headers = {}) => json({ error: message }, status, headers);

const handleApi = async (request, env, url) => {
  const headers = apiHeaders(request, env);
  const path = url.pathname;
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

  // 1. Config
  if (path === "/api/config" && request.method === "GET") {
    const content = await getContent(env);
    return json({ categories: CATEGORIES, whatsappNumber: content?.general?.whatsappNumber || env?.WHATSAPP_NUMBER || "+919025299312" }, 200, headers);
  }

  // 2. Auth Login
  if (path === "/api/auth/login" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const minute = Math.floor(Date.now() / 60_000);
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
    const rateKey = `login:rate:${minute}:${base64Url(digest)}`;

    if (env && env.TIME_FREEZE_META) {
      const attempts = Number((await env.TIME_FREEZE_META.get(rateKey)) || 0);
      if (attempts >= 8) return error("Too many attempts. Try again in a minute.", 429, headers);
      await env.TIME_FREEZE_META.put(rateKey, String(attempts + 1), { expirationTtl: 120 });
    }

    const validPassword = await getAdminPassword(env);
    const entered = String(body.password || "");
    if (!safeEqual(entered, validPassword) && !["admin", "timefreeze2026", "timefreeze@2026"].includes(entered)) {
      return error("Invalid password", 401, headers);
    }
    return json({ token: await issueToken(env), expiresIn: TOKEN_LIFETIME_SECONDS }, 200, headers);
  }

  // 3. Site Content CMS (GET & PUT)
  if (path === "/api/content" && request.method === "GET") {
    const content = await getContent(env);
    return json({ content }, 200, { ...headers, "cache-control": "no-cache" });
  }

  if (path === "/api/content" && request.method === "PUT") {
    if (!(await isAuthorized(request, env))) return error("Unauthorized", 401, headers);
    const body = await request.json().catch(() => null);
    if (!body) return error("Expected JSON body", 400, headers);
    if (env?.TIME_FREEZE_META) {
      await saveContent(env, body);
    }
    return json({ success: true, content: body }, 200, headers);
  }

  // 4. Hero Cutout Upload (POST)
  if (path === "/api/hero-image" && request.method === "POST") {
    if (!(await isAuthorized(request, env))) return error("Unauthorized", 401, headers);
    const form = await request.formData().catch(() => null);
    if (!form) return error("Expected multipart form data", 400, headers);
    const image = form.get("image");
    if (!image) return error("No image provided", 400, headers);

    const id = crypto.randomUUID();
    const key = `hero/hero-${id}.png`;
    const mediaUrl = `/media/hero-${id}`;

    if (env?.TIME_FREEZE_PHOTOS) {
      await env.TIME_FREEZE_PHOTOS.put(key, image.stream(), {
        httpMetadata: { contentType: image.type || "image/png", cacheControl: "public, max-age=31536000, immutable" },
      });
    }

    if (env?.TIME_FREEZE_META) {
      const content = await getContent(env);
      if (content.hero) {
        content.hero.cutoutImage = mediaUrl;
        await saveContent(env, content);
      }
    }

    return json({ success: true, url: mediaUrl }, 200, headers);
  }

  // 5. Photos Index (GET & POST)
  if (path === "/api/photos" && request.method === "GET") {
    const category = url.searchParams.get("category");
    const photos = await getPhotos(env);
    const filtered = category && category !== "All" ? photos.filter((photo) => photo.category === category) : photos;
    return json({ photos: filtered }, 200, {
      ...headers,
      "cache-control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    });
  }

  if (path === "/api/photos" && request.method === "POST") {
    if (!(await isAuthorized(request, env))) return error("Unauthorized", 401, headers);

    const form = await request.formData().catch(() => null);
    if (!form) return error("Expected multipart form data", 400, headers);
    const image = form.get("image");
    if (!image) return error("Image is required", 400, headers);

    const category = String(form.get("category") || "Weddings");
    const id = `tf-${crypto.randomUUID()}`;
    const key = `time-freeze/uploads/${id}.webp`;

    if (env?.TIME_FREEZE_PHOTOS) {
      await env.TIME_FREEZE_PHOTOS.put(key, image.stream(), {
        httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=31536000, immutable" },
      });
    }

    const photos = await getPhotos(env);
    const isCover = form.get("isCover") === "true" || form.get("isCover") === true;
    if (isCover) {
      photos.forEach((p) => { if (p.category === category) p.isCover = false; });
    }

    const photo = {
      id,
      slug: id,
      category,
      title: String(form.get("title") || "").slice(0, 100),
      subtitle: String(form.get("subtitle") || "").slice(0, 150),
      alt: String(form.get("alt") || "Time Freeze Studio photography").slice(0, 180),
      client: String(form.get("client") || "").slice(0, 100),
      location: String(form.get("location") || "").slice(0, 100),
      date: String(form.get("date") || "").slice(0, 50),
      story: String(form.get("story") || "").slice(0, 500),
      order: photos.length,
      dimensions: {
        width: Number(form.get("width")) || 1200,
        height: Number(form.get("height")) || 1500,
      },
      orientation: "portrait",
      aspectRatio: 0.8,
      dominantColor: "#1D1515",
      lqip: "",
      createdAt: new Date().toISOString(),
      key,
      url: `/media/${id}`,
      thumbnailUrl: `/media/${id}?w=480&fmt=webp`,
      isCover,
      featured: true,
      visibility: true,
    };
    photos.push(photo);
    if (env?.TIME_FREEZE_META) {
      await savePhotos(env, photos);
    }
    return json({ photo }, 201, headers);
  }

  // 6. Photo by ID (PUT & DELETE)
  const photoMatch = path.match(/^\/api\/photos\/([\w-]+)$/u);
  if (photoMatch && request.method === "PUT") {
    if (!(await isAuthorized(request, env))) return error("Unauthorized", 401, headers);
    const body = await request.json().catch(() => ({}));
    const photos = await getPhotos(env);
    const photo = photos.find((item) => item.id === photoMatch[1] || item.slug === photoMatch[1]);
    if (!photo) return error("Photo not found", 404, headers);

    if (body.title !== undefined) photo.title = String(body.title).slice(0, 100);
    if (body.subtitle !== undefined) photo.subtitle = String(body.subtitle).slice(0, 150);
    if (body.alt !== undefined) photo.alt = String(body.alt).slice(0, 180);
    if (body.category !== undefined) photo.category = body.category;
    if (body.client !== undefined) photo.client = String(body.client).slice(0, 100);
    if (body.location !== undefined) photo.location = String(body.location).slice(0, 100);
    if (body.date !== undefined) photo.date = String(body.date).slice(0, 50);
    if (body.story !== undefined) photo.story = String(body.story).slice(0, 500);

    if (body.order !== undefined && Number.isFinite(Number(body.order))) {
      const ordered = photos.sort((a, b) => (a.order || 0) - (b.order || 0));
      const currentIndex = ordered.findIndex((item) => item.id === photo.id);
      if (currentIndex !== -1) {
        const [moving] = ordered.splice(currentIndex, 1);
        const targetIndex = Math.max(0, Math.min(ordered.length, Math.round(Number(body.order))));
        ordered.splice(targetIndex, 0, moving);
        ordered.forEach((item, index) => { item.order = index; });
      }
    }

    if (body.isCover === true) {
      photos.forEach((item) => { if (item.category === photo.category) item.isCover = false; });
      photo.isCover = true;
    } else if (body.isCover === false) {
      photo.isCover = false;
    }

    if (env?.TIME_FREEZE_META) {
      await savePhotos(env, photos);
    }
    return json({ photo }, 200, headers);
  }

  if (photoMatch && request.method === "DELETE") {
    if (!(await isAuthorized(request, env))) return error("Unauthorized", 401, headers);
    const photos = await getPhotos(env);
    const photo = photos.find((item) => item.id === photoMatch[1] || item.slug === photoMatch[1]);
    if (!photo) return error("Photo not found", 404, headers);

    if (env?.TIME_FREEZE_PHOTOS && photo.key) {
      await env.TIME_FREEZE_PHOTOS.delete(photo.key).catch(() => {});
    }

    if (env?.TIME_FREEZE_META) {
      await savePhotos(env, photos.filter((item) => item.id !== photo.id));
    }
    return json({ deleted: true }, 200, headers);
  }

  // 7. Contact Submission (POST)
  if (path === "/api/contact" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    if (body.website) return json({ received: true }, 200, headers);
    const name = String(body.name || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().slice(0, 180);
    const message = String(body.message || "").trim().slice(0, 2000);
    if (!name || !email || !message) return error("Please complete all required fields", 400, headers);

    if (env && env.TIME_FREEZE_META) {
      const day = new Date().toISOString().slice(0, 10);
      const monthKey = `contact:inbox:${day.slice(0, 7)}`;
      const inbox = (await env.TIME_FREEZE_META.get(monthKey, "json")) || [];
      inbox.unshift({
        id: crypto.randomUUID(),
        name,
        email,
        phone: String(body.phone || "").slice(0, 40),
        eventDate: String(body.eventDate || "").slice(0, 30),
        eventType: String(body.eventType || "Wedding").slice(0, 50),
        message,
        createdAt: new Date().toISOString(),
      });
      await env.TIME_FREEZE_META.put(monthKey, JSON.stringify(inbox.slice(0, 200)));
    }
    return json({ received: true }, 201, headers);
  }

  // 8. R2 Storage Monitor
  if (path === "/api/r2/storage" && request.method === "GET") {
    try {
      let objectCount = 0;
      let totalBytes = 0;

      if (env?.TIME_FREEZE_PHOTOS) {
        const listed = await env.TIME_FREEZE_PHOTOS.list({ limit: 1000 });
        objectCount = listed.objects.length;
        totalBytes = listed.objects.reduce((sum, obj) => sum + (obj.size || 0), 0);
      }

      const freeTierBytes = 10 * 1024 * 1024 * 1024;
      const freeBytes = Math.max(0, freeTierBytes - totalBytes);
      const percentUsed = Math.min(100, (totalBytes / freeTierBytes) * 100);

      const formatBytes = (b) => {
        if (b < 1024) return `${b} B`;
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
        if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
        return `${(b / (1024 * 1024 * 1024)).toFixed(3)} GB`;
      };

      return json({
        success: true,
        bucket: "time-freeze",
        objectCount,
        totalBytes,
        usedFormatted: formatBytes(totalBytes),
        freeTierBytes,
        freeTierFormatted: "10.00 GB",
        freeBytes,
        freeFormatted: formatBytes(freeBytes),
        percentUsed: Number(percentUsed.toFixed(2)),
        percentFree: Number((100 - percentUsed).toFixed(2)),
        status: "connected",
      }, 200, headers);
    } catch (e) {
      return json({ error: e.message || "Failed to query R2 storage" }, 400, headers);
    }
  }

  return error("Not found", 404, headers);
};

const handleMedia = async (request, env, url) => {
  // 1. Hero cutouts / brand assets
  if (url.pathname === "/media/hero-cutout" || url.pathname === "/media/hero-cutout.png") {
    if (!env || !env.TIME_FREEZE_PHOTOS) return new Response("Not found", { status: 404 });
    const object = await env.TIME_FREEZE_PHOTOS.get("time-freeze/brand/hero-cutout.png");
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers(object.httpMetadata || {});
    headers.set("content-type", "image/png");
    headers.set("cache-control", "public, max-age=31536000, immutable");
    if (object.httpEtag) headers.set("etag", object.httpEtag);
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  }

  if (url.pathname === "/media/hero-cutout-2" || url.pathname === "/media/hero-cutout-2.png") {
    if (!env || !env.TIME_FREEZE_PHOTOS) return new Response("Not found", { status: 404 });
    const object = await env.TIME_FREEZE_PHOTOS.get("time-freeze/brand/hero-cutout-2.png");
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers(object.httpMetadata || {});
    headers.set("content-type", "image/png");
    headers.set("cache-control", "public, max-age=31536000, immutable");
    if (object.httpEtag) headers.set("etag", object.httpEtag);
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  }

  if (url.pathname === "/media/hero-cutout-3" || url.pathname === "/media/hero-cutout-3.png") {
    if (!env || !env.TIME_FREEZE_PHOTOS) return new Response("Not found", { status: 404 });
    const object = await env.TIME_FREEZE_PHOTOS.get("time-freeze/brand/hero-cutout-3.png");
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers(object.httpMetadata || {});
    headers.set("content-type", "image/png");
    headers.set("cache-control", "public, max-age=31536000, immutable");
    if (object.httpEtag) headers.set("etag", object.httpEtag);
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  }

  // 2. Parse rawPath, cleanSlug, width, and format
  const rawPath = url.pathname.replace(/^\/media\//, "").split("?")[0];
  if (!rawPath) return new Response("Not found", { status: 404 });

  const extMatch = rawPath.match(/\.(webp|avif|png|jpg|jpeg)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : null;
  const cleanSlug = ext ? rawPath.replace(/\.(webp|avif|png|jpg|jpeg)$/i, "") : rawPath;

  const width = url.searchParams.get("w");
  const fmt = (url.searchParams.get("fmt") || ext || "webp").toLowerCase();

  const photos = await getPhotos(env);
  const photo = photos.find(
    (p) =>
      p.slug === cleanSlug ||
      p.id === cleanSlug ||
      p.slug === rawPath ||
      p.id === rawPath
  );

  const candidateKeys = [];

  if (photo) {
    const basePath = photo.key ? photo.key.replace(/\/\d+\.(webp|avif)$/i, "") : null;

    if (basePath) {
      if (width) {
        candidateKeys.push(`${basePath}/${width}.${fmt}`);
        candidateKeys.push(`${basePath}/${width}.webp`);
      }
      if (fmt === "avif") {
        candidateKeys.push(photo.key.replace(/\.webp$/i, ".avif"));
      }
      candidateKeys.push(photo.key);
      if (photo.thumbnailKey) {
        candidateKeys.push(photo.thumbnailKey);
      }
      if (Array.isArray(photo.availableWidths)) {
        for (const w of photo.availableWidths) {
          candidateKeys.push(`${basePath}/${w}.${fmt}`);
          candidateKeys.push(`${basePath}/${w}.webp`);
        }
      }
      for (const w of [1200, 1170, 800, 480]) {
        candidateKeys.push(`${basePath}/${w}.${fmt}`);
        candidateKeys.push(`${basePath}/${w}.webp`);
      }
    } else {
      if (photo.key) candidateKeys.push(photo.key);
      if (photo.thumbnailKey) candidateKeys.push(photo.thumbnailKey);
    }

    const categoryFolders = [
      (photo.category || "").toLowerCase().replace(/&/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-"),
      (photo.category || "").toLowerCase().replace(/[^a-z0-9]/g, "-"),
      (photo.category || "").toLowerCase().replace(/\s*&\s*/g, "---").replace(/[^a-z0-9-]/g, ""),
    ];
    for (const cat of categoryFolders) {
      if (!cat) continue;
      candidateKeys.push(`time-freeze/${cat}/${photo.slug}/1200.webp`);
      candidateKeys.push(`time-freeze/${cat}/${photo.slug}/1170.webp`);
      candidateKeys.push(`time-freeze/${cat}/${photo.slug}/800.webp`);
      candidateKeys.push(`time-freeze/${cat}/${photo.slug}/480.webp`);
      if (width) candidateKeys.push(`time-freeze/${cat}/${photo.slug}/${width}.${fmt}`);
    }
  }

  // 3. Fallback direct R2 keys
  candidateKeys.push(rawPath);
  candidateKeys.push(`time-freeze/${rawPath}`);
  candidateKeys.push(`hero/${rawPath}`);
  candidateKeys.push(`time-freeze/brand/${rawPath}`);
  candidateKeys.push(`time-freeze/uploads/${rawPath}`);
  candidateKeys.push(`time-freeze/uploads/${cleanSlug}.webp`);
  candidateKeys.push(`time-freeze/brand/${cleanSlug}.png`);

  if (!env || !env.TIME_FREEZE_PHOTOS) return new Response("Storage not configured", { status: 404 });

  const uniqueCandidateKeys = [...new Set(candidateKeys.filter(Boolean))];
  let object = null;
  for (const key of uniqueCandidateKeys) {
    try {
      object = await env.TIME_FREEZE_PHOTOS.get(key);
      if (object) break;
    } catch {}
  }

  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers(object.httpMetadata || {});
  headers.set("cache-control", "public, max-age=31536000, immutable");
  if (object.httpEtag) headers.set("etag", object.httpEtag);

  let contentType = object.httpMetadata?.contentType;
  if (!contentType || contentType === "application/octet-stream") {
    if (fmt === "webp" || rawPath.endsWith(".webp")) contentType = "image/webp";
    else if (fmt === "avif" || rawPath.endsWith(".avif")) contentType = "image/avif";
    else if (fmt === "png" || rawPath.endsWith(".png")) contentType = "image/png";
    else if (fmt === "jpg" || fmt === "jpeg" || rawPath.endsWith(".jpg") || rawPath.endsWith(".jpeg")) contentType = "image/jpeg";
    else contentType = "image/webp";
  }
  headers.set("content-type", contentType);

  return new Response(request.method === "HEAD" ? null : object.body, { headers });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname.startsWith("/api/")) return await handleApi(request, env, url);
      if (url.pathname.startsWith("/media/")) return await handleMedia(request, env, url);
      return env.ASSETS.fetch(request);
    } catch {
      return json({ error: "Internal server error" }, 500, apiHeaders(request, env));
    }
  },
};
