import React, { useEffect, useMemo, useState } from "react";
import { Download, Printer, FileSpreadsheet, FileText } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Tabs from "../../components/ui/Tabs.jsx";
import ChartCard from "../../components/ui/ChartCard.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { monthlySales, newContracts, contractStats } from "../../data/dummyData.js";
import { api } from "../../api/client.js";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtNumber, fmtCurrency, fmtDate } from "../../utils/format.js";

const PERIODS = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly", "Custom"];
const PIE_COLORS = ["#01613C", "#E36B14", "#8FBE28"];

function downloadCSV(filename, rows, headers) {
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Real .xlsx / .pdf files for the field-data export card below — built
// entirely client-side (SheetJS for Excel, jsPDF+autotable for PDF) from
// whichever dataset (columns + fmt) the admin has selected.
function datasetToAoa(dataset) {
  const head = dataset.columns.map((c) => c.label);
  const body = dataset.rows.map((r) => dataset.columns.map((c) => String(c.fmt(r))));
  return { head, body };
}

function downloadDatasetExcel(filename, dataset) {
  const { head, body } = datasetToAoa(dataset);
  const ws = XLSX.utils.aoa_to_sheet([head, ...body]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, filename);
}

function downloadDatasetPdf(filename, title, dataset) {
  const { head, body } = datasetToAoa(dataset);
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [head],
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [1, 97, 60] },
  });
  doc.save(filename);
}

function ExportBar({ onCsv, onExcel }) {
  const { t } = useLanguage();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button className="db-btn db-btn-outline db-btn-sm" onClick={() => window.print()}><Printer size={13} /> {t("reports.print")}</button>
      <button className="db-btn db-btn-outline db-btn-sm" onClick={onCsv}><Download size={13} /> {t("reports.csv")}</button>
      <button className="db-btn db-btn-outline db-btn-sm" onClick={onExcel || onCsv}><FileSpreadsheet size={13} /> {t("reports.excel")}</button>
      <button className="db-btn db-btn-outline db-btn-sm" onClick={() => window.print()}><FileText size={13} /> {t("reports.pdf")}</button>
    </div>
  );
}

export default function Reports() {
  const { t } = useLanguage();
  const TABS = [
    { value: "production", label: t("reports.tabProduction") },
    { value: "sales", label: t("reports.tabSales") },
    { value: "contracts", label: t("reports.tabContracts") },
  ];
  const [tab, setTab] = useState("production");
  const [period, setPeriod] = useState("Monthly");
  const [salesTransactions, setSalesTransactions] = useState([]);
  const [maggotBatches, setMaggotBatches] = useState([]);
  const [eggBatches, setEggBatches] = useState([]);
  const [datasetKey, setDatasetKey] = useState("maggotHarvest");
  // Same shared context the operator forms (and the admin's own "Add Maggot
  // Harvest" button) write through, so this export always matches the live log.
  const { maggotHarvests, kasgotRecords, feedRecords } = useProductionLog();

  useEffect(() => {
    api.get("/sales-transactions").then(setSalesTransactions).catch(() => {});
    api.get("/maggot-batches").then(setMaggotBatches).catch(() => {});
    api.get("/egg-batches").then(setEggBatches).catch(() => {});
  }, []);

  const FIELD_DATASETS = useMemo(() => ({
    maggotHarvest: {
      label: t("production.maggotHarvest"),
      rows: maggotHarvests,
      columns: [
        { key: "date", label: t("common.date"), fmt: (r) => fmtDate(r.date) },
        { key: "biopondLabel", label: t("production.colBiopond"), fmt: (r) => r.biopondLabel || "—" },
        { key: "quantityKg", label: t("production.colQuantityKg"), fmt: (r) => fmtNumber(r.quantityKg) },
        { key: "createdBy", label: t("production.colRecordedBy"), fmt: (r) => r.createdBy || "—" },
      ],
    },
    bsfEggs: {
      label: t("production.bsfEggs"),
      rows: eggBatches,
      columns: [
        { key: "id", label: t("production.colEggBatchId"), fmt: (r) => r.id },
        { key: "collectionDate", label: t("production.colCollectionDate"), fmt: (r) => fmtDate(r.collectionDate) },
        { key: "eggWeightG", label: t("production.colEggWeight"), fmt: (r) => `${r.eggWeightG} g` },
        { key: "sourceCage", label: t("production.colSourceCage"), fmt: (r) => r.sourceCage || "—" },
        { key: "estHatchDate", label: t("production.colEstHatch"), fmt: (r) => fmtDate(r.estHatchDate) },
        { key: "status", label: t("common.status"), fmt: (r) => r.status || "—" },
        { key: "createdBy", label: t("production.colRecordedBy"), fmt: (r) => r.createdBy || "—" },
      ],
    },
    kasgot: {
      label: t("reports.datasetKasgot"),
      rows: kasgotRecords,
      columns: [
        { key: "date", label: t("common.date"), fmt: (r) => fmtDate(r.date) },
        { key: "biopondLabel", label: t("production.colBiopond"), fmt: (r) => r.biopondLabel || "—" },
        { key: "quantityKg", label: t("production.colQuantityKg"), fmt: (r) => fmtNumber(r.quantityKg) },
        { key: "createdBy", label: t("production.colRecordedBy"), fmt: (r) => r.createdBy || "—" },
      ],
    },
    feed: {
      label: t("production.feed"),
      rows: feedRecords,
      columns: [
        { key: "date", label: t("common.date"), fmt: (r) => fmtDate(r.date) },
        { key: "clientName", label: t("production.colHotel"), fmt: (r) => r.clientName || "—" },
        { key: "quantityKg", label: t("production.colQuantityKg"), fmt: (r) => fmtNumber(r.quantityKg) },
        { key: "createdBy", label: t("production.colRecordedBy"), fmt: (r) => r.createdBy || "—" },
      ],
    },
  }), [t, maggotHarvests, eggBatches, kasgotRecords, feedRecords]);

  const activeDataset = FIELD_DATASETS[datasetKey];

  const productionTrend = monthlySales.map((m) => ({ month: m.month, target: 12000, actual: 9000 + m.freshMaggotQty }));

  const customerContribution = useMemo(() => {
    const map = {};
    salesTransactions.forEach((tx) => { map[tx.customer] = (map[tx.customer] || 0) + tx.total; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [salesTransactions]);

  const productPerformance = [
    { name: "Fresh Maggot", value: monthlySales.reduce((s, m) => s + m.freshMaggotRevenue, 0) },
    { name: "BSF Eggs", value: monthlySales.reduce((s, m) => s + m.eggRevenue, 0) },
    { name: "Kasgot / Organic Fertilizer", value: monthlySales.reduce((s, m) => s + m.kasgotRevenue, 0) },
  ];

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("reports.title")}</h1>
        <p>{t("reports.subtitle")}</p>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "production" && (
        <>
          <div className="db-toolbar">
            <select className="db-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <div className="grow" />
            <ExportBar onCsv={() => downloadCSV("production_batches.csv", maggotBatches, ["id", "biopondId", "hatchDate", "ageDays", "initialQty", "feedKg", "estHarvestKg", "actualHarvestKg", "mortality", "status"])} />
          </div>

          <div className="db-row db-grid-4">
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.totalProduction")}</div><div className="value">12,450 kg</div><div className="foot"><span className="trend up">+8.2%</span></div></div></div>
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.targetVsActual")}</div><div className="value">92%</div></div></div>
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.productionEfficiency")}</div><div className="value">94.1%</div></div></div>
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.activeBatches")}</div><div className="value">{maggotBatches.filter((b) => b.status !== "Harvested" && b.status !== "Failed").length}</div></div></div>
          </div>

          <div className="db-row">
            <div className="db-card">
              <div className="db-card-head"><h3>{t("reports.fieldDataTitle")}</h3></div>
              <p className="sub" style={{ marginTop: -8, marginBottom: 16 }}>{t("reports.fieldDataSubtitle")}</p>
              <div className="db-toolbar" style={{ marginTop: 0 }}>
                <select className="db-select" value={datasetKey} onChange={(e) => setDatasetKey(e.target.value)}>
                  {Object.entries(FIELD_DATASETS).map(([key, d]) => <option key={key} value={key}>{d.label}</option>)}
                </select>
                <div className="grow" />
                <button
                  className="db-btn db-btn-outline db-btn-sm"
                  disabled={activeDataset.rows.length === 0}
                  onClick={() => downloadDatasetExcel(`${datasetKey}-report.xlsx`, activeDataset)}
                >
                  <FileSpreadsheet size={13} /> {t("reports.downloadExcel")}
                </button>
                <button
                  className="db-btn db-btn-outline db-btn-sm"
                  disabled={activeDataset.rows.length === 0}
                  onClick={() => downloadDatasetPdf(`${datasetKey}-report.pdf`, activeDataset.label, activeDataset)}
                >
                  <FileText size={13} /> {t("reports.downloadPdf")}
                </button>
              </div>
              <DataTable
                columns={activeDataset.columns.map((c) => ({ key: c.key, label: c.label, sortable: true, render: c.fmt }))}
                rows={activeDataset.rows}
                pageSize={6}
                emptyTitle={t("reports.noDataToExport")}
              />
            </div>
          </div>

          <div className="db-row db-grid-2">
            <ChartCard title={t("reports.productionTrend")} subtitle={t("reports.productionTrendSubtitle")}>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={productionTrend} margin={{ left: -14 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `${fmtNumber(v)} kg`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="actual" name={t("reports.actual")} stroke="#01613C" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="target" name={t("reports.target")} stroke="#E36B14" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="db-card">
              <div className="db-card-head"><h3>{t("reports.batchPerformance")}</h3></div>
              <DataTable
                columns={[
                  { key: "id", label: t("reports.colBatch"), sortable: true },
                  { key: "estHarvestKg", label: t("reports.colEst"), render: (r) => `${fmtNumber(r.estHarvestKg)} kg` },
                  { key: "actualHarvestKg", label: t("reports.colActual"), render: (r) => r.actualHarvestKg ? `${fmtNumber(r.actualHarvestKg)} kg` : "—" },
                  { key: "mortality", label: t("reports.colMortality"), sortable: true, render: (r) => `${r.mortality}%` },
                  { key: "status", label: t("common.status"), render: (r) => <Badge>{r.status}</Badge> },
                ]}
                rows={maggotBatches}
                pageSize={5}
              />
            </div>
          </div>
        </>
      )}

      {tab === "sales" && (
        <>
          <div className="db-toolbar">
            <div className="grow" />
            <ExportBar onCsv={() => downloadCSV("sales_transactions.csv", salesTransactions, ["id", "date", "customer", "product", "qty", "unit", "price", "total", "paymentStatus"])} />
          </div>

          <div className="db-row db-grid-2">
            <ChartCard title={t("reports.monthlyRevenue")} subtitle={t("reports.monthlyRevenueSubtitle")}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlySales.map((m) => ({ month: m.month, revenue: m.freshMaggotRevenue + m.eggRevenue + m.kasgotRevenue }))} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`} />
                  <Tooltip formatter={(v) => fmtCurrency(v)} />
                  <Line type="monotone" dataKey="revenue" stroke="#01613C" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={t("reports.productPerformance")} subtitle={t("reports.productPerformanceSubtitle")}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={productPerformance} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {productPerformance.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="db-row db-grid-2">
            <ChartCard title={t("reports.customerContribution")} subtitle={t("reports.customerContributionSubtitle")}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={customerContribution} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3E9E2" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#7C9086" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}jt`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#7C9086" }} axisLine={false} tickLine={false} width={140} />
                  <Tooltip formatter={(v) => fmtCurrency(v)} />
                  <Bar dataKey="value" fill="#01613C" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="db-card">
              <div className="db-card-head"><h3>{t("reports.salesTrend")}</h3></div>
              <div className="db-metric-row" style={{ borderTop: "none", paddingTop: 0 }}>
                <div className="m"><div className="v">{fmtCurrency(salesTransactions.reduce((s, tx) => s + tx.total, 0))}</div><div className="l">{t("reports.recentRevenue")}</div></div>
                <div className="m"><div className="v">+14.6%</div><div className="l">{t("reports.growth")}</div></div>
                <div className="m"><div className="v">Fresh Maggot</div><div className="l">{t("reports.bestSeller")}</div></div>
              </div>
            </div>
          </div>

          <div className="db-row">
            <div className="db-card">
              <div className="db-card-head"><h3>{t("reports.salesTransactionsTitle")}</h3></div>
              <DataTable
                columns={[
                  { key: "id", label: t("reports.colTransaction"), sortable: true },
                  { key: "date", label: t("common.date"), sortable: true, render: (r) => fmtDate(r.date) },
                  { key: "customer", label: t("reports.colCustomer"), sortable: true },
                  { key: "product", label: t("reports.colProduct") },
                  { key: "qty", label: t("reports.colQty"), render: (r) => `${r.qty} ${r.unit}` },
                  { key: "price", label: t("reports.colPrice"), render: (r) => fmtCurrency(r.price) },
                  { key: "total", label: t("reports.colTotal"), sortable: true, render: (r) => fmtCurrency(r.total) },
                  { key: "paymentStatus", label: t("reports.colPayment"), render: (r) => <Badge>{r.paymentStatus}</Badge> },
                ]}
                rows={salesTransactions}
                pageSize={6}
              />
            </div>
          </div>
        </>
      )}

      {tab === "contracts" && (
        <>
          <div className="db-toolbar">
            <div className="grow" />
            <ExportBar onCsv={() => downloadCSV("new_hotel_contracts.csv", newContracts, ["hotel", "contractNumber", "contractStart", "contractExpiry", "contractValue", "pic", "status"])} />
          </div>

          <div className="db-row db-grid-4">
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.newClientsThisYear")}</div><div className="value">{contractStats.newClientsThisYear}</div></div></div>
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.activeContracts")}</div><div className="value">{contractStats.activeContracts}</div></div></div>
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.expiringContracts")}</div><div className="value">{contractStats.expiringContracts}</div></div></div>
            <div className="db-card"><div className="db-kpi"><div className="label">{t("reports.renewalRate")}</div><div className="value">{contractStats.renewalRate}%</div></div></div>
          </div>

          <div className="db-row">
            <div className="db-card">
              <div className="db-card-head"><h3>{t("reports.newHotelContractsTitle")}</h3></div>
              <DataTable
                columns={[
                  { key: "hotel", label: t("reports.colHotel"), sortable: true },
                  { key: "contractNumber", label: t("reports.colContractNumber") },
                  { key: "contractStart", label: t("reports.colStart"), sortable: true, render: (r) => fmtDate(r.contractStart) },
                  { key: "contractExpiry", label: t("reports.colExpiry"), sortable: true, render: (r) => fmtDate(r.contractExpiry) },
                  { key: "contractValue", label: t("reports.colValue"), sortable: true, render: (r) => fmtCurrency(r.contractValue) },
                  { key: "pic", label: t("vendors.pic") },
                  { key: "status", label: t("common.status"), render: (r) => <Badge>{r.status}</Badge> },
                ]}
                rows={newContracts}
                pageSize={7}
                emptyTitle={t("reports.noNewContracts")}
                emptyMessage={t("reports.noNewContractsMessage")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
