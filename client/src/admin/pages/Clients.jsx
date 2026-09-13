import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MapPin, Phone, Eye, Pencil, Trash2, FileText, Recycle } from "lucide-react";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtNumber, fmtDate } from "../../utils/format.js";

const STATUS_OPTIONS = ["All", "Active", "Contract Expiring", "Inactive"];

export default function Clients() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const SORT_OPTIONS = [
    { value: "name", label: t("clients.sortNameAZ") },
    { value: "waste-desc", label: t("clients.sortWasteHighLow") },
    { value: "expiry", label: t("clients.sortContractExpiry") },
  ];
  const [hotels, setHotels] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const emptyForm = { name: "", address: "", phone: "", email: "", website: "", hotelPIC: { name: "", position: "", phone: "" } };
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get("/hotels").then(setHotels).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let rows = hotels.filter((h) =>
      (status === "All" || h.status === status) &&
      (h.name.toLowerCase().includes(query.toLowerCase()) || h.address.toLowerCase().includes(query.toLowerCase()))
    );
    if (sortBy === "name") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "waste-desc") rows = [...rows].sort((a, b) => b.monthlyWasteKg - a.monthlyWasteKg);
    if (sortBy === "expiry") rows = [...rows].sort((a, b) => new Date(a.contractExpiry) - new Date(b.contractExpiry));
    return rows;
  }, [hotels, query, status, sortBy]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (h) => {
    setEditingId(h.id);
    setForm({
      name: h.name, address: h.address, phone: h.phone, email: h.email, website: h.website || "",
      hotelPIC: { name: h.hotelPIC.name || "", position: h.hotelPIC.position || "", phone: h.hotelPIC.phone || "" },
    });
    setAddOpen(true);
  };
  const closeModal = () => { setAddOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const targetId = editingId;
    closeModal();
    try {
      if (isEdit) {
        const updated = await api.patch(`/hotels/${targetId}`, form);
        setHotels((prev) => prev.map((h) => (h.id === targetId ? updated : h)));
      } else {
        const hotel = await api.post("/hotels", form);
        setHotels((prev) => [...prev, hotel]);
      }
    } catch (err) {
      alert(err.message || t("clients.failedSave"));
    }
  };

  const handleDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    try {
      await api.delete(`/hotels/${id}`);
      setHotels((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      alert(err.message || t("clients.failedDelete"));
    }
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("clients.title")}</h1>
        <p>{t("clients.subtitle")}</p>
      </div>

      <div className="db-toolbar">
        <div className="db-search-input grow">
          <Search size={15} />
          <input className="db-input" style={{ width: "100%" }} placeholder={t("clients.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="db-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? t("common.all") : t(`status.${s}`)}</option>)}
        </select>
        <select className="db-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="db-btn db-btn-primary" onClick={openAdd}><Plus size={15} /> {t("clients.addClient")}</button>
      </div>

      {filtered.length === 0 ? (
        <div className="db-card"><EmptyState title={t("clients.noClientsFound")} message={t("clients.tryAdjusting")} /></div>
      ) : (
        <div className="db-grid-3">
          {filtered.map((h) => (
            <div className="db-card" key={h.id}>
              <div className="db-card-head">
                <div>
                  <h3>{h.name}</h3>
                  <div className="sub" style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {h.address}</div>
                </div>
                <Badge>{h.status}</Badge>
              </div>

              <div style={{ fontSize: ".82rem", display: "grid", gap: 6, color: "var(--db-ink-soft)" }}>
                <div><b style={{ color: "var(--db-ink)" }}>{t("clients.hotelPic")}:</b> {h.hotelPIC.name || "—"} · {h.hotelPIC.position || "—"}</div>
                {h.hotelPIC.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={12} /> {h.hotelPIC.phone}</div>
                )}
                <div>
                  <b style={{ color: "var(--db-ink)" }}>{t("clients.vendorPic")}:</b> {h.vendorPIC.name} · {h.vendorPIC.position}
                  <span style={{ color: "var(--db-muted)" }}> {t("clients.fromVendorPage")}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={12} /> {h.vendorPIC.phone}</div>
              </div>

              <div className="db-metric-row" style={{ marginTop: 14, paddingTop: 14 }}>
                <div className="m"><div className="v">{fmtNumber(h.monthlyWasteKg)} kg</div><div className="l">{t("clients.thisMonth")}</div></div>
                <div className="m"><div className="v">{fmtNumber(h.avgDailyWasteKg)} kg</div><div className="l">{t("clients.avgDaily")}</div></div>
                <div className="m"><div className="v">{h.lastCollection === "—" ? "—" : fmtDate(h.lastCollection)}</div><div className="l">{t("clients.lastCollection")}</div></div>
              </div>
              <div style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 10 }}>
                {t("clients.contract")} {h.contractNumber} · {t("clients.expires")} {h.contractExpiry === "—" ? "—" : fmtDate(h.contractExpiry)}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <button className="db-btn db-btn-primary db-btn-sm" onClick={() => navigate(`/dashboard/clients/${h.id}`)}><Eye size={13} /> {t("common.viewDetail")}</button>
                <button className="db-btn db-btn-outline db-btn-sm" onClick={() => openEdit(h)}><Pencil size={13} /> {t("common.edit")}</button>
                <button className="db-btn db-btn-outline db-btn-sm"><Recycle size={13} /> {t("clients.wasteData")}</button>
                <button className="db-btn db-btn-outline db-btn-sm"><FileText size={13} /> {t("clients.contractBtn")}</button>
                <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDeleteId(h.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={closeModal} title={editingId ? t("clients.editClient") : t("clients.addClient")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="add-client-form" type="submit">{editingId ? t("common.save") : t("clients.addClient")}</button></>}>
        <form id="add-client-form" onSubmit={handleSave}>
          <div className="db-field"><label>{t("clients.hotelName")}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="db-field"><label>{t("common.address")}</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
          <div className="db-field-row">
            <div className="db-field"><label>{t("common.phone")}</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="db-field"><label>{t("common.email")}</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="db-field"><label>{t("clients.website")}</label><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="example.com" /></div>

          <div style={{ fontSize: ".76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--db-muted)", marginTop: 18, marginBottom: 8 }}>
            {t("clients.hotelPic")}
          </div>
          <div className="db-field-row">
            <div className="db-field"><label>{t("clients.picName")}</label><input value={form.hotelPIC.name} onChange={(e) => setForm({ ...form, hotelPIC: { ...form.hotelPIC, name: e.target.value } })} /></div>
            <div className="db-field"><label>{t("clients.picPosition")}</label><input value={form.hotelPIC.position} onChange={(e) => setForm({ ...form, hotelPIC: { ...form.hotelPIC, position: e.target.value } })} /></div>
          </div>
          <div className="db-field"><label>{t("clients.picPhone")}</label><input value={form.hotelPIC.phone} onChange={(e) => setForm({ ...form, hotelPIC: { ...form.hotelPIC, phone: e.target.value } })} /></div>

          <p style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 16 }}>
            {t("clients.vendorPicNote")} <b>{t("sidebar.vendor")}</b> {t("clients.vendorPicNoteEnd")}
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("clients.deleteClientTitle")}
        message={t("clients.deleteClientMessage")}
      />
    </div>
  );
}
