// Regression coverage for the new "Owner" role — equal standing to Super
// Admin (client/src/data/dummyData.js's roles list), both allowed to manage
// users and (for the platform-owner org) edit the shared role/permission
// template. Also covers migrateRolePermissions backfilling this role onto an
// already-seeded database that predates it.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { db, nowISO } from "../db.js";
import { migrateRolePermissions } from "../seed.js";
import { startTestServer, makeClient, SEEDED, cleanupTestDb } from "./helpers.js";

let server, baseUrl;

before(async () => {
  ({ server, baseUrl } = await startTestServer());
});

after(() => {
  server.close();
  cleanupTestDb();
});

describe("role-owner", () => {
  test("exists with full permissions, same as role-super-admin", async () => {
    const api = makeClient(baseUrl);
    await api.post("/api/auth/login", SEEDED.superAdmin);
    const res = await api.get("/api/users/roles/all");
    assert.equal(res.status, 200);

    const owner = res.body.find((r) => r.id === "role-owner");
    const superAdmin = res.body.find((r) => r.id === "role-super-admin");
    assert.ok(owner, "role-owner should exist");
    assert.deepEqual(owner.permissions, superAdmin.permissions, "Owner and Super Admin should have identical permission matrices");
  });

  test("a user with role-owner can manage users just like Super Admin", async () => {
    // Promote the seeded operator-org's demo Super Admin's own org — simplest
    // path is to create a fresh Owner user directly, then act as them.
    const orgId = db.prepare("SELECT org_id FROM users WHERE email = ?").get(SEEDED.superAdmin.email).org_id;
    const ownerEmail = "owner-role-test@bsfdm.com";
    db.prepare(
      "INSERT INTO users (id, org_id, name, email, password, role_id, status, last_login, created_date) VALUES (?,?,?,?,?,?,?,NULL,?)"
    ).run("USR-OWNERTEST", orgId, "Owner Test", ownerEmail, bcrypt.hashSync("owner-test-pass", 10), "role-owner", "Active", nowISO().slice(0, 10));

    const api = makeClient(baseUrl);
    const login = await api.post("/api/auth/login", { email: ownerEmail, password: "owner-test-pass" });
    assert.equal(login.status, 200);
    assert.equal(login.body.role.id, "role-owner");

    const created = await api.post("/api/users", { name: "Created By Owner", email: `created-by-owner-${Date.now()}@bsfdm.com`, roleId: "role-operator" });
    assert.equal(created.status, 201);
    await api.delete(`/api/users/${created.body.id}`);
  });

  test("a user with role-owner in the platform-owner org can edit the shared role/permission template", async () => {
    const api = makeClient(baseUrl);
    await api.post("/api/auth/login", { email: "owner-role-test@bsfdm.com", password: "owner-test-pass" });
    const res = await api.patch("/api/users/roles/role-operator/permissions", { module: "Production", action: "view", value: true });
    assert.equal(res.status, 200);
  });
});

describe("migrateRolePermissions backfills role-owner onto an existing database", () => {
  test("removing role-owner and re-running the migration restores it", () => {
    db.prepare("DELETE FROM role_permissions WHERE role_id = 'role-owner'").run();
    db.prepare("DELETE FROM users WHERE role_id = 'role-owner'").run();
    db.prepare("DELETE FROM roles WHERE id = 'role-owner'").run();

    const before = db.prepare("SELECT id FROM roles WHERE id = 'role-owner'").get();
    assert.equal(before, undefined);

    migrateRolePermissions(db);

    const after = db.prepare("SELECT id FROM roles WHERE id = 'role-owner'").get();
    assert.ok(after, "role-owner should be restored");
    const perms = db.prepare("SELECT COUNT(*) AS c FROM role_permissions WHERE role_id = 'role-owner'").get();
    assert.ok(perms.c > 0, "role-owner's permission rows should be restored");
  });
});
