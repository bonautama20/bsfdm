// Regression coverage for a real gap found while deploying the multi-tenant
// conversion: backup.js used to only VACUUM INTO the control database — once
// business data moved into per-organization tenant files, that left every
// org's actual data (bioponds, hotels, sales, etc.) completely unbacked-up.
// This locks in that every tenant db gets its own snapshot, and that
// retention is enforced per database rather than one global cap.
import { test, describe, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getTenantDb } from "../tenantDb.js";
import { runBackup } from "../backup.js";
import { cleanupTestDb } from "./helpers.js";

const BACKUP_DIR = path.join(path.dirname(process.env.DB_PATH), "backups");

after(() => {
  fs.rmSync(BACKUP_DIR, { force: true, recursive: true });
  cleanupTestDb();
});

describe("runBackup", () => {
  test("backs up the control database and every tenant database", () => {
    getTenantDb("ORG-DEMO");
    getTenantDb("ORG-BACKUP-TEST");
    runBackup();

    const files = fs.readdirSync(BACKUP_DIR);
    assert.ok(files.some((f) => f.startsWith("control-")), "should back up the control db");
    assert.ok(files.some((f) => f.startsWith("tenant-ORG-DEMO-")), "should back up ORG-DEMO's tenant db");
    assert.ok(files.some((f) => f.startsWith("tenant-ORG-BACKUP-TEST-")), "should back up a dashed org id's tenant db");
  });

  test("retention is enforced per database, not as one global cap", async () => {
    fs.rmSync(BACKUP_DIR, { force: true, recursive: true });
    process.env.BACKUP_RETENTION_COUNT = "2";
    try {
      for (let i = 0; i < 3; i++) {
        runBackup();
        await new Promise((r) => setTimeout(r, 1100)); // filenames are timestamp-keyed to the second
      }
    } finally {
      delete process.env.BACKUP_RETENTION_COUNT;
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const controlFiles = files.filter((f) => f.startsWith("control-"));
    const demoFiles = files.filter((f) => f.startsWith("tenant-ORG-DEMO-"));
    const otherFiles = files.filter((f) => f.startsWith("tenant-ORG-BACKUP-TEST-"));

    assert.equal(controlFiles.length, 2, "control backups should be pruned to the retention count");
    assert.equal(demoFiles.length, 2, "ORG-DEMO backups should be pruned to the retention count independently");
    assert.equal(otherFiles.length, 2, "ORG-BACKUP-TEST backups should be pruned to the retention count independently");
  });
});
