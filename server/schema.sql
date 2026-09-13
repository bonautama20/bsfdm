-- BSFDM database schema — tailored to the BSF Data Management System
-- (Admin panel + Operator mobile module). SQLite via Node's built-in node:sqlite.

PRAGMA foreign_keys = ON;

-- ---------- Auth / RBAC ----------
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
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password      TEXT NOT NULL, -- bcrypt hash, never plaintext (see server/routes/auth.js)
  role_id       TEXT NOT NULL REFERENCES roles(id),
  status        TEXT NOT NULL DEFAULT 'Active',
  last_login    TEXT,
  created_date  TEXT NOT NULL
);

-- ---------- Biopond production (Admin board + Operator module — single source of truth) ----------
CREATE TABLE IF NOT EXISTS racks (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bioponds (
  id               TEXT PRIMARY KEY,
  rack_id          TEXT NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  number           INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'Available', -- Available | Occupied
  baby_maggot_qty  INTEGER,
  date_in          TEXT,
  feed_in_kg       REAL,
  feed_source      TEXT,
  harvest_date     TEXT,
  created_by       TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bioponds_rack ON bioponds(rack_id);

-- ---------- Clients / Vendors ----------
CREATE TABLE IF NOT EXISTS hotels (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  address               TEXT,
  phone                 TEXT,
  email                 TEXT,
  website               TEXT,
  hotel_pic_name        TEXT,
  hotel_pic_position    TEXT,
  hotel_pic_phone       TEXT,
  contract_number       TEXT,
  contract_start        TEXT,
  contract_expiry       TEXT,
  status                TEXT NOT NULL DEFAULT 'Active', -- Active | Contract Expiring | Inactive
  monthly_waste_kg      REAL DEFAULT 0,
  avg_daily_waste_kg    REAL DEFAULT 0,
  last_collection       TEXT
);

CREATE TABLE IF NOT EXISTS waste_collections (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id   TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  date       TEXT NOT NULL,
  quantity_kg REAL NOT NULL,
  category   TEXT,
  vehicle    TEXT,
  driver     TEXT,
  operator   TEXT,
  notes      TEXT
);
CREATE INDEX IF NOT EXISTS idx_waste_hotel ON waste_collections(hotel_id);

CREATE TABLE IF NOT EXISTS vendors (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  pic           TEXT,
  pic_position  TEXT,
  location      TEXT,
  phone1        TEXT,
  phone2        TEXT
);

CREATE TABLE IF NOT EXISTS vendor_hotels (
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  hotel_id  TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  PRIMARY KEY (vendor_id, hotel_id)
);

-- ---------- Employees / Attendance ----------
CREATE TABLE IF NOT EXISTS employees (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  position   TEXT,
  department TEXT,
  phone      TEXT,
  email      TEXT,
  status     TEXT NOT NULL DEFAULT 'Active',
  join_date  TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  clock_in    TEXT,
  clock_out   TEXT,
  status      TEXT NOT NULL, -- Present | Absent | Late | Leave | Sick | Holiday
  hours       REAL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);

-- ---------- Operator production logs ----------
CREATE TABLE IF NOT EXISTS egg_harvests (
  id             TEXT PRIMARY KEY,
  date           TEXT NOT NULL,
  quantity_gram  REAL NOT NULL,
  created_by     TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kasgot_records (
  id             TEXT PRIMARY KEY,
  date           TEXT NOT NULL,
  biopond_label  TEXT,
  quantity_kg    REAL NOT NULL,
  created_by     TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS maggot_harvests (
  id             TEXT PRIMARY KEY,
  date           TEXT NOT NULL,
  biopond_label  TEXT,
  quantity_kg    REAL NOT NULL,
  created_by     TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS breeder_records (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL, -- Prepupa | Pupa
  date       TEXT NOT NULL,
  quantity   REAL NOT NULL,
  unit       TEXT NOT NULL,
  created_by TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feed_records (
  id           TEXT PRIMARY KEY,
  date         TEXT NOT NULL,
  client_name  TEXT,
  quantity_kg  REAL NOT NULL,
  created_by   TEXT,
  created_at   TEXT NOT NULL
);

-- ---------- Admin production reporting (batches/cages) ----------
CREATE TABLE IF NOT EXISTS maggot_batches (
  id               TEXT PRIMARY KEY,
  biopond_id       TEXT,
  hatch_date       TEXT,
  age_days         INTEGER,
  initial_qty      INTEGER,
  feed_kg          REAL,
  est_biomass_kg   REAL,
  est_harvest_kg   REAL,
  actual_harvest_kg REAL,
  mortality        REAL,
  status           TEXT
);

CREATE TABLE IF NOT EXISTS egg_batches (
  id                TEXT PRIMARY KEY,
  collection_date   TEXT,
  egg_weight_g      REAL,
  source_cage       TEXT,
  est_hatch_date    TEXT,
  actual_hatch_date TEXT,
  hatch_rate        REAL,
  status            TEXT,
  created_by        TEXT
);

CREATE TABLE IF NOT EXISTS breeder_cages (
  id                TEXT PRIMARY KEY,
  pupae_entry_date  TEXT,
  pupae_qty         INTEGER,
  adult_emergence   INTEGER,
  egg_production_g  REAL,
  cycle             TEXT,
  status            TEXT,
  mortality         REAL
);

CREATE TABLE IF NOT EXISTS kasgot_batches (
  id                TEXT PRIMARY KEY,
  source_biopond    TEXT,
  processing_date   TEXT,
  raw_weight_kg     REAL,
  dried_weight_kg   REAL,
  packaging         TEXT,
  stock             REAL,
  sales_status      TEXT
);

-- ---------- Sales ----------
CREATE TABLE IF NOT EXISTS sales_transactions (
  id             TEXT PRIMARY KEY,
  date           TEXT NOT NULL,
  customer       TEXT NOT NULL,
  product        TEXT NOT NULL,
  qty            REAL NOT NULL,
  unit           TEXT NOT NULL,
  price          REAL NOT NULL,
  total          REAL NOT NULL,
  payment_status TEXT NOT NULL
);

-- ---------- Calendar ----------
CREATE TABLE IF NOT EXISTS calendar_events (
  id         TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  title      TEXT NOT NULL,
  event_date TEXT NOT NULL,
  data       TEXT -- JSON blob of type-specific fields (biopond, customer, notes, etc.)
);

-- ---------- Notifications ----------
CREATE TABLE IF NOT EXISTS notification_settings (
  id       TEXT PRIMARY KEY,
  label    TEXT NOT NULL,
  in_app   INTEGER NOT NULL DEFAULT 1,
  email    INTEGER NOT NULL DEFAULT 0,
  whatsapp INTEGER NOT NULL DEFAULT 0,
  timing   TEXT NOT NULL DEFAULT 'Same day'
);

-- ---------- Misc app-wide settings (key/value) ----------
CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL -- JSON blob
);

-- ---------- Maggot cultivator community directory ----------
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
