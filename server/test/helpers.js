// Minimal fetch-based HTTP client + cookie jar for hitting `app` on a real
// ephemeral port — no supertest/etc. dependency needed for what these tests
// check.
import fs from "node:fs";
import app from "../app.js";

export async function startTestServer() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

// Removes this process's own SQLite test file(s) (see test/setup.js — one
// control db + one tenant-db directory per process, named by PID) — call
// from an `after()` hook alongside `server.close()`. Also removes the
// WAL/SHM sidecar files SQLite leaves next to the main file (a plain
// rmSync of DB_PATH alone doesn't touch those).
export function cleanupTestDb() {
  if (process.env.DB_PATH) {
    for (const suffix of ["", "-wal", "-shm"]) {
      fs.rmSync(`${process.env.DB_PATH}${suffix}`, { force: true });
    }
  }
  if (process.env.TENANT_DB_DIR) {
    fs.rmSync(process.env.TENANT_DB_DIR, { force: true, recursive: true });
  }
}

export function makeClient(baseUrl) {
  let cookie = "";
  const request = async (method, path, body) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
    return { status: res.status, body: json, raw: text };
  };
  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path) => request("DELETE", path),
    clearCookie: () => { cookie = ""; },
  };
}

export const SEEDED = {
  superAdmin: { email: "admin@bsfdm.com", password: "bsfdm123" },
  operator: { email: "andi@bsfdm.com", password: "operator123" },
  salesAdmin: { email: "rangga.pratama@bsfdm.com", password: "bsfdm123" },
};
