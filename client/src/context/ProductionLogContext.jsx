import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useBiopond, localISODate } from "./BiopondContext.jsx";
import { api } from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";
import { useLanguage } from "./LanguageContext.jsx";

const ProductionLogContext = createContext(null);

const daysBetween = (fromISO, toISO) => {
  const [fy, fm, fd] = fromISO.split("-").map(Number);
  const [ty, tm, td] = toISO.split("-").map(Number);
  const a = new Date(fy, fm - 1, fd);
  const b = new Date(ty, tm - 1, td);
  return Math.round((b - a) / 86400000);
};

export function ProductionLogProvider({ children }) {
  const { session } = useAuth();
  const { allBioponds } = useBiopond();
  const { t } = useLanguage();
  const [kasgotRecords, setKasgotRecords] = useState([]);
  const [breederRecords, setBreederRecords] = useState([]);
  const [feedRecords, setFeedRecords] = useState([]);
  const [maggotHarvests, setMaggotHarvests] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set());

  // Same fix as BiopondContext: refetch per logged-in user, not just once on
  // mount, and clear on logout — otherwise switching accounts in the same
  // tab leaves the previous session's records/notifications on screen.
  useEffect(() => {
    if (!session?.user?.id) {
      setKasgotRecords([]);
      setBreederRecords([]);
      setFeedRecords([]);
      setMaggotHarvests([]);
      return;
    }
    api.get("/kasgot-records").then(setKasgotRecords).catch(() => {});
    api.get("/breeder-records").then(setBreederRecords).catch(() => {});
    api.get("/feed-records").then(setFeedRecords).catch(() => {});
    api.get("/maggot-harvests").then(setMaggotHarvests).catch(() => {});
  }, [session?.user?.id]);

  const addMaggotHarvest = async (data) => {
    const record = await api.post("/maggot-harvests", { date: data.date, biopondLabel: data.biopondLabel, quantityKg: Number(data.quantityKg), createdBy: data.createdBy });
    setMaggotHarvests((prev) => [record, ...prev]);
  };

  const addKasgotRecord = async (data) => {
    const record = await api.post("/kasgot-records", { date: data.date, biopondLabel: data.biopondLabel, quantityKg: Number(data.quantityKg), createdBy: data.createdBy });
    setKasgotRecords((prev) => [record, ...prev]);
  };

  const addBreederRecord = async (data) => {
    const record = await api.post("/breeder-records", { type: data.type, date: data.date, quantity: Number(data.quantity), unit: data.unit, createdBy: data.createdBy });
    setBreederRecords((prev) => [record, ...prev]);
  };

  const addFeedRecord = async (data) => {
    const record = await api.post("/feed-records", { date: data.date, clientName: data.clientName, quantityKg: Number(data.quantityKg), createdBy: data.createdBy });
    setFeedRecords((prev) => [record, ...prev]);
  };

  // Harvest notifications are always derived live from the shared biopond data —
  // never stored separately, so they can never drift out of sync with the board.
  const harvestNotifications = useMemo(() => {
    const today = localISODate();
    const list = [];
    allBioponds
      .filter((b) => b.status === "Occupied" && b.harvestDate)
      .forEach((b) => {
        const diff = daysBetween(today, b.harvestDate);
        const label = `${b.rackName} - ${t("biopond.biopondLabel")} ${b.number}`;
        if (diff === 1) {
          list.push({ id: `notif-tomorrow-${b.id}`, category: "tomorrow", severity: "warning", title: t("harvestNotif.tomorrowTitle"), message: t("harvestNotif.tomorrowMessage", { label }), date: b.harvestDate, biopond: b });
        } else if (diff === 0) {
          list.push({ id: `notif-today-${b.id}`, category: "today", severity: "danger", title: t("harvestNotif.todayTitle"), message: t("harvestNotif.todayMessage", { label }), date: b.harvestDate, biopond: b });
        } else if (diff < 0) {
          const daysLate = Math.abs(diff);
          const message = daysLate === 1
            ? t("harvestNotif.overdueMessageYesterday", { label })
            : t("harvestNotif.overdueMessageDaysAgo", { label, days: daysLate });
          list.push({ id: `notif-overdue-${b.id}`, category: "overdue", severity: "danger", title: t("harvestNotif.overdueTitle"), message, date: b.harvestDate, biopond: b });
        }
      });
    return list.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [allBioponds, t]);

  const unreadCount = harvestNotifications.filter((n) => !readIds.has(n.id)).length;

  const markAllRead = () => setReadIds(new Set(harvestNotifications.map((n) => n.id)));
  const isRead = (id) => readIds.has(id);

  const value = {
    kasgotRecords, breederRecords, feedRecords, maggotHarvests,
    addKasgotRecord, addBreederRecord, addFeedRecord, addMaggotHarvest,
    harvestNotifications, unreadCount, markAllRead, isRead,
  };

  return <ProductionLogContext.Provider value={value}>{children}</ProductionLogContext.Provider>;
}

export function useProductionLog() {
  const ctx = useContext(ProductionLogContext);
  if (!ctx) throw new Error("useProductionLog must be used within ProductionLogProvider");
  return ctx;
}
