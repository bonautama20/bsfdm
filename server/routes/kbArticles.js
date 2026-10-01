import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { db, nowISO, nextId, localISODate } from "../db.js";
import { requireAuth, requirePlatformOwner } from "../middleware/auth.js";
import { validate } from "../validate.js";

// BSF Knowledge Base — the public landing-page blog (footer -> "BSF
// Knowledge Base"). Reads are public and unauthenticated (mounted in app.js
// BEFORE requireAuth, like communityPublic.js), since there's no
// confidential field here to redact. Writes are the opposite of that: each
// mutating route below applies requireAuth + requirePlatformOwner itself,
// so ONLY the platform operator's organization (PLATFORM_OWNER_ORG_ID) can
// add, edit, or delete an article — every other logged-in user, regardless
// of role/permission, is refused. That's a deliberate departure from the
// requirePermission role-matrix used elsewhere (communities.js, vendors.js,
// etc.): this content represents the app owner speaking publicly, not
// per-tenant operational data.
const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Where uploaded article images live on disk — a sibling of the sqlite data
// files (server/data/), the one directory on this host that's actually
// persistent across deploys (see .gitignore: server/data/uploads/ is
// untracked, same treatment as the *.sqlite3 files next to it). Served
// publicly (read-only) via express.static in app.js, mounted at /uploads.
// Overridable via KB_UPLOADS_DIR for the same reason db.js's DB_PATH is —
// test/setup.js points it at a per-process temp dir so the test suite never
// writes into the real dev/production uploads folder.
export const KB_UPLOADS_DIR = process.env.KB_UPLOADS_DIR || path.join(__dirname, "..", "data", "uploads", "kb");
fs.mkdirSync(KB_UPLOADS_DIR, { recursive: true });

const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — generous for a blog photo, small enough to not choke the VPS disk.
const ALLOWED_MIME_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
// Matches exactly what the filename generator below produces — a crypto
// random UUID plus one of the allowed extensions. Used to validate
// DELETE :filename so it can never be made to unlink an arbitrary path
// (e.g. "../../../etc/passwd") — only files this endpoint itself created.
const SAFE_FILENAME_RE = /^[a-f0-9-]+\.(png|jpe?g|webp|gif)$/i;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, KB_UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED_MIME_EXT[file.mimetype] || ""}`),
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_IMAGES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_EXT[file.mimetype]) {
      return cb(new Error("Only PNG, JPG, WEBP, or GIF images are allowed."));
    }
    cb(null, true);
  },
});

const articleSchema = {
  categoryEn: { required: true, maxLength: 60 },
  categoryId: { required: true, maxLength: 60 },
  titleEn: { required: true, maxLength: 200 },
  titleId: { required: true, maxLength: 200 },
  excerptEn: { required: true, maxLength: 400 },
  excerptId: { required: true, maxLength: 400 },
  bodyEn: { required: true, maxLength: 20000 },
  bodyId: { required: true, maxLength: 20000 },
  readMinutes: { min: 1, max: 120 },
};

// `validate()` (validate.js) only handles scalar fields — `images` is an
// array of URLs this same router issued via POST /uploads, so it gets its
// own small check instead: at most MAX_IMAGES, and every entry must actually
// be one of ours (not an arbitrary external URL smuggled into the article).
function validateImages(images) {
  if (!Array.isArray(images)) return "images must be an array of image URLs.";
  if (images.length > MAX_IMAGES) return `You can attach at most ${MAX_IMAGES} images.`;
  if (!images.every((u) => typeof u === "string" && u.startsWith("/uploads/kb/"))) {
    return "images must be URLs returned by the upload endpoint.";
  }
  return null;
}

const toArticle = (a) => ({
  id: a.id,
  slug: a.slug,
  readMinutes: a.read_minutes,
  publishedAt: a.published_at,
  createdAt: a.created_at,
  updatedAt: a.updated_at,
  category: { en: a.category_en, id: a.category_id },
  title: { en: a.title_en, id: a.title_id },
  excerpt: { en: a.excerpt_en, id: a.excerpt_id },
  // Stored as paragraphs joined with a blank line (see routes/kbArticles.js's
  // own writes below and seed.js's seedKbArticles) — split back into an
  // array here so the client never has to know about the storage format.
  body: {
    en: a.body_en.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
    id: a.body_id.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
  },
  // images[0] doubles as the card/hero cover image on the client — order is
  // display order, controlled by the admin's reorder buttons.
  images: JSON.parse(a.images || "[]"),
});

function slugify(text) {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFKD").replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "article";
}

// Slug is assigned once at creation from titleEn and never changes — see
// schema-control.sql's comment on kb_articles.slug. Appends -2, -3, ... on
// collision (e.g. two articles both titled "Getting Started").
function uniqueSlug(base) {
  let slug = base;
  let n = 2;
  while (db.prepare("SELECT 1 FROM kb_articles WHERE slug = ?").get(slug)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM kb_articles ORDER BY published_at DESC, rowid DESC").all();
  res.json(rows.map(toArticle));
});

// Looked up by slug (public article page, /knowledge-base/:slug) OR by id
// (not currently used by the client — the admin dashboard already has the
// full row from GET / — but kept consistent/cheap to support).
router.get("/:key", (req, res) => {
  const row = db.prepare("SELECT * FROM kb_articles WHERE slug = ? OR id = ?").get(req.params.key, req.params.key);
  if (!row) return res.status(404).json({ error: "Article not found." });
  res.json(toArticle(row));
});

// Image upload for the admin's article editor — independent of any specific
// article (the editor uploads as the owner picks files, then attaches the
// returned URLs to the article's `images` array on save/update). Accepts up
// to MAX_IMAGES files in one call under the field name "images". Wrapped
// manually (rather than passed straight as route middleware) so a
// MulterError — wrong type, too large, too many files — comes back as a
// normal 400 JSON error instead of falling through to app.js's generic
// 500 handler.
router.post("/uploads", requireAuth, requirePlatformOwner, (req, res) => {
  upload.array("images", MAX_IMAGES)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || "Upload failed." });
    const files = (req.files || []).map((f) => ({ url: `/uploads/kb/${f.filename}`, filename: f.filename }));
    res.status(201).json(files);
  });
});

// Removes one uploaded file from disk — called when the admin removes an
// image from the editor (whether or not it was ever attached to a saved
// article). SAFE_FILENAME_RE keeps this from ever touching a path outside
// KB_UPLOADS_DIR.
router.delete("/uploads/:filename", requireAuth, requirePlatformOwner, (req, res) => {
  const { filename } = req.params;
  if (!SAFE_FILENAME_RE.test(filename)) return res.status(400).json({ error: "Invalid filename." });
  const filePath = path.join(KB_UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found." });
  fs.unlinkSync(filePath);
  res.status(204).end();
});

router.post("/", requireAuth, requirePlatformOwner, (req, res) => {
  const errors = validate(req.body, articleSchema);
  if (errors.length > 0) return res.status(400).json({ error: errors[0] });

  const b = req.body || {};
  const imagesError = validateImages(b.images ?? []);
  if (imagesError) return res.status(400).json({ error: imagesError });

  const id = nextId(db, "kb_articles", "ART", 3);
  const slug = uniqueSlug(slugify(b.titleEn));
  const ts = nowISO();
  const publishedAt = b.publishedAt || localISODate();
  const readMinutes = Number(b.readMinutes) || 5;

  db.prepare(
    `INSERT INTO kb_articles
      (id, slug, category_en, category_id, title_en, title_id, excerpt_en, excerpt_id, body_en, body_id, read_minutes, published_at, images, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, slug, b.categoryEn, b.categoryId, b.titleEn, b.titleId, b.excerptEn, b.excerptId, b.bodyEn, b.bodyId,
    readMinutes, publishedAt, JSON.stringify(b.images ?? []), ts, ts
  );

  res.status(201).json(toArticle(db.prepare("SELECT * FROM kb_articles WHERE id = ?").get(id)));
});

router.patch("/:id", requireAuth, requirePlatformOwner, (req, res) => {
  const existing = db.prepare("SELECT * FROM kb_articles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Article not found." });

  const errors = validate(req.body, articleSchema);
  if (errors.length > 0) return res.status(400).json({ error: errors[0] });

  const b = req.body || {};
  if (b.images !== undefined) {
    const imagesError = validateImages(b.images);
    if (imagesError) return res.status(400).json({ error: imagesError });
  }

  const readMinutes = b.readMinutes !== undefined ? Number(b.readMinutes) || existing.read_minutes : existing.read_minutes;
  const images = b.images !== undefined ? JSON.stringify(b.images) : existing.images;
  db.prepare(
    `UPDATE kb_articles SET
      category_en=?, category_id=?, title_en=?, title_id=?, excerpt_en=?, excerpt_id=?,
      body_en=?, body_id=?, read_minutes=?, published_at=?, images=?, updated_at=?
     WHERE id=?`
  ).run(
    b.categoryEn ?? existing.category_en, b.categoryId ?? existing.category_id,
    b.titleEn ?? existing.title_en, b.titleId ?? existing.title_id,
    b.excerptEn ?? existing.excerpt_en, b.excerptId ?? existing.excerpt_id,
    b.bodyEn ?? existing.body_en, b.bodyId ?? existing.body_id,
    readMinutes, b.publishedAt ?? existing.published_at, images, nowISO(), req.params.id
  );

  res.json(toArticle(db.prepare("SELECT * FROM kb_articles WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requireAuth, requirePlatformOwner, (req, res) => {
  const result = db.prepare("DELETE FROM kb_articles WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Article not found." });
  res.status(204).end();
});

export default router;
