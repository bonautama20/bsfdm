import { Router } from "express";
import { db, nowISO } from "../db.js";
import { requirePlatformOwner } from "../middleware/auth.js";

// Platform-wide view across every organization — only the platform owner
// (PLATFORM_OWNER_ORG_ID) can see this, since it's cross-tenant data no
// individual customer should see. This is the in-app version of what
// `node set-org-plan.js` already shows/does from the CLI; both read/write
// the same tables, so either one works.
const router = Router();
router.use(requirePlatformOwner);

const toOrgSummary = (o) => ({
  id: o.id,
  name: o.name,
  slug: o.slug,
  plan: o.plan,
  status: o.status,
  createdAt: o.created_at,
  userCount: o.user_count,
  pendingUpgradeRequest: o.request_id
    ? { id: o.request_id, note: o.request_note, createdAt: o.request_created_at }
    : null,
});

router.get("/stats", (req, res) => {
  const totals = db.prepare(`
    SELECT
      COUNT(*) AS organizations,
      SUM(CASE WHEN plan = 'paid' THEN 1 ELSE 0 END) AS paid,
      SUM(CASE WHEN plan = 'free' THEN 1 ELSE 0 END) AS free
    FROM organizations
  `).get();
  const { users } = db.prepare("SELECT COUNT(*) AS users FROM users").get();

  const organizations = db.prepare(`
    SELECT
      o.*,
      (SELECT COUNT(*) FROM users u WHERE u.org_id = o.id) AS user_count,
      ur.id AS request_id, ur.note AS request_note, ur.created_at AS request_created_at
    FROM organizations o
    LEFT JOIN upgrade_requests ur ON ur.org_id = o.id AND ur.status = 'pending'
    ORDER BY o.created_at DESC
  `).all();

  res.json({
    totals: { organizations: totals.organizations, paid: totals.paid || 0, free: totals.free || 0, users },
    organizations: organizations.map(toOrgSummary),
  });
});

// Same effect as `node set-org-plan.js <orgId> <plan>` — upgrading also
// resolves that org's pending upgrade request, if any.
router.post("/organizations/:orgId/plan", (req, res) => {
  const { plan } = req.body || {};
  if (plan !== "free" && plan !== "paid") {
    return res.status(400).json({ error: "plan must be \"free\" or \"paid\"." });
  }
  const org = db.prepare("SELECT * FROM organizations WHERE id = ?").get(req.params.orgId);
  if (!org) return res.status(404).json({ error: "Organization not found." });

  db.prepare("UPDATE organizations SET plan = ? WHERE id = ?").run(plan, req.params.orgId);
  if (plan === "paid") {
    db.prepare(
      "UPDATE upgrade_requests SET status = 'approved', resolved_at = ? WHERE org_id = ? AND status = 'pending'"
    ).run(nowISO(), req.params.orgId);
  }

  res.json({ ok: true });
});

export default router;
