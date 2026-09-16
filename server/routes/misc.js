import { Router } from "express";
import { nextId, nowISO } from "../db.js";
import { requirePermission, requireOperatorOrPermission } from "../middleware/auth.js";
import { requirePlan, getOrgPlan, FREE_CAGE_LIMIT } from "../middleware/plan.js";

const router = Router();

// This router mixes free-tier Production reporting (maggot/egg batches,
// breeder cages, kasgot batches) with paid-only modules (sales, calendar,
// notifications, app settings) — so requirePlan is applied per-route below
// instead of once for the whole router (contrast with hotels.js/vendors.js/
// employees.js, which are single-module and gate at the top).

// ---------- Sales transactions ----------
const toSale = (t) => ({
  id: t.id, date: t.date, customer: t.customer, product: t.product,
  qty: t.qty, unit: t.unit, price: t.price, total: t.total, paymentStatus: t.payment_status,
});

router.get("/sales-transactions", requirePlan("Report"), (req, res) => {
  res.json(req.db.prepare("SELECT * FROM sales_transactions ORDER BY date DESC").all().map(toSale));
});

router.post("/sales-transactions", requirePlan("Report"), requirePermission("Report", "create"), (req, res) => {
  const { date, customer, product, qty, unit, price, paymentStatus } = req.body || {};
  if (!date || !customer || !product || !qty || !price) {
    return res.status(400).json({ error: "date, customer, product, qty, and price are required." });
  }
  const id = nextId(req.db, "sales_transactions", "TXN", 4);
  const total = Number(qty) * Number(price);
  req.db.prepare(
    "INSERT INTO sales_transactions (id,date,customer,product,qty,unit,price,total,payment_status) VALUES (?,?,?,?,?,?,?,?,?)"
  ).run(id, date, customer, product, Number(qty), unit || "kg", Number(price), total, paymentStatus || "Pending");

  res.status(201).json(toSale(req.db.prepare("SELECT * FROM sales_transactions WHERE id = ?").get(id)));
});

// ---------- Calendar events ----------
const toEvent = (e) => ({
  id: e.id, type: e.event_type, title: e.title, date: e.event_date,
  ...(e.data ? JSON.parse(e.data) : {}),
});

router.get("/calendar-events", requirePlan("Calendar"), (req, res) => {
  res.json(req.db.prepare("SELECT * FROM calendar_events ORDER BY event_date").all().map(toEvent));
});

router.post("/calendar-events", requirePlan("Calendar"), requirePermission("Calendar", "create"), (req, res) => {
  const { type, title, date, ...rest } = req.body || {};
  if (!type || !title || !date) return res.status(400).json({ error: "type, title, and date are required." });

  const id = `EVT-${Date.now()}`;
  req.db.prepare("INSERT INTO calendar_events (id, event_type, title, event_date, data) VALUES (?,?,?,?,?)")
    .run(id, type, title, date, JSON.stringify(rest));

  res.status(201).json(toEvent(req.db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(id)));
});

router.patch("/calendar-events/:id", requirePlan("Calendar"), requirePermission("Calendar", "edit"), (req, res) => {
  const existing = req.db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Event not found." });

  const { type, title, date, ...rest } = req.body || {};
  const mergedData = { ...(existing.data ? JSON.parse(existing.data) : {}), ...rest };
  req.db.prepare("UPDATE calendar_events SET event_type=?, title=?, event_date=?, data=? WHERE id=?").run(
    type ?? existing.event_type, title ?? existing.title, date ?? existing.event_date,
    JSON.stringify(mergedData), req.params.id
  );
  res.json(toEvent(req.db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(req.params.id)));
});

router.delete("/calendar-events/:id", requirePlan("Calendar"), requirePermission("Calendar", "delete"), (req, res) => {
  const result = req.db.prepare("DELETE FROM calendar_events WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Event not found." });
  res.status(204).end();
});

// ---------- Notification settings ----------
const toNotifSetting = (n) => ({
  id: n.id, label: n.label, inApp: !!n.in_app, email: !!n.email, whatsapp: !!n.whatsapp, timing: n.timing,
});

router.get("/notification-settings", requirePlan("Notification"), (req, res) => {
  res.json(req.db.prepare("SELECT * FROM notification_settings ORDER BY rowid").all().map(toNotifSetting));
});

router.patch("/notification-settings/:id", requirePlan("Notification"), requirePermission("Notification", "edit"), (req, res) => {
  const existing = req.db.prepare("SELECT * FROM notification_settings WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Notification setting not found." });

  const b = req.body || {};
  req.db.prepare("UPDATE notification_settings SET in_app=?, email=?, whatsapp=?, timing=? WHERE id=?").run(
    b.inApp !== undefined ? (b.inApp ? 1 : 0) : existing.in_app,
    b.email !== undefined ? (b.email ? 1 : 0) : existing.email,
    b.whatsapp !== undefined ? (b.whatsapp ? 1 : 0) : existing.whatsapp,
    b.timing ?? existing.timing,
    req.params.id
  );
  res.json(toNotifSetting(req.db.prepare("SELECT * FROM notification_settings WHERE id = ?").get(req.params.id)));
});

// ---------- Misc app settings (key/value, e.g. quiet hours) ----------
router.get("/app-settings/:key", requirePlan("Setting"), (req, res) => {
  const row = req.db.prepare("SELECT * FROM app_settings WHERE key = ?").get(req.params.key);
  res.json(row ? JSON.parse(row.value) : null);
});

router.put("/app-settings/:key", requirePlan("Setting"), requirePermission("Setting", "edit"), (req, res) => {
  const value = JSON.stringify(req.body || {});
  req.db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(req.params.key, value);
  res.json(req.body || {});
});

// ---------- Legacy production reporting tables (read-only) ----------
router.get("/maggot-batches", (req, res) => {
  res.json(req.db.prepare("SELECT * FROM maggot_batches").all().map((m) => ({
    id: m.id, biopondId: m.biopond_id, hatchDate: m.hatch_date, ageDays: m.age_days,
    initialQty: m.initial_qty, feedKg: m.feed_kg, estBiomassKg: m.est_biomass_kg,
    estHarvestKg: m.est_harvest_kg, actualHarvestKg: m.actual_harvest_kg, mortality: m.mortality, status: m.status,
  })));
});

const toEggBatch = (e) => ({
  id: e.id, collectionDate: e.collection_date, eggWeightG: e.egg_weight_g, sourceCage: e.source_cage,
  estHatchDate: e.est_hatch_date, actualHatchDate: e.actual_hatch_date, hatchRate: e.hatch_rate, status: e.status,
  createdBy: e.created_by,
});

router.get("/egg-batches", (req, res) => {
  res.json(req.db.prepare("SELECT * FROM egg_batches ORDER BY rowid DESC").all().map(toEggBatch));
});

// Written by operators (EggHarvestForm) as much as by admins (Production.jsx's
// "Add Egg Production" modal) — same dual-path reasoning as productionLogs.js.
router.post("/egg-batches", requireOperatorOrPermission("Production", "create"), (req, res) => {
  const { collectionDate, eggWeightG, sourceCage, estHatchDate, createdBy } = req.body || {};
  if (!collectionDate || !eggWeightG || !sourceCage || !estHatchDate) {
    return res.status(400).json({ error: "collectionDate, eggWeightG, sourceCage, and estHatchDate are required." });
  }
  const id = nextId(req.db, "egg_batches", "EB");
  req.db.prepare(
    "INSERT INTO egg_batches (id,collection_date,egg_weight_g,source_cage,est_hatch_date,actual_hatch_date,hatch_rate,status,created_by) VALUES (?,?,?,?,?,NULL,NULL,'Incubating',?)"
  ).run(id, collectionDate, Number(eggWeightG), sourceCage, estHatchDate, createdBy || null);

  res.status(201).json(toEggBatch(req.db.prepare("SELECT * FROM egg_batches WHERE id = ?").get(id)));
});

router.patch("/egg-batches/:id", requirePermission("Production", "edit"), (req, res) => {
  const existing = req.db.prepare("SELECT * FROM egg_batches WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Egg batch not found." });

  const b = req.body || {};
  req.db.prepare(
    "UPDATE egg_batches SET collection_date=?, egg_weight_g=?, source_cage=?, est_hatch_date=?, status=? WHERE id=?"
  ).run(
    b.collectionDate ?? existing.collection_date,
    b.eggWeightG !== undefined ? Number(b.eggWeightG) : existing.egg_weight_g,
    b.sourceCage ?? existing.source_cage,
    b.estHatchDate ?? existing.est_hatch_date,
    b.status ?? existing.status,
    req.params.id
  );
  res.json(toEggBatch(req.db.prepare("SELECT * FROM egg_batches WHERE id = ?").get(req.params.id)));
});

router.delete("/egg-batches/:id", requirePermission("Production", "delete"), (req, res) => {
  const result = req.db.prepare("DELETE FROM egg_batches WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Egg batch not found." });
  res.status(204).end();
});

router.get("/breeder-cages", (req, res) => {
  res.json(req.db.prepare("SELECT * FROM breeder_cages ORDER BY rowid").all().map((c) => ({
    id: c.id, pupaeEntryDate: c.pupae_entry_date, pupaeQty: c.pupae_qty, adultEmergence: c.adult_emergence,
    eggProductionG: c.egg_production_g, cycle: c.cycle, status: c.status, mortality: c.mortality,
  })));
});

// Bulk-creates N source/breeder cages up front (the "Source Cage" button on
// the BSF Eggs tab, and the cage list on Breeder/Parent Stock) — mirrors
// racks.js's "add a rack with N bioponds" pattern. A free org is capped at
// FREE_CAGE_LIMIT total cages; the frontend reads the real limit back from
// err.limit for the upgrade prompt, same as the biopond quota.
router.post("/breeder-cages", requirePermission("Production", "create"), (req, res) => {
  const count = Number(req.body?.count);
  if (!count || count < 1) return res.status(400).json({ error: "count must be a positive number." });

  if (getOrgPlan(req.auth.orgId) === "free") {
    const { count: existing } = req.db.prepare("SELECT COUNT(*) AS count FROM breeder_cages").get();
    if (existing + count > FREE_CAGE_LIMIT) {
      return res.status(402).json({
        error: `Free plan is limited to ${FREE_CAGE_LIMIT} source cage total. Upgrade to add more.`,
        upgradeRequired: true,
        limitReached: true,
        limit: FREE_CAGE_LIMIT,
      });
    }
  }

  const created = [];
  for (let i = 0; i < count; i++) {
    const id = nextId(req.db, "breeder_cages", "BC");
    req.db.prepare("INSERT INTO breeder_cages (id, status) VALUES (?, 'Active')").run(id);
    created.push({ id, pupaeEntryDate: null, pupaeQty: null, adultEmergence: null, eggProductionG: null, cycle: null, status: "Active", mortality: null });
  }
  res.status(201).json(created);
});

// ---------- Cage entries (pupa/prepupa logged into a specific source cage) ----------
const toCageEntry = (e) => ({
  id: e.id, cageId: e.cage_id, date: e.date, quantityKg: e.quantity_kg,
  createdBy: e.created_by, createdAt: e.created_at,
});

router.get("/cage-entries", (req, res) => {
  res.json(req.db.prepare("SELECT * FROM cage_entries ORDER BY created_at DESC").all().map(toCageEntry));
});

router.post("/cage-entries", requirePermission("Production", "create"), (req, res) => {
  const { cageId, date, quantityKg } = req.body || {};
  if (!cageId || !date || !quantityKg) {
    return res.status(400).json({ error: "cageId, date, and quantityKg are required." });
  }
  const cage = req.db.prepare("SELECT id FROM breeder_cages WHERE id = ?").get(cageId);
  if (!cage) return res.status(404).json({ error: "Source cage not found." });

  const id = nextId(req.db, "cage_entries", "CE", 4);
  req.db.prepare(
    "INSERT INTO cage_entries (id, cage_id, date, quantity_kg, created_by, created_at) VALUES (?,?,?,?,?,?)"
  ).run(id, cageId, date, Number(quantityKg), req.body.createdBy || null, nowISO());

  res.status(201).json(toCageEntry(req.db.prepare("SELECT * FROM cage_entries WHERE id = ?").get(id)));
});

router.patch("/cage-entries/:id", requirePermission("Production", "edit"), (req, res) => {
  const existing = req.db.prepare("SELECT * FROM cage_entries WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Cage entry not found." });

  const { date, quantityKg } = req.body || {};
  req.db.prepare("UPDATE cage_entries SET date = ?, quantity_kg = ? WHERE id = ?").run(
    date ?? existing.date,
    quantityKg !== undefined ? Number(quantityKg) : existing.quantity_kg,
    req.params.id
  );
  res.json(toCageEntry(req.db.prepare("SELECT * FROM cage_entries WHERE id = ?").get(req.params.id)));
});

router.delete("/cage-entries/:id", requirePermission("Production", "delete"), (req, res) => {
  const result = req.db.prepare("DELETE FROM cage_entries WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Cage entry not found." });
  res.status(204).end();
});

const toKasgotBatch = (k) => ({
  id: k.id, sourceBiopond: k.source_biopond, processingDate: k.processing_date, rawWeightKg: k.raw_weight_kg,
  driedWeightKg: k.dried_weight_kg, packaging: k.packaging, stock: k.stock, salesStatus: k.sales_status,
});

router.get("/kasgot-batches", (req, res) => {
  res.json(req.db.prepare("SELECT * FROM kasgot_batches ORDER BY rowid DESC").all().map(toKasgotBatch));
});

router.post("/kasgot-batches", requirePermission("Production", "create"), (req, res) => {
  const { sourceBiopond, processingDate, rawWeightKg, driedWeightKg, packaging } = req.body || {};
  if (!sourceBiopond || !processingDate || !rawWeightKg || !driedWeightKg) {
    return res.status(400).json({ error: "sourceBiopond, processingDate, rawWeightKg, and driedWeightKg are required." });
  }
  const id = nextId(req.db, "kasgot_batches", "KB");
  req.db.prepare(
    "INSERT INTO kasgot_batches (id,source_biopond,processing_date,raw_weight_kg,dried_weight_kg,packaging,stock,sales_status) VALUES (?,?,?,?,?,?,?,'In Stock')"
  ).run(id, sourceBiopond, processingDate, Number(rawWeightKg), Number(driedWeightKg), packaging || "25kg Sack", Number(driedWeightKg));

  res.status(201).json(toKasgotBatch(req.db.prepare("SELECT * FROM kasgot_batches WHERE id = ?").get(id)));
});

export default router;
