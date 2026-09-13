import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Layers, Scale, Egg, Sprout, Users, Droplets, CalendarDays, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBiopond, localISODate } from "../../context/BiopondContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtDate } from "../../utils/format.js";

const initials = (name = "") => name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const menuCards = [
  { to: "/operator/production/biopond", icon: Layers, labelKey: "operatorHome.menuBiopond", subKey: "operatorHome.menuBiopondSub" },
  { to: "/operator/production/maggot-harvest", icon: Scale, labelKey: "operatorHome.menuMaggotHarvest", subKey: "operatorHome.menuMaggotHarvestSub" },
  { to: "/operator/production/egg-harvest", icon: Egg, labelKey: "operatorHome.menuEggHarvest", subKey: "operatorHome.menuEggHarvestSub" },
  { to: "/operator/production/kasgot", icon: Sprout, labelKey: "operatorHome.menuKasgot", subKey: "operatorHome.menuKasgotSub" },
  { to: "/operator/production/breeder", icon: Users, labelKey: "operatorHome.menuBreeder", subKey: "operatorHome.menuBreederSub" },
  { to: "/operator/production/feed", icon: Droplets, labelKey: "operatorHome.menuFeed", subKey: "operatorHome.menuFeedSub" },
  { to: "/operator/calendar", icon: CalendarDays, labelKey: "operatorHome.menuCalendar", subKey: "operatorHome.menuCalendarSub" },
];

const greetingKeyFor = (hour) => {
  if (hour < 11) return "operatorHome.goodMorning";
  if (hour < 15) return "operatorHome.goodAfternoon";
  if (hour < 19) return "operatorHome.goodEvening";
  return "operatorHome.goodNight";
};

export default function OperatorHome() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { session } = useAuth();
  const { allBioponds } = useBiopond();
  const { harvestNotifications, unreadCount, feedRecords } = useProductionLog();

  const firstName = (session?.user?.name || "Operator").split(" ")[0];
  const now = new Date();
  const today = localISODate(now);

  const activity = useMemo(() => {
    const stockedToday = allBioponds.filter((b) => b.dateIn === today).length;
    const harvestToday = harvestNotifications.filter((n) => n.category === "today").length;
    const feedToday = feedRecords.filter((f) => f.date === today).reduce((s, f) => s + f.quantityKg, 0);
    return { stockedToday, harvestToday, feedToday };
  }, [allBioponds, harvestNotifications, feedRecords, today]);

  // "Upcoming Harvest" previews what's coming soon (today/tomorrow); overdue items
  // are flagged separately via the notification bell and the full Notifications page.
  const topNotifications = harvestNotifications.filter((n) => n.category !== "overdue").slice(0, 3);

  return (
    <>
      <header className="op-header">
        <div className="op-header-top">
          <div className="op-header-brand">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <polygon points="20,3 34.6,11.5 34.6,28.5 20,37 5.4,28.5 5.4,11.5" fill="#E36B14" />
            </svg>
            BSFDM
          </div>
          <div className="op-header-actions">
            <button className="op-icon-btn" aria-label={t("operatorNav.notifications")} onClick={() => navigate("/operator/notifications")}>
              <Bell size={17} />
              {unreadCount > 0 && <span className="op-badge-dot">{unreadCount}</span>}
            </button>
            <button className="op-avatar" style={{ border: "none" }} onClick={() => navigate("/operator/profile")} aria-label={t("operatorHome.profile")}>
              {initials(session?.user?.name || "Operator")}
            </button>
          </div>
        </div>
        <div className="op-greeting">
          <h1>{t(greetingKeyFor(now.getHours()))}, {firstName}</h1>
          <div className="date">{now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          <div className="sub">{t("operatorHome.whatToRecord")}</div>
        </div>
      </header>

      <div className="op-content">
        <div className="op-menu-grid">
          {menuCards.map((c) => (
            <button key={c.to} className="op-menu-card" onClick={() => navigate(c.to)}>
              <div className="ic-wrap"><c.icon size={22} /></div>
              <div className="lbl">{t(c.labelKey)}</div>
              <div className="sub">{t(c.subKey)}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="op-section-title">{t("operatorHome.todaysActivity")}</div>
          <div className="op-stats-row">
            <div className="op-stat"><div className="v">{activity.stockedToday}</div><div className="l">{t("operatorHome.stocked")}</div></div>
            <div className="op-stat"><div className="v">{activity.harvestToday}</div><div className="l">{t("operatorHome.harvestToday")}</div></div>
            <div className="op-stat"><div className="v">{activity.feedToday} kg</div><div className="l">{t("operatorHome.feedReceived")}</div></div>
          </div>
        </div>

        {topNotifications.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="op-section-title">{t("operatorHome.upcomingHarvest")}</div>
            {topNotifications.map((n) => (
              <div key={n.id} className={`op-notif-card ${n.category}`}>
                <div className="ic-wrap"><Layers size={17} /></div>
                <div style={{ flex: 1 }}>
                  <div className="title">{n.biopond.rackName} - {t("biopond.biopondLabel")} {n.biopond.number}</div>
                  <div className="date">{fmtDate(n.date, { day: "2-digit", month: "short" })}</div>
                </div>
                <span className={`op-notif-pill ${n.category}`}>{t(`notifCategory.${n.category}`)}</span>
              </div>
            ))}
            <button className="op-view-all" style={{ width: "100%" }} onClick={() => navigate("/operator/notifications")}>
              {t("operatorHome.viewAll")} <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
