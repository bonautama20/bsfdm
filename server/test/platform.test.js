// Regression coverage for the platform-owner-only stats page (server/routes/
// platform.js) — cross-tenant data that only PLATFORM_OWNER_ORG_ID may see,
// and the isPlatformOwner flag the frontend uses to show/hide it.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { db, PLATFORM_OWNER_ORG_ID } from "../db.js";
import { TENANT_DB_DIR } from "../tenantDb.js";
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
  const email = `platform${counter++}@platform-test.test`;
  const res = await api.post("/api/auth/register", { companyName, name: "Owner", email, password: "a-strong-password" });
  assert.equal(res.status, 201);
  return { api, orgId: res.body.organization.id, email };
}

describe("isPlatformOwner flag", () => {
  test("the seeded demo org (default PLATFORM_OWNER_ORG_ID in tests) is flagged as the platform owner", async () => {
    const api = makeClient(baseUrl);
    const res = await api.post("/api/auth/login", SEEDED.superAdmin);
    assert.equal(res.body.organization.isPlatformOwner, true);
  });

  test("a freshly registered org is not the platform owner", async () => {
    const { api } = await registerAndLogin("Platform Test Co A");
    const me = await api.get("/api/auth/me");
    assert.equal(me.body.organization.isPlatformOwner, false);
  });
});

describe("GET /api/platform/stats", () => {
  test("a non-owner organization is blocked", async () => {
    const { api } = await registerAndLogin("Platform Test Co B");
    const res = await api.get("/api/platform/stats");
    assert.equal(res.status, 403);
  });

  test("the platform owner sees totals and the full organization list, including a pending upgrade request", async () => {
    const { api: ownerApi } = { api: makeClient(baseUrl) };
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

    const { api: customerApi, orgId } = await registerAndLogin("Platform Test Co C");
    await customerApi.post("/api/billing/upgrade-request", { note: "please upgrade me" });

    const res = await ownerApi.get("/api/platform/stats");
    assert.equal(res.status, 200);
    assert.ok(res.body.totals.organizations >= 1);
    assert.ok(res.body.totals.users >= 1);

    const org = res.body.organizations.find((o) => o.id === orgId);
    assert.ok(org, "the newly registered org should appear in the list");
    assert.equal(org.plan, "free");
    assert.equal(org.userCount, 1);
    assert.equal(org.pendingUpgradeRequest.note, "please upgrade me");
  });
});

describe("POST /api/platform/organizations/:orgId/plan", () => {
  test("the platform owner can upgrade an org, which resolves its pending request", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

    const { api: customerApi, orgId } = await registerAndLogin("Platform Test Co D");
    await customerApi.post("/api/billing/upgrade-request", { note: "x" });

    const upgrade = await ownerApi.post(`/api/platform/organizations/${orgId}/plan`, { plan: "paid" });
    assert.equal(upgrade.status, 200);

    const status = await customerApi.get("/api/billing/upgrade-request/status");
    assert.equal(status.body.status, "approved");

    const org = db.prepare("SELECT plan FROM organizations WHERE id = ?").get(orgId);
    assert.equal(org.plan, "paid");
  });

  test("a non-owner organization cannot upgrade any org, including itself", async () => {
    const { api, orgId } = await registerAndLogin("Platform Test Co E");
    const res = await api.post(`/api/platform/organizations/${orgId}/plan`, { plan: "paid" });
    assert.equal(res.status, 403);
  });
});

describe("POST /api/platform/organizations/:orgId/status (suspend/activate)", () => {
  test("suspending an org blocks its logged-in user's very next request, not just their next login", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

    const { api: customerApi, orgId } = await registerAndLogin("Platform Test Co F");
    const before = await customerApi.get("/api/racks");
    assert.equal(before.status, 200, "sanity check: works before suspension");

    const suspend = await ownerApi.post(`/api/platform/organizations/${orgId}/status`, { status: "suspended" });
    assert.equal(suspend.status, 200);

    // Same cookie/session as before — no logout/login in between.
    const after = await customerApi.get("/api/racks");
    assert.equal(after.status, 403);
    assert.match(after.body.error, /no longer has access/i);
  });

  test("a suspended org's user cannot even log in with a fresh session", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const { orgId, email } = await registerAndLogin("Platform Test Co G");
    await ownerApi.post(`/api/platform/organizations/${orgId}/status`, { status: "suspended" });

    const freshApi = makeClient(baseUrl);
    const login = await freshApi.post("/api/auth/login", { email, password: "a-strong-password" });
    assert.equal(login.status, 403);
  });

  test("reactivating restores access immediately", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const { api: customerApi, orgId } = await registerAndLogin("Platform Test Co H");

    await ownerApi.post(`/api/platform/organizations/${orgId}/status`, { status: "suspended" });
    assert.equal((await customerApi.get("/api/racks")).status, 403);

    await ownerApi.post(`/api/platform/organizations/${orgId}/status`, { status: "active" });
    assert.equal((await customerApi.get("/api/racks")).status, 200);
  });

  test("the platform owner cannot suspend their own organization", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const res = await ownerApi.post(`/api/platform/organizations/${PLATFORM_OWNER_ORG_ID}/status`, { status: "suspended" });
    assert.equal(res.status, 400);
  });

  test("a non-owner organization cannot suspend anyone", async () => {
    const { api, orgId } = await registerAndLogin("Platform Test Co I");
    const res = await api.post(`/api/platform/organizations/${orgId}/status`, { status: "suspended" });
    assert.equal(res.status, 403);
  });
});

describe("DELETE /api/platform/organizations/:orgId", () => {
  test("deletes the org, its users, and its entire tenant database file", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);

    const { api: customerApi, orgId } = await registerAndLogin("Platform Test Co J");
    await customerApi.get("/api/racks"); // ensures the tenant db file actually got created on disk
    const tenantFile = path.join(TENANT_DB_DIR, `${orgId}.sqlite3`);
    assert.ok(fs.existsSync(tenantFile), "sanity check: tenant db file exists before deletion");

    const del = await ownerApi.delete(`/api/platform/organizations/${orgId}`);
    assert.equal(del.status, 204);

    assert.equal(db.prepare("SELECT id FROM organizations WHERE id = ?").get(orgId), undefined);
    assert.equal(db.prepare("SELECT id FROM users WHERE org_id = ?").get(orgId), undefined);
    assert.equal(fs.existsSync(tenantFile), false, "tenant db file should be removed from disk");

    // The deleted org's already-logged-in session is rejected immediately.
    const after = await customerApi.get("/api/racks");
    assert.equal(after.status, 403);
  });

  test("the platform owner cannot delete their own organization", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const res = await ownerApi.delete(`/api/platform/organizations/${PLATFORM_OWNER_ORG_ID}`);
    assert.equal(res.status, 400);
  });

  test("a non-owner organization cannot delete anyone, including itself", async () => {
    const { api, orgId } = await registerAndLogin("Platform Test Co K");
    const res = await api.delete(`/api/platform/organizations/${orgId}`);
    assert.equal(res.status, 403);
  });

  test("deleting an unknown org id is a 404, not a silent success", async () => {
    const ownerApi = makeClient(baseUrl);
    await ownerApi.post("/api/auth/login", SEEDED.superAdmin);
    const res = await ownerApi.delete("/api/platform/organizations/ORG-DOES-NOT-EXIST");
    assert.equal(res.status, 404);
  });
});
