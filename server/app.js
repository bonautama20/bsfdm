// Builds the Express app (middleware + all routes) without starting it —
// kept separate from index.js so tests can import `app` and drive it with a
// real HTTP client on an ephemeral port, instead of re-implementing/mocking
// the route wiring. index.js is the only thing that calls `.listen()` and
// schedules the production backup timer.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { requireAuth } from "./middleware/auth.js";

import authRouter from "./routes/auth.js";
import racksRouter from "./routes/racks.js";
import hotelsRouter from "./routes/hotels.js";
import vendorsRouter from "./routes/vendors.js";
import employeesRouter from "./routes/employees.js";
import usersRouter from "./routes/users.js";
import productionLogsRouter from "./routes/productionLogs.js";
import miscRouter from "./routes/misc.js";
import communityPublicRouter from "./routes/communityPublic.js";
import communitiesRouter from "./routes/communities.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const isProd = process.env.NODE_ENV === "production";
const distPath = path.join(__dirname, "..", "client", "dist");
const servesOwnFrontend = fs.existsSync(distPath);

const app = express();

// A crash inside a route handler used to leave a raw Express stack trace (with
// file paths) visible to the client (see the ID-collision bug this actually
// hit during testing) and left the process's exit behavior to chance. These
// two are the last line of defense for whatever the try/catch blocks in
// individual routes miss.
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught exception — exiting so the process manager/host can restart cleanly:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled promise rejection:", reason);
});

// Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.).
// CSP is left off for now — the app relies on inline <style> blocks and
// inline style={{}} throughout, so helmet's default CSP would break it
// without real tuning; the other headers are still worth having as-is.
app.use(helmet({ contentSecurityPolicy: false }));

// Comma-separated list of allowed origins, e.g. "https://app.example.com,https://admin.example.com".
// Required in production ONLY when the frontend is deployed separately from
// this API (no client/dist here to serve) — same-origin requests never need
// CORS headers at all, so a single-host deployment can safely skip this.
// `credentials: true` is required whenever it IS set, so the httpOnly auth
// cookie can be sent cross-origin.
const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()).filter(Boolean);
if (isProd && !allowedOrigins?.length && !servesOwnFrontend) {
  console.error(
    "[server] CORS_ORIGIN is required in production when the API is deployed separately from the " +
    "frontend (no client/dist build found next to server/). Reflecting any origin back with " +
    "credentials enabled would let any website read this API as a logged-in user. Set CORS_ORIGIN " +
    "in server/.env to your frontend's origin(s), e.g. https://app.example.com."
  );
  process.exit(1);
}
if (allowedOrigins?.length) {
  app.use(cors({ origin: allowedOrigins, credentials: true }));
} else if (!isProd) {
  // Local/demo convenience only — reflects any origin. Never used in
  // production: either CORS_ORIGIN is set above, or (single-host deploy)
  // no cross-origin support is needed or granted at all.
  app.use(cors({ origin: true, credentials: true }));
}
app.use(express.json());
app.use(cookieParser());

// Lightweight CSRF defense for the cookie-based session, production only.
// CORS lockdown above stops a cross-origin fetch()/JSON request, but a plain
// HTML <form method="POST" enctype="text/plain"> from an attacker's page
// skips CORS preflight entirely and still reaches the server with the
// victim's cookie attached — this catches that. Origin/Referer can't be
// spoofed by page script, so a mismatch is a reliable signal; their absence
// is let through rather than blocked, since some legitimate non-browser
// clients (health checks, future server-to-server calls) don't send either.
if (isProd) {
  const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
  app.use("/api", (req, res, next) => {
    if (!MUTATING_METHODS.has(req.method)) return next();
    const origin = req.get("origin") || req.get("referer");
    if (!origin) return next();
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      return res.status(403).json({ error: "Request blocked: invalid Origin." });
    }
    const isSameHost = originHost === req.get("host");
    const isAllowedCrossOrigin = allowedOrigins?.some((o) => {
      try { return new URL(o).host === originHost; } catch { return false; }
    });
    if (isSameHost || isAllowedCrossOrigin) return next();
    return res.status(403).json({ error: "Cross-origin request blocked." });
  });
}

app.get("/api/health", (req, res) => {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  res.json({ ok: true, users: count });
});

app.use("/api/auth", authRouter);

// Public read-only community directory (landing page map + list) — no phone
// numbers, no auth required. Must stay mounted before requireAuth below.
app.use("/api/community", communityPublicRouter);

// Every other /api route requires a valid session from here on.
app.use("/api", requireAuth);

app.use("/api/racks", racksRouter);
app.use("/api/hotels", hotelsRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/users", usersRouter);
app.use("/api/communities", communitiesRouter);
app.use("/api", productionLogsRouter);
app.use("/api", miscRouter);

// In production, optionally serve the built frontend (npm run build, which
// outputs to client/dist) from this same process, so a single deployment
// target (one Node server, one port) can host both the API and the app.
// Skipped if client/dist hasn't been built.
if (isProd && servesOwnFrontend) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  console.log("[server] Serving built frontend from client/dist");
}

// Catches anything a route handler throws (sync) or passes to next(err),
// instead of falling through to Express's default handler — which used to
// dump a full stack trace (with local file paths) straight into the HTTP
// response. Must be the last app.use().
app.use((err, req, res, next) => {
  console.error(`[server] Error handling ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: isProd ? "Something went wrong. Please try again." : err.message });
});

export default app;
