// Automated backups for every SQLite database this app manages — the shared
// control database (accounts, organizations, the community directory) AND
// every organization's own tenant database (see server/tenantDb.js). Since
// the multi-tenant split, all the actual business data (bioponds, hotels,
// sales, etc.) lives in the tenant files, not the control one — backing up
// only the control db would silently leave every organization's real data
// unprotected.
//
// Uses `VACUUM INTO`, SQLite's built-in hot-backup command — it produces a
// complete, consistent snapshot file without locking out concurrent
// reads/writes, unlike a raw file copy (which can catch a write mid-flight).
//
// Runs on a daily in-process timer (wired up in index.js) AND is runnable
// standalone via `npm run backup` — e.g. from an external cron/platform
// scheduler, which is the more reliable option on hosts that restart the
// app frequently (an in-process timer resets every restart).
//
// IMPORTANT: BACKUP_DIR must itself live on persistent storage — on hosts
// with an ephemeral filesystem (see db.js's platform check), point BACKUP_DIR
// at the same mounted volume as DB_PATH, or the backups disappear right along
// with the database they're meant to protect.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { db, DB_PATH } from "./db.js";
import { TENANT_DB_DIR } from "./tenantDb.js";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), "backups");
const CONTROL_PREFIX = "control-";
const TENANT_PREFIX = "tenant-";

function timestampForFilename() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

// Single-quoted SQL string literal — backupPath is always built from our own
// timestamp/org id, never from user input, but the quote is still escaped
// defensively since VACUUM INTO can't take a bound parameter.
function vacuumInto(sourceDb, backupPath, label) {
  try {
    sourceDb.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
    console.log(`[backup] Wrote ${backupPath}`);
    return true;
  } catch (err) {
    console.error(`[backup] Failed to back up ${label}: ${err.message}`);
    return false;
  }
}

export function runBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = timestampForFilename();

  vacuumInto(db, path.join(BACKUP_DIR, `${CONTROL_PREFIX}${ts}.sqlite3`), "control database");

  const tenantFiles = fs.existsSync(TENANT_DB_DIR)
    ? fs.readdirSync(TENANT_DB_DIR).filter((f) => f.endsWith(".sqlite3"))
    : [];
  for (const file of tenantFiles) {
    const orgId = file.replace(/\.sqlite3$/, "");
    // A short-lived connection just for the snapshot — separate from the
    // long-lived one server/tenantDb.js's cache holds open for the live app.
    // Safe to open concurrently: both are WAL-mode connections to the same
    // file, and VACUUM INTO only reads from its source.
    const tenantDb = new DatabaseSync(path.join(TENANT_DB_DIR, file));
    try {
      vacuumInto(tenantDb, path.join(BACKUP_DIR, `${TENANT_PREFIX}${orgId}-${ts}.sqlite3`), `tenant ${orgId}`);
    } finally {
      tenantDb.close();
    }
  }

  pruneOldBackups();
}

// Keeps the newest RETENTION_COUNT backups PER DATABASE (control, and each
// tenant separately) rather than one global cap — otherwise a handful of
// active organizations could crowd a quiet one's backups out of the
// retention window entirely.
function pruneOldBackups() {
  const retentionCount = Number(process.env.BACKUP_RETENTION_COUNT) || 14;
  const allFiles = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".sqlite3"));
  const groups = new Map(); // "control" or "tenant-<orgId>" -> filenames

  // Strip the trailing "-<timestamp>.sqlite3" (always the LAST such match,
  // since org ids can themselves contain dashes, e.g. "ORG-1") to recover
  // the group a file belongs to.
  const TIMESTAMP_SUFFIX = /-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.sqlite3$/;
  for (const file of allFiles) {
    const groupKey = TIMESTAMP_SUFFIX.test(file) ? file.replace(TIMESTAMP_SUFFIX, "") : file;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(file);
  }

  for (const files of groups.values()) {
    files.sort(); // ISO-ish timestamp in the filename sorts chronologically as text
    const toDelete = files.slice(0, Math.max(0, files.length - retentionCount));
    toDelete.forEach((f) => {
      try {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
      } catch (err) {
        console.error(`[backup] Could not prune ${f}: ${err.message}`);
      }
    });
  }
}

// `node backup.js` (or `npm run backup`) runs a one-off backup immediately —
// point an external cron/scheduler at this for the most restart-proof setup.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runBackup();
}
