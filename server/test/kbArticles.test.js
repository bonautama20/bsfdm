// Regression coverage for the public BSF Knowledge Base and its
// platform-owner-only CRUD (server/routes/kbArticles.js) — reads are public
// and unauthenticated, but only PLATFORM_OWNER_ORG_ID may create, edit, or
// delete an article, mirroring test/platform.test.js's coverage of
// requirePlatformOwner elsewhere.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";
import { KB_UPLOADS_DIR } from "../routes/kbArticles.js";

// A 1x1 transparent PNG — smallest possible valid image, enough to exercise
// multer's real disk-write path without shipping a binary fixture file.
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

// makeClient's cookie jar is private to its own `request()` wrapper, which
// only sends JSON — multer needs real multipart/form-data, so these upload
// tests go through fetch directly and keep the session cookie themselves.
async function rawRegisterAndLogin(companyName, email) {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyName, name: "Owner", email, password: "a-strong-password" }),
  });
  assert.equal(res.status, 201);
  return res.headers.get("set-cookie").split(";")[0];
}

async function rawLoginOwner() {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(SEEDED.superAdmin),
  });
  assert.equal(res.status, 200);
  return res.headers.get("set-cookie").split(";")[0];
}

async function uploadImages(cookie, files) {
  const form = new FormData();
  for (const f of files) form.append("images", new Blob([f.buffer], { type: f.type }), f.filename);
  const res = await fetch(`${baseUrl}/api/kb-articles/uploads`, {
    method: "POST",
    headers: cookie ? { Cookie: cookie } : {},
    body: form,
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

let server, baseUrl;
let counter = 0;
// Logged in exactly once for the whole file and reused by every test below
// (JWTs are stateless and valid for 7 days, so there's no isolation cost to
// sharing one) — logging in fresh per test, multiplied across this file's
// ~20 platform-owner tests, used to blow past loginLimiter's 15-per-15-min
// cap (routes/auth.js) partway through a run.
let sharedOwnerApi, sharedOwnerCookie;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  sharedOwnerApi = makeClient(baseUrl);
  await sharedOwnerApi.post("/api/auth/login", SEEDED.superAdmin);
  sharedOwnerCookie = await rawLoginOwner();
});

after(() => {
  server.close();
  cleanupTestDb();
});

async function registerAndLogin(companyName) {
  const api = makeClient(baseUrl);
  const email = `kb${counter++}@kb-test.test`;
  const res = await api.post("/api/auth/register", { companyName, name: "Owner", email, password: "a-strong-password" });
  assert.equal(res.status, 201);
  return api;
}

const draftArticle = (overrides = {}) => ({
  categoryEn: "Feeding", categoryId: "Pemberian Pakan",
  titleEn: "Test Article Title", titleId: "Judul Artikel Uji",
  excerptEn: "A short test excerpt.", excerptId: "Ringkasan uji singkat.",
  bodyEn: "First paragraph.\n\nSecond paragraph.",
  bodyId: "Paragraf pertama.\n\nParagraf kedua.",
  readMinutes: 4,
  publishedAt: "2026-04-01",
  ...overrides,
});

describe("GET /api/kb-articles (public)", () => {
  test("is readable without logging in, and includes the seeded starter articles", async () => {
    const api = makeClient(baseUrl);
    const res = await api.get("/api/kb-articles");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 1);
    const first = res.body[0];
    assert.ok(first.slug);
    assert.ok(first.category.en && first.category.id);
    assert.ok(first.title.en && first.title.id);
    assert.ok(Array.isArray(first.body.en) && first.body.en.length > 0, "body.en should split into a non-empty paragraph array");
  });

  test("GET /:slug returns the matching article; an unknown slug is a 404", async () => {
    const api = makeClient(baseUrl);
    const list = await api.get("/api/kb-articles");
    const known = list.body[0];

    const found = await api.get(`/api/kb-articles/${known.slug}`);
    assert.equal(found.status, 200);
    assert.equal(found.body.slug, known.slug);

    const missing = await api.get("/api/kb-articles/does-not-exist-slug");
    assert.equal(missing.status, 404);
  });
});

describe("POST /api/kb-articles (create)", () => {
  test("requires authentication", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/kb-articles", draftArticle());
    assert.equal(res.status, 401);
  });

  test("a logged-in but non-owner organization is blocked", async () => {
    const api = await registerAndLogin("KB Test Co A");
    const res = await api.post("/api/kb-articles", draftArticle());
    assert.equal(res.status, 403);
  });

  test("the platform owner can create an article, which then appears in the public list", async () => {
    const ownerApi = sharedOwnerApi;

    const res = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Unique Creation Test" }));
    assert.equal(res.status, 201);
    assert.equal(res.body.title.en, "Unique Creation Test");
    assert.equal(res.body.body.en.length, 2, "body should split into two paragraphs");
    assert.ok(res.body.slug.startsWith("unique-creation-test"));

    const publicApi = makeClient(baseUrl);
    const list = await publicApi.get("/api/kb-articles");
    assert.ok(list.body.some((a) => a.id === res.body.id));
  });

  test("two articles with the same title get distinct slugs", async () => {
    const ownerApi = sharedOwnerApi;

    const first = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Duplicate Title Case" }));
    const second = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Duplicate Title Case" }));
    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
    assert.notEqual(first.body.slug, second.body.slug);
  });

  test("rejects a missing required field", async () => {
    const ownerApi = sharedOwnerApi;
    const { titleEn, ...incomplete } = draftArticle();
    const res = await ownerApi.post("/api/kb-articles", incomplete);
    assert.equal(res.status, 400);
  });
});

describe("PATCH /api/kb-articles/:id (edit)", () => {
  test("the platform owner can edit an article; its slug never changes", async () => {
    const ownerApi = sharedOwnerApi;

    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Editable Article" }));
    const originalSlug = created.body.slug;

    const updated = await ownerApi.patch(`/api/kb-articles/${created.body.id}`, {
      ...draftArticle({ titleEn: "Editable Article, Now Renamed" }),
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.title.en, "Editable Article, Now Renamed");
    assert.equal(updated.body.slug, originalSlug, "editing the title should not change the existing slug");
  });

  test("a non-owner organization cannot edit an article", async () => {
    const ownerApi = sharedOwnerApi;
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Protected From Edit" }));

    const intruderApi = await registerAndLogin("KB Test Co B");
    const res = await intruderApi.patch(`/api/kb-articles/${created.body.id}`, draftArticle({ titleEn: "Hijacked" }));
    assert.equal(res.status, 403);
  });

  test("editing an unknown id is a 404", async () => {
    const ownerApi = sharedOwnerApi;
    const res = await ownerApi.patch("/api/kb-articles/ART-DOES-NOT-EXIST", draftArticle());
    assert.equal(res.status, 404);
  });
});

describe("DELETE /api/kb-articles/:id", () => {
  test("a non-owner organization cannot delete an article", async () => {
    const ownerApi = sharedOwnerApi;
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Protected From Delete" }));

    const intruderApi = await registerAndLogin("KB Test Co C");
    const res = await intruderApi.delete(`/api/kb-articles/${created.body.id}`);
    assert.equal(res.status, 403);
  });

  test("the platform owner can delete an article, which then disappears from the public list", async () => {
    const ownerApi = sharedOwnerApi;
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Deletable Article" }));

    const del = await ownerApi.delete(`/api/kb-articles/${created.body.id}`);
    assert.equal(del.status, 204);

    const publicApi = makeClient(baseUrl);
    const gone = await publicApi.get(`/api/kb-articles/${created.body.slug}`);
    assert.equal(gone.status, 404);
  });

  test("deleting an unknown id is a 404, not a silent success", async () => {
    const ownerApi = sharedOwnerApi;
    const res = await ownerApi.delete("/api/kb-articles/ART-DOES-NOT-EXIST");
    assert.equal(res.status, 404);
  });
});

describe("POST /api/kb-articles/uploads (image upload)", () => {
  test("requires authentication", async () => {
    const res = await uploadImages(null, [{ filename: "a.png", type: "image/png", buffer: TINY_PNG }]);
    assert.equal(res.status, 401);
  });

  test("a logged-in but non-owner organization is blocked", async () => {
    const cookie = await rawRegisterAndLogin("KB Upload Test Co A", `kbup${counter++}@kb-test.test`);
    const res = await uploadImages(cookie, [{ filename: "a.png", type: "image/png", buffer: TINY_PNG }]);
    assert.equal(res.status, 403);
  });

  test("the platform owner can upload an image; it's written to disk and served under /uploads/kb/", async () => {
    const cookie = sharedOwnerCookie;
    const res = await uploadImages(cookie, [{ filename: "cover.png", type: "image/png", buffer: TINY_PNG }]);
    assert.equal(res.status, 201);
    assert.equal(res.body.length, 1);
    const { url, filename } = res.body[0];
    assert.match(url, /^\/uploads\/kb\/[a-f0-9-]+\.png$/);
    assert.ok(fs.existsSync(path.join(KB_UPLOADS_DIR, filename)), "uploaded file should exist on disk");

    const served = await fetch(`${baseUrl}${url}`);
    assert.equal(served.status, 200);
  });

  test("rejects a disallowed file type (e.g. SVG)", async () => {
    const cookie = sharedOwnerCookie;
    const res = await uploadImages(cookie, [
      { filename: "bad.svg", type: "image/svg+xml", buffer: Buffer.from("<svg></svg>") },
    ]);
    assert.equal(res.status, 400);
  });

  test("rejects more than 5 files in one call", async () => {
    const cookie = sharedOwnerCookie;
    const files = Array.from({ length: 6 }, (_, i) => ({ filename: `img${i}.png`, type: "image/png", buffer: TINY_PNG }));
    const res = await uploadImages(cookie, files);
    assert.equal(res.status, 400);
  });
});

describe("DELETE /api/kb-articles/uploads/:filename", () => {
  test("a non-owner organization cannot delete an uploaded file", async () => {
    const ownerCookie = sharedOwnerCookie;
    const uploaded = await uploadImages(ownerCookie, [{ filename: "x.png", type: "image/png", buffer: TINY_PNG }]);
    const filename = uploaded.body[0].filename;

    const intruderCookie = await rawRegisterAndLogin("KB Upload Test Co B", `kbup${counter++}@kb-test.test`);
    const res = await fetch(`${baseUrl}/api/kb-articles/uploads/${filename}`, { method: "DELETE", headers: { Cookie: intruderCookie } });
    assert.equal(res.status, 403);
    assert.ok(fs.existsSync(path.join(KB_UPLOADS_DIR, filename)), "file should still exist after a blocked delete");
  });

  test("rejects a filename outside the generated pattern (path traversal attempt)", async () => {
    const cookie = sharedOwnerCookie;
    const res = await fetch(`${baseUrl}/api/kb-articles/uploads/${encodeURIComponent("../../etc/passwd")}`, {
      method: "DELETE",
      headers: { Cookie: cookie },
    });
    assert.equal(res.status, 400);
  });

  test("the platform owner can delete an uploaded file, which removes it from disk", async () => {
    const cookie = sharedOwnerCookie;
    const uploaded = await uploadImages(cookie, [{ filename: "y.png", type: "image/png", buffer: TINY_PNG }]);
    const filename = uploaded.body[0].filename;

    const res = await fetch(`${baseUrl}/api/kb-articles/uploads/${filename}`, { method: "DELETE", headers: { Cookie: cookie } });
    assert.equal(res.status, 204);
    assert.equal(fs.existsSync(path.join(KB_UPLOADS_DIR, filename)), false);
  });

  test("deleting an already-gone filename is a 404", async () => {
    const cookie = sharedOwnerCookie;
    const res = await fetch(`${baseUrl}/api/kb-articles/uploads/${crypto.randomUUID()}.png`, { method: "DELETE", headers: { Cookie: cookie } });
    assert.equal(res.status, 404);
  });
});

describe("kb_articles.images field", () => {
  test("defaults to an empty array when not provided on create", async () => {
    const ownerApi = sharedOwnerApi;
    const res = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "No Images Article" }));
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.images, []);
  });

  test("round-trips attached image URLs through create, edit, and the public GET", async () => {
    const cookie = sharedOwnerCookie;
    const uploaded = await uploadImages(cookie, [
      { filename: "one.png", type: "image/png", buffer: TINY_PNG },
      { filename: "two.png", type: "image/png", buffer: TINY_PNG },
    ]);
    const urls = uploaded.body.map((f) => f.url);

    const ownerApi = sharedOwnerApi;
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Article With Images", images: urls }));
    assert.equal(created.status, 201);
    assert.deepEqual(created.body.images, urls);

    const publicApi = makeClient(baseUrl);
    const fetched = await publicApi.get(`/api/kb-articles/${created.body.slug}`);
    assert.deepEqual(fetched.body.images, urls, "images[0] should be the cover image, in the order sent");

    // Edit: drop down to just the first image.
    const edited = await ownerApi.patch(`/api/kb-articles/${created.body.id}`, draftArticle({ titleEn: "Article With Images", images: [urls[0]] }));
    assert.equal(edited.status, 200);
    assert.deepEqual(edited.body.images, [urls[0]]);
  });

  test("rejects more than 5 image URLs on create", async () => {
    const ownerApi = sharedOwnerApi;
    const tooMany = Array.from({ length: 6 }, (_, i) => `/uploads/kb/fake-${i}.png`);
    const res = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Too Many Images", images: tooMany }));
    assert.equal(res.status, 400);
  });

  test("rejects an image URL that didn't come from the upload endpoint", async () => {
    const ownerApi = sharedOwnerApi;
    const res = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Smuggled Image URL", images: ["https://evil.example.com/x.png"] }));
    assert.equal(res.status, 400);
  });
});
