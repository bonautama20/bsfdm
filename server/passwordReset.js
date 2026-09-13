// Shared by both the self-service "forgot password" flow (routes/auth.js) and
// admin-triggered password setup/reset (routes/users.js) — one place that
// knows how a reset token is minted, hashed, and turned into a link.
import crypto from "node:crypto";
import { db, nowISO } from "./db.js";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

// One live token per user at a time — clears out anything previously issued.
export function issueResetToken(userId) {
  db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(userId);
  const rawToken = crypto.randomBytes(32).toString("base64url");
  db.prepare(
    "INSERT INTO password_resets (token_hash, user_id, expires_at, used, created_at) VALUES (?,?,?,0,?)"
  ).run(hashToken(rawToken), userId, new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString(), nowISO());
  return rawToken;
}

export function resolveAppUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:5173";
  // Single-host production deploy (frontend served by this same process) —
  // falls back to whatever origin the request actually came in on.
  return `${req.protocol}://${req.get("host")}`;
}
