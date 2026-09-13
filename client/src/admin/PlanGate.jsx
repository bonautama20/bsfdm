import React from "react";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { isModuleLocked } from "../data/planModules.js";

// Wraps a dashboard route that requires a paid plan. Renders the real page
// for a paid org (or a module the free plan already includes); renders an
// upgrade panel instead for a free org — covers direct URL/bookmark access,
// not just clicking a locked sidebar item (Sidebar.jsx still navigates
// there normally; this is what actually stops the page from rendering).
// The server enforces the same rule independently (see
// server/middleware/plan.js) — this is a UX nicety, not the security
// boundary, so a determined user hitting the API directly still gets 402.
export default function PlanGate({ module, children }) {
  const { session } = useAuth();
  const { t } = useLanguage();

  if (!isModuleLocked(module, session?.organization?.plan)) return children;

  return (
    <div className="db-card" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center", padding: "40px 32px" }}>
      <div className="db-empty ic" style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--db-canvas)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "var(--db-accent)" }}>
        <Lock size={24} />
      </div>
      <h3 style={{ fontSize: "1.15rem", marginBottom: 8 }}>{t("plan.upgradeTitle")}</h3>
      <p style={{ color: "var(--db-muted)", fontSize: ".9rem", lineHeight: 1.6 }}>{t("plan.upgradeDesc")}</p>
    </div>
  );
}
