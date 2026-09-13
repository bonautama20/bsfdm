import { Router } from "express";
import { nowISO, nextId } from "../db.js";
import { requireOperatorOrPermission } from "../middleware/auth.js";

const router = Router();

function makeLogRoutes({ path, table, idPrefix, columns }) {
  // columns: array of { field, column } pairs describing the body shape (excluding id/createdBy/createdAt)
  router.get(`/${path}`, (req, res) => {
    const rows = req.db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
    res.json(rows.map((r) => rowToJson(r, columns)));
  });

  // These are submitted by operators from the field (mobile /operator module)
  // as much as by admins — see requireOperatorOrPermission's doc comment.
  router.post(`/${path}`, requireOperatorOrPermission("Production", "create"), (req, res) => {
    const body = req.body || {};
    for (const { field } of columns) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }
    const id = nextId(req.db, table, idPrefix, 4);
    const ts = nowISO();
    const colNames = ["id", ...columns.map((c) => c.column), "created_by", "created_at"];
    const placeholders = colNames.map(() => "?").join(",");
    const values = [id, ...columns.map((c) => body[c.field]), body.createdBy || null, ts];
    req.db.prepare(`INSERT INTO ${table} (${colNames.join(",")}) VALUES (${placeholders})`).run(...values);

    res.status(201).json(rowToJson(req.db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id), columns));
  });
}

function rowToJson(r, columns) {
  const out = { id: r.id, createdBy: r.created_by, createdAt: r.created_at };
  columns.forEach(({ field, column }) => { out[field] = r[column]; });
  return out;
}

makeLogRoutes({
  path: "kasgot-records",
  table: "kasgot_records",
  idPrefix: "KSG",
  columns: [
    { field: "date", column: "date" },
    { field: "biopondLabel", column: "biopond_label" },
    { field: "quantityKg", column: "quantity_kg" },
  ],
});

makeLogRoutes({
  path: "maggot-harvests",
  table: "maggot_harvests",
  idPrefix: "MGH",
  columns: [
    { field: "date", column: "date" },
    { field: "biopondLabel", column: "biopond_label" },
    { field: "quantityKg", column: "quantity_kg" },
  ],
});

makeLogRoutes({
  path: "breeder-records",
  table: "breeder_records",
  idPrefix: "BRD",
  columns: [
    { field: "type", column: "type" },
    { field: "date", column: "date" },
    { field: "quantity", column: "quantity" },
    { field: "unit", column: "unit" },
  ],
});

makeLogRoutes({
  path: "feed-records",
  table: "feed_records",
  idPrefix: "FED",
  columns: [
    { field: "date", column: "date" },
    { field: "clientName", column: "client_name" },
    { field: "quantityKg", column: "quantity_kg" },
  ],
});

export default router;
