// One SQLite database per organization (tenant) — see the multi-tenant plan.
// Isolation is structural: a company's data physically lives in its own
// file, so there's no WHERE-clause discipline that could leak one tenant's
// rows into another's. Connections are opened once per org and cached for
// the life of the process (mirrors db.js's single-connection pattern, just
// keyed by org instead of global).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DB_PATH } from "./db.js";
import { DEMO_ORG_ID, seedTenantDemoData } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Defaults to a "tenants" folder next to the control database — keep this on
// the same persistent volume as DB_PATH in production (see db.js's ephemeral
// host check and README's deploy notes); nothing here re-checks that
// independently, so getting DB_PATH right also gets this right.
export const TENANT_DB_DIR = process.env.TENANT_DB_DIR || path.join(path.dirname(DB_PATH), "tenants");
const SCHEMA_PATH = path.join(__dirname, "schema-tenant.sql");

fs.mkdirSync(TENANT_DB_DIR, { recursive: true });

const connections = new Map();

function tenantDbPath(orgId) {
  return path.join(TENANT_DB_DIR, `${orgId}.sqlite3`);
}

function openTenantDb(orgId) {
  const dbPath = tenantDbPath(orgId);
  const isNew = !fs.existsSync(dbPath);

  const tenantDb = new DatabaseSync(dbPath);
  tenantDb.exec("PRAGMA journal_mode = WAL;");
  tenantDb.exec(fs.readFileSync(SCHEMA_PATH, "utf-8"));

  // Future tenant-table column migrations go here, one `ensureColumn(tenantDb,
  // table, column, type)` call per new column (see db.js for the helper) —
  // none needed yet since every tenant db is created fresh from the current
  // schema-tenant.sql.

  if (isNew) {
    console.log(`[tenantDb] Created new tenant database for ${orgId}.`);
    if (orgId === DEMO_ORG_ID) {
      seedTenantDemoData(tenantDb);
      console.log(`[tenantDb] Seeded demo operational data for ${orgId}.`);
    }
  }

  return tenantDb;
}

export function getTenantDb(orgId) {
  if (!orgId) throw new Error("getTenantDb: orgId is required.");
  let tenantDb = connections.get(orgId);
  if (!tenantDb) {
    tenantDb = openTenantDb(orgId);
    connections.set(orgId, tenantDb);
  }
  return tenantDb;
}

// Permanently removes an organization's entire database — used when the
// platform owner deletes a customer (see routes/platform.js). Closes the
// cached connection first (if this process has one open) so nothing keeps
// writing to a file that's about to disappear, then removes the main file
// and its WAL/SHM sidecars. Irreversible: callers are responsible for
// confirming this is really wanted before calling it.
export function deleteTenantDb(orgId) {
  const existing = connections.get(orgId);
  if (existing) {
    existing.close();
    connections.delete(orgId);
  }
  const dbPath = tenantDbPath(orgId);
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(`${dbPath}${suffix}`, { force: true });
  }
}
