// Thin fetch wrapper for the BSFDM Express/SQLite backend (see server/).
// Defaults to the relative "/api" path, which works both in local dev (proxied
// to the backend by vite.config.js) and in production when the backend serves
// the built frontend from the same origin (see server/index.js). Set
// VITE_API_BASE only when the frontend and backend are deployed on different
// hosts/origins.
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // send the httpOnly auth cookie on every request
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let data = null;
    try {
      data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // response had no JSON body
    }
    const err = new Error(message);
    err.status = res.status;
    // Lets callers branch on structured fields a route attached to its error
    // response (e.g. plan.js's { upgradeRequired, limitReached }) without
    // string-matching the message.
    Object.assign(err, data || {});
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
