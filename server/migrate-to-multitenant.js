// One-off transformation of the old single-tenant database (one shared
// bsfdm.sqlite3 with everyone's data mixed together) into the new
// control-db + per-tenant-db layout (see the multi-tenant plan and
// schema-control.sql / schema-tenant.sql). The existing data becomes
// "Organization 1" — a real paid tenant, not the demo org.
//
// This does NOT touch the source file — it only reads from it. Run it
// against a COPY first (see README below), and always take a fresh backup
// (`npm run backup`) of the real source before ever pointing this at
// production data.
//
// Usage:
//   node migrate-to-multitenant.js <source-db-path> [--org-id=ORG-001] [--org-name="BSFDM"] [--force]
//
// --force lets it proceed even if a control DB or that org's tenant DB
// already exists at the destination — existing rows are left alone and new
// rows are still inserted, so re-running after a partial failure is safe,
// but running it twice on the SAME source will duplicate rows. Prefer a
// clean destination unless you specifically need to resume.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      flags[key] = value ?? true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const sourcePath = positional[0];
if (!sourcePath) {
  console.error("Usage: node migrate-to-multitenant.js <source-db-path> [--org-id=ORG-001] [--org-name=\"BSFDM\"] [--force]");
  process.exit(1);
}
if (!fs.existsSync(sourcePath)) {
  console.error(`Source database not found: ${sourcePath}`);
  process.exit(1);
}

const orgId = flags["org-id"] || "ORG-001";
const orgName = flags["org-name"] || "BSFDM";
const orgSlug = orgName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "org-001";
const force = !!flags.force;

const controlDbPath = process.env.DB_PATH || path.join(__dirname, "data", "control.sqlite3");
const tenantDbDir = process.env.TENANT_DB_DIR || path.join(path.dirname(controlDbPath), "tenants");
const tenantDbPath = path.join(tenantDbDir, `${orgId}.sqlite3`);

if (!force && fs.existsSync(controlDbPath)) {
  console.error(`Control database already exists at ${controlDbPath}. Pass --force to migrate into it anyway, or remove it first.`);
  process.exit(1);
}
if (!force && fs.existsSync(tenantDbPath)) {
  console.error(`Tenant database already exists at ${tenantDbPath}. Pass --force to migrate into it anyway, or remove it first.`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(controlDbPath), { recursive: true });
fs.mkdirSync(tenantDbDir, { recursive: true });

const source = new DatabaseSync(sourcePath, { readOnly: true });
const control = new DatabaseSync(controlDbPath);
control.exec("PRAGMA journal_mode = WAL;");
control.exec(fs.readFileSync(path.join(__dirname, "schema-control.sql"), "utf-8"));

const tenant = new DatabaseSync(tenantDbPath);
tenant.exec("PRAGMA journal_mode = WAL;");
tenant.exec(fs.readFileSync(path.join(__dirname, "schema-tenant.sql"), "utf-8"));

// Copies every row of `table` from source into target, inserting one extra
// literal column value (org_id) ahead of the source's own columns if given.
function copyTable(target, table, { extraColumn, extraValue } = {}) {
  const rows = source.prepare(`SELECT * FROM ${table}`).all();
  if (rows.length === 0) return 0;

  const sourceCols = Object.keys(rows[0]);
  const cols = extraColumn ? [extraColumn, ...sourceCols] : sourceCols;
  const placeholders = cols.map(() => "?").join(",");
  const insert = target.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`);

  for (const row of rows) {
    const values = extraColumn
      ? [extraValue, ...sourceCols.map((c) => row[c])]
      : sourceCols.map((c) => row[c]);
    insert.run(...values);
  }
  return rows.length;
}

// Order matters: roles must exist before users (FK), users must exist
// before password_resets (FK). role_permissions/communities have no
// dependency on users so their position doesn't matter.
const CONTROL_TABLES_BEFORE_USERS = ["roles"];
const CONTROL_TABLES_AFTER_USERS = ["role_permissions", "communities", "password_resets"];
// Parent tables before the child tables that reference them (FK order):
// racks -> bioponds, hotels -> waste_collections/vendor_hotels,
// vendors -> vendor_hotels, employees -> attendance.
const TENANT_TABLES = [
  "racks", "hotels", "vendors", "employees",
  "bioponds", "waste_collections", "vendor_hotels", "attendance",
  "egg_harvests", "kasgot_records", "maggot_harvests",
  "breeder_records", "feed_records", "maggot_batches", "egg_batches", "breeder_cages",
  "kasgot_batches", "sales_transactions", "calendar_events", "notification_settings", "app_settings",
];

const existingOrg = control.prepare("SELECT id FROM organizations WHERE id = ?").get(orgId);
if (!existingOrg) {
  control.prepare(
    "INSERT INTO organizations (id, name, slug, plan, status, created_at) VALUES (?,?,?,?,?,?)"
  ).run(orgId, orgName, orgSlug, "paid", "active", new Date().toISOString());
  console.log(`[migrate] Created organization ${orgId} ("${orgName}", plan: paid).`);
} else {
  console.log(`[migrate] Organization ${orgId} already exists in the control db — reusing it.`);
}

for (const table of CONTROL_TABLES_BEFORE_USERS) {
  const count = copyTable(control, table);
  console.log(`[migrate] Copied ${count} row(s) from ${table} into the control db.`);
}

const userCount = copyTable(control, "users", { extraColumn: "org_id", extraValue: orgId });
console.log(`[migrate] Copied ${userCount} user(s) into the control db, tagged with org_id=${orgId}.`);

for (const table of CONTROL_TABLES_AFTER_USERS) {
  const count = copyTable(control, table);
  console.log(`[migrate] Copied ${count} row(s) from ${table} into the control db.`);
}

for (const table of TENANT_TABLES) {
  const count = copyTable(tenant, table);
  console.log(`[migrate] Copied ${count} row(s) from ${table} into tenant db ${orgId}.`);
}

console.log(`\n[migrate] Done.`);
console.log(`  Control DB: ${controlDbPath}`);
console.log(`  Tenant DB:  ${tenantDbPath}`);
console.log(`\nVerify the app boots and logs in correctly against these files before removing the old source database.`);
