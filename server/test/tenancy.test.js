// Regression coverage for the multi-tenant conversion: each organization's
// data must live in its own database file, so nothing a route handler does
// can leak one company's rows into another's. There's no self-registration
// endpoint yet (that's Phase 2), so this test creates a second organization
// directly against the control db the same way the eventual /register route
// will, then drives everything else through the real HTTP API.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { db, nowISO } from "../db.js";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

let server, baseUrl;
const otherOrg = { id: "ORG-TEST-B", email: "owner@other-company.test", password: "other-company-pass" };

before(async () => {
  ({ server, baseUrl } = await startTestServer());

  db.prepare("INSERT INTO organizations (id, name, slug, plan, status, created_at) VALUES (?,?,?,?,?,?)")
    .run(otherOrg.id, "Other Company", "other-company", "paid", "active", nowISO());
  db.prepare(
    "INSERT INTO users (id, org_id, name, email, password, role_id, status, last_login, created_date) VALUES (?,?,?,?,?,?,?,NULL,?)"
  ).run("USR-OTHER", otherOrg.id, "Other Owner", otherOrg.email, bcrypt.hashSync(otherOrg.password, 10), "role-super-admin", "Active", nowISO().slice(0, 10));
});

after(() => {
  server.close();
  cleanupTestDb();
});

describe("tenant data isolation", () => {
  test("a hotel created by one org is invisible to another org", async () => {
    const orgA = makeClient(baseUrl);
    assert.equal((await orgA.post("/api/auth/login", SEEDED.superAdmin)).status, 200);
    const created = await orgA.post("/api/hotels", { name: "Isolation Test Hotel", address: "X" });
    assert.equal(created.status, 201);

    const orgB = makeClient(baseUrl);
    assert.equal((await orgB.post("/api/auth/login", otherOrg)).status, 200);
    const listB = await orgB.get("/api/hotels");
    assert.equal(listB.status, 200);
    assert.ok(
      listB.body.every((h) => h.id !== created.body.id),
      "org B's hotel list must not contain org A's hotel"
    );

    await orgA.delete(`/api/hotels/${created.body.id}`);
  });

  test("GET /api/users only returns users from the caller's own org", async () => {
    const orgA = makeClient(baseUrl);
    assert.equal((await orgA.post("/api/auth/login", SEEDED.superAdmin)).status, 200);
    const usersA = await orgA.get("/api/users");
    assert.equal(usersA.status, 200);
    assert.ok(usersA.body.every((u) => u.email !== otherOrg.email), "org A must not see org B's user");

    const orgB = makeClient(baseUrl);
    assert.equal((await orgB.post("/api/auth/login", otherOrg)).status, 200);
    const usersB = await orgB.get("/api/users");
    assert.equal(usersB.status, 200);
    assert.equal(usersB.body.length, 1);
    assert.equal(usersB.body[0].email, otherOrg.email);
  });

  test("an admin cannot reset another org's user's password by guessing their id", async () => {
    const orgA = makeClient(baseUrl);
    assert.equal((await orgA.post("/api/auth/login", SEEDED.superAdmin)).status, 200);
    const res = await orgA.post("/api/users/USR-OTHER/send-password-reset");
    assert.equal(res.status, 404);
  });

  test("the shared community directory is visible to every org", async () => {
    const orgB = makeClient(baseUrl);
    assert.equal((await orgB.post("/api/auth/login", otherOrg)).status, 200);
    const res = await orgB.get("/api/community");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });
});
