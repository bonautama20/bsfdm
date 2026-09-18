// Public "Request Demo" popup on the landing page (client/src/pages/
// Landing.jsx) — submitted by anonymous visitors, before any account exists,
// so this is mounted before requireAuth in app.js like auth.js's own public
// routes.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db, nowISO, nextId } from "../db.js";
import { validateBody } from "../validate.js";

const router = Router();

// Generous enough for a real visitor retyping a typo'd phone/email, tight
// enough to blunt scripted spam against a public, unauthenticated form.
const demoRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});

router.post(
  "/",
  demoRequestLimiter,
  validateBody({
    phone: { required: true, maxLength: 30 },
    email: { required: true, email: true, maxLength: 200 },
  }),
  (req, res) => {
    const { phone, email } = req.body;
    const id = nextId(db, "demo_requests", "DEMO", 4);
    db.prepare("INSERT INTO demo_requests (id, phone, email, status, created_at) VALUES (?,?,?,'new',?)")
      .run(id, phone.trim(), email.trim(), nowISO());
    res.status(201).json({ ok: true });
  }
);

export default router;
