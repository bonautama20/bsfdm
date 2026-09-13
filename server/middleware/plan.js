// Free/paid feature gating (see the multi-tenant plan's Phase 3). No payment
// gateway yet — plan.js is the enforcement point; upgrading an org today is a
// manual `node set-org-plan.js <orgId> paid` after an off-platform payment
// (bank transfer, etc.), not a self-serve checkout.
import { db } from "../db.js";

// The ONLY module a free-plan organization can use. Keep this in sync with
// client/src/data/planModules.js, which mirrors it for the sidebar lock UI —
// that copy is a UX nicety, this one is the real boundary.
const FREE_MODULES = new Set(["Production"]);

// Use exactly like requirePermission — after requireAuth, before the route
// handler. `module` is the same string requirePermission already uses for
// that route (Client, Vendor, Employee, Report, Calendar, Notification,
// Setting, Community) so both checks read the same vocabulary.
export function requirePlan(module) {
  return (req, res, next) => {
    if (!req.auth?.orgId) return res.status(401).json({ error: "Not authenticated." });
    if (FREE_MODULES.has(module)) return next();

    const org = db.prepare("SELECT plan FROM organizations WHERE id = ?").get(req.auth.orgId);
    if (org?.plan === "paid") return next();

    res.status(402).json({
      error: `Upgrade to a paid plan to access ${module}.`,
      upgradeRequired: true,
      module,
    });
  };
}
