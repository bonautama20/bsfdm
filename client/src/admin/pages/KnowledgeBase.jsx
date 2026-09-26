import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Badge from "../../components/ui/Badge.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtDate } from "../../utils/format.js";

// Admin CRUD for the public BSF Knowledge Base (landing page footer -> "BSF
// Knowledge Base"). Only the platform operator ever sees this page — see
// PlatformOwnerGate on the /dashboard/knowledge-base route in App.jsx and
// Sidebar.jsx's isPlatformOwner check — and the server independently
// enforces the same rule on every write (requirePlatformOwner in
// server/routes/kbArticles.js), so hiding the UI is a convenience, not the
// actual security boundary.
const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  categoryEn: "", categoryId: "",
  titleEn: "", titleId: "",
  excerptEn: "", excerptId: "",
  bodyEn: "", bodyId: "",
  readMinutes: 5,
  publishedAt: todayISO(),
};

export default function KnowledgeBaseAdmin() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // article object, or null
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api.get("/kb-articles").then(setArticles).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) =>
      a.title.en.toLowerCase().includes(q) ||
      a.title.id.toLowerCase().includes(q) ||
      a.category.en.toLowerCase().includes(q)
    );
  }, [articles, query]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      categoryEn: a.category.en, categoryId: a.category.id,
      titleEn: a.title.en, titleId: a.title.id,
      excerptEn: a.excerpt.en, excerptId: a.excerpt.id,
      bodyEn: a.body.en.join("\n\n"), bodyId: a.body.id.join("\n\n"),
      readMinutes: a.readMinutes,
      publishedAt: a.publishedAt,
    });
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setForm(emptyForm); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, readMinutes: Number(form.readMinutes) || 5 };
      if (editingId) {
        const updated = await api.patch(`/kb-articles/${editingId}`, payload);
        setArticles((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      } else {
        const created = await api.post("/kb-articles", payload);
        setArticles((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (err) {
      alert(err.message || t("kbAdmin.failedSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const target = deleteTarget;
    setDeleting(true);
    try {
      await api.delete(`/kb-articles/${target.id}`);
      setArticles((prev) => prev.filter((a) => a.id !== target.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || t("kbAdmin.failedDelete"));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "title", label: t("kbAdmin.colTitle"), sortable: true, sortValue: (a) => a.title.en, render: (a) => (
      <div>
        <div style={{ fontWeight: 700 }}>{a.title.en}</div>
        <div style={{ fontSize: ".78rem", color: "var(--db-muted)" }}>{a.title.id}</div>
      </div>
    ) },
    { key: "category", label: t("kbAdmin.colCategory"), sortable: true, sortValue: (a) => a.category.en, render: (a) => <Badge tone="green">{a.category.en}</Badge> },
    { key: "publishedAt", label: t("kbAdmin.colPublished"), sortable: true, render: (a) => fmtDate(a.publishedAt) },
    { key: "readMinutes", label: t("kbAdmin.colReadTime"), sortable: true, sortValue: (a) => a.readMinutes, render: (a) => t("kbAdmin.minutesShort", { n: a.readMinutes }) },
    { key: "actions", label: "", render: (a) => (
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <a
          className="db-btn db-btn-ghost db-btn-sm"
          title={t("kbAdmin.viewOnSite")}
          href={`/knowledge-base/${a.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={13} />
        </a>
        <button className="db-btn db-btn-outline db-btn-sm" onClick={() => openEdit(a)}><Pencil size={13} /> {t("common.edit")}</button>
        <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDeleteTarget(a)}><Trash2 size={13} /> {t("common.delete")}</button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("kbAdmin.title")}</h1>
        <p>{t("kbAdmin.subtitle")}</p>
      </div>

      <div className="db-toolbar">
        <div className="db-search-input grow">
          <Search size={15} />
          <input className="db-input" style={{ width: "100%" }} placeholder={t("kbAdmin.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="db-btn db-btn-primary" onClick={openAdd}><Plus size={15} /> {t("kbAdmin.addArticle")}</button>
      </div>

      <div className="db-card">
        {loading ? null : (
          <DataTable
            columns={columns}
            rows={filtered}
            emptyTitle={t("kbAdmin.noArticlesFound")}
            emptyMessage={t("kbAdmin.tryDifferentSearch")}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? t("kbAdmin.editArticle") : t("kbAdmin.addArticle")}
        maxWidth={760}
        footer={
          <>
            <button className="db-btn db-btn-outline" onClick={closeModal} disabled={saving}>{t("common.cancel")}</button>
            <button className="db-btn db-btn-primary" form="kb-article-form" type="submit" disabled={saving}>
              {saving ? t("ui.confirmDelete.pleaseWait") : t("common.save")}
            </button>
          </>
        }
      >
        <form id="kb-article-form" onSubmit={handleSave}>
          <div className="db-field-row">
            <div className="db-field">
              <label>{t("kbAdmin.fieldReadMinutes")}</label>
              <input type="number" min={1} max={120} value={form.readMinutes} onChange={(e) => setForm({ ...form, readMinutes: e.target.value })} required />
            </div>
            <div className="db-field">
              <label>{t("kbAdmin.fieldPublishedDate")}</label>
              <input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} required />
            </div>
          </div>

          <h4 style={{ margin: "18px 0 10px", fontSize: ".82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--db-muted)" }}>
            {t("kbAdmin.sectionEnglish")}
          </h4>
          <div className="db-field"><label>{t("kbAdmin.fieldCategory")}</label><input value={form.categoryEn} onChange={(e) => setForm({ ...form, categoryEn: e.target.value })} required maxLength={60} /></div>
          <div className="db-field"><label>{t("kbAdmin.fieldTitle")}</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required maxLength={200} /></div>
          <div className="db-field">
            <label>{t("kbAdmin.fieldExcerpt")}</label>
            <textarea rows={2} value={form.excerptEn} onChange={(e) => setForm({ ...form, excerptEn: e.target.value })} required maxLength={400} />
            <p style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 6 }}>{t("kbAdmin.fieldExcerptHint")}</p>
          </div>
          <div className="db-field">
            <label>{t("kbAdmin.fieldBody")}</label>
            <textarea rows={8} value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} required />
            <p style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 6 }}>{t("kbAdmin.fieldBodyHint")}</p>
          </div>

          <h4 style={{ margin: "22px 0 10px", fontSize: ".82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".03em", color: "var(--db-muted)" }}>
            {t("kbAdmin.sectionIndonesian")}
          </h4>
          <div className="db-field"><label>{t("kbAdmin.fieldCategory")}</label><input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required maxLength={60} /></div>
          <div className="db-field"><label>{t("kbAdmin.fieldTitle")}</label><input value={form.titleId} onChange={(e) => setForm({ ...form, titleId: e.target.value })} required maxLength={200} /></div>
          <div className="db-field">
            <label>{t("kbAdmin.fieldExcerpt")}</label>
            <textarea rows={2} value={form.excerptId} onChange={(e) => setForm({ ...form, excerptId: e.target.value })} required maxLength={400} />
            <p style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 6 }}>{t("kbAdmin.fieldExcerptHint")}</p>
          </div>
          <div className="db-field">
            <label>{t("kbAdmin.fieldBody")}</label>
            <textarea rows={8} value={form.bodyId} onChange={(e) => setForm({ ...form, bodyId: e.target.value })} required />
            <p style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 6 }}>{t("kbAdmin.fieldBodyHint")}</p>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t("kbAdmin.deleteArticleTitle")}
        message={deleteTarget ? t("kbAdmin.deleteArticleMessage", { title: deleteTarget.title.en }) : ""}
      />
    </div>
  );
}
