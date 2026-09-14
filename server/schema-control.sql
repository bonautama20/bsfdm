-- Control database — the one thing every request needs before we know which
-- tenant it belongs to (auth + org registry), plus the Community directory,
-- which is deliberately shared across every organization (a nationwide public
-- map of cultivators, not a per-company resource). Every other table lives in
-- a per-organization tenant database — see schema-tenant.sql and
-- server/tenantDb.js.

PRAGMA foreign_keys = ON;

-- ---------- Organizations (tenants) ----------
CREATE TABLE IF NOT EXISTS organizations (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  plan       TEXT NOT NULL DEFAULT 'free', -- free | paid
  status     TEXT NOT NULL DEFAULT 'active', -- active | suspended
  created_at TEXT NOT NULL
);

-- ---------- Auth / RBAC ----------
-- Role definitions and their permission matrix are a shared template across
-- every organization for now (not per-org customizable) — see the plan's
-- "Explicitly out of scope" note.
CREATE TABLE IF NOT EXISTS roles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  module  TEXT NOT NULL,
  can_view    INTEGER NOT NULL DEFAULT 0,
  can_create  INTEGER NOT NULL DEFAULT 0,
  can_edit    INTEGER NOT NULL DEFAULT 0,
  can_delete  INTEGER NOT NULL DEFAULT 0,
  can_export  INTEGER NOT NULL DEFAULT 0,
  can_approve INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (role_id, module)
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE, -- globally unique across the whole platform, not per-org
  password      TEXT NOT NULL, -- bcrypt hash, never plaintext (see server/routes/auth.js)
  role_id       TEXT NOT NULL REFERENCES roles(id),
  status        TEXT NOT NULL DEFAULT 'Active',
  last_login    TEXT,
  created_date  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);

-- ---------- Password reset tokens ----------
-- Only the SHA-256 hash of the token is stored — the raw token is emailed to
-- the user and never persisted, so a leaked database alone can't be used to
-- take over an account (see server/routes/auth.js).
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- ---------- Manual plan upgrade requests ----------
-- No payment gateway yet: a free org pays off-platform (QRIS/bank
-- transfer/e-wallet, see client/src/data/paymentConfig.js) and clicks
-- "Saya Sudah Bayar" on /dashboard/upgrade, which inserts a pending row
-- here. The platform operator (PLATFORM_OWNER_ORG_ID) sees pending
-- requests via `node set-org-plan.js` and upgrades the org with the same
-- script, which also resolves the matching request.
CREATE TABLE IF NOT EXISTS upgrade_requests (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending', -- pending | approved | dismissed
  created_at  TEXT NOT NULL,
  resolved_at TEXT
);

-- ---------- Maggot cultivator community directory (shared, cross-tenant) ----------
-- Public landing page shows name/address/kabupaten/provinsi + the province
-- distribution map only; phone is only ever returned by the authenticated
-- admin endpoints (see server/routes/communities.js vs communityPublic.js).
CREATE TABLE IF NOT EXISTS communities (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT,
  address    TEXT,
  kabupaten  TEXT,
  provinsi   TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
