// Regression coverage for the server-side permission enforcement added to
// harden this app for go-live (see server/middleware/auth.js's
// requirePermission / requireOperatorOrPermission). Before this, ANY logged-in
// user — any role — could call any mutating endpoint regardless of the Roles
// & Permissions matrix; these tests exist so that gap can't quietly reopen.
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

async function loginAs(account) {
  const api = makeClient(baseUrl);
  const res = await api.post("/api/auth/login", account);
  assert.equal(res.status, 200, `login should succeed for ${account.email}`);
  return api;
}

describe("operator role", () => {
  test("can submit its own field-log data (maggot harvest)", async () => {
    const api = await loginAs(SEEDED.operator);
    const res = await api.post("/api/maggot-harvests", { date: "2026-01-01", biopondLabel: "Test Rack - Biopond 1", quantityKg: 5 });
    assert.equal(res.status, 201);
  });

  test("is blocked from an admin-only action (creating a vendor)", async () => {
    const api = await loginAs(SEEDED.operator);
    const res = await api.post("/api/vendors", { name: "Should Not Work", pic: "X" });
    assert.equal(res.status, 403);
  });

  test("is blocked from creating a hotel/client", async () => {
    const api = await loginAs(SEEDED.operator);
    const res = await api.post("/api/hotels", { name: "Should Not Work", address: "X" });
    assert.equal(res.status, 403);
  });
});

describe("sales-admin role", () => {
  test("can create a hotel/client (full access per its matrix)", async () => {
    const api = await loginAs(SEEDED.salesAdmin);
    const res = await api.post("/api/hotels", { name: "Sales Admin Test Hotel", address: "X" });
    assert.equal(res.status, 201);
    // Clean up — this suite reuses one seeded test DB across the file.
    await api.delete(`/api/hotels/${res.body.id}`);
  });

  test("is blocked from vendor management (not in its matrix)", async () => {
    const api = await loginAs(SEEDED.salesAdmin);
    const res = await api.post("/api/vendors", { name: "Should Not Work", pic: "X" });
    assert.equal(res.status, 403);
  });

  test("is blocked from submitting production field logs (not an operator, no Production access)", async () => {
    const api = await loginAs(SEEDED.salesAdmin);
    const res = await api.post("/api/maggot-harvests", { date: "2026-01-01", biopondLabel: "X", quantityKg: 1 });
    assert.equal(res.status, 403);
  });
});

describe("super-admin role", () => {
  test("can perform every action checked above", async () => {
    const api = await loginAs(SEEDED.superAdmin);
    const vendor = await api.post("/api/vendors", { name: "Super Admin Test Vendor", pic: "X" });
    assert.equal(vendor.status, 201);
    await api.delete(`/api/vendors/${vendor.body.id}`);

    const hotel = await api.post("/api/hotels", { name: "Super Admin Test Hotel", address: "X" });
    assert.equal(hotel.status, 201);
    await api.delete(`/api/hotels/${hotel.body.id}`);

    const harvest = await api.post("/api/maggot-harvests", { date: "2026-01-01", biopondLabel: "X", quantityKg: 1 });
    assert.equal(harvest.status, 201);
  });
});

describe("users management stays Super Admin-only regardless of module permissions", () => {
  test("sales-admin cannot create a user even though it isn't gated by requirePermission", async () => {
    const api = await loginAs(SEEDED.salesAdmin);
    const res = await api.post("/api/users", { name: "X", email: "shouldnotwork@example.com", roleId: "role-operator" });
    assert.equal(res.status, 403);
  });
});
