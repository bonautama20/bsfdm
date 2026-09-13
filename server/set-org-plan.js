// Manual plan upgrade/downgrade — there's no payment gateway yet (see the
// multi-tenant plan), so moving an org from free to paid today is: the
// customer pays off-platform (bank transfer, etc.), then an operator runs
// this once. `node set-org-plan.js` with no args lists every org and its
// current plan so you can find the right id first.
//
// Usage:
//   node set-org-plan.js                       list every organization
//   node set-org-plan.js <org-id> <free|paid>   change one organization's plan
import { db } from "./db.js";

const [orgId, plan] = process.argv.slice(2);

function listOrgs() {
  const orgs = db.prepare("SELECT id, name, slug, plan, status, created_at FROM organizations ORDER BY created_at").all();
  if (orgs.length === 0) {
    console.log("No organizations yet.");
    return;
  }
  console.log(`${"ID".padEnd(14)}${"PLAN".padEnd(8)}${"STATUS".padEnd(12)}NAME`);
  for (const o of orgs) {
    console.log(`${o.id.padEnd(14)}${o.plan.padEnd(8)}${o.status.padEnd(12)}${o.name}`);
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
