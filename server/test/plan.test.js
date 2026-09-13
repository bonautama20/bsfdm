// Regression coverage for free/paid feature gating (server/middleware/plan.js
// — Phase 3 of the multi-tenant plan). A free org must be able to use
// Production and nothing else; upgrading via set-org-plan.js's own logic
// (a plain UPDATE, exercised here directly against the control db) must
// unlock everything immediately, no re-login required.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../db.js";
import { startTestServer, makeClient, cleanupTestDb } from "./helpers.js";

let server, baseUrl;
let counter = 0;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

after(() => {
  server.close();
  cleanupTestDb();
});

// Each call registers a brand new org (email must be globally unique — see
// server/routes/auth.js's register route) so tests in this file don't
// interfere with each other's plan state.
async function registerAndLogin(companyName) {
  const api = makeClient(baseUrl);
  const email = `owner${counter++}@gating-test.test`;
  const res = await api.post("/api/auth/register", { companyName, name: "Owner", email, password: "a-strong-password" });
  assert.equal(res.status, 201);
  return { api, orgId: res.body.organization.id };
}

describe("free plan", () => {
  test("can read and write Production data", async () => {
    const { api } = await registerAndLogin("Free Co A");
    const racks = await api.get("/api/racks");
    assert.equal(racks.status, 200);

    const kasgot = await api.post("/api/kasgot-records", { date: "2026-01-01", biopondLabel: "Test", quantityKg: 1 });
    assert.equal(kasgot.status, 201);
  });

  test("gets 402 (not 200 or 500) reading a paid-only module", async () => {
    const { api } = await registerAndLogin("Free Co B");
    for (const path of ["/api/hotels", "/api/vendors", "/api/employees", "/api/communities", "/api/users"]) {
      const res = await api.get(path);
      assert.equal(res.status, 402, `${path} should be gated for a free org`);
      assert.equal(res.body.upgradeRequired, true);
    }
  });

  test("gets 402 reading paid-only endpoints inside the mixed misc router", async () => {
    const { api } = await registerAndLogin("Free Co C");
    for (const path of ["/api/sales-transactions", "/api/calendar-events", "/api/notification-settings", "/api/app-settings/quiet-hours"]) {
      const res = await api.get(path);
      assert.equal(res.status, 402, `${path} should be gated for a free org`);
    }
  });

  test("gets 402 writing to a paid-only module, not a silent 403/500", async () => {
    const { api } = await registerAndLogin("Free Co D");
    const res = await api.post("/api/hotels", { name: "Should Be Blocked By Plan", address: "X" });
    assert.equal(res.status, 402);
  });
});

describe("paid plan", () => {
  test("upgrading the org unlocks every module immediately, no re-login", async () => {
    const { api, orgId } = await registerAndLogin("Free Co E");
    const blocked = await api.get("/api/hotels");
    assert.equal(blocked.status, 402);

    db.prepare("UPDATE organizations SET plan = 'paid' WHERE id = ?").run(orgId);

    // Same cookie/session as before the upgrade — no fresh login.
    const unlocked = await api.get("/api/hotels");
    assert.equal(unlocked.status, 200);
    assert.deepEqual(unlocked.body, []);
  });
});
