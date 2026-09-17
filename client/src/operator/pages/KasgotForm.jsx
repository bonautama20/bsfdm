import React, { useMemo, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBiopond, localISODate } from "../../context/BiopondContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyForm = { date: localISODate(), biopondLabel: "", quantityKg: "" };

function validate(form, t) {
  const errs = {};
  if (!form.date) errs.date = t("opForm.dateRequired");
  if (!form.biopondLabel) errs.biopondLabel = t("kasgotForm.selectBiopond");
  if (!form.quantityKg || Number(form.quantityKg) <= 0) errs.quantityKg = t("kasgotForm.qtyRequired");
  return errs;
}

export default function KasgotForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { allBioponds } = useBiopond();
  const { addKasgotRecord } = useProductionLog();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(false);

  const options = useMemo(() => allBioponds.map((b) => `${b.rackName} - ${t("biopond.biopondLabel")} ${b.number}`), [allBioponds, t]);
  const errors = touched ? validate(form, t) : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form, t)).length > 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setNetError(true); return; }
    setNetError(false);
    setSaving(true);
    try {
      await addKasgotRecord({ ...form, createdBy: session?.user?.name });
      setSaved(true);
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return <SuccessScreen title={t("kasgotForm.successTitle")} message={t("kasgotForm.successMessage", { qty: form.quantityKg, biopond: form.biopondLabel })} />;
  }

  return (
    <>
      <BackHeader title={t("kasgotForm.title")} to="/operator/production" />
      <div className="op-content">
        {netError && <div className="op-net-error"><WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div>{t("opForm.netErrorMessage")}</div></div>}
        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.date ? "has-err" : ""}`}>
            <label>{t("opForm.date")}</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <div className="err">{errors.date}</div>}
          </div>
          <div className={`op-field ${errors.biopondLabel ? "has-err" : ""}`}>
            <label>{t("kasgotForm.biopondNumber")}</label>
            <select value={form.biopondLabel} onChange={(e) => setForm({ ...form, biopondLabel: e.target.value })}>
              <option value="" disabled>{t("kasgotForm.selectBiopondPlaceholder")}</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.biopondLabel && <div className="err">{errors.biopondLabel}</div>}
          </div>
          <div className={`op-field ${errors.quantityKg ? "has-err" : ""}`}>
            <label>{t("kasgotForm.kasgotQuantity")}</label>
            <div className="op-input-unit">
              <input type="number" min={0.01} step="any" placeholder="e.g. 45.5" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
              <span className="unit-suffix">kg</span>
            </div>
            {errors.quantityKg && <div className="err">{errors.quantityKg}</div>}
          </div>
          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("kasgotForm.saveKasgot")}
          </button>
        </form>
      </div>
    </>
  );
}
