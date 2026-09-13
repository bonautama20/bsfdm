import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, CheckCircle2, AlertTriangle, AlertOctagon, Info, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBiopond } from "../../context/BiopondContext.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import LanguageToggle from "../../components/ui/LanguageToggle.jsx";
import { systemAlerts } from "../../data/dummyData.js";

const initials = (name = "") => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const ALERT_ICON = { warning: AlertTriangle, danger: AlertOctagon, success: CheckCircle2, info: Info };
const ALERT_TONE = { warning: { bg: "#FEF3E2", fg: "#D97706" }, danger: { bg: "#FDECEC", fg: "#DC2626" }, success: { bg: "#E7F7ED", fg: "#16A34A" }, info: { bg: "#EAF1FE", fg: "#2563EB" } };

export default function Header({ onMenuToggle }) {
  const { session, logout } = useAuth();
  const { t, lang } = useLanguage();
  const { allBioponds } = useBiopond();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hotels, setHotels] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [maggotBatches, setMaggotBatches] = useState([]);
  const [salesTransactions, setSalesTransactions] = useState([]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    api.get("/hotels").then(setHotels).catch(() => {});
    api.get("/employees").then(setEmployees).catch(() => {});
    api.get("/maggot-batches").then(setMaggotBatches).catch(() => {});
    api.get("/sales-transactions").then(setSalesTransactions).catch(() => {});
  }, []);

  const searchIndex = useMemo(() => {
    const idx = [];
    hotels.forEach((h) => idx.push({ group: t("header.groupClients"), label: h.name, sub: h.address, to: "/dashboard/clients" }));
    employees.forEach((e) => idx.push({ group: t("header.groupEmployees"), label: e.name, sub: e.position, to: "/dashboard/settings" }));
    maggotBatches.forEach((b) => idx.push({ group: t("header.groupProductionBatches"), label: b.id, sub: `Biopond ${b.biopondId} · ${b.status}`, to: "/dashboard/production" }));
    allBioponds.forEach((b) => idx.push({ group: t("header.groupBioponds"), label: `Biopond ${b.number}`, sub: `${b.rackName} · ${b.status}`, to: "/dashboard/production" }));
    salesTransactions.forEach((s) => idx.push({ group: t("header.groupSalesTransactions"), label: s.id, sub: `${s.customer} · ${s.product}`, to: "/dashboard/reports" }));
    return idx;
  }, [allBioponds, hotels, employees, maggotBatches, salesTransactions, t]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchIndex.filter((r) => r.label.toLowerCase().includes(q) || r.sub?.toLowerCase().includes(q)).slice(0, 8);
  }, [query, searchIndex]);

  const locale = lang === "id" ? "id-ID" : "en-US";
  const dateStr = now.toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="db-header">
      <button className="menu-toggle" onClick={onMenuToggle} aria-label={t("header.openMenu")}><Menu size={22} /></button>

      <div className="db-search">
        <Search size={16} />
        <input
          placeholder={t("header.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setQuery(""), 150)}
        />
        {results.length > 0 && (
          <div className="db-dropdown" style={{ left: 0, right: "auto", width: 380 }}>
            <div className="db-dropdown-list">
              {results.map((r, i) => (
                <div key={i} className="db-dropdown-item" style={{ cursor: "pointer" }}
                  onMouseDown={() => { navigate(r.to); setQuery(""); }}>
                  <div className="ic" style={{ background: "#E1F3E7", color: "#01613C", fontSize: ".64rem", fontWeight: 800 }}>{r.group.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.label}</div>
                    <div style={{ color: "#7C9086", fontSize: ".76rem" }}>{r.group} · {r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="db-header-right">
        <LanguageToggle />
        <div className="db-datetime">
          <div><b>{dateStr}</b></div>
          <div>{timeStr} · {t("header.syncedAgo")}</div>
        </div>

        <div style={{ position: "relative" }}>
          <button className="db-icon-btn" onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }} aria-label={t("header.notifications")}>
            <Bell size={18} />
            {systemAlerts.length > 0 && <span className="db-badge-dot">{systemAlerts.length}</span>}
          </button>
          {notifOpen && (
            <div className="db-dropdown">
              <div className="db-dropdown-head">
                <h4>{t("header.systemAlerts")}</h4>
                <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setNotifOpen(false)}>{t("common.close")}</button>
              </div>
              <div className="db-dropdown-list">
                {systemAlerts.map((a) => {
                  const Icon = ALERT_ICON[a.severity];
                  const tone = ALERT_TONE[a.severity];
                  return (
                    <div key={a.id} className="db-dropdown-item">
                      <div className="ic" style={{ background: tone.bg, color: tone.fg }}><Icon size={16} /></div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.title}</div>
                        <div style={{ color: "#7C9086" }}>{a.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="db-header-profile"
            onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
            aria-label={t("header.accountMenu")}
          >
            <div className="db-avatar">{initials(session?.user?.name || "Farm Manager")}</div>
          </button>
          {profileOpen && (
            <div className="db-dropdown" style={{ width: 220 }}>
              <div className="db-dropdown-head">
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".86rem" }}>{session?.user?.name || "Farm Manager"}</div>
                  <div style={{ color: "#7C9086", fontSize: ".76rem" }}>{session?.role?.name || "Super Admin"}</div>
                </div>
              </div>
              <div className="db-profile-menu" style={{ position: "static" }}>
                <button className="danger" onClick={handleLogout}><LogOut size={15} /> {t("common.logOut")}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
