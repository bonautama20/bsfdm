import React, { useEffect, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { localISODate } from "../../context/BiopondContext.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyForm = { date: localISODate(), clientName: "", quantityKg: "" };

function validate(form, t) {
  const errs = {};
  if (!form.date) errs.date = t("opForm.dateRequired");
  if (!form.clientName) errs.clientName = t("feedForm.selectHotel");
  if (!form.quantityKg || Number(form.quantityKg) <= 0) errs.quantityKg = t("feedForm.qtyRequired");
  return errs;
}

export default function FeedForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { addFeedRecord } = useProductionLog();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    api.get("/hotels").then(setHotels).catch(() => {});
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
      await addFeedRecord({ ...form, createdBy: session?.user?.name });
      setSaved(true);
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return <SuccessScreen title={t("feedForm.successTitle")} message={t("feedForm.successMessage", { qty: form.quantityKg, client: form.clientName })} />;
  }

  return (
    <>
      <BackHeader title={t("feedForm.title")} to="/operator/production" />
      <div className="op-content">
        {netError && <div className="op-net-error"><WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div>{t("opForm.netErrorMessage")}</div></div>}
        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.date ? "has-err" : ""}`}>
            <label>{t("opForm.date")}</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            {errors.date && <div className="err">{errors.date}</div>}
          </div>
          <div className={`op-field ${errors.clientName ? "has-err" : ""}`}>
            <label>{t("feedForm.hotel")}</label>
            <select value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })}>
              <option value="" disabled>{t("feedForm.selectHotelPlaceholder")}</option>
              {hotels.map((h) => <option key={h.id} value={h.name}>{h.name}</option>)}
            </select>
            {errors.clientName && <div className="err">{errors.clientName}</div>}
          </div>
          <div className={`op-field ${errors.quantityKg ? "has-err" : ""}`}>
            <label>{t("feedForm.feedQuantity")}</label>
            <div className="op-input-unit">
              <input type="number" min={0.01} step="any" placeholder="e.g. 320.5" value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
              <span className="unit-suffix">kg</span>
            </div>
            {errors.quantityKg && <div className="err">{errors.quantityKg}</div>}
          </div>
          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("feedForm.saveFeed")}
          </button>
        </form>
      </div>
    </>
  );
}
