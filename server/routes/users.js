import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { db, nowISO } from "../db.js";
import { requireRole, requirePlatformOwner } from "../middleware/auth.js";
import { requirePlan } from "../middleware/plan.js";
import { validateBody, validate } from "../validate.js";
import { issueResetToken, resolveAppUrl } from "../passwordReset.js";
import { sendWelcomeEmail } from "../email.js";

const router = Router();
// Team/role management lives on the Settings page, which is paid-only — see
// the multi-tenant plan's Phase 3. A free org stays single-user.
router.use(requirePlan("Setting"));

// User accounts and role permissions are the highest-blast-radius data in the
// app (they control who can do what) — restrict mutations to the two
// highest-standing roles, Owner and Super Admin (equal standing — see
// client/src/data/dummyData.js's roles list).
const requireOwnerOrSuperAdmin = requireRole("role-owner", "role-super-admin");

// role_permissions has no org_id (it's a shared template across every
// tenant for now — see the multi-tenant plan's scope cut), so letting any
// org's Super Admin edit it would let one company silently change every
// other company's permission matrix. requirePlatformOwner (middleware/auth.js)
// restricts that to PLATFORM_OWNER_ORG_ID only; every org can still read it
// (GET /roles/all is unrestricted).

const toUser = (u) => ({
  id: u.id, name: u.name, email: u.email, roleId: u.role_id,
  status: u.status, lastLogin: u.last_login, createdDate: u.created_date,
});

const toRole = (r) => ({ id: r.id, name: r.name, description: r.description });

const userSchema = {
  name: { maxLength: 200 },
  email: { maxLength: 200, email: true },
  roleId: { maxLength: 100 },
};

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM users WHERE org_id = ? ORDER BY rowid").all(req.auth.orgId).map(toUser));
});

function nextUserId() {
  const { maxNum } = db.prepare(
    "SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) AS maxNum FROM users"
  ).get();
  return `USR-${String((maxNum || 0) + 1).padStart(2, "0")}`;
}

// Creates the account with a random, never-shown password, then emails the
// user a link (the same reset-password page "forgot password" uses) to set
// their own — no temp password ever passes through an admin's screen, an
// alert() dialog, or this response.
async function createUserAndSendWelcome({ orgId, name, email, roleId, status }, req) {
  const id = nextUserId();
  const unusablePassword = bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10);
  db.prepare(
    "INSERT INTO users (id, org_id, name, email, password, role_id, status, last_login, created_date) VALUES (?,?,?,?,?,?,?,NULL,?)"
  ).run(id, orgId, name, email, unusablePassword, roleId, status || "Active", nowISO().slice(0, 10));

  const rawToken = issueResetToken(id);
  const setupUrl = `${resolveAppUrl(req)}/reset-password?token=${rawToken}`;
  try {
    await sendWelcomeEmail(email, name, setupUrl);
  } catch (err) {
    console.error(`[users] Failed to send welcome email to ${email}: ${err.message}`);
    // The account still exists — an admin can trigger another email via
    // POST /:id/send-password-reset below if delivery failed.
  }
  return id;
}

router.post(
  "/",
  requireOwnerOrSuperAdmin,
  validateBody({ ...userSchema, name: { ...userSchema.name, required: true }, email: { ...userSchema.email, required: true }, roleId: { ...userSchema.roleId, required: true } }),
  async (req, res) => {
    const { name, email, roleId, status } = req.body || {};
    // Email is unique across the whole platform, not just this org (one
    // email = one account, see the multi-tenant plan) — the UNIQUE
    // constraint would catch this too, but checking first gives a clean
    // 409 instead of a raw constraint-violation error.
    const dup = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email.trim());
    if (dup) return res.status(409).json({ error: "A user with this email already exists." });

    const id = await createUserAndSendWelcome({ orgId: req.auth.orgId, name, email: email.trim(), roleId, status }, req);
    res.status(201).json(toUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id)));
  }
);

// Bulk import — mirrors communities.js's /bulk: the client parses the
// uploaded Excel file itself and posts the resulting rows as plain JSON.
router.post("/bulk", requireOwnerOrSuperAdmin, async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  if (rows.length === 0) return res.status(400).json({ error: "No rows to import." });

  const seenEmails = new Set(
    db.prepare("SELECT lower(email) AS e FROM users").all().map((r) => r.e)
  );
  const inserted = [];
  const skipped = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = (r.name || "").toString().trim();
    const email = (r.email || "").toString().trim();
    const roleId = (r.roleId || "").toString().trim();

    const errors = validate({ name, email, roleId }, {
      ...userSchema,
      name: { ...userSchema.name, required: true },
      email: { ...userSchema.email, required: true },
      roleId: { ...userSchema.roleId, required: true },
    });
    if (errors.length > 0) { skipped.push({ row: i + 1, reason: errors[0] }); continue; }
    if (seenEmails.has(email.toLowerCase())) { skipped.push({ row: i + 1, reason: `${email} already has an account.` }); continue; }
    if (!db.prepare("SELECT id FROM roles WHERE id = ?").get(roleId)) { skipped.push({ row: i + 1, reason: `Unknown role "${roleId}".` }); continue; }

    seenEmails.add(email.toLowerCase());
    const id = await createUserAndSendWelcome({ orgId: req.auth.orgId, name, email, roleId, status: (r.status || "Active").toString().trim() }, req);
    inserted.push(id);
  }

  res.status(201).json({ insertedCount: inserted.length, skipped });
});

// Admin-triggered "set/reset your password" email for an existing user —
// replaces the old flow where the admin generated a temp password in the
// browser and read it back via alert().
router.post("/:id/send-password-reset", requireOwnerOrSuperAdmin, async (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ? AND org_id = ?").get(req.params.id, req.auth.orgId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const rawToken = issueResetToken(user.id);
  const setupUrl = `${resolveAppUrl(req)}/reset-password?token=${rawToken}`;
  await sendWelcomeEmail(user.email, user.name, setupUrl);
  res.json({ message: `A password setup link has been sent to ${user.email}.` });
});

router.patch("/:id", requireOwnerOrSuperAdmin, validateBody(userSchema), (req, res) => {
  const existing = db.prepare("SELECT * FROM users WHERE id = ? AND org_id = ?").get(req.params.id, req.auth.orgId);
  if (!existing) return res.status(404).json({ error: "User not found." });

  const b = req.body || {};
  const hashedPassword = b.password ? bcrypt.hashSync(b.password, 10) : null;
  db.prepare("UPDATE users SET name=?, email=?, role_id=?, status=?, password=COALESCE(?, password) WHERE id=?").run(
    b.name ?? existing.name, b.email ?? existing.email, b.roleId ?? existing.role_id,
    b.status ?? existing.status, hashedPassword, req.params.id
  );
  res.json(toUser(db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id)));
});

router.delete("/:id", requireOwnerOrSuperAdmin, (req, res) => {
  const result = db.prepare("DELETE FROM users WHERE id = ? AND org_id = ?").run(req.params.id, req.auth.orgId);
  if (result.changes === 0) return res.status(404).json({ error: "User not found." });
  res.status(204).end();
});

// Shared global template across every org for now — see requirePlatformOwner.
router.get("/roles/all", (req, res) => {
  const roles = db.prepare("SELECT * FROM roles ORDER BY rowid").all();
  const perms = db.prepare("SELECT * FROM role_permissions").all();
  res.json(
    roles.map((r) => ({
      ...toRole(r),
      permissions: perms
        .filter((p) => p.role_id === r.id)
        .reduce((acc, p) => {
          acc[p.module] = {
            view: !!p.can_view, create: !!p.can_create, edit: !!p.can_edit,
            delete: !!p.can_delete, export: !!p.can_export, approve: !!p.can_approve,
          };
          return acc;
        }, {}),
    }))
  );
});

router.patch("/roles/:roleId/permissions", requireOwnerOrSuperAdmin, requirePlatformOwner, (req, res) => {
  const { module, action, value } = req.body || {};
  const validActions = ["view", "create", "edit", "delete", "export", "approve"];
  if (!module || !validActions.includes(action)) {
    return res.status(400).json({ error: "module and a valid action are required." });
  }
  const column = `can_${action}`;
  const existing = db.prepare("SELECT * FROM role_permissions WHERE role_id = ? AND module = ?").get(req.params.roleId, module);
  if (existing) {
    db.prepare(`UPDATE role_permissions SET ${column} = ? WHERE role_id = ? AND module = ?`).run(value ? 1 : 0, req.params.roleId, module);
  } else {
    db.prepare(
      `INSERT INTO role_permissions (role_id, module, ${column}) VALUES (?,?,?)`
    ).run(req.params.roleId, module, value ? 1 : 0);
  }
  res.json({ ok: true });
});

export default router;
