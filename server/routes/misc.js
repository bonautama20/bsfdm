import { Router } from "express";
import { db, nowISO, nextId } from "../db.js";
import { requirePermission, requireOperatorOrPermission } from "../middleware/auth.js";

const router = Router();

// ---------- Sales transactions ----------
const toSale = (t) => ({
  id: t.id, date: t.date, customer: t.customer, product: t.product,
  qty: t.qty, unit: t.unit, price: t.price, total: t.total, paymentStatus: t.payment_status,
});

router.get("/sales-transactions", (req, res) => {
  res.json(db.prepare("SELECT * FROM sales_transactions ORDER BY date DESC").all().map(toSale));
});

router.post("/sales-transactions", requirePermission("Report", "create"), (req, res) => {
  const { date, customer, product, qty, unit, price, paymentStatus } = req.body || {};
  if (!date || !customer || !product || !qty || !price) {
    return res.status(400).json({ error: "date, customer, product, qty, and price are required." });
  }
  const id = nextId("sales_transactions", "TXN", 4);
  const total = Number(qty) * Number(price);
  db.prepare(
    "INSERT INTO sales_transactions (id,date,customer,product,qty,unit,price,total,payment_status) VALUES (?,?,?,?,?,?,?,?,?)"
  ).run(id, date, customer, product, Number(qty), unit || "kg", Number(price), total, paymentStatus || "Pending");

  res.status(201).json(toSale(db.prepare("SELECT * FROM sales_transactions WHERE id = ?").get(id)));
});

// ---------- Calendar events ----------
const toEvent = (e) => ({
  id: e.id, type: e.event_type, title: e.title, date: e.event_date,
  ...(e.data ? JSON.parse(e.data) : {}),
});

router.get("/calendar-events", (req, res) => {
  res.json(db.prepare("SELECT * FROM calendar_events ORDER BY event_date").all().map(toEvent));
});

router.post("/calendar-events", requirePermission("Calendar", "create"), (req, res) => {
  const { type, title, date, ...rest } = req.body || {};
  if (!type || !title || !date) return res.status(400).json({ error: "type, title, and date are required." });

  const id = `EVT-${Date.now()}`;
  db.prepare("INSERT INTO calendar_events (id, event_type, title, event_date, data) VALUES (?,?,?,?,?)")
    .run(id, type, title, date, JSON.stringify(rest));

  res.status(201).json(toEvent(db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(id)));
});

router.patch("/calendar-events/:id", requirePermission("Calendar", "edit"), (req, res) => {
  const existing = db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Event not found." });

  const { type, title, date, ...rest } = req.body || {};
  const mergedData = { ...(existing.data ? JSON.parse(existing.data) : {}), ...rest };
  db.prepare("UPDATE calendar_events SET event_type=?, title=?, event_date=?, data=? WHERE id=?").run(
    type ?? existing.event_type, title ?? existing.title, date ?? existing.event_date,
    JSON.stringify(mergedData), req.params.id
  );
  res.json(toEvent(db.prepare("SELECT * FROM calendar_events WHERE id = ?").get(req.params.id)));
});

router.delete("/calendar-events/:id", requirePermission("Calendar", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM calendar_events WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Event not found." });
  res.status(204).end();
});

// ---------- Notification settings ----------
const toNotifSetting = (n) => ({
  id: n.id, label: n.label, inApp: !!n.in_app, email: !!n.email, whatsapp: !!n.whatsapp, timing: n.timing,
});

router.get("/notification-settings", (req, res) => {
  res.json(db.prepare("SELECT * FROM notification_settings ORDER BY rowid").all().map(toNotifSetting));
});

router.patch("/notification-settings/:id", requirePermission("Notification", "edit"), (req, res) => {
  const existing = db.prepare("SELECT * FROM notification_settings WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Notification setting not found." });

  const b = req.body || {};
  db.prepare("UPDATE notification_settings SET in_app=?, email=?, whatsapp=?, timing=? WHERE id=?").run(
    b.inApp !== undefined ? (b.inApp ? 1 : 0) : existing.in_app,
    b.email !== undefined ? (b.email ? 1 : 0) : existing.email,
    b.whatsapp !== undefined ? (b.whatsapp ? 1 : 0) : existing.whatsapp,
    b.timing ?? existing.timing,
    req.params.id
  );
  res.json(toNotifSetting(db.prepare("SELECT * FROM notification_settings WHERE id = ?").get(req.params.id)));
});

// ---------- Misc app settings (key/value, e.g. quiet hours) ----------
router.get("/app-settings/:key", (req, res) => {
  const row = db.prepare("SELECT * FROM app_settings WHERE key = ?").get(req.params.key);
  res.json(row ? JSON.parse(row.value) : null);
});

router.put("/app-settings/:key", requirePermission("Setting", "edit"), (req, res) => {
  const value = JSON.stringify(req.body || {});
  db.prepare("INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(req.params.key, value);
  res.json(req.body || {});
});

// ---------- Legacy production reporting tables (read-only) ----------
router.get("/maggot-batches", (req, res) => {
  res.json(db.prepare("SELECT * FROM maggot_batches").all().map((m) => ({
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
  res.json(db.prepare("SELECT * FROM egg_batches ORDER BY rowid DESC").all().map(toEggBatch));
});

// Written by operators (EggHarvestForm) as much as by admins (Production.jsx's
// "Add Egg Production" modal) — same dual-path reasoning as productionLogs.js.
router.post("/egg-batches", requireOperatorOrPermission("Production", "create"), (req, res) => {
  const { collectionDate, eggWeightG, sourceCage, estHatchDate, createdBy } = req.body || {};
  if (!collectionDate || !eggWeightG || !sourceCage || !estHatchDate) {
    return res.status(400).json({ error: "collectionDate, eggWeightG, sourceCage, and estHatchDate are required." });
  }
  const id = nextId("egg_batches", "EB");
  db.prepare(
    "INSERT INTO egg_batches (id,collection_date,egg_weight_g,source_cage,est_hatch_date,actual_hatch_date,hatch_rate,status,created_by) VALUES (?,?,?,?,?,NULL,NULL,'Incubating',?)"
  ).run(id, collectionDate, Number(eggWeightG), sourceCage, estHatchDate, createdBy || null);

  res.status(201).json(toEggBatch(db.prepare("SELECT * FROM egg_batches WHERE id = ?").get(id)));
});

router.patch("/egg-batches/:id", requirePermission("Production", "edit"), (req, res) => {
  const existing = db.prepare("SELECT * FROM egg_batches WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Egg batch not found." });

  const b = req.body || {};
  db.prepare(
    "UPDATE egg_batches SET collection_date=?, egg_weight_g=?, source_cage=?, est_hatch_date=?, status=? WHERE id=?"
  ).run(
    b.collectionDate ?? existing.collection_date,
    b.eggWeightG !== undefined ? Number(b.eggWeightG) : existing.egg_weight_g,
    b.sourceCage ?? existing.source_cage,
    b.estHatchDate ?? existing.est_hatch_date,
    b.status ?? existing.status,
    req.params.id
  );
  res.json(toEggBatch(db.prepare("SELECT * FROM egg_batches WHERE id = ?").get(req.params.id)));
});

router.delete("/egg-batches/:id", requirePermission("Production", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM egg_batches WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Egg batch not found." });
  res.status(204).end();
});

router.get("/breeder-cages", (req, res) => {
  res.json(db.prepare("SELECT * FROM breeder_cages ORDER BY rowid").all().map((c) => ({
    id: c.id, pupaeEntryDate: c.pupae_entry_date, pupaeQty: c.pupae_qty, adultEmergence: c.adult_emergence,
    eggProductionG: c.egg_production_g, cycle: c.cycle, status: c.status, mortality: c.mortality,
  })));
});

const toKasgotBatch = (k) => ({
  id: k.id, sourceBiopond: k.source_biopond, processingDate: k.processing_date, rawWeightKg: k.raw_weight_kg,
  driedWeightKg: k.dried_weight_kg, packaging: k.packaging, stock: k.stock, salesStatus: k.sales_status,
});

router.get("/kasgot-batches", (req, res) => {
  res.json(db.prepare("SELECT * FROM kasgot_batches ORDER BY rowid DESC").all().map(toKasgotBatch));
});

router.post("/kasgot-batches", requirePermission("Production", "create"), (req, res) => {
  const { sourceBiopond, processingDate, rawWeightKg, driedWeightKg, packaging } = req.body || {};
  if (!sourceBiopond || !processingDate || !rawWeightKg || !driedWeightKg) {
    return res.status(400).json({ error: "sourceBiopond, processingDate, rawWeightKg, and driedWeightKg are required." });
  }
  const id = nextId("kasgot_batches", "KB");
  db.prepare(
    "INSERT INTO kasgot_batches (id,source_biopond,processing_date,raw_weight_kg,dried_weight_kg,packaging,stock,sales_status) VALUES (?,?,?,?,?,?,?,'In Stock')"
  ).run(id, sourceBiopond, processingDate, Number(rawWeightKg), Number(driedWeightKg), packaging || "25kg Sack", Number(driedWeightKg));

  res.status(201).json(toKasgotBatch(db.prepare("SELECT * FROM kasgot_batches WHERE id = ?").get(id)));
});

export default router;
