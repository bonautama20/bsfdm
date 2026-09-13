import { Router } from "express";
import { nextId } from "../db.js";
import { requirePermission } from "../middleware/auth.js";
import { requirePlan } from "../middleware/plan.js";
import { validateBody } from "../validate.js";

const router = Router();
// Client management is paid-only — see the multi-tenant plan's Phase 3.
router.use(requirePlan("Client"));

const hotelSchema = {
  name: { maxLength: 200 },
  address: { maxLength: 500 },
  phone: { maxLength: 30 },
  email: { maxLength: 200, email: true },
  website: { maxLength: 200 },
};

// Vendor PIC is never stored on the hotel row — it's derived live from
// whichever vendor's "Handles" list includes this hotel (see vendors.js),
// so editing a vendor's PIC on the Vendor page instantly reflects here too.
function getVendorForHotel(db, hotelId) {
  return db.prepare(
    `SELECT v.pic, v.pic_position, v.phone2
     FROM vendor_hotels vh JOIN vendors v ON v.id = vh.vendor_id
     WHERE vh.hotel_id = ?
     LIMIT 1`
  ).get(hotelId);
}

const toHotel = (h, vendor) => ({
  id: h.id,
  name: h.name,
  address: h.address,
  phone: h.phone,
  email: h.email,
  website: h.website,
  hotelPIC: { name: h.hotel_pic_name || "", position: h.hotel_pic_position || "", phone: h.hotel_pic_phone || "" },
  vendorPIC: vendor
    ? { name: vendor.pic || "—", position: vendor.pic_position || "—", phone: vendor.phone2 || "—" }
    : { name: "—", position: "—", phone: "—" },
  contractNumber: h.contract_number,
  contractStart: h.contract_start,
  contractExpiry: h.contract_expiry,
  status: h.status,
  monthlyWasteKg: h.monthly_waste_kg,
  avgDailyWasteKg: h.avg_daily_waste_kg,
  lastCollection: h.last_collection,
});

router.get("/", (req, res) => {
  const hotels = req.db.prepare("SELECT * FROM hotels ORDER BY rowid").all();
  const vendorLinks = req.db.prepare(
    `SELECT vh.hotel_id AS hotel_id, v.pic, v.pic_position, v.phone2
     FROM vendor_hotels vh JOIN vendors v ON v.id = vh.vendor_id`
  ).all();
  const vendorByHotel = {};
  vendorLinks.forEach((row) => { if (!vendorByHotel[row.hotel_id]) vendorByHotel[row.hotel_id] = row; });

  res.json(hotels.map((h) => toHotel(h, vendorByHotel[h.id])));
});

router.get("/:id/waste-history", (req, res) => {
  const rows = req.db.prepare("SELECT * FROM waste_collections WHERE hotel_id = ? ORDER BY date").all(req.params.id);
  res.json(rows.map((w) => ({
    date: w.date, quantityKg: w.quantity_kg, category: w.category,
    vehicle: w.vehicle, driver: w.driver, operator: w.operator, notes: w.notes || "",
  })));
});

router.post(
  "/",
  requirePermission("Client", "create"),
  validateBody({ ...hotelSchema, name: { ...hotelSchema.name, required: true }, address: { ...hotelSchema.address, required: true } }),
  (req, res) => {
  const { name, address, phone, email, website, hotelPIC } = req.body || {};

  const id = nextId(req.db, "hotels", "HTL", 2);
  const contractYear = new Date().getFullYear();
  req.db.prepare(
    `INSERT INTO hotels (id,name,address,phone,email,website,hotel_pic_name,hotel_pic_position,hotel_pic_phone,contract_number,contract_start,contract_expiry,status,monthly_waste_kg,avg_daily_waste_kg,last_collection)
     VALUES (?,?,?,?,?,?,?,?,?,?, date('now'), date('now','+1 year'), 'Active', 0, 0, NULL)`
  ).run(
    id, name, address, phone || "", email || "", website || "",
    hotelPIC?.name || "", hotelPIC?.position || "", hotelPIC?.phone || "",
    `CTR-${contractYear}-${100 + Number(id.slice(4))}`
  );

  res.status(201).json(toHotel(req.db.prepare("SELECT * FROM hotels WHERE id = ?").get(id), getVendorForHotel(req.db, id)));
});

router.patch("/:id", requirePermission("Client", "edit"), validateBody(hotelSchema), (req, res) => {
  const existing = req.db.prepare("SELECT * FROM hotels WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Hotel not found." });

  const b = req.body || {};
  req.db.prepare(
    `UPDATE hotels SET name=?, address=?, phone=?, email=?, website=?, status=?,
     hotel_pic_name=?, hotel_pic_position=?, hotel_pic_phone=? WHERE id=?`
  ).run(
    b.name ?? existing.name, b.address ?? existing.address, b.phone ?? existing.phone,
    b.email ?? existing.email, b.website ?? existing.website, b.status ?? existing.status,
    b.hotelPIC?.name ?? existing.hotel_pic_name, b.hotelPIC?.position ?? existing.hotel_pic_position,
    b.hotelPIC?.phone ?? existing.hotel_pic_phone, req.params.id
  );
  res.json(toHotel(req.db.prepare("SELECT * FROM hotels WHERE id = ?").get(req.params.id), getVendorForHotel(req.db, req.params.id)));
});

router.delete("/:id", requirePermission("Client", "delete"), (req, res) => {
  const result = req.db.prepare("DELETE FROM hotels WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Hotel not found." });
  res.status(204).end();
});

export default router;
