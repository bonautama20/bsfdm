import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Globe, MapPin } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import Badge from "../../components/ui/Badge.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtNumber, fmtDate } from "../../utils/format.js";

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hotel, setHotel] = useState(null);
  const [history, setHistory] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get("/hotels").then((hotels) => {
      const found = hotels.find((h) => h.id === clientId);
      if (!found) { setNotFound(true); return; }
      setHotel(found);
    }).catch(() => setNotFound(true));
    api.get(`/hotels/${clientId}/waste-history`).then(setHistory).catch(() => {});
  }, [clientId]);

  if (notFound) {
    return (
      <div className="db-card">
        <p>{t("clientDetail.notFound")}</p>
        <button className="db-btn db-btn-outline db-btn-sm" style={{ marginTop: 12 }} onClick={() => navigate("/dashboard/clients")}>{t("clientDetail.backToClients")}</button>
      </div>
    );
  }

  if (!hotel) return null;

  const monthlyTotal = history.reduce((s, h) => s + h.quantityKg, 0);
  const annualEstimate = monthlyTotal * 12;

  return (
    <div>
      <button className="db-btn db-btn-ghost db-btn-sm" style={{ marginBottom: 14 }} onClick={() => navigate("/dashboard/clients")}><ArrowLeft size={14} /> {t("clientDetail.backToClients")}</button>

      <div className="db-content-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>{hotel.name}</h1>
          <p style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}><MapPin size={14} /> {hotel.address}</p>
        </div>
        <Badge>{hotel.status}</Badge>
      </div>

      <div className="db-row db-grid-2">
        <div className="db-card">
          <div className="db-card-head"><h3>{t("clientDetail.clientInformation")}</h3></div>
          <div style={{ display: "grid", gap: 10, fontSize: ".86rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Phone size={14} /> {hotel.phone}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Mail size={14} /> {hotel.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Globe size={14} /> {hotel.website}</div>
            <div style={{ marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--db-line)" }}>
              <b>{t("clients.hotelPic")}:</b> {hotel.hotelPIC.name || "—"} — {hotel.hotelPIC.position || "—"}
              {hotel.hotelPIC.phone && ` (${hotel.hotelPIC.phone})`}
            </div>
            <div><b>{t("clients.vendorPic")}:</b> {hotel.vendorPIC.name} — {hotel.vendorPIC.position} ({hotel.vendorPIC.phone})</div>
          </div>
        </div>

        <div className="db-card">
          <div className="db-card-head"><h3>{t("clientDetail.contractInformation")}</h3></div>
          <div style={{ display: "grid", gap: 10, fontSize: ".86rem" }}>
            <div><b>{t("clientDetail.contractNumber")}:</b> {hotel.contractNumber}</div>
            <div><b>{t("clientDetail.startDate")}:</b> {fmtDate(hotel.contractStart)}</div>
            <div><b>{t("clientDetail.expiryDate")}:</b> {fmtDate(hotel.contractExpiry)}</div>
            <div><b>{t("clientDetail.serviceScope")}:</b> {t("clientDetail.serviceScopeValue")}</div>
            <div><b>{t("clientDetail.collectionSchedule")}:</b> {t("clientDetail.collectionScheduleValue")}</div>
            <div style={{ marginTop: 8 }}>
              <button className="db-btn db-btn-outline db-btn-sm">{t("clientDetail.viewContractDocument")}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="db-row db-grid-3">
        <div className="db-card"><div className="db-kpi"><div className="label">{t("clientDetail.dailyAverage")}</div><div className="value">{fmtNumber(hotel.avgDailyWasteKg)} kg</div></div></div>
        <div className="db-card"><div className="db-kpi"><div className="label">{t("clientDetail.monthlyEstimate")}</div><div className="value">{fmtNumber(monthlyTotal)} kg</div></div></div>
        <div className="db-card"><div className="db-kpi"><div className="label">{t("clientDetail.annualEstimate")}</div><div className="value">{fmtNumber(annualEstimate)} kg</div></div></div>
      </div>

      <div className="db-row">
        <div className="db-card">
          <div className="db-card-head"><h3>{t("clientDetail.dailyWasteChartTitle")}</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history} margin={{ left: -14 }}>
              <defs>
                <linearGradient id="wasteFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#01613C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#01613C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E9E2" />
              <XAxis dataKey="date" tickFormatter={(d) => fmtDate(d, { day: "2-digit", month: "short" })} tick={{ fontSize: 10, fill: "#7C9086" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7C9086" }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={(d) => fmtDate(d)} formatter={(v) => [`${v} kg`, t("clientDetail.waste")]} />
              <Area type="monotone" dataKey="quantityKg" stroke="#01613C" fill="url(#wasteFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="db-row">
        <div className="db-card">
          <div className="db-card-head"><h3>{t("clientDetail.wasteHistoryTitle")}</h3></div>
          <DataTable
            columns={[
              { key: "date", label: t("clientDetail.colDate"), sortable: true, render: (r) => fmtDate(r.date) },
              { key: "quantityKg", label: t("clientDetail.colQuantity"), sortable: true, render: (r) => `${fmtNumber(r.quantityKg)} kg` },
              { key: "category", label: t("clientDetail.colCategory") },
              { key: "vehicle", label: t("clientDetail.colVehicle") },
              { key: "driver", label: t("clientDetail.colDriver") },
              { key: "operator", label: t("clientDetail.colOperator") },
              { key: "notes", label: t("clientDetail.colNotes"), render: (r) => r.notes || "—" },
            ]}
            rows={history}
            pageSize={7}
          />
        </div>
      </div>
    </div>
  );
}
