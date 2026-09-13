import React, { useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { localISODate } from "../../context/BiopondContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyForm = { type: "", date: localISODate(), quantity: "", unit: "kg" };

function validate(form, t) {
  const errs = {};
  if (!form.type) errs.type = t("breederForm.typeRequired");
  if (!form.date) errs.date = t("opForm.dateRequired");
  if (!form.quantity || Number(form.quantity) <= 0) errs.quantity = t("breederForm.qtyRequired");
  return errs;
}

export default function BreederForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { addBreederRecord } = useProductionLog();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(false);

  const errors = touched ? validate(form, t) : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form, t)).length > 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setNetError(true); return; }
    setNetError(false);
    setSaving(true);
    try {
      await addBreederRecord({ ...form, createdBy: session?.user?.name });
      setSaved(true);
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return <SuccessScreen title={t("breederForm.successTitle")} message={t("breederForm.successMessage", { qty: form.quantity, unit: form.unit, type: form.type, date: form.date })} />;
  }

  return (
    <>
      <BackHeader title={t("breederForm.title")} to="/operator/production" />
      <div className="op-content">
        {netError && <div className="op-net-error"><WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div>{t("opForm.netErrorMessage")}</div></div>}
        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.type ? "has-err" : ""}`}>
            <label>{t("breederForm.type")}</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="" disabled>{t("breederForm.selectType")}</option>
              <option value="Prepupa">{t("breederForm.prepupa")}</option>
              <option value="Pupa">{t("breederForm.pupa")}</option>
            </select>
            {errors.type && <div className="err">{errors.type}</div>}
          </div>
          <div className={`op-field ${errors.date ? "has-err" : ""}`}>
            <label>{t("opForm.date")}</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <div className="err">{errors.date}</div>}
          </div>
          <div className={`op-field ${errors.quantity ? "has-err" : ""}`}>
            <label>{t("breederForm.quantity")}</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 10 }}>
              <input type="number" min={1} placeholder={t("breederForm.quantity")} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option>
                <option value="gram">gram</option>
                <option value="pcs">pcs</option>
              </select>
            </div>
            {errors.quantity && <div className="err">{errors.quantity}</div>}
          </div>
          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("breederForm.saveBreederData")}
          </button>
        </form>
      </div>
    </>
  );
}
