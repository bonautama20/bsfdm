import React, { useEffect, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { localISODate, addDays } from "../../context/BiopondContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

// BSF eggs typically hatch ~4 days after collection — operators in the field
// don't track this, so it's estimated automatically to keep the batch record
// consistent with the ones admins create manually (which do set it by hand).
const INCUBATION_DAYS = 4;

const emptyForm = { date: localISODate(), quantityGram: "", cage: "" };

function validate(form, t) {
  const errs = {};
  if (!form.date) errs.date = t("opForm.dateRequired");
  if (!form.quantityGram || Number(form.quantityGram) <= 0) errs.quantityGram = t("eggForm.qtyRequired");
  if (!form.cage) errs.cage = t("eggForm.cageRequired");
  return errs;
}

export default function EggHarvestForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [cages, setCages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/breeder-cages").then(setCages).catch(() => {});
  }, []);

  const errors = touched ? validate(form, t) : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form, t)).length > 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setNetError(true); return; }
    setNetError(false);
    setSaving(true);
    try {
      await api.post("/egg-batches", {
        collectionDate: form.date,
        eggWeightG: Number(form.quantityGram),
        sourceCage: form.cage,
        estHatchDate: addDays(form.date, INCUBATION_DAYS),
        createdBy: session?.user?.name,
      });
      setSaved(true);
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return <SuccessScreen title={t("eggForm.successTitle")} message={t("eggForm.successMessage", { qty: form.quantityGram, date: form.date })} />;
  }

  return (
    <>
      <BackHeader title={t("eggForm.title")} to="/operator/production" />
      <div className="op-content">
        {netError && <div className="op-net-error"><WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div>{t("opForm.netErrorMessage")}</div></div>}
        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.date ? "has-err" : ""}`}>
            <label>{t("opForm.date")}</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <div className="err">{errors.date}</div>}
          </div>
          <div className={`op-field ${errors.quantityGram ? "has-err" : ""}`}>
            <label>{t("eggForm.eggQuantity")}</label>
            <div className="op-input-unit">
              <input type="number" min={1} placeholder="e.g. 85" value={form.quantityGram} onChange={(e) => setForm({ ...form, quantityGram: e.target.value })} />
              <span className="unit-suffix">gram</span>
            </div>
            {errors.quantityGram && <div className="err">{errors.quantityGram}</div>}
          </div>
          <div className={`op-field ${errors.cage ? "has-err" : ""}`}>
            <label>{t("eggForm.sourceCage")}</label>
            <select value={form.cage} onChange={(e) => setForm({ ...form, cage: e.target.value })}>
              <option value="" disabled>{t("eggForm.selectCage")}</option>
              {cages.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
            {errors.cage && <div className="err">{errors.cage}</div>}
          </div>
          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("eggForm.saveEggHarvest")}
          </button>
        </form>
      </div>
    </>
  );
}
