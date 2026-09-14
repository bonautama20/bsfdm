import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db, nowISO, nextId } from "../db.js";

// No payment gateway yet (see the multi-tenant plan) — a free org pays
// off-platform and tells us via this endpoint; an operator reviews pending
// requests and upgrades the org manually with server/set-org-plan.js, which
// also resolves the matching request. See client/src/admin/pages/Upgrade.jsx
// for the customer-facing side.
const router = Router();

// Loose enough for a real user re-submitting after fixing a typo in their
// note, tight enough to stop someone hammering the button.
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a while and try again." },
});

const toRequest = (r) => ({
  id: r.id, note: r.note, status: r.status, createdAt: r.created_at, resolvedAt: r.resolved_at,
});

router.post("/upgrade-request", requestLimiter, (req, res) => {
  const org = db.prepare("SELECT * FROM organizations WHERE id = ?").get(req.auth.orgId);
  if (!org) return res.status(404).json({ error: "Organization not found." });
  if (org.plan === "paid") return res.status(400).json({ error: "Your organization is already on the paid plan." });

  const existing = db.prepare("SELECT * FROM upgrade_requests WHERE org_id = ? AND status = 'pending'").get(req.auth.orgId);
  if (existing) return res.status(200).json(toRequest(existing));

  const note = (req.body?.note || "").toString().trim().slice(0, 500);
  const id = nextId(db, "upgrade_requests", "UPG", 4);
  db.prepare("INSERT INTO upgrade_requests (id, org_id, note, status, created_at) VALUES (?,?,?,'pending',?)")
    .run(id, req.auth.orgId, note, nowISO());

  res.status(201).json(toRequest(db.prepare("SELECT * FROM upgrade_requests WHERE id = ?").get(id)));
});

// Lets the Upgrade page show "waiting for confirmation" instead of the form
// again after a request has already been submitted, without needing a
// dedicated admin UI yet — the operator still resolves requests via the CLI.
router.get("/upgrade-request/status", (req, res) => {
  const latest = db.prepare(
    "SELECT * FROM upgrade_requests WHERE org_id = ? ORDER BY created_at DESC LIMIT 1"
  ).get(req.auth.orgId);
  res.json(latest ? toRequest(latest) : null);
});

export default router;
