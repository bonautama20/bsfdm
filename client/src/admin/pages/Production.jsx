import React, { useEffect, useMemo, useState } from "react";
import { Bug, Scale, Egg, Users, Sprout, Droplets, Plus, Pencil, Trash2 } from "lucide-react";
import DataTable from "../../components/ui/DataTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import BiopondBoard from "../components/BiopondBoard.jsx";
import { useBiopond, localISODate } from "../../context/BiopondContext.jsx";
import { useProductionLog } from "../../context/ProductionLogContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtNumber, fmtDate } from "../../utils/format.js";

function Field({ label, children }) {
  return <div className="db-field"><label>{label}</label>{children}</div>;
}

const BREEDER_TYPE_KEY = { Prepupa: "breederForm.prepupa", Pupa: "breederForm.pupa" };

export default function Production() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { allBioponds, totals: biopondTotals, releaseBiopond } = useBiopond();
  // Same shared context the operator forms write through — the field logs
  // below are guaranteed to match exactly what operators submitted, live.
  const { kasgotRecords, breederRecords, feedRecords, maggotHarvests, addMaggotHarvest } = useProductionLog();
  const [active, setActive] = useState("maggot");
  const [eggs, setEggs] = useState([]);
  const [kasgot, setKasgot] = useState([]);
  const [breederCages, setBreederCages] = useState([]);

  useEffect(() => {
    api.get("/egg-batches").then(setEggs).catch(() => {});
    api.get("/kasgot-batches").then(setKasgot).catch(() => {});
    api.get("/breeder-cages").then(setBreederCages).catch(() => {});
  }, []);

  const feedStats = useMemo(() => {
    const today = localISODate();
    const todayKg = feedRecords.filter((f) => f.date === today).reduce((s, f) => s + f.quantityKg, 0);
    const monthPrefix = today.slice(0, 7);
    const monthKg = feedRecords.filter((f) => f.date?.startsWith(monthPrefix)).reduce((s, f) => s + f.quantityKg, 0);
    return { todayKg, monthKg, count: feedRecords.length };
  }, [feedRecords]);

  const maggotStats = useMemo(() => {
    const occupied = allBioponds.filter((b) => b.status === "Occupied");
    const totalLarvae = occupied.reduce((s, b) => s + (b.babyMaggotQty || 0), 0);
    const today = localISODate();
    const avgAgeDays = occupied.length
      ? Math.round(occupied.reduce((s, b) => s + (new Date(today) - new Date(b.dateIn)) / 86400000, 0) / occupied.length)
      : 0;
    const nextHarvestDate = occupied.length
      ? occupied.map((b) => b.harvestDate).sort()[0]
      : null;
    return { occupiedCount: occupied.length, totalLarvae, avgAgeDays, nextHarvestDate };
  }, [allBioponds]);

  // Same "occupied bioponds only" option list + label format as the operator's
  // Maggot Harvest form (operator/pages/MaggotHarvestForm.jsx), so admin sees
  // exactly the same choices and picking one releases it the same way.
  const occupiedBiopondOptions = useMemo(() => allBioponds
    .filter((b) => b.status === "Occupied")
    .map((b) => ({ key: `${b.rackId}:${b.id}`, rackId: b.rackId, biopondId: b.id, label: `${b.rackName} - ${t("biopond.biopondLabel")} ${b.number}` })),
  [allBioponds, t]);

  const maggotHarvestStats = useMemo(() => {
    const today = localISODate();
    const todayKg = maggotHarvests.filter((h) => h.date === today).reduce((s, h) => s + (h.quantityKg || 0), 0);
    const monthPrefix = today.slice(0, 7);
    const monthKg = maggotHarvests.filter((h) => h.date?.startsWith(monthPrefix)).reduce((s, h) => s + (h.quantityKg || 0), 0);
    return { todayKg, monthKg, count: maggotHarvests.length };
  }, [maggotHarvests]);

  const eggStats = useMemo(() => {
    const today = localISODate();
    const monthPrefix = today.slice(0, 7);
    const todayEntries = eggs.filter((b) => b.collectionDate === today);
    const monthEntries = eggs.filter((b) => b.collectionDate?.startsWith(monthPrefix));
    const todayKg = todayEntries.reduce((s, b) => s + (b.eggWeightG || 0), 0) / 1000;
    const monthlyKg = monthEntries.reduce((s, b) => s + (b.eggWeightG || 0), 0) / 1000;
    const avgYieldG = eggs.length
      ? Math.round(eggs.reduce((s, b) => s + (b.eggWeightG || 0), 0) / eggs.length)
      : 0;
    const upcoming = eggs.map((e) => e.estHatchDate).filter((d) => d && d >= today).sort();
    return { todayKg, monthlyKg, collectionUnits: eggs.length, avgYieldG, nextHarvestDate: upcoming[0] || null };
  }, [eggs]);

  const breederStats = useMemo(() => {
    const activeCages = breederCages.filter((c) => c.status === "Active").length;
    const estAdultPopulation = breederCages.reduce((s, c) => s + (c.adultEmergence || 0), 0);
    const avgMortality = breederCages.length
      ? +(breederCages.reduce((s, c) => s + (c.mortality || 0), 0) / breederCages.length).toFixed(1)
      : 0;
    return { activeCages, estAdultPopulation, avgMortality };
  }, [breederCages]);

  const kasgotStats = useMemo(() => {
    const today = localISODate();
    const monthPrefix = today.slice(0, 7);
    const todayKg = kasgotRecords.filter((k) => k.date === today).reduce((s, k) => s + (k.quantityKg || 0), 0);
    const monthlyKg = kasgotRecords.filter((k) => k.date?.startsWith(monthPrefix)).reduce((s, k) => s + (k.quantityKg || 0), 0);
    const availableStockKg = kasgot.reduce((s, k) => s + (k.stock || 0), 0);
    const soldQtyKg = kasgot.reduce((s, k) => s + Math.max((k.driedWeightKg || 0) - (k.stock || 0), 0), 0);
    return { todayKg, monthlyKg, availableStockKg, soldQtyKg };
  }, [kasgotRecords, kasgot]);

  const [modal, setModal] = useState(null); // 'add-egg' | 'add-kasgot'
  const [form, setForm] = useState({});
  const [editingEggId, setEditingEggId] = useState(null);
  const [deleteEggId, setDeleteEggId] = useState(null);

  const closeModal = () => { setModal(null); setForm({}); setEditingEggId(null); };

  const openEditEgg = (egg) => {
    setEditingEggId(egg.id);
    setForm({ collectionDate: egg.collectionDate, weight: egg.eggWeightG, cage: egg.sourceCage, estHatch: egg.estHatchDate });
    setModal("add-egg");
  };

  const handleSaveEgg = async (e) => {
    e.preventDefault();
    const isEdit = !!editingEggId;
    const targetId = editingEggId;
    closeModal();
    const payload = {
      collectionDate: form.collectionDate || localISODate(),
      eggWeightG: Number(form.weight) || 480,
      sourceCage: form.cage || breederCages[0]?.id,
      estHatchDate: form.estHatch || localISODate(),
    };
    try {
      if (isEdit) {
        const updated = await api.patch(`/egg-batches/${targetId}`, payload);
        setEggs((prev) => prev.map((egg) => (egg.id === targetId ? updated : egg)));
      } else {
        const created = await api.post("/egg-batches", payload);
        setEggs((prev) => [created, ...prev]);
      }
    } catch (err) {
      alert(err.message || t("production.failedAddEgg"));
    }
  };

  const deleteEgg = async () => {
    const id = deleteEggId;
    setDeleteEggId(null);
    try {
      await api.delete(`/egg-batches/${id}`);
      setEggs((prev) => prev.filter((egg) => egg.id !== id));
    } catch (err) {
      alert(err.message || t("production.failedDeleteEgg"));
    }
  };

  const handleAddMaggotHarvest = async (e) => {
    e.preventDefault();
    closeModal();
    const selected = occupiedBiopondOptions.find((o) => o.key === form.maggotBiopondKey);
    try {
      await addMaggotHarvest({ date: form.date || localISODate(), biopondLabel: selected?.label, quantityKg: form.quantityKg, createdBy: session?.user?.name });
      if (selected) {
        try {
          await releaseBiopond(selected.rackId, selected.biopondId);
        } catch {
          // Harvest is already recorded — releasing the biopond is a best-effort
          // follow-up, same as the operator form's behavior.
        }
      }
    } catch (err) {
      alert(err.message || t("production.failedAddMaggotHarvest"));
    }
  };

  const handleAddKasgot = async (e) => {
    e.preventDefault();
    closeModal();
    try {
      const created = await api.post("/kasgot-batches", {
        sourceBiopond: form.biopondId || "BP-001",
        processingDate: form.date || localISODate(),
        rawWeightKg: Number(form.rawWeight) || 800,
        driedWeightKg: Number(form.driedWeight) || 560,
        packaging: form.packaging || "25kg Sack",
      });
      setKasgot((prev) => [created, ...prev]);
    } catch (err) {
      alert(err.message || t("production.failedAddKasgot"));
    }
  };

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("production.title")}</h1>
        <p>{t("production.subtitle")}</p>
      </div>

      <div className="db-row db-grid-6">
        <div className={`db-card clickable ${active === "maggot" ? "" : ""}`} onClick={() => setActive("maggot")} style={active === "maggot" ? { borderColor: "#01613C" } : undefined}>
          <div className="db-kpi">
            <div className="ic-wrap"><Bug size={20} /></div>
            <div className="label">{t("production.maggotRearing")}</div>
            <div className="value">{maggotStats.occupiedCount} {t("production.active")}</div>
            <div className="foot">
              <span className="today">{fmtNumber(maggotStats.totalLarvae)} {t("production.larvae")} · {biopondTotals.total} {t("production.bioponds")}</span>
            </div>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 8 }}>
            {t("production.avgAge")} {maggotStats.avgAgeDays}d · {biopondTotals.available} {t("production.bioponsAvailable")} · {t("production.nextHarvest")} {maggotStats.nextHarvestDate ? fmtDate(maggotStats.nextHarvestDate) : "—"}
          </div>
        </div>

        <div className="db-card clickable" onClick={() => setActive("maggotHarvest")} style={active === "maggotHarvest" ? { borderColor: "#01613C" } : undefined}>
          <div className="db-kpi">
            <div className="ic-wrap"><Scale size={20} /></div>
            <div className="label">{t("production.maggotHarvest")}</div>
            <div className="value">{fmtNumber(maggotHarvestStats.todayKg)} {t("production.kgToday")}</div>
            <div className="foot"><span className="today">{fmtNumber(maggotHarvestStats.monthKg)} {t("production.kgThisMonth")}</span></div>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 8 }}>
            {maggotHarvestStats.count} {t("production.maggotHarvestRecorded")}
          </div>
        </div>

        <div className="db-card clickable" onClick={() => setActive("eggs")} style={active === "eggs" ? { borderColor: "#01613C" } : undefined}>
          <div className="db-kpi">
            <div className="ic-wrap"><Egg size={20} /></div>
            <div className="label">{t("production.bsfEggs")}</div>
            <div className="value">{fmtNumber(eggStats.todayKg)} {t("production.kgToday")}</div>
            <div className="foot"><span className="today">{fmtNumber(eggStats.monthlyKg)} {t("production.kgThisMonth")}</span></div>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 8 }}>
            {eggStats.collectionUnits} {t("production.collectionUnits")} · {t("production.avgYield")} {eggStats.avgYieldG}g · {t("production.next")} {eggStats.nextHarvestDate ? fmtDate(eggStats.nextHarvestDate) : "—"}
          </div>
        </div>

        <div className="db-card clickable" onClick={() => setActive("breeder")} style={active === "breeder" ? { borderColor: "#01613C" } : undefined}>
          <div className="db-kpi">
            <div className="ic-wrap"><Users size={20} /></div>
            <div className="label">{t("production.breederStock")}</div>
            <div className="value">{breederStats.activeCages} {t("production.activeCages")}</div>
            <div className="foot"><span className="today">{fmtNumber(breederStats.estAdultPopulation)} {t("production.adultsEst")}</span></div>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 8 }}>
            {t("production.mortality")} {breederStats.avgMortality}%
          </div>
        </div>

        <div className="db-card clickable" onClick={() => setActive("kasgot")} style={active === "kasgot" ? { borderColor: "#01613C" } : undefined}>
          <div className="db-kpi">
            <div className="ic-wrap"><Sprout size={20} /></div>
            <div className="label">{t("production.kasgotFertilizer")}</div>
            <div className="value">{fmtNumber(kasgotStats.todayKg)} {t("production.kgToday")}</div>
            <div className="foot"><span className="today">{fmtNumber(kasgotStats.monthlyKg)} {t("production.kgThisMonth")}</span></div>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 8 }}>
            {t("production.stock")} {fmtNumber(kasgotStats.availableStockKg)} kg · {t("production.sold")} {fmtNumber(kasgotStats.soldQtyKg)} kg
          </div>
        </div>

        <div className="db-card clickable" onClick={() => setActive("feed")} style={active === "feed" ? { borderColor: "#01613C" } : undefined}>
          <div className="db-kpi">
            <div className="ic-wrap"><Droplets size={20} /></div>
            <div className="label">{t("production.feed")}</div>
            <div className="value">{fmtNumber(feedStats.todayKg)} {t("production.kgToday")}</div>
            <div className="foot"><span className="today">{fmtNumber(feedStats.monthKg)} {t("production.kgThisMonth")}</span></div>
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 8 }}>
            {feedStats.count} {t("production.feedReceived").toLowerCase()}
          </div>
        </div>
      </div>

      {active === "maggot" && <BiopondBoard />}

      {active === "maggotHarvest" && (
        <div className="db-card">
          <div className="db-card-head">
            <h3>{t("production.maggotHarvestLogTitle")}</h3>
            <button className="db-btn db-btn-primary db-btn-sm" onClick={() => setModal("add-maggot-harvest")}><Plus size={14} /> {t("production.addMaggotHarvest")}</button>
          </div>
          <DataTable
            columns={[
              { key: "date", label: t("common.date"), sortable: true, render: (r) => fmtDate(r.date) },
              { key: "biopondLabel", label: t("production.colBiopond") },
              { key: "quantityKg", label: t("production.colQuantityKg"), sortable: true, render: (r) => fmtNumber(r.quantityKg) },
              { key: "createdBy", label: t("production.colRecordedBy") },
            ]}
            rows={maggotHarvests}
            pageSize={8}
          />
        </div>
      )}

      {active === "eggs" && (
        <div className="db-card">
          <div className="db-card-head">
            <h3>{t("production.eggProductionTitle")}</h3>
            <button className="db-btn db-btn-primary db-btn-sm" onClick={() => setModal("add-egg")}><Plus size={14} /> {t("production.addEggProduction")}</button>
          </div>
          <DataTable
            columns={[
              { key: "id", label: t("production.colEggBatchId"), sortable: true },
              { key: "collectionDate", label: t("production.colCollectionDate"), sortable: true, render: (r) => fmtDate(r.collectionDate) },
              { key: "eggWeightG", label: t("production.colEggWeight"), sortable: true, render: (r) => `${r.eggWeightG} g` },
              { key: "sourceCage", label: t("production.colSourceCage"), sortable: true },
              { key: "estHatchDate", label: t("production.colEstHatch"), render: (r) => fmtDate(r.estHatchDate) },
              { key: "status", label: t("common.status"), render: (r) => <Badge>{r.status}</Badge> },
              { key: "createdBy", label: t("production.colRecordedBy"), render: (r) => r.createdBy || "—" },
              {
                key: "actions", label: "", render: (r) => (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="db-btn db-btn-ghost db-btn-sm" title={t("common.edit")} onClick={() => openEditEgg(r)}><Pencil size={13} /></button>
                    <button className="db-btn db-btn-ghost db-btn-sm" title={t("common.delete")} onClick={() => setDeleteEggId(r.id)}><Trash2 size={13} /></button>
                  </div>
                )
              },
            ]}
            rows={eggs}
            pageSize={6}
          />
        </div>
      )}

      {active === "breeder" && (
        <div className="db-card">
          <div className="db-card-head"><h3>{t("production.breederCagesTitle")}</h3></div>
          <DataTable
            columns={[
              { key: "id", label: t("production.colCageId"), sortable: true },
              { key: "pupaeEntryDate", label: t("production.colPupaeEntry"), sortable: true, render: (r) => fmtDate(r.pupaeEntryDate) },
              { key: "pupaeQty", label: t("production.colPupaeQty"), sortable: true, render: (r) => fmtNumber(r.pupaeQty) },
              { key: "adultEmergence", label: t("production.colAdultEmergence"), sortable: true, render: (r) => fmtNumber(r.adultEmergence) },
              { key: "eggProductionG", label: t("production.colEggProduction"), render: (r) => `${r.eggProductionG} g` },
              { key: "cycle", label: t("production.colCycle") },
              { key: "mortality", label: t("production.colMortality"), sortable: true, render: (r) => `${r.mortality}%` },
              { key: "status", label: t("common.status"), render: (r) => <Badge>{r.status}</Badge> },
            ]}
            rows={breederCages}
            pageSize={6}
          />
        </div>
      )}

      {active === "breeder" && (
        <div className="db-card">
          <div className="db-card-head"><h3>{t("production.fieldBreederLogTitle")}</h3></div>
          <DataTable
            columns={[
              { key: "type", label: t("production.colType"), render: (r) => BREEDER_TYPE_KEY[r.type] ? t(BREEDER_TYPE_KEY[r.type]) : r.type },
              { key: "date", label: t("common.date"), sortable: true, render: (r) => fmtDate(r.date) },
              { key: "quantity", label: t("breederForm.quantity"), sortable: true, render: (r) => `${fmtNumber(r.quantity)} ${r.unit}` },
              { key: "createdBy", label: t("production.colRecordedBy") },
            ]}
            rows={breederRecords}
            pageSize={6}
          />
        </div>
      )}

      {active === "kasgot" && (
        <div className="db-card">
          <div className="db-card-head">
            <h3>{t("production.kasgotBatchesTitle")}</h3>
            <button className="db-btn db-btn-primary db-btn-sm" onClick={() => setModal("add-kasgot")}><Plus size={14} /> {t("production.recordKasgotProduction")}</button>
          </div>
          <DataTable
            columns={[
              { key: "id", label: t("production.colBatchId"), sortable: true },
              { key: "sourceBiopond", label: t("production.colSourceBiopond"), sortable: true },
              { key: "processingDate", label: t("production.colProcessingDate"), sortable: true, render: (r) => fmtDate(r.processingDate) },
              { key: "rawWeightKg", label: t("production.colRawWeight"), render: (r) => `${fmtNumber(r.rawWeightKg)} kg` },
              { key: "driedWeightKg", label: t("production.colFinalWeight"), render: (r) => `${fmtNumber(r.driedWeightKg)} kg` },
              { key: "packaging", label: t("production.colPackaging") },
              { key: "stock", label: t("production.colStock"), sortable: true, render: (r) => `${fmtNumber(r.stock)} kg` },
              { key: "salesStatus", label: t("production.colSalesStatus"), render: (r) => <Badge>{r.salesStatus}</Badge> },
            ]}
            rows={kasgot}
            pageSize={6}
          />
        </div>
      )}

      {active === "kasgot" && (
        <div className="db-card">
          <div className="db-card-head"><h3>{t("production.fieldKasgotLogTitle")}</h3></div>
          <DataTable
            columns={[
              { key: "date", label: t("common.date"), sortable: true, render: (r) => fmtDate(r.date) },
              { key: "biopondLabel", label: t("production.colBiopond") },
              { key: "quantityKg", label: t("production.colQuantityKg"), sortable: true, render: (r) => fmtNumber(r.quantityKg) },
              { key: "createdBy", label: t("production.colRecordedBy") },
            ]}
            rows={kasgotRecords}
            pageSize={6}
          />
        </div>
      )}

      {active === "feed" && (
        <div className="db-card">
          <div className="db-card-head">
            <h3>{t("production.feedLogTitle")}</h3>
          </div>
          <p className="sub" style={{ marginTop: -8, marginBottom: 16 }}>{t("production.feedSubtitle")}</p>
          <DataTable
            columns={[
              { key: "date", label: t("common.date"), sortable: true, render: (r) => fmtDate(r.date) },
              { key: "clientName", label: t("production.colHotel"), sortable: true },
              { key: "quantityKg", label: t("production.colQuantityKg"), sortable: true, render: (r) => fmtNumber(r.quantityKg) },
              { key: "createdBy", label: t("production.colRecordedBy") },
            ]}
            rows={feedRecords}
            pageSize={8}
          />
        </div>
      )}

      {/* ---- Modals ---- */}
      <Modal open={modal === "add-egg"} onClose={closeModal} title={editingEggId ? t("production.editEggTitle") : t("production.modalAddEggTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="egg-form" type="submit">{t("common.save")}</button></>}>
        <form id="egg-form" onSubmit={handleSaveEgg}>
          <div className="db-field-row">
            <Field label={t("production.modalCollectionDate")}><input type="date" value={form.collectionDate || ""} onChange={(e) => setForm({ ...form, collectionDate: e.target.value })} required /></Field>
            <Field label={t("production.modalEggWeight")}><input type="number" placeholder="480" value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: e.target.value })} required /></Field>
          </div>
          <div className="db-field-row">
            <Field label={t("production.modalSourceCage")}>
              <select className="db-select" style={{ width: "100%" }} value={form.cage || ""} onChange={(e) => setForm({ ...form, cage: e.target.value })} required>
                <option value="" disabled>{t("production.selectCage")}</option>
                {breederCages.map((c) => <option key={c.id} value={c.id}>{c.id}</option>)}
              </select>
            </Field>
            <Field label={t("production.modalEstHatchDate")}><input type="date" value={form.estHatch || ""} onChange={(e) => setForm({ ...form, estHatch: e.target.value })} required /></Field>
          </div>
        </form>
      </Modal>

      <Modal open={modal === "add-kasgot"} onClose={closeModal} title={t("production.modalAddKasgotTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="kasgot-form" type="submit">{t("common.save")}</button></>}>
        <form id="kasgot-form" onSubmit={handleAddKasgot}>
          <div className="db-field-row">
            <Field label={t("production.modalSourceBiopond")}><input placeholder="BP-041" value={form.biopondId || ""} onChange={(e) => setForm({ ...form, biopondId: e.target.value })} required /></Field>
            <Field label={t("production.modalProcessingDate")}><input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></Field>
          </div>
          <div className="db-field-row">
            <Field label={t("production.modalRawWeight")}><input type="number" placeholder="800" value={form.rawWeight || ""} onChange={(e) => setForm({ ...form, rawWeight: e.target.value })} required /></Field>
            <Field label={t("production.modalFinalWeight")}><input type="number" placeholder="560" value={form.driedWeight || ""} onChange={(e) => setForm({ ...form, driedWeight: e.target.value })} required /></Field>
          </div>
          <Field label={t("production.modalPackaging")}>
            <select className="db-select" style={{ width: "100%" }} value={form.packaging || "25kg Sack"} onChange={(e) => setForm({ ...form, packaging: e.target.value })}>
              <option>25kg Sack</option>
              <option>50kg Sack</option>
            </select>
          </Field>
        </form>
      </Modal>

      <Modal open={modal === "add-maggot-harvest"} onClose={closeModal} title={t("production.modalAddMaggotHarvestTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeModal}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="maggot-harvest-form" type="submit">{t("common.save")}</button></>}>
        <form id="maggot-harvest-form" onSubmit={handleAddMaggotHarvest}>
          <Field label={t("opForm.date")}><input type="date" value={form.date || localISODate()} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></Field>
          <Field label={t("maggotForm.biopondNumber")}>
            <select className="db-select" style={{ width: "100%" }} value={form.maggotBiopondKey || ""} onChange={(e) => setForm({ ...form, maggotBiopondKey: e.target.value })} required>
              <option value="" disabled>{t("maggotForm.selectBiopondPlaceholder")}</option>
              {occupiedBiopondOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            {occupiedBiopondOptions.length === 0 && <div className="err">{t("maggotForm.noOccupiedBioponds")}</div>}
          </Field>
          <Field label={t("maggotForm.harvestQuantity")}><input type="number" min={1} placeholder="e.g. 25" value={form.quantityKg || ""} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} required /></Field>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteEggId} onClose={() => setDeleteEggId(null)} onConfirm={deleteEgg}
        title={t("production.deleteEggTitle")} message={t("production.deleteEggMessage")} />
    </div>
  );
}
