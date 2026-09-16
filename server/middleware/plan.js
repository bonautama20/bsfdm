// Free/paid feature gating (see the multi-tenant plan's Phase 3). No payment
// gateway yet — plan.js is the enforcement point; upgrading an org today is a
// manual `node set-org-plan.js <orgId> paid` after an off-platform payment
// (bank transfer, etc.), not a self-serve checkout.
import { db } from "../db.js";

// The ONLY module a free-plan organization can use. Keep this in sync with
// client/src/data/planModules.js, which mirrors it for the sidebar lock UI —
// that copy is a UX nicety, this one is the real boundary.
const FREE_MODULES = new Set(["Production"]);

// Even within Production (free), a free org is capped at this many bioponds
// total — see server/routes/racks.js. The frontend doesn't hardcode this; it
// reads the real limit back from this error response (err.limit) to show in
// the upgrade prompt, so there's nothing else to keep in sync.
export const FREE_BIOPOND_LIMIT = 5;

// A free org can create at most this many breeder/source cages (BSF Eggs +
// Breeder/Parent Stock tabs) — see server/routes/misc.js.
export const FREE_CAGE_LIMIT = 1;

export function getOrgPlan(orgId) {
  return db.prepare("SELECT plan FROM organizations WHERE id = ?").get(orgId)?.plan || "free";
}

// Use exactly like requirePermission — after requireAuth, before the route
// handler. `module` is the same string requirePermission already uses for
// that route (Client, Vendor, Employee, Report, Calendar, Notification,
// Setting, Community) so both checks read the same vocabulary.
export function requirePlan(module) {
  return (req, res, next) => {
    if (!req.auth?.orgId) return res.status(401).json({ error: "Not authenticated." });
    if (FREE_MODULES.has(module)) return next();
    if (getOrgPlan(req.auth.orgId) === "paid") return next();

    res.status(402).json({
      error: `Upgrade to a paid plan to access ${module}.`,
      upgradeRequired: true,
      module,
    });
  };
}
