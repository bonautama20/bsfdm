import React, { useMemo, useState } from "react";
import { Sprout, Truck, CalendarClock } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import BackHeader from "../components/BackHeader.jsx";
import { useBiopond, localISODate } from "../../context/BiopondContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtDate } from "../../utils/format.js";

const EVENT_COLOR = { Harvest: "#01613C", "Customer Order": "#E36B14", Stocking: "#2563EB" };
const EVENT_ICON = { Harvest: Sprout, "Customer Order": Truck, Stocking: CalendarClock };

const dayOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localISODate(d);
};

// A few illustrative customer-order reservations — operators view these, admins create them.
const CUSTOMER_ORDERS = [
  { biopondLabel: "Rak A - Biopond 5", customer: "Wijaya Farm", orderQty: "50 kg Fresh Maggot", deliveryDate: dayOffset(12) },
  { biopondLabel: "Rak B - Biopond 8", customer: "Tirta Farm Aquaculture", orderQty: "35 kg Fresh Maggot", deliveryDate: dayOffset(6) },
];

function buildMonthGrid(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function OperatorCalendar() {
  const { allBioponds } = useBiopond();
  const { t } = useLanguage();
  const [view, setView] = useState("agenda");
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const today = localISODate();

  const events = useMemo(() => {
    const list = [];
    allBioponds.forEach((b) => {
      const label = `${b.rackName} - ${t("biopond.biopondLabel")} ${b.number}`;
      if (b.dateIn) list.push({ date: b.dateIn, type: "Stocking", title: label, detail: t("operatorCalendar.stockingDetail") });
      if (b.harvestDate) list.push({ date: b.harvestDate, type: "Harvest", title: label, detail: t("operatorCalendar.harvestDetail") });
    });
    CUSTOMER_ORDERS.forEach((o) => list.push({
      date: o.deliveryDate, type: "Customer Order", title: o.biopondLabel,
      detail: `${t("operatorCalendar.customer")}: ${o.customer} · ${o.orderQty}`,
    }));
    return list.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [allBioponds, t]);

  const upcoming = events.filter((e) => e.date >= today);
  const groupedByDate = useMemo(() => {
    const map = new Map();
    upcoming.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return [...map.entries()];
  }, [upcoming]);

  const monthDays = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    });
    return map;
  }, [events]);

  const dayEvents = selectedDate ? (eventsByDate.get(selectedDate) || []) : [];

  return (
    <>
      <BackHeader title={t("operatorCalendar.title")} to="/operator" />
      <div className="op-content">
        <div className="op-tabs">
          <button className={view === "agenda" ? "active" : ""} onClick={() => { setView("agenda"); setSelectedDate(null); }}>{t("operatorCalendar.agenda")}</button>
          <button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>{t("operatorCalendar.month")}</button>
        </div>

        {view === "agenda" && (
          groupedByDate.length === 0 ? (
            <EmptyState title={t("operatorCalendar.noUpcoming")} message={t("operatorCalendar.noUpcomingMessage")} />
          ) : groupedByDate.map(([date, items]) => (
            <div key={date}>
              <div className="op-agenda-date">{fmtDate(date, { weekday: "long", day: "2-digit", month: "long" })}</div>
              {items.map((e, i) => {
                const Icon = EVENT_ICON[e.type];
                return (
                  <div className="op-event-card" key={i}>
                    <div className="op-event-dot" style={{ background: EVENT_COLOR[e.type] }} />
                    <div style={{ flex: 1 }}>
                      <div className="type">{t(`eventCalType.${e.type}`)}</div>
                      <div className="title">{e.title}</div>
                      <div className="meta">{e.detail}</div>
                    </div>
                    <Icon size={16} color={EVENT_COLOR[e.type]} />
                  </div>
                );
              })}
            </div>
          ))
        )}

        {view === "month" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <button className="op-back-btn" onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}>‹</button>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>{anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
              <button className="op-back-btn" onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}>›</button>
            </div>
            <div className="op-cal-grid" style={{ marginBottom: 6 }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="op-cal-dow">{d}</div>)}
            </div>
            <div className="op-cal-grid">
              {monthDays.map((d, i) => {
                const iso = localISODate(d);
                const inMonth = d.getMonth() === anchor.getMonth();
                const dayEvts = eventsByDate.get(iso) || [];
                return (
                  <button key={i} className={`op-cal-cell ${!inMonth ? "muted" : ""} ${iso === today ? "today" : ""}`} onClick={() => setSelectedDate(iso)}>
                    {d.getDate()}
                    {dayEvts.length > 0 && (
                      <div className="dot-row">
                        {[...new Set(dayEvts.map((e) => e.type))].slice(0, 3).map((evtType) => (
                          <span key={evtType} className="evt-dot" style={{ background: iso === today ? "#fff" : EVENT_COLOR[evtType] }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div style={{ marginTop: 22 }}>
                <div className="op-agenda-date">{fmtDate(selectedDate, { weekday: "long", day: "2-digit", month: "long" })}</div>
                {dayEvents.length === 0 ? (
                  <EmptyState title={t("operatorCalendar.noActivity")} message={t("operatorCalendar.noActivityMessage")} />
                ) : dayEvents.map((e, i) => {
                  const Icon = EVENT_ICON[e.type];
                  return (
                    <div className="op-event-card" key={i}>
                      <div className="op-event-dot" style={{ background: EVENT_COLOR[e.type] }} />
                      <div style={{ flex: 1 }}>
                        <div className="type">{t(`eventCalType.${e.type}`)}</div>
                        <div className="title">{e.title}</div>
                        <div className="meta">{e.detail}</div>
                      </div>
                      <Icon size={16} color={EVENT_COLOR[e.type]} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
