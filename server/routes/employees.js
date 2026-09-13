import { Router } from "express";
import { db, nextId } from "../db.js";
import { requirePermission } from "../middleware/auth.js";
import { validateBody } from "../validate.js";

const router = Router();

const employeeSchema = {
  name: { maxLength: 200 },
  position: { maxLength: 200 },
  department: { maxLength: 200 },
  phone: { maxLength: 30 },
  email: { maxLength: 200, email: true },
};

const toEmployee = (e) => ({
  id: e.id, name: e.name, position: e.position, department: e.department,
  phone: e.phone, email: e.email, status: e.status, joinDate: e.join_date,
});

const toAttendance = (a) => ({
  employeeId: a.employee_id, date: a.date,
  clockIn: a.clock_in || "-", clockOut: a.clock_out || "-",
  status: a.status, hours: a.hours,
});

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM employees ORDER BY rowid").all().map(toEmployee));
});

router.post(
  "/",
  requirePermission("Employee", "create"),
  validateBody({ ...employeeSchema, name: { ...employeeSchema.name, required: true }, position: { ...employeeSchema.position, required: true } }),
  (req, res) => {
  const { name, position, department, phone, email, status, joinDate } = req.body || {};

  const id = nextId("employees", "EMP", 3);
  db.prepare(
    "INSERT INTO employees (id, name, position, department, phone, email, status, join_date) VALUES (?,?,?,?,?,?,?,?)"
  ).run(id, name, position, department || "", phone || "", email || "", status || "Active", joinDate || new Date().toISOString().slice(0, 10));

  res.status(201).json(toEmployee(db.prepare("SELECT * FROM employees WHERE id = ?").get(id)));
});

router.patch("/:id", requirePermission("Employee", "edit"), validateBody(employeeSchema), (req, res) => {
  const existing = db.prepare("SELECT * FROM employees WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Employee not found." });

  const b = req.body || {};
  db.prepare("UPDATE employees SET name=?, position=?, department=?, phone=?, email=?, status=? WHERE id=?").run(
    b.name ?? existing.name, b.position ?? existing.position, b.department ?? existing.department,
    b.phone ?? existing.phone, b.email ?? existing.email, b.status ?? existing.status, req.params.id
  );
  res.json(toEmployee(db.prepare("SELECT * FROM employees WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requirePermission("Employee", "delete"), (req, res) => {
  const result = db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "Employee not found." });
  res.status(204).end();
});

router.get("/attendance/today", (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  res.json(db.prepare("SELECT * FROM attendance WHERE date = ? ORDER BY rowid").all(today).map(toAttendance));
});

router.get("/:id/attendance", (req, res) => {
  res.json(db.prepare("SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC").all(req.params.id).map(toAttendance));
});

router.post("/:id/attendance", requirePermission("Employee", "create"), (req, res) => {
  const { date, clockIn, clockOut, status, hours } = req.body || {};
  if (!date || !status) return res.status(400).json({ error: "Date and status are required." });

  db.prepare(
    "INSERT INTO attendance (employee_id, date, clock_in, clock_out, status, hours) VALUES (?,?,?,?,?,?)"
  ).run(req.params.id, date, clockIn || null, clockOut || null, status, hours || 0);

  res.status(201).json({ ok: true });
});

export default router;
