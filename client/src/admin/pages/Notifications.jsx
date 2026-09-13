import React, { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const TIMING_OPTIONS = ["Same day", "1 day before", "3 days before", "7 days before", "Custom"];

function Switch({ checked, onChange }) {
  return (
    <label className="db-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider" />
    </label>
  );
}

export default function Notifications() {
  const { t } = useLanguage();
  const [types, setTypes] = useState([]);
  const [quietEnabled, setQuietEnabled] = useState(true);
  const [quietFrom, setQuietFrom] = useState("21:00");
  const [quietTo, setQuietTo] = useState("06:00");

  useEffect(() => {
    api.get("/notification-settings").then(setTypes).catch(() => {});
    api.get("/app-settings/quiet-hours").then((v) => {
      if (v) { setQuietEnabled(v.enabled); setQuietFrom(v.from); setQuietTo(v.to); }
    }).catch(() => {});
  }, []);

  const update = async (id, patch) => {
    setTypes((prev) => prev.map((nt) => nt.id === id ? { ...nt, ...patch } : nt));
    try {
      await api.patch(`/notification-settings/${id}`, patch);
    } catch (err) {
      alert(err.message || t("notifications.failedUpdate"));
    }
  };

  const saveQuietHours = async (patch) => {
    const next = { enabled: quietEnabled, from: quietFrom, to: quietTo, ...patch };
    setQuietEnabled(next.enabled); setQuietFrom(next.from); setQuietTo(next.to);
    try {
      await api.put("/app-settings/quiet-hours", next);
    } catch (err) {
      alert(err.message || t("notifications.failedSaveQuietHours"));
    }
  };

  const timingLabel = (timing) => {
    const key = `timing.${timing}`;
    const label = t(key);
    return label === key ? timing : label;
  };

  const typeLabel = (label) => {
    const key = `notifType.${label}`;
    const translated = t(key);
    return translated === key ? label : translated;
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("notifications.title")}</h1>
        <p>{t("notifications.subtitle")}</p>
      </div>

      <div className="db-card" style={{ marginBottom: 20 }}>
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr>
                <th>{t("notifications.colType")}</th>
                <th>{t("notifications.colInApp")}</th>
                <th>{t("notifications.colEmail")}</th>
                <th>{t("notifications.colWhatsapp")}</th>
                <th>{t("notifications.colTiming")}</th>
              </tr>
            </thead>
            <tbody>
              {types.map((nt) => (
                <tr key={nt.id}>
                  <td style={{ fontWeight: 700 }}>{typeLabel(nt.label)}</td>
                  <td><Switch checked={nt.inApp} onChange={() => update(nt.id, { inApp: !nt.inApp })} /></td>
                  <td><Switch checked={nt.email} onChange={() => update(nt.id, { email: !nt.email })} /></td>
                  <td><Switch checked={nt.whatsapp} onChange={() => update(nt.id, { whatsapp: !nt.whatsapp })} /></td>
                  <td>
                    <select className="db-select" value={nt.timing} onChange={(e) => update(nt.id, { timing: e.target.value })}>
                      {TIMING_OPTIONS.map((o) => <option key={o} value={o}>{timingLabel(o)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: ".76rem", marginTop: 12, color: "var(--db-muted)" }}>
          {t("notifications.whatsappNote")}
        </p>
      </div>

      <div className="db-card">
        <div className="db-card-head">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><Moon size={17} /> {t("notifications.quietHours")}</h3>
            <div className="sub">{t("notifications.quietHoursSubtitle")}</div>
          </div>
          <Switch checked={quietEnabled} onChange={() => saveQuietHours({ enabled: !quietEnabled })} />
        </div>
        {quietEnabled && (
          <div className="db-field-row" style={{ maxWidth: 420 }}>
            <div className="db-field"><label>{t("notifications.from")}</label><input type="time" value={quietFrom} onChange={(e) => saveQuietHours({ from: e.target.value })} /></div>
            <div className="db-field"><label>{t("notifications.to")}</label><input type="time" value={quietTo} onChange={(e) => saveQuietHours({ to: e.target.value })} /></div>
          </div>
        )}
        <p style={{ fontSize: ".8rem" }}>
          {t("notifications.quietHoursNote")}
        </p>
      </div>
    </div>
  );
}
