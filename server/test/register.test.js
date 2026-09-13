// Regression coverage for self-registration (Phase 2 of the multi-tenant
// plan): POST /api/auth/register must create a brand new, empty organization
// and immediately log the founder in — and must never let two organizations
// collide on id/slug or let one email register twice.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, makeClient, cleanupTestDb } from "./helpers.js";

let server, baseUrl;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

after(() => {
  server.close();
  cleanupTestDb();
});

describe("POST /api/auth/register", () => {
  test("creates a new org + user and logs them in", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/register", {
      companyName: "Acme Maggot Co",
      name: "Jane Founder",
      email: "jane@acme-maggot.test",
      password: "a-strong-password",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, "jane@acme-maggot.test");
    assert.equal(res.body.role.id, "role-super-admin");

    // The cookie set by register actually authenticates a follow-up request.
    const me = await api.get("/api/auth/me");
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, "jane@acme-maggot.test");
  });

  test("a brand new org starts with an empty tenant db (no demo bioponds)", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/register", {
      companyName: "Blank Slate Farms",
      name: "New Owner",
      email: "owner@blank-slate.test",
      password: "a-strong-password",
    });
    // A fresh signup is on the free plan, which only grants Production —
    // Client (hotels) is checked separately by plan.test.js.
    assert.equal(res.body.organization.plan, "free");
    const racks = await api.get("/api/racks");
    assert.equal(racks.status, 200);
    assert.deepEqual(racks.body, []);
  });

  test("rejects a second signup with an already-registered email", async () => {
    const api = makeClient(baseUrl);
    await api.post("/api/auth/register", {
      companyName: "First Co",
      name: "Owner One",
      email: "dupe@example.test",
      password: "a-strong-password",
    });
    const second = await api.post("/api/auth/register", {
      companyName: "Second Co",
      name: "Owner Two",
      email: "dupe@example.test",
      password: "another-strong-pass",
    });
    assert.equal(second.status, 409);
  });

  test("two companies with the same name get distinct slugs, not a crash", async () => {
    const api = makeClient(baseUrl);
    const first = await api.post("/api/auth/register", {
      companyName: "Same Name Farms",
      name: "Owner A",
      email: "a@same-name.test",
      password: "a-strong-password",
    });
    const second = await api.post("/api/auth/register", {
      companyName: "Same Name Farms",
      name: "Owner B",
      email: "b@same-name.test",
      password: "a-strong-password",
    });
    assert.equal(first.status, 201);
    assert.equal(second.status, 201);
  });

  test("rejects a short password", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/register", {
      companyName: "Short Pass Co",
      name: "X",
      email: "shortpass@example.test",
      password: "short",
    });
    assert.equal(res.status, 400);
  });

  test("rejects a missing companyName", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/register", {
      name: "X",
      email: "nocompany@example.test",
      password: "a-strong-password",
    });
    assert.equal(res.status, 400);
  });
});
