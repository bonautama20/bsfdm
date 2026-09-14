// Manual plan upgrade/downgrade — there's no payment gateway yet (see the
// multi-tenant plan), so moving an org from free to paid today is: the
// customer pays off-platform (QRIS/bank transfer/e-wallet — see
// client/src/data/paymentConfig.js) and clicks "Saya Sudah Bayar" on
// /dashboard/upgrade, which shows up here as a pending request. `node
// set-org-plan.js` with no args lists every org, its plan, and any pending
// upgrade requests so you can find the right id first.
//
// Usage:
//   node set-org-plan.js                       list orgs + pending upgrade requests
//   node set-org-plan.js <org-id> <free|paid>   change one organization's plan
import { db, nowISO } from "./db.js";

const [orgId, plan] = process.argv.slice(2);

function listOrgs() {
  const orgs = db.prepare("SELECT id, name, slug, plan, status, created_at FROM organizations ORDER BY created_at").all();
  if (orgs.length === 0) {
    console.log("No organizations yet.");
  } else {
    console.log(`${"ID".padEnd(14)}${"PLAN".padEnd(8)}${"STATUS".padEnd(12)}NAME`);
    for (const o of orgs) {
      console.log(`${o.id.padEnd(14)}${o.plan.padEnd(8)}${o.status.padEnd(12)}${o.name}`);
    }
  }

  const pending = db.prepare(`
    SELECT ur.id AS request_id, ur.org_id, ur.note, ur.created_at, o.name AS org_name
    FROM upgrade_requests ur JOIN organizations o ON o.id = ur.org_id
    WHERE ur.status = 'pending' ORDER BY ur.created_at
  `).all();
  console.log(`\nPending upgrade requests: ${pending.length === 0 ? "none" : ""}`);
  for (const r of pending) {
    console.log(`  ${r.org_id.padEnd(14)} ${r.org_name} — requested ${r.created_at}${r.note ? ` — note: "${r.note}"` : ""}`);
  }
  if (pending.length > 0) {
    console.log(`\nRun \`node set-org-plan.js <org-id> paid\` to approve one — it also marks the matching request resolved.`);
  }
}

if (!orgId) {
  listOrgs();
  process.exit(0);
}

if (plan !== "free" && plan !== "paid") {
  console.error(`Usage: node set-org-plan.js <org-id> <free|paid>\nGot plan: ${JSON.stringify(plan)}`);
  process.exit(1);
}

const org = db.prepare("SELECT * FROM organizations WHERE id = ?").get(orgId);
if (!org) {
  console.error(`No organization found with id ${orgId}. Run with no arguments to list all organizations.`);
  process.exit(1);
}

db.prepare("UPDATE organizations SET plan = ? WHERE id = ?").run(plan, orgId);
console.log(`[set-org-plan] ${org.name} (${orgId}): ${org.plan} -> ${plan}`);
console.log("The change takes effect on that org's next API request — no re-login needed (the plan is looked up live, not baked into the session token).");

if (plan === "paid") {
  const result = db.prepare(
    "UPDATE upgrade_requests SET status = 'approved', resolved_at = ? WHERE org_id = ? AND status = 'pending'"
  ).run(nowISO(), orgId);
  if (result.changes > 0) {
    console.log(`Resolved ${result.changes} pending upgrade request(s) for this organization.`);
  }
}
