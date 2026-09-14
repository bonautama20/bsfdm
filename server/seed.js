// Seeds demo data — imported directly from the frontend's dummy data module
// (pure data, no React) so the two never drift apart. This is the one
// deliberate exception to the client/server separation: seed.js reaches into
// client/src purely for this static data file, not for any runtime code.
//
// Split across the control/tenant database boundary (see the multi-tenant
// plan): `seedControlBase` and `seedDemoOrgAndUsers` seed the shared control
// database (server/db.js); `seedTenantDemoData` seeds one tenant's own
// database (server/tenantDb.js) — called only for the fixed demo
// organization (DEMO_ORG_ID), never for a real signup's brand-new org, which
// starts with an empty tenant database instead.
import bcrypt from "bcryptjs";
import {
  biopondRacks, hotels, wasteHistoryByHotel, vendors, employees, attendanceToday,
  roles, rolePermissions, users, notificationTypes, maggotBatches, eggBatches,
  breederCages, kasgotBatches, salesTransactions, calendarEvents, communities,
} from "../client/src/data/dummyData.js";

export const DEMO_ORG_ID = "ORG-DEMO";

// Roles/permissions (shared global template — see the plan's scope cut on
// per-org customization) and the Community directory (shared/cross-tenant)
// — everything here has no org_id and only ever needs seeding once, on a
// brand-new control database.
export function seedControlBase(db) {
  const insertRole = db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
  roles.forEach((r) => insertRole.run(r.id, r.name, r.description));

  const insertPerm = db.prepare(
    "INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export, can_approve) VALUES (?,?,?,?,?,?,?,?)"
  );
  Object.entries(rolePermissions).forEach(([roleId, modules]) => {
    Object.entries(modules).forEach(([mod, perms]) => {
      insertPerm.run(roleId, mod, perms.view ? 1 : 0, perms.create ? 1 : 0, perms.edit ? 1 : 0, perms.delete ? 1 : 0, perms.export ? 1 : 0, perms.approve ? 1 : 0);
    });
  });

  const insertCommunity = db.prepare(
    "INSERT INTO communities (id,name,phone,address,kabupaten,provinsi,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)"
  );
  const communityTs = new Date().toISOString();
  communities.forEach((c, i) => {
    insertCommunity.run(`KOM-${String(i + 1).padStart(3, "0")}`, c.name, c.phone, c.address, c.kabupaten, c.provinsi, communityTs, communityTs);
  });
}

// The one demo organization (plan: paid, so every module is visible) plus
// its demo users — every seeded user gets a demo password (hashed at rest,
// same plaintext documented in the README) so QA can log in and test every
// role. Real signups (Phase 2) create their own organization + first user
// instead of ever touching this.
export function seedDemoOrgAndUsers(db) {
  db.prepare("INSERT INTO organizations (id, name, slug, plan, status, created_at) VALUES (?,?,?,?,?,?)")
    .run(DEMO_ORG_ID, "BSFDM Demo", "bsfdm-demo", "paid", "active", new Date().toISOString());

  const insertUser = db.prepare(
    "INSERT INTO users (id, org_id, name, email, password, role_id, status, last_login, created_date) VALUES (?,?,?,?,?,?,?,?,?)"
  );
  // `admin@bsfdm.com` is added explicitly as a real row (it used to be a
  // synthetic fallback identity in the old in-memory AuthContext).
  insertUser.run("USR-00", DEMO_ORG_ID, "Farm Manager", "admin@bsfdm.com", bcrypt.hashSync("bsfdm123", 10), "role-super-admin", "Active", null, "2018-08-01");
  users.forEach((u) => {
    const password = u.email === "andi@bsfdm.com" ? "operator123" : "bsfdm123";
    insertUser.run(u.id, DEMO_ORG_ID, u.name, u.email, bcrypt.hashSync(password, 10), u.roleId, u.status, u.lastLogin || null, u.createdDate);
  });
}

// All of one organization's own operational data — called against a tenant
// database. Only ever invoked for DEMO_ORG_ID; every other (real) org's
// tenant database is created schema-only, empty, ready for their own data.
export function seedTenantDemoData(db) {
  const insertRack = db.prepare("INSERT INTO racks (id, name, created_at, updated_at) VALUES (?,?,?,?)");
  const insertBiopond = db.prepare(
    "INSERT INTO bioponds (id, rack_id, number, status, baby_maggot_qty, date_in, feed_in_kg, feed_source, harvest_date, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
  );
  biopondRacks.forEach((rack) => {
    const now = new Date().toISOString();
    insertRack.run(rack.id, rack.name, now, now);
    rack.bioponds.forEach((b) => {
      insertBiopond.run(b.id, rack.id, b.number, b.status, b.babyMaggotQty, b.dateIn, b.feedInKg, b.feedSource, b.harvestDate, b.createdBy, b.createdAt, b.updatedAt);
    });
  });

  const insertHotel = db.prepare(
    "INSERT INTO hotels (id,name,address,phone,email,website,hotel_pic_name,hotel_pic_position,hotel_pic_phone,contract_number,contract_start,contract_expiry,status,monthly_waste_kg,avg_daily_waste_kg,last_collection) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
  );
  const insertWaste = db.prepare(
    "INSERT INTO waste_collections (hotel_id,date,quantity_kg,category,vehicle,driver,operator,notes) VALUES (?,?,?,?,?,?,?,?)"
  );
  hotels.forEach((h) => {
    insertHotel.run(
      h.id, h.name, h.address, h.phone, h.email, h.website,
      h.hotelPIC.name, h.hotelPIC.position, h.hotelPIC.phone,
      h.contractNumber, h.contractStart, h.contractExpiry, h.status, h.monthlyWasteKg, h.avgDailyWasteKg, h.lastCollection
    );
    wasteHistoryByHotel(h.id).forEach((w) => {
      insertWaste.run(h.id, w.date, w.quantityKg, w.category, w.vehicle, w.driver, w.operator, w.notes || null);
    });
  });

  // Vendors are the single source of truth for their PIC's identity — hotels
  // display it live via the vendor_hotels join (see server/routes/hotels.js)
  // instead of storing their own copy of the vendor's PIC name/position/phone.
  const insertVendor = db.prepare("INSERT INTO vendors (id, name, pic, pic_position, location, phone1, phone2) VALUES (?,?,?,?,?,?,?)");
  const insertVendorHotel = db.prepare("INSERT INTO vendor_hotels (vendor_id, hotel_id) VALUES (?,?)");
  vendors.forEach((v) => {
    insertVendor.run(v.id, v.name, v.pic, v.picPosition, v.location, v.phone1, v.phone2);
    v.hotelIds.forEach((hid) => insertVendorHotel.run(v.id, hid));
  });

  const insertEmp = db.prepare("INSERT INTO employees (id,name,position,department,phone,email,status,join_date) VALUES (?,?,?,?,?,?,?,?)");
  employees.forEach((e) => insertEmp.run(e.id, e.name, e.position, e.department, e.phone, e.email, e.status, e.joinDate));

  const insertAtt = db.prepare("INSERT INTO attendance (employee_id,date,clock_in,clock_out,status,hours) VALUES (?,?,?,?,?,?)");
  attendanceToday.forEach((a) => {
    insertAtt.run(a.employeeId, a.date, a.clockIn === "-" ? null : a.clockIn, a.clockOut === "-" ? null : a.clockOut, a.status, a.hours);
  });

  const insertMaggotBatch = db.prepare(
    "INSERT INTO maggot_batches (id,biopond_id,hatch_date,age_days,initial_qty,feed_kg,est_biomass_kg,est_harvest_kg,actual_harvest_kg,mortality,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)"
  );
  maggotBatches.forEach((m) => insertMaggotBatch.run(m.id, m.biopondId, m.hatchDate, m.ageDays, m.initialQty, m.feedKg, m.estBiomassKg, m.estHarvestKg, m.actualHarvestKg, m.mortality, m.status));

  const insertEggBatch = db.prepare(
    "INSERT INTO egg_batches (id,collection_date,egg_weight_g,source_cage,est_hatch_date,actual_hatch_date,hatch_rate,status) VALUES (?,?,?,?,?,?,?,?)"
  );
  eggBatches.forEach((e) => insertEggBatch.run(e.id, e.collectionDate, e.eggWeightG, e.sourceCage, e.estHatchDate, e.actualHatchDate, e.hatchRate, e.status));

  const insertCage = db.prepare(
    "INSERT INTO breeder_cages (id,pupae_entry_date,pupae_qty,adult_emergence,egg_production_g,cycle,status,mortality) VALUES (?,?,?,?,?,?,?,?)"
  );
  breederCages.forEach((c) => insertCage.run(c.id, c.pupaeEntryDate, c.pupaeQty, c.adultEmergence, c.eggProductionG, c.cycle, c.status, c.mortality));

  const insertKasgotBatch = db.prepare(
    "INSERT INTO kasgot_batches (id,source_biopond,processing_date,raw_weight_kg,dried_weight_kg,packaging,stock,sales_status) VALUES (?,?,?,?,?,?,?,?)"
  );
  kasgotBatches.forEach((k) => insertKasgotBatch.run(k.id, k.sourceBiopond, k.processingDate, k.rawWeightKg, k.driedWeightKg, k.packaging, k.stock, k.salesStatus));

  const insertSale = db.prepare(
    "INSERT INTO sales_transactions (id,date,customer,product,qty,unit,price,total,payment_status) VALUES (?,?,?,?,?,?,?,?,?)"
  );
  salesTransactions.forEach((t) => insertSale.run(t.id, t.date, t.customer, t.product, t.qty, t.unit, t.price, t.total, t.paymentStatus));

  const insertEvent = db.prepare("INSERT INTO calendar_events (id, event_type, title, event_date, data) VALUES (?,?,?,?,?)");
  calendarEvents.forEach((e) => {
    const { id, type, title, date, ...rest } = e;
    insertEvent.run(id, type, title, date, JSON.stringify(rest));
  });

  const insertNotif = db.prepare("INSERT INTO notification_settings (id, label, in_app, email, whatsapp, timing) VALUES (?,?,?,?,?,?)");
  notificationTypes.forEach((n) => insertNotif.run(n.id, n.label, n.inApp ? 1 : 0, n.email ? 1 : 0, n.whatsapp ? 1 : 0, n.timing));
}

// Backfills any role or (role, module) permission row that doesn't exist yet
// on an already-seeded control database — e.g. after a new role (Owner) or a
// new module (Vendor, Employee, Community) is added in dummyData.js. Safe to
// call on every boot: existing rows are left untouched, only gaps are filled in.
export function migrateRolePermissions(db) {
  const existingRoles = new Set(db.prepare("SELECT id FROM roles").all().map((r) => r.id));
  const insertRole = db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
  roles.forEach((r) => {
    if (existingRoles.has(r.id)) return;
    insertRole.run(r.id, r.name, r.description);
  });

  const existingPerms = new Set(
    db.prepare("SELECT role_id || ':' || module AS k FROM role_permissions").all().map((r) => r.k)
  );
  const insertPerm = db.prepare(
    "INSERT INTO role_permissions (role_id, module, can_view, can_create, can_edit, can_delete, can_export, can_approve) VALUES (?,?,?,?,?,?,?,?)"
  );
  Object.entries(rolePermissions).forEach(([roleId, modules]) => {
    Object.entries(modules).forEach(([mod, perms]) => {
      if (existingPerms.has(`${roleId}:${mod}`)) return;
      insertPerm.run(roleId, mod, perms.view ? 1 : 0, perms.create ? 1 : 0, perms.edit ? 1 : 0, perms.delete ? 1 : 0, perms.export ? 1 : 0, perms.approve ? 1 : 0);
    });
  });
}
