// Regression coverage for the public BSF Knowledge Base and its
// platform-owner-only CRUD (server/routes/kbArticles.js) — reads are public
// and unauthenticated, but only PLATFORM_OWNER_ORG_ID may create, edit, or
// delete an article, mirroring test/platform.test.js's coverage of
// requirePlatformOwner elsewhere.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

let server, baseUrl;
let counter = 0;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
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
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

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
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

    const first = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Duplicate Title Case" }));
    const second = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Duplicate Title Case" }));
    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
    assert.notEqual(first.body.slug, second.body.slug);
  });

  test("rejects a missing required field", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const { titleEn, ...incomplete } = draftArticle();
    const res = await ownerApi.post("/api/kb-articles", incomplete);
    assert.equal(res.status, 400);
  });
});

describe("PATCH /api/kb-articles/:id (edit)", () => {
  test("the platform owner can edit an article; its slug never changes", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

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
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Protected From Edit" }));

    const intruderApi = await registerAndLogin("KB Test Co B");
    const res = await intruderApi.patch(`/api/kb-articles/${created.body.id}`, draftArticle({ titleEn: "Hijacked" }));
    assert.equal(res.status, 403);
  });

  test("editing an unknown id is a 404", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const res = await ownerApi.patch("/api/kb-articles/ART-DOES-NOT-EXIST", draftArticle());
    assert.equal(res.status, 404);
  });
});

describe("DELETE /api/kb-articles/:id", () => {
  test("a non-owner organization cannot delete an article", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Protected From Delete" }));

    const intruderApi = await registerAndLogin("KB Test Co C");
    const res = await intruderApi.delete(`/api/kb-articles/${created.body.id}`);
    assert.equal(res.status, 403);
  });

  test("the platform owner can delete an article, which then disappears from the public list", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const created = await ownerApi.post("/api/kb-articles", draftArticle({ titleEn: "Deletable Article" }));

    const del = await ownerApi.delete(`/api/kb-articles/${created.body.id}`);
    assert.equal(del.status, 204);

    const publicApi = makeClient(baseUrl);
    const gone = await publicApi.get(`/api/kb-articles/${created.body.slug}`);
    assert.equal(gone.status, 404);
  });

  test("deleting an unknown id is a 404, not a silent success", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const res = await ownerApi.delete("/api/kb-articles/ART-DOES-NOT-EXIST");
    assert.equal(res.status, 404);
  });
});
