import React, { useEffect, useState } from "react";
import { Building2, Users, CheckCircle2, Gift, Clock, Power, Trash2 } from "lucide-react";
import { api } from "../../api/client.js";
import DataTable from "../../components/ui/DataTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtDate, fmtDateTime, fmtNumber } from "../../utils/format.js";

export default function PlatformAdmin() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyOrgId, setBusyOrgId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // org object, or null
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get("/platform/stats").then(setData).catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const togglePlan = async (org) => {
    const nextPlan = org.plan === "paid" ? "free" : "paid";
    setBusyOrgId(org.id);
    try {
      await api.post(`/platform/organizations/${org.id}/plan`, { plan: nextPlan });
      load();
    } catch (err) {
      alert(err.message || t("platform.failedUpdatePlan"));
    } finally {
      setBusyOrgId(null);
    }
  };

  const toggleStatus = async (org) => {
    const nextStatus = org.status === "suspended" ? "active" : "suspended";
    setBusyOrgId(org.id);
    try {
      await api.post(`/platform/organizations/${org.id}/status`, { status: nextStatus });
      load();
    } catch (err) {
      alert(err.message || t("platform.failedUpdateStatus"));
    } finally {
      setBusyOrgId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/platform/organizations/${deleteTarget.id}`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      alert(err.message || t("platform.failedDeleteOrg"));
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div>
        <div className="db-content-header"><h1>{t("platform.title")}</h1></div>
        <div className="db-card"><p style={{ color: "var(--db-danger)" }}>{error}</p></div>
      </div>
    );
  }

  const columns = [
    { key: "name", label: t("platform.colOrganization"), sortable: true, render: (o) => (
      <div>
        <div style={{ fontWeight: 700 }}>{o.name}</div>
        <div style={{ fontSize: ".78rem", color: "var(--db-muted)" }}>{o.slug}</div>
      </div>
    ) },
    { key: "ownerEmail", label: t("platform.colEmail"), sortable: true, render: (o) => o.ownerEmail || "—" },
    { key: "plan", label: t("platform.colPlan"), sortable: true, render: (o) => (
      <Badge tone={o.plan === "paid" ? "green" : "gray"}>{o.plan === "paid" ? t("platform.paid") : t("platform.free")}</Badge>
    ) },
    { key: "status", label: t("platform.colStatus"), sortable: true, render: (o) => (
      <Badge tone={o.status === "suspended" ? "red" : "green"}>{o.status === "suspended" ? t("platform.suspended") : t("platform.active")}</Badge>
    ) },
    { key: "userCount", label: t("platform.colUsers"), sortable: true, sortValue: (o) => o.userCount },
    { key: "createdAt", label: t("platform.colCreated"), sortable: true, render: (o) => fmtDateTime(o.createdAt) },
    { key: "pendingUpgradeRequest", label: t("platform.colUpgradeRequest"), render: (o) => (
      o.pendingUpgradeRequest ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--db-warning)" }}>
          <Clock size={14} />
          <span style={{ fontSize: ".82rem" }}>{fmtDate(o.pendingUpgradeRequest.createdAt)}{o.pendingUpgradeRequest.note ? ` — ${o.pendingUpgradeRequest.note}` : ""}</span>
        </div>
      ) : <span style={{ color: "var(--db-muted)" }}>—</span>
    ) },
    { key: "actions", label: "", render: (o) => {
      // The platform owner's own organization can't be suspended or deleted
      // (see routes/platform.js) — hide those actions here too, rather than
      // let a click round-trip to the server just to bounce off a 400.
      const isSelf = o.id === session?.organization?.id;
      return (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className={`db-btn db-btn-sm ${o.plan === "paid" ? "db-btn-outline" : "db-btn-primary"}`}
            disabled={busyOrgId === o.id}
            onClick={() => togglePlan(o)}
          >
            {o.plan === "paid" ? t("platform.downgradeToFree") : t("platform.upgradeToPaid")}
          </button>
          {!isSelf && (
            <>
              <button
                className="db-btn db-btn-ghost db-btn-sm"
                title={o.status === "suspended" ? t("platform.activate") : t("platform.suspend")}
                disabled={busyOrgId === o.id}
                onClick={() => toggleStatus(o)}
              >
                <Power size={13} />
              </button>
              <button
                className="db-btn db-btn-ghost db-btn-sm"
                title={t("common.delete")}
                disabled={busyOrgId === o.id}
                onClick={() => setDeleteTarget(o)}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      );
    } },
  ];

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("platform.title")}</h1>
        <p>{t("platform.subtitle")}</p>
      </div>

      {data && (
        <div className="db-grid-4" style={{ marginBottom: 24 }}>
          <div className="db-card">
            <div style={{ color: "var(--db-accent)", marginBottom: 8 }}><Building2 size={20} /></div>
            <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("platform.kpiOrganizations")}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{fmtNumber(data.totals.organizations)}</div>
          </div>
          <div className="db-card">
            <div style={{ color: "var(--db-success)", marginBottom: 8 }}><CheckCircle2 size={20} /></div>
            <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("platform.kpiPaid")}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{fmtNumber(data.totals.paid)}</div>
          </div>
          <div className="db-card">
            <div style={{ color: "var(--db-muted)", marginBottom: 8 }}><Gift size={20} /></div>
            <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("platform.kpiFree")}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{fmtNumber(data.totals.free)}</div>
          </div>
          <div className="db-card">
            <div style={{ color: "var(--db-info)", marginBottom: 8 }}><Users size={20} /></div>
            <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("platform.kpiUsers")}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{fmtNumber(data.totals.users)}</div>
          </div>
        </div>
      )}

      <div className="db-card">
        {data && <DataTable columns={columns} rows={data.organizations} pageSize={10} />}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title={t("platform.deleteOrgTitle")}
        message={t("platform.deleteOrgMessage", { name: deleteTarget?.name || "" })}
      />
    </div>
  );
}
