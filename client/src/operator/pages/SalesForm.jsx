import React, { useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { localISODate } from "../../context/BiopondContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

// Kept in one place so the dropdown, the unit rule, and the admin recap
// table's label all agree on the same canonical values.
export const SALES_TYPES = ["Fresh Maggot", "Baby Maggot", "Egg", "Prepupa", "Pupa", "Kasgot"];
export const SALES_TYPE_KEY = {
  "Fresh Maggot": "salesForm.typeFreshMaggot",
  "Baby Maggot": "salesForm.typeBabyMaggot",
  "Egg": "salesForm.typeEgg",
  "Prepupa": "salesForm.typePrepupa",
  "Pupa": "salesForm.typePupa",
  "Kasgot": "salesForm.typeKasgot",
};
// Every sales type is priced/weighed in kg except Egg and Baby Maggot, which
// (like their production-side counterparts elsewhere in the app) are tracked
// in grams — this is display-only, the server derives and trusts its own
// copy independently.
const GRAM_SALES_TYPES = new Set(["Egg", "Baby Maggot"]);
export const unitForSalesType = (salesType) => (GRAM_SALES_TYPES.has(salesType) ? "gram" : "kg");

const emptyForm = { date: localISODate(), salesType: "", quantity: "", totalPrice: "", buyerName: "", buyerPhone: "" };

function validate(form, t) {
  const errs = {};
  if (!form.date) errs.date = t("opForm.dateRequired");
  if (!form.salesType) errs.salesType = t("salesForm.typeRequired");
  if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = t("salesForm.qtyRequired");
  if (!form.totalPrice || Number(form.totalPrice) <= 0) errs.totalPrice = t("salesForm.totalPriceRequired");
  if (!form.buyerName.trim()) errs.buyerName = t("salesForm.buyerNameRequired");
  if (!form.buyerPhone.trim()) errs.buyerPhone = t("salesForm.buyerPhoneRequired");
  return errs;
}

export default function SalesForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { addSalesRecord } = useProductionLog();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(false);

  const errors = touched ? validate(form, t) : {};
  const unit = unitForSalesType(form.salesType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form, t)).length > 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setNetError(true); return; }
    setNetError(false);
    setSaving(true);
    try {
      await addSalesRecord({ ...form, createdBy: session?.user?.name });
      setSaved(true);
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <SuccessScreen
        title={t("salesForm.successTitle")}
        message={t("salesForm.successMessage", { qty: form.quantity, unit, type: t(SALES_TYPE_KEY[form.salesType]), buyer: form.buyerName })}
      />
    );
  }

  return (
    <>
      <BackHeader title={t("salesForm.title")} to="/operator/production" />
      <div className="op-content">
        {netError && <div className="op-net-error"><WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div>{t("opForm.netErrorMessage")}</div></div>}
        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.date ? "has-err" : ""}`}>
            <label>{t("opForm.date")}</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <div className="err">{errors.date}</div>}
          </div>
          <div className={`op-field ${errors.salesType ? "has-err" : ""}`}>
            <label>{t("salesForm.salesType")}</label>
            <select value={form.salesType} onChange={(e) => setForm({ ...form, salesType: e.target.value })}>
              <option value="" disabled>{t("salesForm.selectSalesType")}</option>
              {SALES_TYPES.map((type) => <option key={type} value={type}>{t(SALES_TYPE_KEY[type])}</option>)}
            </select>
            {errors.salesType && <div className="err">{errors.salesType}</div>}
          </div>
          <div className={`op-field ${errors.quantity ? "has-err" : ""}`}>
            <label>{t("salesForm.quantity")}</label>
            <div className="op-input-unit">
              <input type="number" min={0.01} step="any" placeholder="e.g. 10" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <span className="unit-suffix">{unit}</span>
            </div>
            {errors.quantity && <div className="err">{errors.quantity}</div>}
          </div>
          <div className={`op-field ${errors.totalPrice ? "has-err" : ""}`}>
            <label>{t("salesForm.totalPrice")}</label>
            <input type="number" min={1} placeholder="e.g. 150000" value={form.totalPrice} onChange={(e) => setForm({ ...form, totalPrice: e.target.value })} />
            {errors.totalPrice && <div className="err">{errors.totalPrice}</div>}
          </div>
          <div className={`op-field ${errors.buyerName ? "has-err" : ""}`}>
            <label>{t("salesForm.buyerName")}</label>
            <input type="text" placeholder="e.g. Budi" value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} />
            {errors.buyerName && <div className="err">{errors.buyerName}</div>}
          </div>
          <div className={`op-field ${errors.buyerPhone ? "has-err" : ""}`}>
            <label>{t("salesForm.buyerPhone")}</label>
            <input type="tel" placeholder="e.g. 081234567890" value={form.buyerPhone} onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })} />
            {errors.buyerPhone && <div className="err">{errors.buyerPhone}</div>}
          </div>
          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("salesForm.saveSales")}
          </button>
        </form>
      </div>
    </>
  );
}
