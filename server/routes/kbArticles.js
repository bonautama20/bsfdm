import { Router } from "express";
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

router.post("/", requireAuth, requirePlatformOwner, (req, res) => {
  const errors = validate(req.body, articleSchema);
  if (errors.length > 0) return res.status(400).json({ error: errors[0] });

  const b = req.body || {};
  const id = nextId(db, "kb_articles", "ART", 3);
  const slug = uniqueSlug(slugify(b.titleEn));
  const ts = nowISO();
  const publishedAt = b.publishedAt || localISODate();
  const readMinutes = Number(b.readMinutes) || 5;

  db.prepare(
    `INSERT INTO kb_articles
      (id, slug, category_en, category_id, title_en, title_id, excerpt_en, excerpt_id, body_en, body_id, read_minutes, published_at, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(id, slug, b.categoryEn, b.categoryId, b.titleEn, b.titleId, b.excerptEn, b.excerptId, b.bodyEn, b.bodyId, readMinutes, publishedAt, ts, ts);

  res.status(201).json(toArticle(db.prepare("SELECT * FROM kb_articles WHERE id = ?").get(id)));
});

router.patch("/:id", requireAuth, requirePlatformOwner, (req, res) => {
  const existing = db.prepare("SELECT * FROM kb_articles WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Article not found." });

  const errors = validate(req.body, articleSchema);
  if (errors.length > 0) return res.status(400).json({ error: errors[0] });

  const b = req.body || {};
  const readMinutes = b.readMinutes !== undefined ? Number(b.readMinutes) || existing.read_minutes : existing.read_minutes;
  db.prepare(
    `UPDATE kb_articles SET
      category_en=?, category_id=?, title_en=?, title_id=?, excerpt_en=?, excerpt_id=?,
      body_en=?, body_id=?, read_minutes=?, published_at=?, updated_at=?
     WHERE id=?`
  ).run(
    b.categoryEn ?? existing.category_en, b.categoryId ?? existing.category_id,
    b.titleEn ?? existing.title_en, b.titleId ?? existing.title_id,
    b.excerptEn ?? existing.excerpt_en, b.excerptId ?? existing.excerpt_id,
    b.bodyEn ?? existing.body_en, b.bodyId ?? existing.body_id,
    readMinutes, b.publishedAt ?? existing.published_at, nowISO(), req.params.id
  );

  res.json(toArticle(db.prepare("SELECT * FROM kb_articles WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requireAuth, requirePlatformOwner, (req, res) => {
  const result = db.prepare("DELETE FROM kb_articles WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Article not found." });
  res.status(204).end();
});

export default router;
