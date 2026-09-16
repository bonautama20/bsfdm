// Regression coverage for the "Source Cage" feature (BSF Eggs + Breeder/
// Parent Stock tabs): bulk-creating breeder_cages, the free-plan cap on how
// many a free org can create, and the per-cage cage_entries log (pupa/
// prepupa quantity entered over time).
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

let server, baseUrl, api;
let counter = 0;

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

async function registerFreeOrg() {
  const freeApi = makeClient(baseUrl);
  const email = `cagefree${counter++}@cage-test.test`;
  const res = await freeApi.post("/api/auth/register", { companyName: "Cage Test Co", name: "Owner", email, password: "a-strong-password" });
  assert.equal(res.status, 201);
  return freeApi;
}

describe("POST /api/breeder-cages (bulk create)", () => {
  test("creates N cages at once, each with an auto-generated id", async () => {
    const res = await api.post("/api/breeder-cages", { count: 3 });
    assert.equal(res.status, 201);
    assert.equal(res.body.length, 3);
    assert.ok(res.body.every((c) => c.id && c.status === "Active"));

    const list = await api.get("/api/breeder-cages");
    for (const c of res.body) {
      assert.ok(list.body.some((row) => row.id === c.id));
    }
  });

  test("rejects a missing or non-positive count", async () => {
    const missing = await api.post("/api/breeder-cages", {});
    assert.equal(missing.status, 400);

    const zero = await api.post("/api/breeder-cages", { count: 0 });
    assert.equal(zero.status, 400);
  });

  test("a free org is capped at the free cage limit (1)", async () => {
    const freeApi = await registerFreeOrg();

    const first = await freeApi.post("/api/breeder-cages", { count: 1 });
    assert.equal(first.status, 201);

    const second = await freeApi.post("/api/breeder-cages", { count: 1 });
    assert.equal(second.status, 402);
    assert.equal(second.body.limitReached, true);
    assert.equal(second.body.limit, 1);

    // A single request that would itself exceed the limit is rejected too,
    // not just a second request after the first succeeded.
    const freeApi2 = await registerFreeOrg();
    const overLimit = await freeApi2.post("/api/breeder-cages", { count: 2 });
    assert.equal(overLimit.status, 402);
  });
});

describe("DELETE /api/breeder-cages/:id", () => {
  test("deletes the cage and cascades to its cage_entries", async () => {
    const cage = await api.post("/api/breeder-cages", { count: 1 });
    const cageId = cage.body[0].id;
    const entry = await api.post("/api/cage-entries", { cageId, date: "2026-01-10", quantityKg: 3 });
    assert.equal(entry.status, 201);

    const del = await api.delete(`/api/breeder-cages/${cageId}`);
    assert.equal(del.status, 204);

    const cages = await api.get("/api/breeder-cages");
    assert.ok(!cages.body.some((c) => c.id === cageId));

    const entries = await api.get("/api/cage-entries");
    assert.ok(!entries.body.some((e) => e.id === entry.body.id), "the cage's entries should be gone too");
  });

  test("deleting an unknown cage id is a 404", async () => {
    const res = await api.delete("/api/breeder-cages/BC-DOES-NOT-EXIST");
    assert.equal(res.status, 404);
  });

  test("a free org's own cage delete still works within its own tenant", async () => {
    const freeApi = await registerFreeOrg();
    const cage = await freeApi.post("/api/breeder-cages", { count: 1 });
    const del = await freeApi.delete(`/api/breeder-cages/${cage.body[0].id}`);
    assert.equal(del.status, 204);
  });
});

describe("cage_entries CRUD", () => {
  test("logging pupa/prepupa entries into a cage, editing, and deleting one", async () => {
    const cage = await api.post("/api/breeder-cages", { count: 1 });
    const cageId = cage.body[0].id;

    const created = await api.post("/api/cage-entries", { cageId, date: "2026-01-10", quantityKg: 2.5, createdBy: "Tester" });
    assert.equal(created.status, 201);
    assert.equal(created.body.cageId, cageId);
    assert.equal(created.body.quantityKg, 2.5);

    const list = await api.get("/api/cage-entries");
    assert.ok(list.body.some((e) => e.id === created.body.id));

    const updated = await api.patch(`/api/cage-entries/${created.body.id}`, { date: "2026-01-11", quantityKg: 4 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.date, "2026-01-11");
    assert.equal(updated.body.quantityKg, 4);

    const del = await api.delete(`/api/cage-entries/${created.body.id}`);
    assert.equal(del.status, 204);

    const listAfter = await api.get("/api/cage-entries");
    assert.ok(!listAfter.body.some((e) => e.id === created.body.id));
  });

  test("logging an entry against a non-existent cage is rejected", async () => {
    const res = await api.post("/api/cage-entries", { cageId: "BC-DOES-NOT-EXIST", date: "2026-01-10", quantityKg: 1 });
    assert.equal(res.status, 404);
  });

  test("missing required fields on create is a 400", async () => {
    const cage = await api.post("/api/breeder-cages", { count: 1 });
    const cageId = cage.body[0].id;
    const res = await api.post("/api/cage-entries", { cageId });
    assert.equal(res.status, 400);
  });

  test("editing or deleting an unknown entry is a 404", async () => {
    const patch = await api.patch("/api/cage-entries/CE-DOES-NOT-EXIST", { quantityKg: 1 });
    assert.equal(patch.status, 404);

    const del = await api.delete("/api/cage-entries/CE-DOES-NOT-EXIST");
    assert.equal(del.status, 404);
  });
});
