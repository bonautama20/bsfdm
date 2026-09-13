// Regression test for a real bug found during review: several routes
// generated the next id from COUNT(*), which drifts below the highest id
// already in use as soon as any row is deleted — the next insert then
// collides with an existing row (UNIQUE constraint failure -> 500, with a
// raw stack trace before the error-handling middleware existed). This
// happened for real to the Community feature during earlier testing; fixed
// everywhere via db.js's nextId() (MAX(numeric suffix)+1).
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

let server, baseUrl, api;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  api = makeClient(baseUrl);
  const res = await api.post("/api/auth/login", SEEDED.superAdmin);
  assert.equal(res.status, 200);
});

after(() => {
  server.close();
  cleanupTestDb();
});

async function assertSurvivesDeleteThenCreate(label, { create, del }) {
  const first = await create();
  assert.equal(first.status, 201, `${label}: first create should succeed`);
  const id = first.body.id;

  const delRes = await del(id);
  assert.equal(delRes.status, 204, `${label}: delete should succeed`);

  const second = await create();
  assert.equal(second.status, 201, `${label}: create right after a delete should not collide`);
  await del(second.body.id);
}

describe("id generation survives delete-then-create (no COUNT(*) collisions)", () => {
  test("hotels", () =>
    assertSurvivesDeleteThenCreate("hotels", {
      create: () => api.post("/api/hotels", { name: "ID Test Hotel", address: "X" }),
      del: (id) => api.delete(`/api/hotels/${id}`),
    }));

  test("vendors", () =>
    assertSurvivesDeleteThenCreate("vendors", {
      create: () => api.post("/api/vendors", { name: "ID Test Vendor", pic: "X" }),
      del: (id) => api.delete(`/api/vendors/${id}`),
    }));

  test("employees", () =>
    assertSurvivesDeleteThenCreate("employees", {
      create: () => api.post("/api/employees", { name: "ID Test Employee", position: "X" }),
      del: (id) => api.delete(`/api/employees/${id}`),
    }));

  test("communities", () =>
    assertSurvivesDeleteThenCreate("communities", {
      create: () => api.post("/api/communities", { name: "ID Test Community", provinsi: "Bali" }),
      del: (id) => api.delete(`/api/communities/${id}`),
    }));
});
