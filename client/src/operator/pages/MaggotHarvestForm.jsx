import React, { useMemo, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBiopond, localISODate } from "../../context/BiopondContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyForm = { date: localISODate(), biopondKey: "", quantityKg: "" };

function validate(form, t) {
  const errs = {};
  if (!form.date) errs.date = t("opForm.dateRequired");
  if (!form.biopondKey) errs.biopondLabel = t("maggotForm.selectBiopond");
  if (!form.quantityKg || Number(form.quantityKg) <= 0) errs.quantityKg = t("maggotForm.qtyRequired");
  return errs;
}

export default function MaggotHarvestForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { allBioponds, releaseBiopond } = useBiopond();
  const { addMaggotHarvest } = useProductionLog();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedInfo, setSavedInfo] = useState(null);

  // Only occupied bioponds can be harvested — once harvested it's released
  // back to Available, so an already-empty biopond has nothing to pick here.
  const options = useMemo(() => allBioponds
    .filter((b) => b.status === "Occupied")
    .map((b) => ({ key: `${b.rackId}:${b.id}`, rackId: b.rackId, biopondId: b.id, label: `${b.rackName} - ${t("biopond.biopondLabel")} ${b.number}` })),
  [allBioponds, t]);

  const errors = touched ? validate(form, t) : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form, t)).length > 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setNetError(true); return; }
    setNetError(false);
    setSaving(true);
    const selected = options.find((o) => o.key === form.biopondKey);
    try {
      await addMaggotHarvest({ date: form.date, biopondLabel: selected?.label, quantityKg: form.quantityKg, createdBy: session?.user?.name });
      if (selected) {
        try {
          await releaseBiopond(selected.rackId, selected.biopondId);
        } catch {
          // Harvest is already recorded — releasing the biopond is a best-effort
          // follow-up, so a failure here shouldn't block the success screen.
        }
      }
      setSavedInfo({ qty: form.quantityKg, biopond: selected?.label || "" });
      setSaved(true);
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return <SuccessScreen title={t("maggotForm.successTitle")} message={t("maggotForm.successMessage", savedInfo)} />;
  }

  return (
    <>
      <BackHeader title={t("maggotForm.title")} to="/operator/production" />
      <div className="op-content">
        {netError && <div className="op-net-error"><WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div>{t("opForm.netErrorMessage")}</div></div>}
        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.date ? "has-err" : ""}`}>
            <label>{t("opForm.date")}</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <div className="err">{errors.date}</div>}
          </div>
          <div className={`op-field ${errors.biopondLabel ? "has-err" : ""}`}>
            <label>{t("maggotForm.biopondNumber")}</label>
            <select value={form.biopondKey} onChange={(e) => setForm({ ...form, biopondKey: e.target.value })}>
              <option value="" disabled>{t("maggotForm.selectBiopondPlaceholder")}</option>
              {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            {errors.biopondLabel && <div className="err">{errors.biopondLabel}</div>}
            {options.length === 0 && <div className="err">{t("maggotForm.noOccupiedBioponds")}</div>}
          </div>
          <div className={`op-field ${errors.quantityKg ? "has-err" : ""}`}>
            <label>{t("maggotForm.harvestQuantity")}</label>
            <div className="op-input-unit">
              <input type="number" min={1} placeholder="e.g. 25" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
              <span className="unit-suffix">kg</span>
            </div>
            {errors.quantityKg && <div className="err">{errors.quantityKg}</div>}
          </div>
          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("maggotForm.saveHarvest")}
          </button>
        </form>
      </div>
    </>
  );
}
