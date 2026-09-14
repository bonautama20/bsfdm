// Regression coverage for the free-plan biopond cap: a free org can use
// Production (see plan.test.js for the module-level gate), but is capped at
// FREE_BIOPOND_LIMIT total bioponds across all racks (server/routes/racks.js
// + server/middleware/plan.js). Hitting the cap must return a structured 402
// (upgradeRequired + limitReached + limit) the frontend can key off of to
// show an upgrade prompt, not a generic error.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../db.js";
import { FREE_BIOPOND_LIMIT } from "../middleware/plan.js";
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
  const email = `quota${counter++}@quota-test.test`;
  const res = await api.post("/api/auth/register", { companyName, name: "Owner", email, password: "a-strong-password" });
  assert.equal(res.status, 201);
  return { api, orgId: res.body.organization.id };
}

describe("free plan biopond quota", () => {
  test(`a free org can create up to ${FREE_BIOPOND_LIMIT} bioponds total, across ranks and one-at-a-time additions`, async () => {
    const { api } = await registerAndLogin("Quota Co A");

    const rack = await api.post("/api/racks", { name: "Rack 1", count: FREE_BIOPOND_LIMIT - 1 });
    assert.equal(rack.status, 201);
    assert.equal(rack.body.bioponds.length, FREE_BIOPOND_LIMIT - 1);

    const oneMore = await api.post(`/api/racks/${rack.body.id}/bioponds`, {});
    assert.equal(oneMore.status, 201, "the last biopond up to the limit should still be allowed");
  });

  test("a free org is blocked from exceeding the limit via one-at-a-time additions", async () => {
    const { api } = await registerAndLogin("Quota Co B");
    const rack = await api.post("/api/racks", { name: "Rack 1", count: FREE_BIOPOND_LIMIT });
    assert.equal(rack.status, 201);

    const blocked = await api.post(`/api/racks/${rack.body.id}/bioponds`, {});
    assert.equal(blocked.status, 402);
    assert.equal(blocked.body.upgradeRequired, true);
    assert.equal(blocked.body.limitReached, true);
    assert.equal(blocked.body.limit, FREE_BIOPOND_LIMIT);
  });

  test("a free org is blocked from creating a rack whose count alone would exceed the limit", async () => {
    const { api } = await registerAndLogin("Quota Co C");
    const res = await api.post("/api/racks", { name: "Too Many", count: FREE_BIOPOND_LIMIT + 1 });
    assert.equal(res.status, 402);
    assert.equal(res.body.limitReached, true);

    // Nothing should have been created — not even a partial rack.
    const racks = await api.get("/api/racks");
    assert.equal(racks.body.length, 0);
  });

  test("a free org is blocked from creating a second rack that would push the total over the limit", async () => {
    const { api } = await registerAndLogin("Quota Co D");
    const first = await api.post("/api/racks", { name: "Rack 1", count: FREE_BIOPOND_LIMIT - 2 });
    assert.equal(first.status, 201);

    const second = await api.post("/api/racks", { name: "Rack 2", count: 3 });
    assert.equal(second.status, 402);
    assert.equal(second.body.limitReached, true);
  });

  test("a paid org has no biopond limit", async () => {
    const { api, orgId } = await registerAndLogin("Quota Co E");
    db.prepare("UPDATE organizations SET plan = 'paid' WHERE id = ?").run(orgId);

    const rack = await api.post("/api/racks", { name: "Big Rack", count: FREE_BIOPOND_LIMIT + 10 });
    assert.equal(rack.status, 201);
    assert.equal(rack.body.bioponds.length, FREE_BIOPOND_LIMIT + 10);
  });

  test("the existing seeded paid demo org is unaffected by the limit", async () => {
    const api = makeClient(baseUrl);
    await api.post("/api/auth/login", SEEDED.superAdmin);
    const rack = await api.post("/api/racks", { name: "Regression Rack", count: FREE_BIOPOND_LIMIT + 1 });
    assert.equal(rack.status, 201);
    await api.delete(`/api/racks/${rack.body.id}`);
  });
});
