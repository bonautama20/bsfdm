// Regression coverage for the public "Request Demo" popup on the landing
// page — an unauthenticated endpoint, so no login/cookie setup here.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../db.js";
import { startTestServer, makeClient, cleanupTestDb } from "./helpers.js";

let server, baseUrl, api;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
  api = makeClient(baseUrl);
});

after(() => {
  server.close();
  cleanupTestDb();
});

describe("POST /api/demo-requests", () => {
  test("stores a valid submission and returns ok", async () => {
    const res = await api.post("/api/demo-requests", { phone: "081234567890", email: "prospect@example.com" });
    assert.equal(res.status, 201);
    assert.equal(res.body.ok, true);

    const row = db.prepare("SELECT * FROM demo_requests WHERE email = ?").get("prospect@example.com");
    assert.ok(row, "the request should be persisted");
    assert.equal(row.phone, "081234567890");
    assert.equal(row.status, "new");
  });

  test("rejects a missing phone number", async () => {
    const res = await api.post("/api/demo-requests", { email: "noPhone@example.com" });
    assert.equal(res.status, 400);
  });

  test("rejects a malformed email", async () => {
    const res = await api.post("/api/demo-requests", { phone: "081200000000", email: "not-an-email" });
    assert.equal(res.status, 400);
  });

  test("does not require authentication", async () => {
    const freshApi = makeClient(baseUrl); // no login call at all
    const res = await freshApi.post("/api/demo-requests", { phone: "081211112222", email: "anon@example.com" });
    assert.equal(res.status, 201);
  });
});
