import { Router } from "express";
import { db, nowISO, localISODate } from "../db.js";
import { requirePermission, requireOperatorOrPermission } from "../middleware/auth.js";

const router = Router();

const toBiopond = (b) => ({
  id: b.id,
  number: b.number,
  status: b.status,
  babyMaggotQty: b.baby_maggot_qty,
  dateIn: b.date_in,
  feedInKg: b.feed_in_kg,
  feedSource: b.feed_source,
  harvestDate: b.harvest_date,
  createdBy: b.created_by,
  createdAt: b.created_at,
  updatedAt: b.updated_at,
});

function getAllRacks() {
  const racks = db.prepare("SELECT * FROM racks ORDER BY rowid").all();
  const bioponds = db.prepare("SELECT * FROM bioponds ORDER BY number").all();
  return racks.map((r) => ({
    id: r.id,
    name: r.name,
    bioponds: bioponds.filter((b) => b.rack_id === r.id).map(toBiopond),
  }));
}

router.get("/", (req, res) => {
  res.json(getAllRacks());
});

router.post("/", requirePermission("Production", "create"), (req, res) => {
  const { name, count } = req.body || {};
  if (!name || !count || Number(count) < 1) return res.status(400).json({ error: "Rack name and a positive biopond count are required." });

  const id = `RAK-${Date.now()}`;
  const ts = nowISO();
  db.prepare("INSERT INTO racks (id, name, created_at, updated_at) VALUES (?,?,?,?)").run(id, name, ts, ts);

  const insertBiopond = db.prepare(
    "INSERT INTO bioponds (id, rack_id, number, status, created_at, updated_at) VALUES (?,?,?,'Available',?,?)"
  );
  for (let i = 1; i <= Number(count); i++) {
    insertBiopond.run(`${id}-${i}`, id, i, ts, ts);
  }

  res.status(201).json(getAllRacks().find((r) => r.id === id));
});

router.patch("/:rackId", requirePermission("Production", "edit"), (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required." });
  const result = db.prepare("UPDATE racks SET name = ?, updated_at = ? WHERE id = ?").run(name, nowISO(), req.params.rackId);
  if (result.changes === 0) return res.status(404).json({ error: "Rack not found." });
  res.json({ ok: true });
});

router.delete("/:rackId", requirePermission("Production", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM racks WHERE id = ?").run(req.params.rackId);
  if (result.changes === 0) return res.status(404).json({ error: "Rack not found." });
  res.status(204).end();
});

router.post("/:rackId/bioponds", requirePermission("Production", "create"), (req, res) => {
  const { rackId } = req.params;
  const rack = db.prepare("SELECT * FROM racks WHERE id = ?").get(rackId);
  if (!rack) return res.status(404).json({ error: "Rack not found." });

  const { max } = db.prepare("SELECT MAX(number) AS max FROM bioponds WHERE rack_id = ?").get(rackId);
  const nextNumber = (max || 0) + 1;
  const ts = nowISO();
  const id = `${rackId}-${nextNumber}`;
  db.prepare("INSERT INTO bioponds (id, rack_id, number, status, created_at, updated_at) VALUES (?,?,?,'Available',?,?)").run(id, rackId, nextNumber, ts, ts);

  res.status(201).json(toBiopond(db.prepare("SELECT * FROM bioponds WHERE id = ?").get(id)));
});

router.delete("/bioponds/:biopondId", requirePermission("Production", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM bioponds WHERE id = ?").run(req.params.biopondId);
  if (result.changes === 0) return res.status(404).json({ error: "Biopond not found." });
  res.status(204).end();
});

router.post("/bioponds/:biopondId/start-production", requireOperatorOrPermission("Production", "create"), (req, res) => {
  const { babyMaggotQty, dateIn, feedInKg, feedSource, harvestDate, createdBy } = req.body || {};
  const biopond = db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId);
  if (!biopond) return res.status(404).json({ error: "Biopond not found." });

  const ts = nowISO();
  db.prepare(
    `UPDATE bioponds SET status='Occupied', baby_maggot_qty=?, date_in=?, feed_in_kg=?, feed_source=?, harvest_date=?,
     created_by=COALESCE(?, created_by), created_at=CASE WHEN status='Occupied' THEN created_at ELSE ? END, updated_at=?
     WHERE id=?`
  ).run(Number(babyMaggotQty), dateIn, Number(feedInKg), feedSource, harvestDate, createdBy, ts, ts, req.params.biopondId);

  res.json(toBiopond(db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId)));
});

router.post("/bioponds/:biopondId/release", requireOperatorOrPermission("Production", "edit"), (req, res) => {
  const biopond = db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId);
  if (!biopond) return res.status(404).json({ error: "Biopond not found." });

  db.prepare(
    "UPDATE bioponds SET status='Available', baby_maggot_qty=NULL, date_in=NULL, feed_in_kg=NULL, feed_source=NULL, harvest_date=NULL, updated_at=? WHERE id=?"
  ).run(nowISO(), req.params.biopondId);

  res.json(toBiopond(db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId)));
});

export default router;
