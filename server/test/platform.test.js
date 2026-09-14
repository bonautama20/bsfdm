// Regression coverage for the platform-owner-only stats page (server/routes/
// platform.js) — cross-tenant data that only PLATFORM_OWNER_ORG_ID may see,
// and the isPlatformOwner flag the frontend uses to show/hide it.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../db.js";
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
  return { api, orgId: res.body.organization.id };
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
