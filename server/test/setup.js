// Loaded via `node --import ./test/setup.js --test ...` (see package.json's
// "test" script), BEFORE any test file (and therefore before app.js/db.js)
// is imported — so these env vars are already in place when db.js reads
// process.env.DB_PATH at module load time. Without this, tests would run
// against server/data/bsfdm.sqlite3, the real local dev/demo database.
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Node's test runner runs each *.test.js file as its own process, and this
// setup module is (re-)loaded once per process (`--import` applies per
// file) — so a single shared DB_PATH would have two node:sqlite processes
// opening/seeding the same file at once ("database is locked"). Each process
// gets its own file instead, named after its PID. Individual test files are
// responsible for deleting their own copy in an `after()` hook (see
// test/helpers.js's startTestServer) — cleaning up here in setup.js would
// risk racing a sibling process that's mid-run against the same glob.
process.env.DB_PATH = path.join(__dirname, `test.${process.pid}.sqlite3`);
process.env.JWT_SECRET = "test-only-secret-do-not-use-in-production";
