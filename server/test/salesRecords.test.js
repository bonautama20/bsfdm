// Regression coverage for the operator "Penjualan" (Sales) log: create (by
// operator or admin), the Egg-implies-gram unit rule, and admin-only edit
// with the updatedBy/updatedAt audit trail the recap list depends on.
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

describe("POST /api/sales-records", () => {
  test("creates a record and derives unit=kg for a non-Egg sales type", async () => {
    const res = await api.post("/api/sales-records", {
      date: "2026-02-01", salesType: "Fresh Maggot", quantity: 25, totalPrice: 150000,
      buyerName: "Budi", buyerPhone: "081234567890", createdBy: "Operator Andi",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.unit, "kg");
    assert.equal(res.body.salesType, "Fresh Maggot");
    assert.equal(res.body.createdBy, "Operator Andi");
    assert.equal(res.body.updatedBy, null);
  });

  test("selecting Egg always forces unit=gram, regardless of what the client sends", async () => {
    const res = await api.post("/api/sales-records", {
      date: "2026-02-02", salesType: "Egg", quantity: 480, unit: "kg", totalPrice: 500000,
      buyerName: "Sari", buyerPhone: "081200000000",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.unit, "gram");
  });

  test("rejects an unknown sales type", async () => {
    const res = await api.post("/api/sales-records", {
      date: "2026-02-01", salesType: "Not A Real Type", quantity: 1, totalPrice: 1,
      buyerName: "X", buyerPhone: "0",
    });
    assert.equal(res.status, 400);
  });

  test("rejects a missing required field", async () => {
    const res = await api.post("/api/sales-records", {
      date: "2026-02-01", salesType: "Kasgot", quantity: 1, totalPrice: 1, buyerName: "X",
      // buyerPhone omitted
    });
    assert.equal(res.status, 400);
  });

  test("an operator can create one (requireOperatorOrPermission lets role-operator through)", async () => {
    const opApi = makeClient(baseUrl);
    const login = await opApi.post("/api/auth/login", SEEDED.operator);
    assert.equal(login.status, 200);

    const res = await opApi.post("/api/sales-records", {
      date: "2026-02-03", salesType: "Pupa", quantity: 3, totalPrice: 30000,
      buyerName: "Rina", buyerPhone: "081211112222",
    });
    assert.equal(res.status, 201);
  });
});

describe("PATCH /api/sales-records/:id", () => {
  test("edits a record and stamps updatedBy/updatedAt", async () => {
    const created = await api.post("/api/sales-records", {
      date: "2026-02-05", salesType: "Baby Maggot", quantity: 10, totalPrice: 80000,
      buyerName: "Dedi", buyerPhone: "081233334444",
    });
    assert.equal(created.body.updatedAt, null);

    const updated = await api.patch(`/api/sales-records/${created.body.id}`, {
      quantity: 12, totalPrice: 96000, updatedBy: "Farm Manager",
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.quantity, 12);
    assert.equal(updated.body.totalPrice, 96000);
    assert.equal(updated.body.updatedBy, "Farm Manager");
    assert.ok(updated.body.updatedAt, "updatedAt should now be set");
  });

  test("switching salesType to Egg on edit re-derives unit=gram", async () => {
    const created = await api.post("/api/sales-records", {
      date: "2026-02-06", salesType: "Kasgot", quantity: 20, totalPrice: 40000,
      buyerName: "Lina", buyerPhone: "081255556666",
    });
    assert.equal(created.body.unit, "kg");

    const updated = await api.patch(`/api/sales-records/${created.body.id}`, { salesType: "Egg" });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.unit, "gram");
  });

  test("an operator cannot edit a sales record (admin-only)", async () => {
    const created = await api.post("/api/sales-records", {
      date: "2026-02-07", salesType: "Prepupa", quantity: 5, totalPrice: 25000,
      buyerName: "Wati", buyerPhone: "081277778888",
    });

    const opApi = makeClient(baseUrl);
    await opApi.post("/api/auth/login", SEEDED.operator);
    const res = await opApi.patch(`/api/sales-records/${created.body.id}`, { quantity: 99 });
    assert.equal(res.status, 403);
  });

  test("editing an unknown record is a 404", async () => {
    const res = await api.patch("/api/sales-records/SLR-DOES-NOT-EXIST", { quantity: 1 });
    assert.equal(res.status, 404);
  });
});
