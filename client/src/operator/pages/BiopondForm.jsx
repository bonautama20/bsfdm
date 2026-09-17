import React, { useEffect, useMemo, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import BackHeader from "../components/BackHeader.jsx";
import SuccessScreen from "../components/SuccessScreen.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useBiopond, localISODate, addDays } from "../../context/BiopondContext.jsx";
import { HARVEST_CYCLE_DAYS } from "../../data/dummyData.js";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";

const emptyForm = { biopondKey: "", babyMaggotQty: "", dateIn: localISODate(), feedInKg: "", feedSource: "" };

// Feed Source is only required once the farm actually has client records to
// pick from (Client is a paid-only module — see server/middleware/plan.js) —
// a free-plan farm has no clients to select at all, so requiring one here
// would make it impossible to ever start a biopond. Once clients exist, the
// farm is expected to track which one supplied the feed, so it becomes
// required (still free text, not a locked-in dropdown value, in case the
// real source isn't one of the recorded clients).
function validate(form, t, hasClients) {
  const errs = {};
  if (!form.biopondKey) errs.biopondKey = t("biopondForm.selectBiopond");
  if (!form.babyMaggotQty || Number(form.babyMaggotQty) <= 0) errs.babyMaggotQty = t("biopondForm.babyMaggotQtyRequired");
  if (!form.dateIn) errs.dateIn = t("biopondForm.stockingDateRequired");
  if (!form.feedInKg || Number(form.feedInKg) <= 0) errs.feedInKg = t("biopondForm.feedAmountRequired");
  if (hasClients && !form.feedSource.trim()) errs.feedSource = t("biopondForm.feedSourceRequired");
  return errs;
}

export default function BiopondForm() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { racks, startProduction } = useBiopond();
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [netError, setNetError] = useState(false);
  const [saved, setSaved] = useState(null);
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    api.get("/hotels").then(setHotels).catch(() => {});
  }, []);

  const availableOptions = useMemo(() => racks.flatMap((r) =>
    r.bioponds.filter((b) => b.status === "Available").map((b) => ({ key: `${r.id}|${b.id}`, rackId: r.id, biopondId: b.id, label: `${r.name} - Biopond ${b.number}` }))
  ), [racks]);

  const hasClients = hotels.length > 0;
  const errors = touched ? validate(form, t, hasClients) : {};
  const harvestDate = form.dateIn ? addDays(form.dateIn, HARVEST_CYCLE_DAYS) : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(validate(form, t, hasClients)).length > 0) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setNetError(true); return; }
    setNetError(false);
    setSaving(true);
    const [rackId, biopondId] = form.biopondKey.split("|");
    const chosen = availableOptions.find((o) => o.key === form.biopondKey);
    try {
      await startProduction(rackId, biopondId, {
        babyMaggotQty: form.babyMaggotQty,
        dateIn: form.dateIn,
        feedInKg: form.feedInKg,
        feedSource: form.feedSource,
        harvestDate,
        createdBy: session?.user?.name,
      });
      setSaved({ label: chosen?.label });
    } catch {
      setNetError(true);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <SuccessScreen
        title={t("biopondForm.successTitle")}
        message={t("biopondForm.successMessage", { label: saved.label, date: harvestDate })}
        viewTo="/operator/calendar"
      />
    );
  }

  return (
    <>
      <BackHeader title={t("biopondForm.newTitle")} to="/operator/production" />
      <div className="op-content">
        {netError && (
          <div className="op-net-error">
            <WifiOff size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>{t("opForm.netErrorMessage")}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={`op-field ${errors.biopondKey ? "has-err" : ""}`}>
            <label>{t("biopondForm.biopondNumber")}</label>
            <select value={form.biopondKey} onChange={(e) => setForm({ ...form, biopondKey: e.target.value })}>
              <option value="" disabled>{t("biopondForm.selectAvailable")}</option>
              {availableOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            {errors.biopondKey && <div className="err">{errors.biopondKey}</div>}
          </div>

          <div className={`op-field ${errors.babyMaggotQty ? "has-err" : ""}`}>
            <label>{t("biopondForm.babyMaggotQty")}</label>
            <input type="number" min={1} placeholder="e.g. 15000" value={form.babyMaggotQty} onChange={(e) => setForm({ ...form, babyMaggotQty: e.target.value })} />
            {errors.babyMaggotQty && <div className="err">{errors.babyMaggotQty}</div>}
          </div>

          <div className={`op-field ${errors.dateIn ? "has-err" : ""}`}>
            <label>{t("biopondForm.stockingDate")}</label>
            <input type="date" value={form.dateIn} onChange={(e) => setForm({ ...form, dateIn: e.target.value })} />
            {errors.dateIn && <div className="err">{errors.dateIn}</div>}
          </div>

          <div className={`op-field ${errors.feedInKg ? "has-err" : ""}`}>
            <label>{t("biopondForm.feedAmount")}</label>
            <div className="op-input-unit">
              <input type="number" min={0.01} step="any" placeholder="e.g. 120.5" value={form.feedInKg} onChange={(e) => setForm({ ...form, feedInKg: e.target.value })} />
              <span className="unit-suffix">kg</span>
            </div>
            {errors.feedInKg && <div className="err">{errors.feedInKg}</div>}
          </div>

          <div className={`op-field ${errors.feedSource ? "has-err" : ""}`}>
            <label>{hasClients ? t("biopondForm.feedSource") : t("biopondForm.feedSourceOptional")}</label>
            <input
              type="text"
              list="feed-source-suggestions"
              placeholder={t("biopondForm.feedSourcePlaceholder")}
              value={form.feedSource}
              onChange={(e) => setForm({ ...form, feedSource: e.target.value })}
            />
            {hasClients && (
              <datalist id="feed-source-suggestions">
                {hotels.map((h) => <option key={h.id} value={h.name} />)}
              </datalist>
            )}
            {errors.feedSource && <div className="err">{errors.feedSource}</div>}
          </div>

          <div className="op-field">
            <label>{t("biopondForm.harvestDate")}</label>
            <input className="readonly" type="text" readOnly value={harvestDate || "—"} />
            <div className="hint">{t("biopondForm.autoCalc", { days: HARVEST_CYCLE_DAYS })}</div>
          </div>

          <button type="submit" className="op-submit" disabled={saving}>
            {saving ? <><Loader2 size={17} className="op-spin" /> {t("opForm.saving")}</> : t("biopondForm.saveProduction")}
          </button>
        </form>
      </div>
    </>
  );
}
