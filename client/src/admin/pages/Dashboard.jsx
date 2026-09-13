import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bug, Egg, Sprout, Recycle, ShoppingBasket, Users, CalendarClock,
  Truck, HandCoins, ClipboardCheck, UserCheck, FileBarChart2, Beaker,
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import KpiCard from "../../components/ui/KpiCard.jsx";
import ChartCard from "../../components/ui/ChartCard.jsx";
import Modal from "../../components/ui/Modal.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { useBiopond, localISODate } from "../../context/BiopondContext.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { kpiSummary, monthlySales, recentActivity, eventColors } from "../../data/dummyData.js";
import { fmtNumber, fmtCurrency, fmtDate, fmtDateTime } from "../../utils/format.js";

const FILTERS = [
  { value: "today", key: "dashboard.filter.today" },
  { value: "week", key: "dashboard.filter.week" },
  { value: "month", key: "dashboard.filter.month" },
  { value: "year", key: "dashboard.filter.year" },
  { value: "custom", key: "dashboard.filter.custom" },
];
const FILTER_SCALE = { today: 1 / 30, week: 7 / 30, month: 1, year: 12, custom: 1 };

const DONUT_COLORS = { Occupied: "#DC2626", Available: "#16A34A" };

const ACTIVITY_ICON = {
  harvest: Sprout, egg: Egg, waste: Recycle, client: Users, sale: HandCoins,
  biopond: Beaker, attendance: UserCheck, report: FileBarChart2,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { allBioponds, totals: biopondTotals } = useBiopond();
  const [dateFilter, setDateFilter] = useState("month");
  const [customFrom, setCustomFrom] = useState(localISODate());
  const [customTo, setCustomTo] = useState(localISODate());
  const [biopondModal, setBiopondModal] = useState(null);
  const [salesProduct, setSalesProduct] = useState("all");
  const [salesMetric, setSalesMetric] = useState("quantity");
  const [wasteMetric, setWasteMetric] = useState("monthly");
  const [hotels, setHotels] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    api.get("/hotels").then(setHotels).catch(() => {});
    api.get("/calendar-events").then(setCalendarEvents).catch(() => {});
  }, []);

  const scale = FILTER_SCALE[dateFilter];

  const todaySuffix = t("dashboard.kpi.todaySuffix");
  const kpis = [
    { key: "maggot", icon: Bug, label: t("dashboard.kpi.maggotProduced"), value: `${fmtNumber(kpiSummary.maggotProducedKg * scale)} kg`, todayLabel: `+${kpiSummary.maggotToday} kg ${todaySuffix}`, trend: kpiSummary.maggotTrend },
    { key: "egg", icon: Egg, label: t("dashboard.kpi.eggProduced"), value: `${(kpiSummary.eggProducedKg * scale).toFixed(1)} kg`, todayLabel: `+${kpiSummary.eggTodayGrams} g ${todaySuffix}`, trend: kpiSummary.eggTrend },
    { key: "kasgot", icon: Sprout, label: t("dashboard.kpi.kasgotProduced"), value: `${fmtNumber(kpiSummary.kasgotProducedKg * scale)} kg`, todayLabel: `+${kpiSummary.kasgotToday} kg ${todaySuffix}`, trend: kpiSummary.kasgotTrend },
    { key: "waste", icon: Recycle, label: t("dashboard.kpi.wasteProcessed"), value: `${fmtNumber(kpiSummary.wasteProcessedKg * scale)} kg`, todayLabel: `+${fmtNumber(kpiSummary.wasteToday)} kg ${todaySuffix}`, trend: kpiSummary.wasteTrend },
  ];

  const donutData = [
    { name: "Occupied", value: biopondTotals.occupied },
    { name: "Available", value: biopondTotals.available },
  ];

  const salesRows = useMemo(() => {
    return monthlySales.map((m) => {
      const row = { month: m.month };
      if (salesProduct === "all" || salesProduct === "Fresh Maggot") row["Fresh Maggot"] = salesMetric === "quantity" ? m.freshMaggotQty : m.freshMaggotRevenue;
      if (salesProduct === "all" || salesProduct === "BSF Eggs") row["BSF Eggs"] = salesMetric === "quantity" ? m.eggQty : m.eggRevenue;
      if (salesProduct === "all" || salesProduct === "Kasgot / Organic Fertilizer") row["Kasgot"] = salesMetric === "quantity" ? m.kasgotQty : m.kasgotRevenue;
      return row;
    });
  }, [salesProduct, salesMetric]);

  const salesTotals = useMemo(() => {
    const totalQty = monthlySales.reduce((s, m) => s + m.freshMaggotQty + m.kasgotQty, 0);
    const totalRevenue = monthlySales.reduce((s, m) => s + m.freshMaggotRevenue + m.eggRevenue + m.kasgotRevenue, 0);
    return { totalQty, totalRevenue };
  }, []);

  const wasteChartData = hotels.map((h) => ({
    name: h.name.split(" ").slice(0, 2).join(" "),
    fullName: h.name,
    value: wasteMetric === "monthly" ? h.monthlyWasteKg : h.avgDailyWasteKg,
  }));
  const totalMonthlyWaste = hotels.reduce((s, h) => s + h.monthlyWasteKg, 0);

  const today = new Date();
  const upcoming = (types) => calendarEvents
    .filter((e) => types.includes(e.type) && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const upcomingHarvest = upcoming(["Maggot Harvest", "BSF Egg Harvest"]);
  const upcomingMeetings = upcoming(["Client Meeting"]);
  const upcomingDeliveries = upcoming(["Product Delivery"]);

  const biopondListFor = (statusKey) => {
    const statusName = statusKey === "occupied" ? "Occupied" : "Available";
    return allBioponds.filter((b) => b.status === statusName);
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("dashboard.title")}</h1>
        <p>{t("dashboard.subtitle")}</p>
      </div>

      <div className="db-toolbar">
        <div className="db-pill-group">
          {FILTERS.map((f) => (
            <button key={f.value} className={`db-pill ${dateFilter === f.value ? "active" : ""}`} onClick={() => setDateFilter(f.value)}>
              {t(f.key)}
            </button>
          ))}
        </div>
        {dateFilter === "custom" && (
          <>
            <input type="date" className="db-input" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <span style={{ color: "var(--db-muted)" }}>{t("dashboard.filter.to")}</span>
            <input type="date" className="db-input" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
          </>
        )}
      </div>

      {/* Row 1 — KPI cards */}
      <div className="db-row db-grid-4">
        {kpis.map(({ key, ...k }) => <KpiCard key={key} {...k} />)}
      </div>

      {/* Row 2 — Biopond Utilization + Monthly Sales */}
      <div className="db-row db-grid-2">
        <ChartCard
          title={t("dashboard.biopondUtilization.title")}
          subtitle={t("dashboard.biopondUtilization.subtitle")}
          height={220}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={2}
                  onClick={(d) => setBiopondModal(d.name === "Occupied" ? "occupied" : "available")}
                  cursor="pointer"
                >
                  {donutData.map((d) => <Cell key={d.name} fill={DONUT_COLORS[d.name]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} ${t("dashboard.biopondUtilization.bioponds")}`, t(`status.${n}`)]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="db-chart-legend" style={{ flexDirection: "column", gap: 10 }}>
                {donutData.map((d) => (
                  <span key={d.name} style={{ cursor: "pointer" }} onClick={() => setBiopondModal(d.name === "Occupied" ? "occupied" : "available")}>
                    <span className="dot" style={{ background: DONUT_COLORS[d.name] }}></span>{t(`status.${d.name}`)}: <b>{d.value}</b>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="db-metric-row">
            <div className="m"><div className="v">{biopondTotals.total}</div><div className="l">{t("dashboard.biopondUtilization.totalBioponds")}</div></div>
            <div className="m"><div className="v">{biopondTotals.occupied}</div><div className="l">{t("dashboard.biopondUtilization.occupied")}</div></div>
            <div className="m"><div className="v">{biopondTotals.available}</div><div className="l">{t("dashboard.biopondUtilization.available")}</div></div>
            <div className="m"><div className="v">{biopondTotals.utilization}%</div><div className="l">{t("dashboard.biopondUtilization.utilization")}</div></div>
          </div>
        </ChartCard>

        <ChartCard
          title={t("dashboard.sales.title")}
          subtitle={t("dashboard.sales.subtitle")}
          controls={
            <>
              <select className="db-select" value={salesProduct} onChange={(e) => setSalesProduct(e.target.value)}>
                <option value="all">{t("dashboard.sales.allProducts")}</option>
                <option value="Fresh Maggot">Fresh Maggot</option>
                <option value="BSF Eggs">BSF Eggs</option>
                <option value="Kasgot / Organic Fertilizer">Kasgot / Organic Fertilizer</option>
              </select>
              <div className="db-pill-group">
                <button className={`db-pill ${salesMetric === "quantity" ? "active" : ""}`} onClick={() => setSalesMetric("quantity")}>{t("dashboard.sales.quantity")}</button>
                <button className={`db-pill ${salesMetric === "revenue" ? "active" : ""}`} onClick={() => setSalesMetric("revenue")}>{t("dashboard.sales.revenue")}</button>
              </div>
            </>
          }
        >
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={salesRows} margin={{ left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E2" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} tickFormatter={(v) => salesMetric === "revenue" ? `${(v / 1_000_000).toFixed(0)}jt` : v} />
              <Tooltip formatter={(v) => salesMetric === "revenue" ? fmtCurrency(v) : `${fmtNumber(v)} kg`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {(salesProduct === "all" || salesProduct === "Fresh Maggot") && <Bar dataKey="Fresh Maggot" fill="#01613C" radius={[4, 4, 0, 0]} />}
              {(salesProduct === "all" || salesProduct === "BSF Eggs") && <Bar dataKey="BSF Eggs" fill="#E36B14" radius={[4, 4, 0, 0]} />}
              {(salesProduct === "all" || salesProduct === "Kasgot / Organic Fertilizer") && <Bar dataKey="Kasgot" fill="#8FBE28" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
          <div className="db-metric-row">
            <div className="m"><div className="v">{fmtNumber(salesTotals.totalQty)} kg</div><div className="l">{t("dashboard.sales.totalQtySold")}</div></div>
            <div className="m"><div className="v">{fmtCurrency(salesTotals.totalRevenue)}</div><div className="l">{t("dashboard.sales.totalRevenue")}</div></div>
            <div className="m"><div className="v">+14.6%</div><div className="l">{t("dashboard.sales.growth")}</div></div>
            <div className="m"><div className="v">Fresh Maggot</div><div className="l">{t("dashboard.sales.bestSeller")}</div></div>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 — Organic Waste Managed by Hotel Clients */}
      <div className="db-row">
        <ChartCard
          title={t("dashboard.waste.title")}
          subtitle={t("dashboard.waste.subtitle")}
          controls={
            <>
              <div className="db-pill-group">
                <button className={`db-pill ${wasteMetric === "monthly" ? "active" : ""}`} onClick={() => setWasteMetric("monthly")}>{t("dashboard.waste.monthly")}</button>
                <button className={`db-pill ${wasteMetric === "daily" ? "active" : ""}`} onClick={() => setWasteMetric("daily")}>{t("dashboard.waste.avgDaily")}</button>
              </div>
              <button className="db-btn db-btn-outline db-btn-sm" onClick={() => navigate("/dashboard/clients")}>{t("dashboard.waste.viewClientDetails")}</button>
            </>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wasteChartData} margin={{ left: -14 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E2" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#7C9086" }} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={54} />
              <YAxis tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `${fmtNumber(v)} kg`} labelFormatter={(_, p) => p?.[0]?.payload?.fullName} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {wasteChartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? "#01613C" : "#0B7A4B"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="db-table-wrap" style={{ marginTop: 16 }}>
            <table className="db-table">
              <thead>
                <tr><th>{t("dashboard.waste.colHotel")}</th><th>{t("dashboard.waste.colMonthlyWaste")}</th><th>{t("dashboard.waste.colAvgDaily")}</th><th>{t("dashboard.waste.colContribution")}</th></tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.id}>
                    <td>{h.name}</td>
                    <td>{fmtNumber(h.monthlyWasteKg)} kg</td>
                    <td>{fmtNumber(h.avgDailyWasteKg)} kg</td>
                    <td>{((h.monthlyWasteKg / totalMonthlyWaste) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* Row 4 — Upcoming Harvest / Meetings / Deliveries */}
      <div className="db-row db-grid-3">
        <div className="db-card">
          <div className="db-card-head"><h3>{t("dashboard.upcomingHarvest")}</h3></div>
          {upcomingHarvest.length === 0 ? <div className="db-empty"><p>{t("dashboard.noHarvestScheduled")}</p></div> : upcomingHarvest.map((e) => (
            <div className="db-list-item" key={e.id}>
              <div className="ic" style={{ background: "#E1F3E7", color: "#01613C" }}><ClipboardCheck size={16} /></div>
              <div style={{ flex: 1 }}>
                <div className="t">{e.title}</div>
                <div className="s">{fmtDate(e.date)} · {e.employee}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="db-card">
          <div className="db-card-head"><h3>{t("dashboard.upcomingMeetings")}</h3></div>
          {upcomingMeetings.length === 0 ? <div className="db-empty"><p>{t("dashboard.noMeetingsScheduled")}</p></div> : upcomingMeetings.map((e) => (
            <div className="db-list-item" key={e.id}>
              <div className="ic" style={{ background: "#FFF1E5", color: "#E36B14" }}><CalendarClock size={16} /></div>
              <div style={{ flex: 1 }}>
                <div className="t">{e.hotel}</div>
                <div className="s">{fmtDate(e.date)} · {e.subject}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="db-card">
          <div className="db-card-head"><h3>{t("dashboard.productDeliveries")}</h3></div>
          {upcomingDeliveries.length === 0 ? <div className="db-empty"><p>{t("dashboard.noDeliveriesScheduled")}</p></div> : upcomingDeliveries.map((e) => (
            <div className="db-list-item" key={e.id}>
              <div className="ic" style={{ background: "#EAF1FE", color: "#2563EB" }}><Truck size={16} /></div>
              <div style={{ flex: 1 }}>
                <div className="t">{e.customer}</div>
                <div className="s">{fmtDate(e.date)} · {e.product} · {e.qty}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 5 — Recent Activity */}
      <div className="db-row">
        <div className="db-card">
          <div className="db-card-head"><h3>{t("dashboard.recentActivity")}</h3></div>
          {recentActivity.map((a) => {
            const Icon = ACTIVITY_ICON[a.type] || ShoppingBasket;
            return (
              <div className="db-activity" key={a.id}>
                <div className="ic"><Icon size={17} /></div>
                <div>
                  <div className="text">{a.text}</div>
                  <div className="meta">{a.user} · {fmtDate(a.date)} at {a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={!!biopondModal}
        onClose={() => setBiopondModal(null)}
        title={biopondModal ? `${t("dashboard.modal.bioponds")} — ${t(`status.${biopondModal === "occupied" ? "Occupied" : "Available"}`)}` : ""}
        maxWidth={620}
      >
        {biopondModal && (
          <DataTable
            columns={[
              { key: "number", label: t("dashboard.modal.colBiopond"), sortable: true, render: (r) => `${t("dashboard.modal.colBiopond")} ${r.number}` },
              { key: "rackName", label: t("dashboard.modal.colRack"), sortable: true },
              { key: "status", label: t("common.status"), render: (r) => <Badge>{r.status}</Badge> },
              { key: "feedSource", label: t("dashboard.modal.colFeedSource"), render: (r) => r.feedSource || "—" },
              { key: "harvestDate", label: t("dashboard.modal.colHarvestDate"), render: (r) => r.harvestDate ? fmtDate(r.harvestDate) : "—" },
            ]}
            rows={biopondListFor(biopondModal)}
            pageSize={6}
          />
        )}
      </Modal>
    </div>
  );
}
