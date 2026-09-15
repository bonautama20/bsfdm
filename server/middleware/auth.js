import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { db, PLATFORM_OWNER_ORG_ID } from "../db.js";
import { getTenantDb } from "../tenantDb.js";

const isProd = process.env.NODE_ENV === "production";

// Without an explicit JWT_SECRET, generate a random one for this process only.
// Fine for local/QA use (worst case: a restart invalidates existing sessions,
// forcing a re-login) — but it means every restart signs with a different key
// and multiple instances wouldn't trust each other's tokens, so a real
// deployment must set a fixed JWT_SECRET in server/.env.
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (isProd) {
    // A random per-process secret in production means every restart logs
    // every user out (and, with >1 instance, tokens minted by one instance
    // are rejected by another) — refuse to boot rather than silently degrade.
    console.error(
      "[auth] JWT_SECRET is required in production and was not set. " +
      "Set it in server/.env — generate one with: " +
      "node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
    process.exit(1);
  }
  JWT_SECRET = crypto.randomBytes(48).toString("hex");
  console.warn(
    "[auth] JWT_SECRET is not set — using a random secret for this process only. " +
    "Set JWT_SECRET in server/.env before a real deployment (see server/.env.example)."
  );
}
export const COOKIE_NAME = "bsfdm_token";
const TOKEN_TTL = "7d";

export function signToken(user) {
  return jwt.sign({ sub: user.id, roleId: user.role_id, orgId: user.org_id }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

// Same-origin deployments (the default — see server/index.js static serving)
// work fine with "lax". Only set COOKIE_SAME_SITE=none (and serve over HTTPS)
// if the frontend and backend are deployed on two different domains.
const sameSite = process.env.COOKIE_SAME_SITE || "lax";

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd || sameSite === "none",
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME);
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Attaches req.auth = { id, roleId, orgId } when a valid cookie is present;
// otherwise 401s. Also checked on EVERY authenticated request (not just
// login) whether the org still exists and isn't suspended — see
// routes/platform.js's delete/status endpoints. A JWT is normally trusted
// without a DB round-trip, but this one check is cheap (indexed lookup by
// primary key) and is what actually makes "delete" and "suspend" take
// effect immediately for a session that's already logged in, rather than
// only on their next login.
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "Not authenticated." });
  try {
    const payload = verifyToken(token);
    const org = db.prepare("SELECT status FROM organizations WHERE id = ?").get(payload.orgId);
    if (!org || org.status === "suspended") {
      return res.status(403).json({ error: "Your organization no longer has access. Contact support." });
    }
    req.auth = { id: payload.sub, roleId: payload.roleId, orgId: payload.orgId };
    next();
  } catch {
    return res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}

// Use after requireAuth on any route that touches an organization's own
// business data (i.e. everything except the control-DB routes — auth,
// users, communities): resolves req.auth.orgId to that tenant's own SQLite
// database and attaches it as req.db. Route handlers use req.db exactly like
// the old module-level `db` import used to work, just tenant-scoped.
export function attachTenantDb(req, res, next) {
  if (!req.auth?.orgId) return res.status(401).json({ error: "Not authenticated." });
  req.db = getTenantDb(req.auth.orgId);
  next();
}

// Use after requireAuth to restrict an endpoint to specific role ids.
export function requireRole(...roleIds) {
  return (req, res, next) => {
    if (!req.auth || !roleIds.includes(req.auth.roleId)) {
      return res.status(403).json({ error: "You don't have permission to do this." });
    }
    next();
  };
}

// Restricts an endpoint to the single organization designated as the
// platform operator (PLATFORM_OWNER_ORG_ID in db.js) — used for the shared
// role/permission template (editable by nobody else, since it's global
// across every tenant for now) and for reviewing other orgs' upgrade
// requests (routes/billing.js). Not a role check: this is about which
// ORGANIZATION you belong to, regardless of your role within it.
export function requirePlatformOwner(req, res, next) {
  if (req.auth?.orgId !== PLATFORM_OWNER_ORG_ID) {
    return res.status(403).json({ error: "Only the platform operator can do this." });
  }
  next();
}

const VALID_ACTIONS = ["view", "create", "edit", "delete", "export", "approve"];

// Server-side enforcement of the same per-module permission matrix the admin's
// Roles & Permissions page edits (role_permissions table) — the UI hiding a
// button was never actually a security boundary on its own, since any logged-in
// user could otherwise call the API directly regardless of role.
export function requirePermission(module, action) {
  if (!VALID_ACTIONS.includes(action)) throw new Error(`requirePermission: invalid action "${action}"`);
  const column = `can_${action}`;
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: "Not authenticated." });
    const row = db.prepare(
      `SELECT ${column} AS allowed FROM role_permissions WHERE role_id = ? AND module = ?`
    ).get(req.auth.roleId, module);
    if (!row?.allowed) {
      return res.status(403).json({ error: "You don't have permission to do this." });
    }
    next();
  };
}

// A handful of endpoints (starting/releasing a biopond, and every field-log
// POST — maggot harvest, kasgot, feed, breeder, egg batches) are written to by
// BOTH the admin panel and the separate mobile-first /operator module.
// Operators have no admin-panel permission row of their own (see
// client/src/data/dummyData.js's rolePermissions comment — every admin module
// is deliberately hidden for role-operator), so they're let through here
// unconditionally for what is, for them, just doing their job; every other
// role still goes through the normal per-module permission check.
export function requireOperatorOrPermission(module, action) {
  const checkPermission = requirePermission(module, action);
  return (req, res, next) => {
    if (req.auth?.roleId === "role-operator") return next();
    return checkPermission(req, res, next);
  };
}
