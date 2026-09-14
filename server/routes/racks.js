import { Router } from "express";
import { nowISO } from "../db.js";
import { requirePermission, requireOperatorOrPermission } from "../middleware/auth.js";
import { getOrgPlan, FREE_BIOPOND_LIMIT } from "../middleware/plan.js";

const router = Router();

// A free org can use Production, but not build it out without limit — caps
// total bioponds at FREE_BIOPOND_LIMIT (see the multi-tenant plan's Phase 3).
// `additional` is how many new bioponds this request would add (1 for the
// single-biopond route, N for creating a rack with N up front). Returns an
// error payload to send as a 402, or null if the request is within quota.
function checkBiopondQuota(req, additional) {
  if (getOrgPlan(req.auth.orgId) !== "free") return null;
  const { count } = req.db.prepare("SELECT COUNT(*) AS count FROM bioponds").get();
  if (count + additional <= FREE_BIOPOND_LIMIT) return null;
  return {
    error: `Free plan is limited to ${FREE_BIOPOND_LIMIT} bioponds total. Upgrade to add more.`,
    upgradeRequired: true,
    limitReached: true,
    limit: FREE_BIOPOND_LIMIT,
  };
}

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

function getAllRacks(db) {
  const racks = db.prepare("SELECT * FROM racks ORDER BY rowid").all();
  const bioponds = db.prepare("SELECT * FROM bioponds ORDER BY number").all();
  return racks.map((r) => ({
    id: r.id,
    name: r.name,
    bioponds: bioponds.filter((b) => b.rack_id === r.id).map(toBiopond),
  }));
}

router.get("/", (req, res) => {
  res.json(getAllRacks(req.db));
});

router.post("/", requirePermission("Production", "create"), (req, res) => {
  const { name, count } = req.body || {};
  if (!name || !count || Number(count) < 1) return res.status(400).json({ error: "Rack name and a positive biopond count are required." });

  // A real report of this: the UI's suggested next name isn't always unique
  // (it's derived from the rack count, not the names actually in use), so a
  // careless click could create a second rack with an identical name —
  // confusing since it looks like "duplicate data" rather than what it is,
  // two separate racks. There's no legitimate reason for two racks in the
  // same org to share a name, so this is a hard block, not just a UI nudge.
  const nameTrimmed = name.trim();
  const existing = req.db.prepare("SELECT id FROM racks WHERE lower(name) = lower(?)").get(nameTrimmed);
  if (existing) return res.status(409).json({ error: `A rack named "${nameTrimmed}" already exists. Add bioponds to it instead, or pick a different name.` });

  const quotaError = checkBiopondQuota(req, Number(count));
  if (quotaError) return res.status(402).json(quotaError);

  const id = `RAK-${Date.now()}`;
  const ts = nowISO();
  req.db.prepare("INSERT INTO racks (id, name, created_at, updated_at) VALUES (?,?,?,?)").run(id, nameTrimmed, ts, ts);

  const insertBiopond = req.db.prepare(
    "INSERT INTO bioponds (id, rack_id, number, status, created_at, updated_at) VALUES (?,?,?,'Available',?,?)"
  );
  for (let i = 1; i <= Number(count); i++) {
    insertBiopond.run(`${id}-${i}`, id, i, ts, ts);
  }

  res.status(201).json(getAllRacks(req.db).find((r) => r.id === id));
});

router.patch("/:rackId", requirePermission("Production", "edit"), (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "Name is required." });

  const nameTrimmed = name.trim();
  const existing = req.db.prepare("SELECT id FROM racks WHERE lower(name) = lower(?) AND id != ?").get(nameTrimmed, req.params.rackId);
  if (existing) return res.status(409).json({ error: `A rack named "${nameTrimmed}" already exists.` });

  const result = req.db.prepare("UPDATE racks SET name = ?, updated_at = ? WHERE id = ?").run(nameTrimmed, nowISO(), req.params.rackId);
  if (result.changes === 0) return res.status(404).json({ error: "Rack not found." });
  res.json({ ok: true });
});

router.delete("/:rackId", requirePermission("Production", "delete"), (req, res) => {
  const result = req.db.prepare("DELETE FROM racks WHERE id = ?").run(req.params.rackId);
  if (result.changes === 0) return res.status(404).json({ error: "Rack not found." });
  res.status(204).end();
});

router.post("/:rackId/bioponds", requirePermission("Production", "create"), (req, res) => {
  const { rackId } = req.params;
  const rack = req.db.prepare("SELECT * FROM racks WHERE id = ?").get(rackId);
  if (!rack) return res.status(404).json({ error: "Rack not found." });

  const quotaError = checkBiopondQuota(req, 1);
  if (quotaError) return res.status(402).json(quotaError);

  const { max } = req.db.prepare("SELECT MAX(number) AS max FROM bioponds WHERE rack_id = ?").get(rackId);
  const nextNumber = (max || 0) + 1;
  const ts = nowISO();
  const id = `${rackId}-${nextNumber}`;
  req.db.prepare("INSERT INTO bioponds (id, rack_id, number, status, created_at, updated_at) VALUES (?,?,?,'Available',?,?)").run(id, rackId, nextNumber, ts, ts);

  res.status(201).json(toBiopond(req.db.prepare("SELECT * FROM bioponds WHERE id = ?").get(id)));
});

router.delete("/bioponds/:biopondId", requirePermission("Production", "delete"), (req, res) => {
  const result = req.db.prepare("DELETE FROM bioponds WHERE id = ?").run(req.params.biopondId);
  if (result.changes === 0) return res.status(404).json({ error: "Biopond not found." });
  res.status(204).end();
});

router.post("/bioponds/:biopondId/start-production", requireOperatorOrPermission("Production", "create"), (req, res) => {
  const { babyMaggotQty, dateIn, feedInKg, feedSource, harvestDate, createdBy } = req.body || {};
  const biopond = req.db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId);
  if (!biopond) return res.status(404).json({ error: "Biopond not found." });

  const ts = nowISO();
  req.db.prepare(
    `UPDATE bioponds SET status='Occupied', baby_maggot_qty=?, date_in=?, feed_in_kg=?, feed_source=?, harvest_date=?,
     created_by=COALESCE(?, created_by), created_at=CASE WHEN status='Occupied' THEN created_at ELSE ? END, updated_at=?
     WHERE id=?`
  ).run(Number(babyMaggotQty), dateIn, Number(feedInKg), feedSource, harvestDate, createdBy, ts, ts, req.params.biopondId);

  res.json(toBiopond(req.db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId)));
});

router.post("/bioponds/:biopondId/release", requireOperatorOrPermission("Production", "edit"), (req, res) => {
  const biopond = req.db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId);
  if (!biopond) return res.status(404).json({ error: "Biopond not found." });

  req.db.prepare(
    "UPDATE bioponds SET status='Available', baby_maggot_qty=NULL, date_in=NULL, feed_in_kg=NULL, feed_source=NULL, harvest_date=NULL, updated_at=? WHERE id=?"
  ).run(nowISO(), req.params.biopondId);

  res.json(toBiopond(req.db.prepare("SELECT * FROM bioponds WHERE id = ?").get(req.params.biopondId)));
});

export default router;
