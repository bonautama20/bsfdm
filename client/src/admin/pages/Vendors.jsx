import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, MapPin, Phone, User, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyForm = { name: "", pic: "", picPosition: "", location: "", phone1: "", phone2: "", hotelIds: [] };

export default function Vendors() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get("/vendors").then(setVendors).catch(() => {});
    api.get("/hotels").then(setHotels).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) =>
      v.name.toLowerCase().includes(q) || v.pic.toLowerCase().includes(q) || v.location.toLowerCase().includes(q)
    );
  }, [vendors, query]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({ name: v.name, pic: v.pic, picPosition: v.picPosition || "", location: v.location, phone1: v.phone1, phone2: v.phone2, hotelIds: v.hotelIds });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setForm(emptyForm); setEditingId(null); };

  const toggleHotel = (id) => setForm((f) => ({
    ...f,
    hotelIds: f.hotelIds.includes(id) ? f.hotelIds.filter((x) => x !== id) : [...f.hotelIds, id],
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const targetId = editingId;
    closeModal();
    try {
      if (isEdit) {
        const updated = await api.patch(`/vendors/${targetId}`, form);
        setVendors((prev) => prev.map((v) => (v.id === targetId ? updated : v)));
      } else {
        const created = await api.post("/vendors", form);
        setVendors((prev) => [...prev, created]);
      }
    } catch (err) {
      alert(err.message || t("vendors.failedSave"));
    }
  };

  const handleDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    try {
      await api.delete(`/vendors/${id}`);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(err.message || t("vendors.failedDelete"));
    }
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("vendors.title")}</h1>
        <p>{t("vendors.subtitle")}</p>
      </div>

      <div className="db-toolbar">
        <div className="db-search-input grow">
          <Search size={15} />
          <input className="db-input" style={{ width: "100%" }} placeholder={t("vendors.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="db-btn db-btn-primary" onClick={openAdd}><Plus size={15} /> {t("vendors.addVendor")}</button>
      </div>

      {filtered.length === 0 ? (
        <div className="db-card"><EmptyState title={t("vendors.noVendorsFound")} message={t("vendors.tryDifferentSearch")} /></div>
      ) : (
        <div className="db-grid-3">
          {filtered.map((v) => (
            <div className="db-card" key={v.id}>
              <div className="db-card-head">
                <div>
                  <h3>{v.name}</h3>
                  <div className="sub" style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {v.location}</div>
                </div>
              </div>

              <div style={{ fontSize: ".84rem", display: "grid", gap: 8, color: "var(--db-ink-soft)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={13} /> {t("vendors.pic")}: <b style={{ color: "var(--db-ink)" }}>{v.pic}</b>{v.picPosition ? ` · ${v.picPosition}` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={13} /> {v.phone1}{v.phone2 ? ` · ${v.phone2}` : ""}
                </div>
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--db-line)" }}>
                <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--db-muted)", marginBottom: 8 }}>
                  {t("vendors.handles")}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {v.hotelIds.length === 0
                    ? <span style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("vendors.noClientsAssigned")}</span>
                    : v.hotelIds.map((id) => {
                        const h = hotels.find((x) => x.id === id);
                        return h ? <Badge key={id} tone="green">{h.name}</Badge> : null;
                      })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="db-btn db-btn-outline db-btn-sm" onClick={() => openEdit(v)}><Pencil size={13} /> {t("common.edit")}</button>
                <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDeleteId(v.id)}><Trash2 size={13} /> {t("common.delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? t("vendors.editVendor") : t("vendors.addVendor")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="vendor-form" type="submit">{t("common.save")}</button></>}>
        <form id="vendor-form" onSubmit={handleSave}>
          <div className="db-field"><label>{t("vendors.vendorName")}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="db-field-row">
            <div className="db-field"><label>{t("vendors.pic")}</label><input value={form.pic} onChange={(e) => setForm({ ...form, pic: e.target.value })} required /></div>
            <div className="db-field"><label>{t("vendors.picPosition")}</label><input value={form.picPosition} onChange={(e) => setForm({ ...form, picPosition: e.target.value })} placeholder="Field Coordinator" /></div>
          </div>
          <div className="db-field"><label>{t("common.address")}</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></div>
          <div className="db-field-row">
            <div className="db-field"><label>{t("vendors.phoneNumber1")}</label><input value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} required /></div>
            <div className="db-field"><label>{t("vendors.phoneNumber2")}</label><input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} /></div>
          </div>
          <div className="db-field">
            <label>{t("vendors.handlesClientHotel")}</label>
            <div className="db-check-list">
              {hotels.map((h) => (
                <label key={h.id}>
                  <span>{h.name}</span>
                  <input type="checkbox" checked={form.hotelIds.includes(h.id)} onChange={() => toggleHotel(h.id)} />
                </label>
              ))}
            </div>
          </div>

          <p style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 8 }}>
            {t("vendors.picNote")}
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("vendors.deleteVendorTitle")}
        message={t("vendors.deleteVendorMessage")}
      />
    </div>
  );
}
