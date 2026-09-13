// Thin entrypoint: builds on app.js (all middleware/routes, importable on its
// own by tests) and adds the two things that are only meaningful for a real
// running process — actually listening on a port, and the production backup
// timer.
import app, { isProd } from "./app.js";
import { runBackup } from "./backup.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[server] BSFDM API listening on http://localhost:${PORT}`);
});

// Daily in-process backup (see backup.js), production only — no value in
// repeatedly snapshotting disposable local dev/demo data. This timer resets
// on every restart, so on hosts that redeploy/restart often, also point an
// external cron/platform scheduler at `npm run backup` for a more reliable
// cadence — the two are complementary, not exclusive (pruning keeps only the
// most recent files either way).
if (isProd) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  runBackup();
  setInterval(runBackup, ONE_DAY_MS);
}
