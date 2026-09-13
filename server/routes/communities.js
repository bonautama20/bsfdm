import { Router } from "express";
import { db, nowISO } from "../db.js";
import { requirePermission } from "../middleware/auth.js";
import { validate } from "../validate.js";

// Authenticated admin CRUD for the cultivator community directory — mounted
// in index.js AFTER requireAuth. Returns the full record including `phone`;
// see communityPublic.js for the phone-redacted public landing-page view.
const router = Router();

const communitySchema = {
  name: { maxLength: 200 },
  phone: { maxLength: 30 },
  address: { maxLength: 500 },
  kabupaten: { maxLength: 200 },
  provinsi: { maxLength: 100 },
};

const toCommunity = (c) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  address: c.address,
  kabupaten: c.kabupaten,
  provinsi: c.provinsi,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
});

// MAX(numeric suffix), not COUNT(*) — COUNT drifts below the highest id
// already in use as soon as any row is deleted, which then collides with an
// existing higher-numbered id on the next insert (UNIQUE constraint failure).
function maxIdNum() {
  const { maxNum } = db.prepare(
    "SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS maxNum FROM communities"
  ).get();
  return maxNum || 0;
}

function nextId() {
  return { id: `KOM-${String(maxIdNum() + 1).padStart(3, "0")}` };
}

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM communities ORDER BY provinsi, name").all();
  res.json(rows.map(toCommunity));
});

router.post("/", requirePermission("Community", "create"), (req, res) => {
  const { name, phone, address, kabupaten, provinsi } = req.body || {};
  if (!name || !provinsi) return res.status(400).json({ error: "Nama dan provinsi wajib diisi." });
  const lengthErrors = validate(req.body, communitySchema);
  if (lengthErrors.length > 0) return res.status(400).json({ error: lengthErrors[0] });

  const { id } = nextId();
  const ts = nowISO();
  db.prepare(
    "INSERT INTO communities (id,name,phone,address,kabupaten,provinsi,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)"
  ).run(id, name, phone || "", address || "", kabupaten || "", provinsi, ts, ts);

  res.status(201).json(toCommunity(db.prepare("SELECT * FROM communities WHERE id = ?").get(id)));
});

router.patch("/:id", requirePermission("Community", "edit"), (req, res) => {
  const existing = db.prepare("SELECT * FROM communities WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Data komunitas tidak ditemukan." });

  const lengthErrors = validate(req.body, communitySchema);
  if (lengthErrors.length > 0) return res.status(400).json({ error: lengthErrors[0] });

  const b = req.body || {};
  db.prepare(
    "UPDATE communities SET name=?, phone=?, address=?, kabupaten=?, provinsi=?, updated_at=? WHERE id=?"
  ).run(
    b.name ?? existing.name, b.phone ?? existing.phone, b.address ?? existing.address,
    b.kabupaten ?? existing.kabupaten, b.provinsi ?? existing.provinsi, nowISO(), req.params.id
  );
  res.json(toCommunity(db.prepare("SELECT * FROM communities WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requirePermission("Community", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM communities WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Data komunitas tidak ditemukan." });
  res.status(204).end();
});

// Bulk import — the client parses the uploaded Excel file itself (see
// admin/pages/Community.jsx) and posts the resulting rows here as plain JSON,
// so the server never has to handle multipart/file parsing.
router.post("/bulk", requirePermission("Community", "create"), (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (rows.length === 0) return res.status(400).json({ error: "Tidak ada baris data untuk diimpor." });

  const insert = db.prepare(
    "INSERT INTO communities (id,name,phone,address,kabupaten,provinsi,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)"
  );
  let num = maxIdNum();
  const ts = nowISO();
  const inserted = [];
  const skipped = [];

  rows.forEach((r, i) => {
    const name = (r.name || "").toString().trim();
    const provinsi = (r.provinsi || "").toString().trim();
    if (!name || !provinsi) {
      skipped.push({ row: i + 1, reason: "Nama dan provinsi wajib diisi." });
      return;
    }
    const lengthErrors = validate(r, communitySchema);
    if (lengthErrors.length > 0) {
      skipped.push({ row: i + 1, reason: lengthErrors[0] });
      return;
    }
    num += 1;
    const id = `KOM-${String(num).padStart(3, "0")}`;
    insert.run(id, name, (r.phone || "").toString().trim(), (r.address || "").toString().trim(), (r.kabupaten || "").toString().trim(), provinsi, ts, ts);
    inserted.push(id);
  });

  res.status(201).json({ insertedCount: inserted.length, skipped });
});

export default router;
