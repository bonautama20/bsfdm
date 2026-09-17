import React, { useMemo, useState } from "react";
import { Receipt, Wallet, Calendar, Pencil } from "lucide-react";
import DataTable from "../../components/ui/DataTable.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { localISODate } from "../../context/BiopondContext.jsx";
import { fmtQty, fmtDate, fmtDateTime, fmtCurrency } from "../../utils/format.js";
import { SALES_TYPES, SALES_TYPE_KEY, unitForSalesType } from "../../operator/pages/SalesForm.jsx";

function Field({ label, children }) {
  return <div className="db-field"><label>{label}</label>{children}</div>;
}

export default function Sales() {
  const { t } = useLanguage();
  const { session } = useAuth();
  // Same shared context the operator Sales form writes through — this recap
  // is always exactly what operators submitted, live (see ProductionLogContext).
  const { salesRecords, updateSalesRecord } = useProductionLog();

  const salesStats = useMemo(() => {
    const today = localISODate();
    const monthPrefix = today.slice(0, 7);
    const todayRevenue = salesRecords.filter((s) => s.date === today).reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const monthRevenue = salesRecords.filter((s) => s.date?.startsWith(monthPrefix)).reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    return { todayRevenue, monthRevenue, count: salesRecords.length };
  }, [salesRecords]);

  // DataTable has no built-in row-index column, so "No urut" is baked into
  // each row before handing it off — stable per render, not tied to sorting.
  const salesWithNo = useMemo(() => salesRecords.map((s, i) => ({ ...s, no: i + 1 })), [salesRecords]);

  const [modal, setModal] = useState(null); // 'edit-sales'
  const [form, setForm] = useState({});
  const [editingSalesId, setEditingSalesId] = useState(null);

  const closeModal = () => { setModal(null); setForm({}); setEditingSalesId(null); };

  const openEditSales = (record) => {
    setEditingSalesId(record.id);
    setForm({
      salesDate: record.date, salesType: record.salesType, salesQuantity: record.quantity,
      salesTotalPrice: record.totalPrice, salesBuyerName: record.buyerName, salesBuyerPhone: record.buyerPhone,
    });
    setModal("edit-sales");
  };

  const handleSaveSales = async (e) => {
    e.preventDefault();
    const targetId = editingSalesId;
    closeModal();
    try {
      await updateSalesRecord(targetId, {
        date: form.salesDate, salesType: form.salesType, quantity: form.salesQuantity,
        totalPrice: form.salesTotalPrice, buyerName: form.salesBuyerName, buyerPhone: form.salesBuyerPhone,
        updatedBy: session?.user?.name,
      });
    } catch (err) {
      alert(err.message || t("production.failedEditSales"));
    }
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("sidebar.sales")}</h1>
        <p>{t("production.salesSubtitle")}</p>
      </div>

      <div className="db-grid-3" style={{ marginBottom: 24 }}>
        <div className="db-card">
          <div style={{ color: "var(--db-accent)", marginBottom: 8 }}><Wallet size={20} /></div>
          <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("production.salesToday")}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{fmtCurrency(salesStats.todayRevenue)}</div>
        </div>
        <div className="db-card">
          <div style={{ color: "var(--db-accent)", marginBottom: 8 }}><Calendar size={20} /></div>
          <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("production.salesThisMonth")}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{fmtCurrency(salesStats.monthRevenue)}</div>
        </div>
        <div className="db-card">
          <div style={{ color: "var(--db-accent)", marginBottom: 8 }}><Receipt size={20} /></div>
          <div style={{ fontSize: ".82rem", color: "var(--db-muted)" }}>{t("production.salesTotalTransactions")}</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>{salesStats.count}</div>
        </div>
      </div>

      <div className="db-card">
        <div className="db-card-head"><h3>{t("production.salesRecordsTitle")}</h3></div>
        <DataTable
          columns={[
            { key: "no", label: t("production.colNo") },
            { key: "date", label: t("common.date"), sortable: true, render: (r) => fmtDate(r.date) },
            { key: "salesType", label: t("production.colSalesType"), sortable: true, render: (r) => t(SALES_TYPE_KEY[r.salesType]) || r.salesType },
            { key: "quantity", label: t("production.colQuantity"), sortable: true, render: (r) => `${fmtQty(r.quantity)} ${r.unit}` },
            { key: "totalPrice", label: t("production.colTotalPrice"), sortable: true, render: (r) => fmtCurrency(r.totalPrice) },
            { key: "buyerName", label: t("production.colBuyerName") },
            { key: "buyerPhone", label: t("production.colBuyerPhone") },
            {
              key: "updatedAt", label: t("production.colLastUpdated"), render: (r) => (
                r.updatedAt
                  ? <span style={{ fontSize: ".8rem", color: "var(--db-muted)" }}>{t("production.updatedByLine", { name: r.updatedBy || "—", date: fmtDateTime(r.updatedAt) })}</span>
                  : <span style={{ color: "var(--db-muted)" }}>—</span>
              )
            },
            {
              key: "actions", label: "", render: (r) => (
                <button className="db-btn db-btn-ghost db-btn-sm" title={t("common.edit")} onClick={() => openEditSales(r)}><Pencil size={13} /></button>
              )
            },
          ]}
          rows={salesWithNo}
          pageSize={10}
        />
      </div>

      <Modal open={modal === "edit-sales"} onClose={closeModal} title={t("production.editSalesTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="edit-sales-form" type="submit">{t("common.save")}</button></>}>
        <form id="edit-sales-form" onSubmit={handleSaveSales}>
          <div className="db-field-row">
            <Field label={t("common.date")}><input type="date" value={form.salesDate || ""} onChange={(e) => setForm({ ...form, salesDate: e.target.value })} required /></Field>
            <Field label={t("salesForm.salesType")}>
              <select className="db-select" style={{ width: "100%" }} value={form.salesType || ""} onChange={(e) => setForm({ ...form, salesType: e.target.value })} required>
                {SALES_TYPES.map((type) => <option key={type} value={type}>{t(SALES_TYPE_KEY[type])}</option>)}
              </select>
            </Field>
          </div>
          <div className="db-field-row">
            <Field label={`${t("salesForm.quantity")} (${unitForSalesType(form.salesType)})`}>
              <input type="number" min={0.01} step="any" value={form.salesQuantity ?? ""} onChange={(e) => setForm({ ...form, salesQuantity: e.target.value })} required />
            </Field>
            <Field label={t("salesForm.totalPrice")}>
              <input type="number" min={1} value={form.salesTotalPrice ?? ""} onChange={(e) => setForm({ ...form, salesTotalPrice: e.target.value })} required />
            </Field>
          </div>
          <div className="db-field-row">
            <Field label={t("salesForm.buyerName")}><input value={form.salesBuyerName || ""} onChange={(e) => setForm({ ...form, salesBuyerName: e.target.value })} required /></Field>
            <Field label={t("salesForm.buyerPhone")}><input type="tel" value={form.salesBuyerPhone || ""} onChange={(e) => setForm({ ...form, salesBuyerPhone: e.target.value })} required /></Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
