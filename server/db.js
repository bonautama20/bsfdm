import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedControlBase, seedDemoOrgAndUsers, migrateRolePermissions, DEMO_ORG_ID } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The CONTROL database — auth (users/roles/permissions), the organization
// registry, and the shared cross-tenant Community directory. Each
// organization's own operational data lives in a separate per-tenant
// database instead — see tenantDb.js. DB_PATH can be overridden via env —
// e.g. to point at a mounted persistent volume on hosts like
// Render/Railway/Fly.io whose local filesystem is ephemeral.
export const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "control.sqlite3");

// The one organization allowed to edit the shared role/permission template
// and review other orgs' upgrade requests (see requirePlatformOwner in
// middleware/auth.js and routes/billing.js). Defaults to the local-dev demo
// org for convenience — a real deployment MUST set this to its own real
// organization's id (see migrate-to-multitenant.js's --org-id, or
// `node set-org-plan.js` to look it up), or the actual operator gets locked
// out of both of those features after going multi-tenant.
export const PLATFORM_OWNER_ORG_ID = process.env.PLATFORM_OWNER_ORG_ID || DEMO_ORG_ID;
const SCHEMA_PATH = path.join(__dirname, "schema-control.sql");

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

// Lightweight migrations: `CREATE TABLE IF NOT EXISTS` above only affects
// brand new databases, so columns added to a schema after a DB already
// exists on disk need to be patched in here too, one ALTER TABLE per new
// column. Exported so tenantDb.js can reuse it for tenant-database schemas.
export function ensureColumn(targetDb, table, column, type) {
  const cols = targetDb.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    targetDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

const { count: roleCount } = db.prepare("SELECT COUNT(*) AS count FROM roles").get();
if (roleCount === 0) {
  console.log("[db] Empty control database — seeding roles/permissions, Community directory, and the demo organization...");
  seedControlBase(db);
  seedDemoOrgAndUsers(db);
  console.log("[db] Control database seed complete.");
} else {
  console.log(`[db] Using existing control database at ${DB_PATH}.`);
  // Fills in any (role, module) permission rows a fresh seed already has but
  // an older existing database doesn't yet (e.g. a module added later).
  migrateRolePermissions(db);
}

// MAX(numeric suffix) + 1, not COUNT(*) — COUNT drifts below the highest id
// already in use as soon as any row is deleted, which then collides with an
// existing higher-numbered id on the next insert (UNIQUE constraint failure;
// this actually happened to the Community feature during testing). `prefix`
// excludes the trailing dash, e.g. nextId(db, "hotels", "HTL", 2) -> "HTL-07".
// padLength 0 (default) means no zero-padding. Takes an explicit `db` (the
// control db, or a tenant db from tenantDb.js) rather than closing over a
// single module-level connection, since there are many databases now.
export function nextId(targetDb, table, prefix, padLength = 0) {
  const dashPrefix = `${prefix}-`;
  const { maxNum } = targetDb.prepare(
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
