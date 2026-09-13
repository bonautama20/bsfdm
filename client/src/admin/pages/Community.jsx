import React, { useMemo, useState } from "react";
import { Search, Plus, Upload, Pencil, Trash2, X as XIcon, Download } from "lucide-react";
import * as XLSX from "xlsx";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import CommunityMap from "../../components/CommunityMap.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { INDONESIA_PROVINCES } from "../../data/indonesiaProvinces.js";

const emptyForm = { name: "", phone: "", address: "", kabupaten: "", provinsi: "" };

function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const pick = (norm, ...keys) => {
    for (const k of keys) if (norm[k] !== undefined && String(norm[k]).trim() !== "") return String(norm[k]).trim();
    return "";
  };
  return rows
    .map((row) => {
      const norm = {};
      Object.entries(row).forEach(([k, v]) => { norm[k.toString().trim().toLowerCase()] = v; });
      return {
        name: pick(norm, "nama", "name"),
        phone: pick(norm, "no telp/whatsapp", "no. telp/whatsapp", "no telp", "no. telp", "telepon", "whatsapp", "no wa", "no. wa", "phone"),
        address: pick(norm, "alamat", "address"),
        kabupaten: pick(norm, "kabupaten", "kabupaten/kota", "kab/kota", "kota"),
        provinsi: pick(norm, "provinsi", "province"),
      };
    })
    .filter((r) => r.name || r.provinsi);
}

export default function Community() {
  const { t } = useLanguage();
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState(null);
  const [parseError, setParseError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  React.useEffect(() => {
    api.get("/communities").then((data) => { setRows(data); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    rows.forEach((r) => { c[r.provinsi] = (c[r.provinsi] || 0) + 1; });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (selectedProvince && r.provinsi !== selectedProvince) return false;
      if (!q) return true;
      return [r.name, r.address, r.kabupaten, r.provinsi].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [rows, query, selectedProvince]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r) => { setEditingId(r.id); setForm({ name: r.name, phone: r.phone || "", address: r.address || "", kabupaten: r.kabupaten || "", provinsi: r.provinsi }); setAddOpen(true); };
  const closeModal = () => { setAddOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const targetId = editingId;
    closeModal();
    try {
      if (isEdit) {
        const updated = await api.patch(`/communities/${targetId}`, form);
        setRows((prev) => prev.map((r) => (r.id === targetId ? updated : r)));
      } else {
        const created = await api.post("/communities", form);
        setRows((prev) => [...prev, created]);
      }
    } catch (err) {
      alert(err.message || t("community.failedSave"));
    }
  };

  const handleDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    try {
      await api.delete(`/communities/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message || t("community.failedDelete"));
    }
  };

  const openUpload = () => { setUploadOpen(true); setParsedRows(null); setParseError(""); setUploadResult(null); };
  const closeUpload = () => { setUploadOpen(false); setParsedRows(null); setParseError(""); setUploadResult(null); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setParseError("");
    setUploadResult(null);
    try {
      const buf = await file.arrayBuffer();
      const parsed = parseWorkbook(buf);
      if (parsed.length === 0) setParseError(t("community.uploadNoRows"));
      setParsedRows(parsed);
    } catch {
      setParseError(t("community.uploadFailed"));
    }
  };

  const confirmUpload = async () => {
    if (!parsedRows?.length) return;
    setUploading(true);
    try {
      const result = await api.post("/communities/bulk", { rows: parsedRows });
      setUploadResult(result);
      setParsedRows(null);
      const data = await api.get("/communities");
      setRows(data);
    } catch {
      setParseError(t("community.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Nama: "Contoh Nama", "No Telp/Whatsapp": "0812xxxxxxx", Alamat: "Jl. Contoh No. 1", Kabupaten: "Kabupaten Contoh", Provinsi: "Jawa Barat" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Komunitas");
    XLSX.writeFile(wb, "template-komunitas.xlsx");
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("community.title")}</h1>
        <p>{t("community.subtitle")}</p>
      </div>

      <div className="db-row db-grid-2">
        <div className="db-card">
          <div className="db-card-head"><h3>{t("community.mapTitle")}</h3></div>
          <CommunityMap counts={counts} selected={selectedProvince} onSelect={setSelectedProvince} />
          <div className="cm-legend"><span className="swatch" /> {t("community.legendLowHigh")}</div>
          {selectedProvince && (
            <button className="db-btn db-btn-outline db-btn-sm" style={{ marginTop: 14 }} onClick={() => setSelectedProvince(null)}>
              <XIcon size={13} /> {selectedProvince}
            </button>
          )}
        </div>
        <div className="db-card">
          <div className="db-card-head"><h3>{t("community.statsTitle")}</h3></div>
          <div style={{ display: "grid", gap: 10 }}>
            <div className="db-metric-row">
              <div className="m"><div className="v">{rows.length}</div><div className="l">{t("community.statTotal")}</div></div>
              <div className="m"><div className="v">{Object.keys(counts).length}</div><div className="l">{t("community.statProvinces")}</div></div>
            </div>
            <DataTable
              columns={[
                { key: "provinsi", label: t("community.colProvinsi"), sortable: true },
                { key: "count", label: t("community.statTotal"), sortable: true },
              ]}
              rows={Object.entries(counts).map(([provinsi, count]) => ({ id: provinsi, provinsi, count }))}
              pageSize={5}
            />
          </div>
        </div>
      </div>

      <div className="db-toolbar">
        <div className="db-search-input grow">
          <Search size={15} />
          <input className="db-input" style={{ width: "100%" }} placeholder={t("community.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="db-btn db-btn-outline" onClick={downloadTemplate}><Download size={15} /> {t("community.downloadTemplate")}</button>
        <button className="db-btn db-btn-outline" onClick={openUpload}><Upload size={15} /> {t("community.uploadExcel")}</button>
        <button className="db-btn db-btn-primary" onClick={openAdd}><Plus size={15} /> {t("community.addData")}</button>
      </div>

      <div className="db-card">
        <DataTable
          columns={[
            { key: "no", label: t("community.colNo"), render: (r) => filtered.indexOf(r) + 1 },
            { key: "name", label: t("community.colName"), sortable: true },
            { key: "phone", label: t("community.colPhone"), render: (r) => r.phone || "—" },
            { key: "address", label: t("community.colAddress"), render: (r) => r.address || "—" },
            { key: "kabupaten", label: t("community.colKabupaten"), render: (r) => r.kabupaten || "—" },
            { key: "provinsi", label: t("community.colProvinsi"), sortable: true },
            {
              key: "actions", label: "",
              render: (r) => (
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="db-btn db-btn-outline db-btn-sm" onClick={() => openEdit(r)}><Pencil size={13} /></button>
                  <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDeleteId(r.id)}><Trash2 size={13} /></button>
                </div>
              ),
            },
          ]}
          rows={filtered}
          pageSize={10}
          emptyTitle={loaded ? t("community.noDataFound") : undefined}
          emptyMessage={t("community.tryAdjusting")}
        />
      </div>

      <Modal
        open={addOpen}
        onClose={closeModal}
        title={editingId ? t("community.editModalTitle") : t("community.addModalTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="community-form" type="submit">{t("common.save")}</button></>}
      >
        <form id="community-form" onSubmit={handleSave}>
          <div className="db-field"><label>{t("community.fieldName")}</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="db-field"><label>{t("community.fieldPhone")}</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812xxxxxxxx" /></div>
          <div className="db-field"><label>{t("community.fieldAddress")}</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
          <div className="db-field-row">
            <div className="db-field"><label>{t("community.fieldKabupaten")}</label><input value={form.kabupaten} onChange={(e) => setForm({ ...form, kabupaten: e.target.value })} /></div>
            <div className="db-field">
              <label>{t("community.fieldProvinsi")}</label>
              <select value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} required>
                <option value="" disabled>{t("community.selectProvinsi")}</option>
                {INDONESIA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={closeUpload}
        title={t("community.uploadModalTitle")}
        maxWidth={680}
        footer={
          parsedRows?.length ? (
            <>
              <button className="db-btn db-btn-outline" onClick={closeUpload}>{t("community.uploadCancel")}</button>
              <button className="db-btn db-btn-primary" onClick={confirmUpload} disabled={uploading}>{uploading ? t("opForm.saving") : t("community.uploadConfirm")}</button>
            </>
          ) : (
            <button className="db-btn db-btn-outline" onClick={closeUpload}>{t("common.cancel")}</button>
          )
        }
      >
        <p style={{ marginBottom: 14 }}>{t("community.uploadInstructions")}</p>
        <button className="db-btn db-btn-outline db-btn-sm" style={{ marginBottom: 16 }} onClick={downloadTemplate}><Download size={13} /> {t("community.downloadTemplate")}</button>

        <div className="db-field">
          <label>{t("community.uploadChooseFile")}</label>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} />
        </div>

        {parseError && <div className="err" style={{ marginTop: 8 }}>{parseError}</div>}

        {parsedRows?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 8 }}>{t("community.uploadPreview")} ({parsedRows.length})</div>
            <DataTable
              columns={[
                { key: "name", label: t("community.colName") },
                { key: "phone", label: t("community.colPhone") },
                { key: "kabupaten", label: t("community.colKabupaten") },
                { key: "provinsi", label: t("community.colProvinsi") },
              ]}
              rows={parsedRows.map((r, i) => ({ id: i, ...r }))}
              pageSize={5}
            />
          </div>
        )}

        {uploadResult && (
          <div style={{ marginTop: 16, fontSize: ".86rem" }}>
            <div style={{ fontWeight: 700, color: "var(--db-primary)" }}>{t("community.uploadResultSuccess", { n: uploadResult.insertedCount })}</div>
            {uploadResult.skipped?.length > 0 && (
              <div style={{ marginTop: 6, color: "var(--db-muted)" }}>{t("community.uploadResultSkipped", { n: uploadResult.skipped.length })}</div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("community.deleteTitle")}
        message={t("community.deleteMessage")}
      />
    </div>
  );
}
