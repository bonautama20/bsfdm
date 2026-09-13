// Generic SMTP email sending (works with Gmail, SendGrid, Mailgun, AWS SES,
// or any other provider's SMTP relay — no vendor-specific SDK needed).
// Configure via SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in
// server/.env. See server/.env.example.
import nodemailer from "nodemailer";

const isProd = process.env.NODE_ENV === "production";
const smtpConfigured = !!process.env.SMTP_HOST;

if (isProd && !smtpConfigured) {
  console.error(
    "[email] SMTP_HOST is not set — password reset emails will NOT be sent. Users won't be able to " +
    "self-reset their password until SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM are set in " +
    "server/.env (see server/.env.example). The app will keep running — this only disables that one feature."
  );
}

let transporter = null;
function getTransporter() {
  if (!smtpConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

async function send({ toEmail, subject, text, html, logLabel }) {
  const from = process.env.SMTP_FROM || "BSFDM <no-reply@bsfdm.local>";
  const t = getTransporter();
  if (!t) {
    // Dev/local fallback (or a misconfigured production instance — already
    // logged loudly above): never block the caller's flow on email delivery,
    // but make the link visible somewhere the developer can actually use it.
    console.warn(`[email] SMTP not configured — ${logLabel} for ${toEmail}:\n  ${text}`);
    return;
  }
  await t.sendMail({ from, to: toEmail, subject, text, html });
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  await send({
    toEmail,
    subject: "Reset your BSFDM password",
    text: `We received a request to reset your BSFDM password. Open this link to choose a new one ` +
      `(valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <p>We received a request to reset your BSFDM password.</p>
      <p><a href="${resetUrl}" style="background:#01613C;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Reset password</a></p>
      <p>Or paste this link into your browser (valid for 1 hour):<br>${resetUrl}</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    logLabel: "password reset link",
  });
}

// Sent when an admin creates an account (single or via bulk import) — the
// user never gets a temp password to read over an admin's shoulder or an
// alert() dialog; they set their own via the same reset-password page.
export async function sendWelcomeEmail(toEmail, name, setupUrl) {
  await send({
    toEmail,
    subject: "You've been added to BSFDM — set your password",
    text: `Hi ${name}, an account has been created for you on BSFDM. Open this link to set your password ` +
      `(valid for 1 hour):\n\n${setupUrl}\n\nIf you weren't expecting this, you can ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>An account has been created for you on BSFDM. Set your password to get started:</p>
      <p><a href="${setupUrl}" style="background:#01613C;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Set your password</a></p>
      <p>Or paste this link into your browser (valid for 1 hour):<br>${setupUrl}</p>
      <p>If you weren't expecting this, you can ignore this email.</p>
    `,
    logLabel: "account setup link",
  });
}
