import React, { useEffect, useState } from "react";
import { Building2, Wallet, QrCode, MessageCircle, CheckCircle2, Clock, Lock, Check } from "lucide-react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { paymentConfig } from "../../data/paymentConfig.js";

// Mirrors the sidebar's own item list (client/src/admin/components/Sidebar.jsx)
// — Production is the one module free orgs already have.
const FREE_FEATURE_KEYS = ["sidebar.production"];
const PAID_ONLY_FEATURE_KEYS = [
  "sidebar.calendar", "sidebar.client", "sidebar.vendor", "sidebar.community",
  "sidebar.report", "sidebar.notification", "sidebar.setting",
];

export default function Upgrade() {
  const { session } = useAuth();
  const { t } = useLanguage();
  const [status, setStatus] = useState(undefined); // undefined = loading, null = none yet
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/billing/upgrade-request/status").then(setStatus).catch(() => setStatus(null));
  }, []);

  const isPaid = session?.organization?.plan === "paid";
  const isPending = status?.status === "pending";

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/billing/upgrade-request", { note: note.trim() });
      setStatus(res);
    } catch (err) {
      setError(err.message || t("upgrade.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("upgrade.title")}</h1>
        <p>{t("upgrade.subtitle")}</p>
      </div>

      {isPaid ? (
        <div className="db-card" style={{ textAlign: "center", padding: "40px 32px" }}>
          <CheckCircle2 size={40} color="var(--db-success)" style={{ marginBottom: 12 }} />
          <h3>{t("upgrade.alreadyPaidTitle")}</h3>
          <p style={{ color: "var(--db-muted)", marginTop: 6 }}>{t("upgrade.alreadyPaidDesc")}</p>
        </div>
      ) : (
        <div className="db-grid-2">
          <div className="db-card">
            <div className="db-card-head">
              <h3>{t("upgrade.comparisonTitle")}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FREE_FEATURE_KEYS.map((key) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Check size={16} color="var(--db-success)" />
                  <span>{t(key)}</span>
                </div>
              ))}
              {PAID_ONLY_FEATURE_KEYS.map((key) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--db-muted)" }}>
                  <Lock size={14} />
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--db-line)", fontWeight: 700 }}>
              {paymentConfig.priceLabel}
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-head">
              <h3>{t("upgrade.paymentMethodsTitle")}</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Building2 size={18} color="var(--db-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{t("upgrade.bankTransfer")}</div>
                  <div style={{ fontSize: ".88rem", color: "var(--db-muted)" }}>
                    {paymentConfig.bankTransfer.bankName} — {paymentConfig.bankTransfer.accountNumber}
                    <br />
                    a.n. {paymentConfig.bankTransfer.accountHolder}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Wallet size={18} color="var(--db-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{paymentConfig.eWallet.provider}</div>
                  <div style={{ fontSize: ".88rem", color: "var(--db-muted)" }}>
                    {paymentConfig.eWallet.number}
                    <br />
                    a.n. {paymentConfig.eWallet.accountHolder}
                  </div>
                </div>
              </div>

              {paymentConfig.qrisImageUrl && (
                <div style={{ display: "flex", gap: 12 }}>
                  <QrCode size={18} color="var(--db-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>QRIS</div>
                    <img src={paymentConfig.qrisImageUrl} alt="QRIS" style={{ width: 180, borderRadius: 8, border: "1px solid var(--db-line)" }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--db-line)" }}>
              {isPending ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--db-warning)" }}>
                  <Clock size={16} />
                  <span style={{ fontWeight: 700 }}>{t("upgrade.pendingConfirmation")}</span>
                </div>
              ) : status === undefined ? null : (
                <>
                  <label style={{ display: "block", fontSize: ".82rem", fontWeight: 700, marginBottom: 8 }}>
                    {t("upgrade.noteLabel")}
                  </label>
                  <textarea
                    className="db-input"
                    style={{ width: "100%", minHeight: 70, marginBottom: 12, resize: "vertical" }}
                    placeholder={t("upgrade.notePlaceholder")}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  {error && <div style={{ color: "var(--db-danger)", fontSize: ".84rem", marginBottom: 10 }}>{error}</div>}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="db-btn db-btn-primary" onClick={handleSubmit} disabled={submitting}>
                      <CheckCircle2 size={15} /> {submitting ? t("upgrade.submitting") : t("upgrade.confirmButton")}
                    </button>
                    {paymentConfig.whatsappNumber && (
                      <a
                        className="db-btn db-btn-outline"
                        href={`https://wa.me/${paymentConfig.whatsappNumber}?text=${encodeURIComponent(
                          t("upgrade.whatsappMessage", { org: session?.organization?.name || "" })
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle size={15} /> {t("upgrade.whatsappButton")}
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
