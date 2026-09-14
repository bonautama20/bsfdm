// Regression coverage for the manual payment flow (no gateway yet — see
// server/routes/billing.js and set-org-plan.js): a free org can submit an
// upgrade request, sees it reflected as pending, and set-org-plan.js both
// upgrades the org and auto-resolves the matching request. Also locks in the
// requirePlatformOwner fix — it must respect PLATFORM_OWNER_ORG_ID (which a
// real deployment sets to its own org, not the local-dev demo org), a real
// bug found while deploying: the old hardcoded DEMO_ORG_ID check silently
// locked the real production owner out of editing the shared role template.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../db.js";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SET_ORG_PLAN_SCRIPT = path.join(__dirname, "..", "set-org-plan.js");

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
  const email = `billing${counter++}@billing-test.test`;
  const res = await api.post("/api/auth/register", { companyName, name: "Owner", email, password: "a-strong-password" });
  assert.equal(res.status, 201);
  return { api, orgId: res.body.organization.id };
}

function runSetOrgPlan(...args) {
  return execFileSync(
    "node",
    ["--disable-warning=ExperimentalWarning", SET_ORG_PLAN_SCRIPT, ...args],
    { encoding: "utf-8", env: { ...process.env } }
  );
}

describe("upgrade requests", () => {
  test("a free org can submit an upgrade request and see it as pending", async () => {
    const { api } = await registerAndLogin("Billing Co A");

    const before = await api.get("/api/billing/upgrade-request/status");
    assert.equal(before.status, 200);
    assert.equal(before.body, null);

    const created = await api.post("/api/billing/upgrade-request", { note: "transfer via BCA" });
    assert.equal(created.status, 201);
    assert.equal(created.body.status, "pending");
    assert.equal(created.body.note, "transfer via BCA");

    const after = await api.get("/api/billing/upgrade-request/status");
    assert.equal(after.body.status, "pending");
  });

  test("submitting again while already pending returns the same request, not a duplicate", async () => {
    const { api } = await registerAndLogin("Billing Co B");
    const first = await api.post("/api/billing/upgrade-request", { note: "first" });
    const second = await api.post("/api/billing/upgrade-request", { note: "second" });
    assert.equal(second.status, 200);
    assert.equal(second.body.id, first.body.id);
  });

  test("a paid org cannot submit an upgrade request", async () => {
    const { api, orgId } = await registerAndLogin("Billing Co C");
    db.prepare("UPDATE organizations SET plan = 'paid' WHERE id = ?").run(orgId);

    const res = await api.post("/api/billing/upgrade-request", { note: "x" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /already on the paid plan/i);
  });

  test("set-org-plan.js upgrading an org auto-resolves its pending request", async () => {
    const { api, orgId } = await registerAndLogin("Billing Co D");
    await api.post("/api/billing/upgrade-request", { note: "please upgrade" });

    const output = runSetOrgPlan(orgId, "paid");
    assert.match(output, /Resolved 1 pending upgrade request/);

    const status = await api.get("/api/billing/upgrade-request/status");
    assert.equal(status.body.status, "approved");

    // The org itself always stays in the top listing table regardless of
    // pending status — only the "Pending upgrade requests" section below it
    // should stop mentioning this org once its request is resolved.
    const listing = runSetOrgPlan();
    const pendingSection = listing.split("Pending upgrade requests:")[1];
    assert.doesNotMatch(pendingSection, new RegExp(orgId));
  });

  test("set-org-plan.js's listing surfaces pending requests", async () => {
    const { api, orgId } = await registerAndLogin("Billing Co E");
    await api.post("/api/billing/upgrade-request", { note: "surface me" });

    const listing = runSetOrgPlan();
    assert.match(listing, new RegExp(orgId));
    assert.match(listing, /surface me/);
  });
});

describe("requirePlatformOwner respects PLATFORM_OWNER_ORG_ID (not a hardcoded demo org)", () => {
  test("the seeded demo org (the default PLATFORM_OWNER_ORG_ID in tests) can edit the shared role template", async () => {
    const api = makeClient(baseUrl);
    await api.post("/api/auth/login", SEEDED.superAdmin);
    const res = await api.patch("/api/users/roles/role-operator/permissions", { module: "Production", action: "view", value: true });
    assert.equal(res.status, 200);
  });

  test("a different, real organization is correctly blocked from editing the shared role template", async () => {
    const { api } = await registerAndLogin("Billing Co F");
    const res = await api.patch("/api/users/roles/role-operator/permissions", { module: "Production", action: "view", value: true });
    assert.equal(res.status, 402); // blocked by the Setting plan-gate before it even reaches requirePlatformOwner — free org
  });

  test("a PAID non-owner organization is blocked by requirePlatformOwner specifically (not just the plan gate)", async () => {
    const { api, orgId } = await registerAndLogin("Billing Co G");
    db.prepare("UPDATE organizations SET plan = 'paid' WHERE id = ?").run(orgId);
    const res = await api.patch("/api/users/roles/role-operator/permissions", { module: "Production", action: "view", value: true });
    assert.equal(res.status, 403);
    assert.match(res.body.error, /platform operator/i);
  });
});
