import React, { useEffect } from "react";
import { Layers } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import BackHeader from "../components/BackHeader.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtDate } from "../../utils/format.js";

const SECTIONS = [
  { key: "overdue", titleKey: "operatorNotifications.harvestOverdue" },
  { key: "today", titleKey: "operatorNotifications.harvestToday" },
  { key: "tomorrow", titleKey: "operatorNotifications.upcomingHarvest" },
];

export default function OperatorNotifications() {
  const { harvestNotifications, markAllRead } = useProductionLog();
  const { t } = useLanguage();

  useEffect(() => {
    markAllRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <BackHeader title={t("operatorNav.notifications")} to="/operator" />
      <div className="op-content">
        {harvestNotifications.length === 0 ? (
          <EmptyState title={t("operatorNotifications.allCaughtUp")} message={t("operatorNotifications.noNotifications")} />
        ) : (
          SECTIONS.map((section) => {
            const items = harvestNotifications.filter((n) => n.category === section.key);
            if (items.length === 0) return null;
            return (
              <div key={section.key} style={{ marginBottom: 24 }}>
                <div className="op-section-title">{t(section.titleKey)}</div>
                {items.map((n) => (
                  <div key={n.id} className={`op-notif-card ${n.category}`}>
                    <div className="ic-wrap"><Layers size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="title">{n.biopond.rackName} - {t("biopond.biopondLabel")} {n.biopond.number}</div>
                      <div className="msg">{n.message}</div>
                      <div className="date">{fmtDate(n.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
