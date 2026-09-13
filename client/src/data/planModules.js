// Mirrors server/middleware/plan.js's FREE_MODULES — the server is the real
// enforcement point (every request is still checked there regardless of
// what this file says), this copy only drives the UI: which sidebar items
// show a lock, and which dashboard routes render the upgrade panel instead
// of the real page for a free-plan organization.
export const FREE_MODULES = new Set(["Production"]);

// Dashboard route -> module string, using the same vocabulary as the
// server's requirePermission/requirePlan calls (Client, Vendor, Employee,
// Report, Calendar, Notification, Setting, Community). Routes not listed
// here (Dashboard, Production) are always available regardless of plan.
export const ROUTE_MODULES = {
  "/dashboard/calendar": "Calendar",
  "/dashboard/clients": "Client",
  "/dashboard/vendors": "Vendor",
  "/dashboard/community": "Community",
  "/dashboard/reports": "Report",
  "/dashboard/notifications": "Notification",
  "/dashboard/settings": "Setting",
};

// `module` is undefined for routes with no gating at all (Dashboard,
// Production isn't in ROUTE_MODULES either since it's always free) — those
// must never be treated as locked just because they're absent from
// FREE_MODULES.
export function isModuleLocked(module, plan) {
  if (!module) return false;
  return plan === "free" && !FREE_MODULES.has(module);
}
