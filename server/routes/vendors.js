import { Router } from "express";
import { db, nextId } from "../db.js";
import { requirePermission } from "../middleware/auth.js";
import { validateBody } from "../validate.js";

const router = Router();

const vendorSchema = {
  name: { maxLength: 200 },
  pic: { maxLength: 200 },
  picPosition: { maxLength: 200 },
  location: { maxLength: 300 },
  phone1: { maxLength: 30 },
  phone2: { maxLength: 30 },
};

function toVendor(v) {
  const hotelIds = db.prepare("SELECT hotel_id FROM vendor_hotels WHERE vendor_id = ?").all(v.id).map((r) => r.hotel_id);
  return {
    id: v.id, name: v.name, pic: v.pic, picPosition: v.pic_position || "", location: v.location,
    phone1: v.phone1, phone2: v.phone2, hotelIds,
  };
}

router.get("/", (req, res) => {
  const vendors = db.prepare("SELECT * FROM vendors ORDER BY rowid").all();
  res.json(vendors.map(toVendor));
});

router.post(
  "/",
  requirePermission("Vendor", "create"),
  validateBody({ ...vendorSchema, name: { ...vendorSchema.name, required: true }, pic: { ...vendorSchema.pic, required: true } }),
  (req, res) => {
  const { name, pic, picPosition, location, phone1, phone2, hotelIds } = req.body || {};

  const id = nextId("vendors", "VND", 2);
  db.prepare("INSERT INTO vendors (id, name, pic, pic_position, location, phone1, phone2) VALUES (?,?,?,?,?,?,?)")
    .run(id, name, pic, picPosition || "", location || "", phone1 || "", phone2 || "");

  const insertLink = db.prepare("INSERT INTO vendor_hotels (vendor_id, hotel_id) VALUES (?,?)");
  (hotelIds || []).forEach((hid) => insertLink.run(id, hid));

  res.status(201).json(toVendor(db.prepare("SELECT * FROM vendors WHERE id = ?").get(id)));
});

router.patch("/:id", requirePermission("Vendor", "edit"), validateBody(vendorSchema), (req, res) => {
  const existing = db.prepare("SELECT * FROM vendors WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Vendor not found." });

  const b = req.body || {};
  db.prepare("UPDATE vendors SET name=?, pic=?, pic_position=?, location=?, phone1=?, phone2=? WHERE id=?").run(
    b.name ?? existing.name, b.pic ?? existing.pic, b.picPosition ?? existing.pic_position, b.location ?? existing.location,
    b.phone1 ?? existing.phone1, b.phone2 ?? existing.phone2, req.params.id
  );

  if (b.hotelIds) {
    db.prepare("DELETE FROM vendor_hotels WHERE vendor_id = ?").run(req.params.id);
    const insertLink = db.prepare("INSERT INTO vendor_hotels (vendor_id, hotel_id) VALUES (?,?)");
    b.hotelIds.forEach((hid) => insertLink.run(req.params.id, hid));
  }

  res.json(toVendor(db.prepare("SELECT * FROM vendors WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requirePermission("Vendor", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM vendors WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Vendor not found." });
  res.status(204).end();
});

export default router;
