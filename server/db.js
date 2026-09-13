import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedDatabase, migrateRolePermissions } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// DB_PATH can be overridden via env — e.g. to point at a mounted persistent
// volume on hosts like Render/Railway/Fly.io whose local filesystem is ephemeral.
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "bsfdm.sqlite3");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

// Best-effort detection of known ephemeral-filesystem hosts (Render, Railway,
// Fly.io, Heroku) via the env vars they set on every deploy. If DB_PATH hasn't
// been pointed at a mounted persistent volume there, every restart/redeploy
// silently wipes the database back to empty (which then re-seeds with demo
// data) — refuse to boot rather than let that happen unnoticed in production.
if (process.env.NODE_ENV === "production" && !process.env.DB_PATH) {
  const platform =
    (process.env.RENDER && "Render") ||
    (process.env.RAILWAY_ENVIRONMENT && "Railway") ||
    (process.env.FLY_APP_NAME && "Fly.io") ||
    (process.env.DYNO && "Heroku") ||
    null;
  if (platform) {
    console.error(
      `[db] Detected a ${platform} deployment with no DB_PATH set — this platform's local disk is ` +
      "ephemeral, so the SQLite database would be wiped on every restart/redeploy. Mount a persistent " +
      "volume/disk and set DB_PATH to a path inside it (e.g. /data/bsfdm.sqlite3) before going live. " +
      "See the \"Deploy ke production\" section in README.md."
    );
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
// WAL mode lets readers and writers run concurrently instead of blocking each
// other (the default rollback-journal mode serializes them) — matters once
// more than a couple of the ~100 users are hitting the API at once.
db.exec("PRAGMA journal_mode = WAL;");
db.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));

// Lightweight migrations: `CREATE TABLE IF NOT EXISTS` above only affects brand
// new databases, so columns added to schema.sql after a DB already exists on
// disk need to be patched in here too, one ALTER TABLE per new column.
function ensureColumn(table, column, type) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}
ensureColumn("hotels", "hotel_pic_phone", "TEXT");
ensureColumn("vendors", "pic_position", "TEXT");
ensureColumn("egg_batches", "created_by", "TEXT");

const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
if (count === 0) {
  console.log("[db] Empty database — seeding demo data...");
  seedDatabase(db);
  console.log("[db] Seed complete.");
} else {
  console.log(`[db] Using existing database at ${DB_PATH} (${count} users).`);
  // Fills in any (role, module) permission rows a fresh seed already has but
  // an older existing database doesn't yet (e.g. a module added later).
  migrateRolePermissions(db);
}

// MAX(numeric suffix) + 1, not COUNT(*) — COUNT drifts below the highest id
// already in use as soon as any row is deleted, which then collides with an
// existing higher-numbered id on the next insert (UNIQUE constraint failure;
// this actually happened to the Community feature during testing). `prefix`
// excludes the trailing dash, e.g. nextId("hotels", "HTL", 2) -> "HTL-07".
// padLength 0 (default) means no zero-padding (e.g. nextId("egg_batches", "EB")).
export function nextId(table, prefix, padLength = 0) {
  const dashPrefix = `${prefix}-`;
  const { maxNum } = db.prepare(
    `SELECT MAX(CAST(SUBSTR(id, ${dashPrefix.length + 1}) AS INTEGER)) AS maxNum FROM ${table}`
  ).get();
  const next = (maxNum || 0) + 1;
  return `${dashPrefix}${padLength ? String(next).padStart(padLength, "0") : next}`;
}

export function nowISO() {
  return new Date().toISOString();
}

export function localISODate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
