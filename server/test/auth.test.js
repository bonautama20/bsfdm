import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

let server, baseUrl;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

after(() => {
  server.close();
  cleanupTestDb();
});

describe("login", () => {
  test("rejects an unknown email", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/login", { email: "nobody@nowhere.com", password: "whatever123" });
    assert.equal(res.status, 401);
  });

  test("rejects a wrong password for a real account", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/login", { email: SEEDED.superAdmin.email, password: "wrong-password" });
    assert.equal(res.status, 401);
  });

  test("succeeds with correct credentials and sets a session cookie", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/login", SEEDED.superAdmin);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, SEEDED.superAdmin.email);

    // The cookie the client captured actually authenticates a follow-up request.
    const me = await api.get("/api/auth/me");
    assert.equal(me.status, 200);
    assert.equal(me.body.user.email, SEEDED.superAdmin.email);
  });
});

describe("requireAuth", () => {
  test("blocks an unauthenticated request to a protected route", async () => {
    const api = makeClient(baseUrl);
    const res = await api.get("/api/hotels");
    assert.equal(res.status, 401);
  });

  test("allows the public community endpoint through with no session", async () => {
    const api = makeClient(baseUrl);
    const res = await api.get("/api/community");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});

describe("forgot-password", () => {
  test("returns the same generic message for a real and a fake email (no user enumeration)", async () => {
    const api = makeClient(baseUrl);
    const real = await api.post("/api/auth/forgot-password", { email: SEEDED.superAdmin.email });
    const fake = await api.post("/api/auth/forgot-password", { email: "definitely-not-a-user@nowhere.com" });
    assert.equal(real.status, 200);
    assert.equal(fake.status, 200);
    assert.equal(real.body.message, fake.body.message);
  });

  test("rejects reset-password with an invalid token", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/reset-password", { token: "not-a-real-token", password: "brandnewpass123" });
    assert.equal(res.status, 400);
  });

  test("rejects a too-short new password", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/reset-password", { token: "whatever", password: "short" });
    assert.equal(res.status, 400);
  });
});
