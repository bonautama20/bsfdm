import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { db, nowISO, nextId, PLATFORM_OWNER_ORG_ID } from "../db.js";
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from "../middleware/auth.js";
import { getTenantDb } from "../tenantDb.js";
import { sendPasswordResetEmail } from "../email.js";
import { hashToken, issueResetToken, resolveAppUrl } from "../passwordReset.js";

const router = Router();

const toUser = (u) => ({
  id: u.id, name: u.name, email: u.email, roleId: u.role_id,
  status: u.status, lastLogin: u.last_login, createdDate: u.created_date,
});
const toRole = (r) => ({ id: r.id, name: r.name, description: r.description });
const toOrg = (o) => ({ id: o.id, name: o.name, plan: o.plan, isPlatformOwner: o.id === PLATFORM_OWNER_ORG_ID });

// Slows down credential-stuffing/brute-force attempts against the login form.
// Keyed by IP; generous enough not to lock out a real user mistyping a password.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a few minutes and try again." },
});

router.post("/login", loginLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email.trim());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (user.status !== "Active") {
    return res.status(403).json({ error: "This account has been deactivated." });
  }

  const org = db.prepare("SELECT * FROM organizations WHERE id = ?").get(user.org_id);
  if (!org || org.status === "suspended") {
    return res.status(403).json({ error: "Your organization no longer has access. Contact support." });
  }

  db.prepare("UPDATE users SET last_login = ? WHERE id = ?").run(nowISO(), user.id);

  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get(user.role_id);
  setAuthCookie(res, signToken(user));

  res.json({
    user: { ...toUser(user), lastLogin: nowISO() },
    role: toRole(role),
    organization: toOrg(org),
  });
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

// Generous enough for a real founder retyping details after a typo (or a
// small office signing up several accounts from behind one NAT'd IP), tight
// enough to blunt a script hammering this into spinning up many organizations
// (each signup creates a whole new tenant database — a heavier write than a
// login attempt).
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many signup attempts. Please wait a few minutes and try again." },
});

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// New self-registration signs the founder in as role-super-admin of a brand
// new organization on the free plan — no email verification gate and no
// manual approval step, matching the frictionless-signup norm for a freemium
// product (see the multi-tenant plan). Upgrading to paid happens manually for
// now via server/set-org-plan.js.
router.post("/register", registerLimiter, async (req, res) => {
  const { companyName, name, email, password } = req.body || {};
  if (!companyName || !name || !email || !password) {
    return res.status(400).json({ error: "companyName, name, email, and password are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const trimmedEmail = String(email).trim();
  const dup = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(trimmedEmail);
  if (dup) return res.status(409).json({ error: "An account with this email already exists." });

  const orgId = nextId(db, "organizations", "ORG");
  const baseSlug = slugify(companyName) || "company";
  let slug = baseSlug;
  let suffix = 2;
  while (db.prepare("SELECT id FROM organizations WHERE slug = ?").get(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  db.prepare("INSERT INTO organizations (id, name, slug, plan, status, created_at) VALUES (?,?,?,?,?,?)")
    .run(orgId, companyName.trim(), slug, "free", "active", nowISO());

  const userId = nextId(db, "users", "USR", 2);
  db.prepare(
    "INSERT INTO users (id, org_id, name, email, password, role_id, status, last_login, created_date) VALUES (?,?,?,?,?,?,?,?,?)"
  ).run(userId, orgId, name.trim(), trimmedEmail, bcrypt.hashSync(password, 10), "role-super-admin", "Active", nowISO(), nowISO().slice(0, 10));

  // Provisions the new org's tenant database right away (empty — no demo
  // data) rather than waiting for the first business-data request to
  // lazily create it, so the very first dashboard load isn't the one
  // paying that cost.
  getTenantDb(orgId);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get("role-super-admin");
  const org = db.prepare("SELECT * FROM organizations WHERE id = ?").get(orgId);
  setAuthCookie(res, signToken(user));

  res.status(201).json({
    user: toUser(user),
    role: toRole(role),
    organization: toOrg(org),
  });
});

// Generous enough for a real user retrying a typo'd email, tight enough to
// blunt using this form to spam an inbox or enumerate accounts by timing.
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a few minutes and try again." },
});

// Always responds with the same generic message whether or not the email
// matches an account — a different response (or timing) would let someone
// enumerate registered emails.
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required." });

  const genericResponse = { message: "If an account exists for that email, a password reset link has been sent." };
  const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?) AND status = 'Active'").get(email.trim());
  if (!user) return res.json(genericResponse);

  const rawToken = issueResetToken(user.id);
  const resetUrl = `${resolveAppUrl(req)}/reset-password?token=${rawToken}`;
  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    console.error(`[auth] Failed to send password reset email: ${err.message}`);
    // Still return the generic success response — don't leak delivery
    // failures to the client, and don't block on an email provider outage.
  }

  res.json(genericResponse);
});

router.post("/reset-password", (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: "Token and new password are required." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });

  const row = db.prepare("SELECT * FROM password_resets WHERE token_hash = ?").get(hashToken(token));
  if (!row || row.used || new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
  }

  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(bcrypt.hashSync(password, 10), row.user_id);
  db.prepare("UPDATE password_resets SET used = 1 WHERE token_hash = ?").run(row.token_hash);

  res.json({ message: "Password updated. You can now log in with your new password." });
});

// Lets the frontend confirm on load whether the session cookie is still valid
// (rather than trusting a locally-cached copy indefinitely), and refresh the
// display data (name/role/status may have changed since the cookie was issued).
router.get("/me", requireAuth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.auth.id);
  if (!user || user.status !== "Active") return res.status(401).json({ error: "Session no longer valid." });
  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get(user.role_id);
  const org = db.prepare("SELECT * FROM organizations WHERE id = ?").get(user.org_id);
  res.json({ user: toUser(user), role: toRole(role), organization: toOrg(org) });
});

export default router;
