// Automated backups for the SQLite database. Uses `VACUUM INTO`, SQLite's
// built-in hot-backup command — it produces a complete, consistent snapshot
// file without locking out concurrent reads/writes, unlike a raw file copy
// (which can catch a write mid-flight).
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
import fs from "node:fs";
import path from "node:path";
import { db, DB_PATH } from "./db.js";

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), "backups");
const RETENTION_COUNT = Number(process.env.BACKUP_RETENTION_COUNT) || 14;
const FILE_PREFIX = "bsfdm-";

function timestampForFilename() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function runBackup() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, `${FILE_PREFIX}${timestampForFilename()}.sqlite3`);

  try {
    // Single-quoted SQL string literal — backupPath is built entirely from
    // our own timestamp, never from user input, but the quote is still
    // escaped defensively since VACUUM INTO can't take a bound parameter.
    db.exec(`VACUUM INTO '${backupPath.replace(/'/g, "''")}'`);
    console.log(`[backup] Wrote ${backupPath}`);
    pruneOldBackups();
    return backupPath;
  } catch (err) {
    console.error(`[backup] Failed: ${err.message}`);
    return null;
  }
}

function pruneOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(FILE_PREFIX) && f.endsWith(".sqlite3"))
    .sort(); // ISO-ish timestamp in the filename sorts chronologically as text

  const toDelete = files.slice(0, Math.max(0, files.length - RETENTION_COUNT));
  toDelete.forEach((f) => {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, f));
    } catch (err) {
      console.error(`[backup] Could not prune ${f}: ${err.message}`);
    }
  });
}

// `node backup.js` (or `npm run backup`) runs a one-off backup immediately —
// point an external cron/scheduler at this for the most restart-proof setup.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  runBackup();
}
