import { Router } from "express";
import { db } from "../db.js";

// Public, unauthenticated read-only view of the cultivator community directory
// for the landing page — mounted in index.js BEFORE requireAuth. Never returns
// `phone`; the full record (incl. phone) is only available via the
// authenticated admin routes in communities.js.
const router = Router();

router.get("/", (req, res) => {
  const rows = db.prepare(
    "SELECT id, name, address, kabupaten, provinsi FROM communities ORDER BY provinsi, name"
  ).all();
  res.json(rows.map((r) => ({ id: r.id, name: r.name, address: r.address, kabupaten: r.kabupaten, provinsi: r.provinsi })));
});

router.get("/summary", (req, res) => {
  const rows = db.prepare(
    "SELECT provinsi, COUNT(*) AS count FROM communities GROUP BY provinsi ORDER BY provinsi"
  ).all();
  res.json(rows);
});

export default router;
