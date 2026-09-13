import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { db, nowISO } from "../db.js";
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from "../middleware/auth.js";
import { sendPasswordResetEmail } from "../email.js";
import { hashToken, issueResetToken, resolveAppUrl } from "../passwordReset.js";

const router = Router();

const toUser = (u) => ({
  id: u.id, name: u.name, email: u.email, roleId: u.role_id,
  status: u.status, lastLogin: u.last_login, createdDate: u.created_date,
});
const toRole = (r) => ({ id: r.id, name: r.name, description: r.description });

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

  db.prepare("UPDATE users SET last_login = ? WHERE id = ?").run(nowISO(), user.id);

  const role = db.prepare("SELECT * FROM roles WHERE id = ?").get(user.role_id);
  setAuthCookie(res, signToken(user));

  res.json({
    user: { ...toUser(user), lastLogin: nowISO() },
    role: toRole(role),
  });
});

router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
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
  res.json({ user: toUser(user), role: toRole(role) });
});

export default router;
