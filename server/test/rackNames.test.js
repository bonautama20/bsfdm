// Regression coverage for a real report: repeated clicks on "Add Production
// Line" (whose suggested name didn't check for existing racks) silently
// created multiple racks with an identical name — looking like duplicated/
// reappearing old data rather than what it actually was, separate racks.
// The server now rejects a duplicate rack name outright.
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { db } from "../db.js";
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

describe("rack name uniqueness", () => {
  test("creating a second rack with the same name is rejected", async () => {
    const first = await api.post("/api/racks", { name: "Unique Rack Name Test", count: 1 });
    assert.equal(first.status, 201);

    const dup = await api.post("/api/racks", { name: "Unique Rack Name Test", count: 1 });
    assert.equal(dup.status, 409);
    assert.match(dup.body.error, /already exists/i);

    // Case-insensitive, and nothing partial was created for the rejected request.
    const dupCase = await api.post("/api/racks", { name: "unique rack name test", count: 1 });
    assert.equal(dupCase.status, 409);

    const racks = await api.get("/api/racks");
    assert.equal(racks.body.filter((r) => r.name.toLowerCase() === "unique rack name test").length, 1);

    await api.delete(`/api/racks/${first.body.id}`);
  });

  test("renaming a rack to an already-used name is rejected", async () => {
    const a = await api.post("/api/racks", { name: "Rename Test A", count: 1 });
    const b = await api.post("/api/racks", { name: "Rename Test B", count: 1 });

    const res = await api.patch(`/api/racks/${b.body.id}`, { name: "Rename Test A" });
    assert.equal(res.status, 409);

    // Renaming a rack to its OWN current name (no-op) must still work.
    const noop = await api.patch(`/api/racks/${a.body.id}`, { name: "Rename Test A" });
    assert.equal(noop.status, 200);

    await api.delete(`/api/racks/${a.body.id}`);
    await api.delete(`/api/racks/${b.body.id}`);
  });
});
