import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Boxes, CheckCircle2, AlertOctagon, Percent, Lock } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { useBiopond, localISODate, addDays } from "../../context/BiopondContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { fmtDate, fmtNumber } from "../../utils/format.js";

const HARVEST_DAYS = 8;

const emptyForm = { babyMaggotQty: "", dateIn: "", feedInKg: "", feedSource: "", harvestDate: "" };

export default function BiopondBoard() {
  const {
    racks, totals, findBiopond,
    addRack, renameRack, deleteRack, addBiopondToRack, deleteBiopond,
    startProduction, releaseBiopond,
  } = useBiopond();
  const { session } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [quotaLimit, setQuotaLimit] = useState(null); // number when the upgrade prompt should be open, else null

  // Shared by both "add rack" and "add biopond" failure paths — a free org
  // hitting server/middleware/plan.js's FREE_BIOPOND_LIMIT gets an upgrade
  // prompt (with the real limit from the server's response) instead of a raw
  // error alert; anything else still falls back to alert() like before.
  const handleBiopondError = (err, fallbackKey) => {
    if (err.limitReached) {
      setQuotaLimit(err.limit);
    } else {
      alert(err.message || t(fallbackKey));
    }
  };

  useEffect(() => {
    api.get("/hotels").then(setHotels).catch(() => {});
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addLineOpen, setAddLineOpen] = useState(false);
  const [lineForm, setLineForm] = useState({ name: "", count: 20 });

  const [renameTarget, setRenameTarget] = useState(null); // rackId
  const [renameValue, setRenameValue] = useState("");
  const [deleteRackId, setDeleteRackId] = useState(null);

  const [formTarget, setFormTarget] = useState(null); // { rackId, biopondId, mode: 'add' | 'edit' }
  const [formData, setFormData] = useState(emptyForm);
  const [detailTarget, setDetailTarget] = useState(null); // { rackId, biopondId }
  const [releaseTarget, setReleaseTarget] = useState(null); // { rackId, biopondId, type: 'harvest' | 'release' }
  const [deleteBiopondTarget, setDeleteBiopondTarget] = useState(null); // { rackId, biopondId }

  const displayRacks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return racks.map((rack) => ({
      ...rack,
      bioponds: rack.bioponds.filter((b) => {
        const matchesSearch = !q || `biopond ${b.number}`.includes(q) || String(b.number).includes(q);
        const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    }));
  }, [racks, search, statusFilter]);

  // ---------- Rack management ----------
  // Picks the first "Rak X" letter not already in use, instead of deriving
  // it from the rack count — the latter can suggest a name that already
  // exists (e.g. after a rack was deleted, or two people adding racks at
  // the same time), which used to let a rack silently get created with a
  // duplicate name; the server now rejects that outright, but a good
  // default here avoids the user ever hitting that error in the first place.
  const nextRackName = () => {
    const used = new Set(racks.map((r) => r.name.trim().toLowerCase()));
    let code = 65;
    while (used.has(`rak ${String.fromCharCode(code)}`.toLowerCase()) && code < 90) code++;
    return `Rak ${String.fromCharCode(code)}`;
  };
  const openAddLine = () => { setLineForm({ name: nextRackName(), count: 20 }); setAddLineOpen(true); };

  const handleAddLine = async (e) => {
    e.preventDefault();
    setAddLineOpen(false);
    try {
      await addRack(lineForm.name.trim() || `Rak ${racks.length + 1}`, Math.max(1, Number(lineForm.count) || 1));
    } catch (err) {
      handleBiopondError(err, "biopond.failedAddRack");
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    const name = renameValue.trim() || racks.find((r) => r.id === renameTarget)?.name;
    setRenameTarget(null);
    try {
      await renameRack(renameTarget, name);
    } catch (err) {
      alert(err.message || t("biopond.failedRenameRack"));
    }
  };

  const confirmDeleteRack = async () => {
    const id = deleteRackId;
    setDeleteRackId(null);
    try {
      await deleteRack(id);
    } catch (err) {
      alert(err.message || t("biopond.failedDeleteRack"));
    }
  };

  // ---------- Biopond form (add / edit) ----------
  const openAddForm = (rackId, biopond) => {
    const dateIn = localISODate();
    setFormTarget({ rackId, biopondId: biopond.id, mode: "add" });
    setFormData({ babyMaggotQty: "", dateIn, feedInKg: "", feedSource: "", harvestDate: addDays(dateIn, HARVEST_DAYS) });
  };

  const openEditForm = (rackId, biopond) => {
    setFormTarget({ rackId, biopondId: biopond.id, mode: "edit" });
    setFormData({
      babyMaggotQty: biopond.babyMaggotQty, dateIn: biopond.dateIn, feedInKg: biopond.feedInKg,
      feedSource: biopond.feedSource, harvestDate: biopond.harvestDate,
    });
    setDetailTarget(null);
  };

  const closeForm = () => { setFormTarget(null); setFormData(emptyForm); };

  const handleDateInChange = (value) => setFormData((f) => ({ ...f, dateIn: value, harvestDate: value ? addDays(value, HARVEST_DAYS) : "" }));

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formTarget) return;
    const target = formTarget;
    closeForm();
    try {
      await startProduction(target.rackId, target.biopondId, { ...formData, createdBy: session?.user?.name });
    } catch (err) {
      alert(err.message || t("biopond.failedSaveBiopond"));
    }
  };

  // ---------- Detail / release ----------
  const openDetail = (rackId, biopond) => setDetailTarget({ rackId, biopondId: biopond.id });

  const handleRelease = async () => {
    if (!releaseTarget) return;
    const target = releaseTarget;
    setReleaseTarget(null);
    try {
      await releaseBiopond(target.rackId, target.biopondId);
    } catch (err) {
      alert(err.message || t("biopond.failedReleaseBiopond"));
    }
  };

  const confirmDeleteBiopond = async () => {
    if (!deleteBiopondTarget) return;
    const target = deleteBiopondTarget;
    setDeleteBiopondTarget(null);
    try {
      await deleteBiopond(target.rackId, target.biopondId);
    } catch (err) {
      alert(err.message || t("biopond.failedDeleteBiopond"));
    }
  };

  const detailBiopond = detailTarget ? findBiopond(detailTarget.rackId, detailTarget.biopondId) : null;
  const deleteBiopondCandidate = deleteBiopondTarget ? findBiopond(deleteBiopondTarget.rackId, deleteBiopondTarget.biopondId) : null;

  return (
    <div>
      <div className="db-card-head" style={{ marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: "1.15rem" }}>{t("biopond.title")}</h3>
          <div className="sub">{t("biopond.subtitle")}</div>
        </div>
        <button className="db-btn db-btn-primary" onClick={openAddLine}><Plus size={15} /> {t("biopond.addProductionLine")}</button>
      </div>

      <div className="db-row db-grid-4">
        <div className="db-card db-kpi">
          <div className="ic-wrap"><Boxes size={20} /></div>
          <div className="label">{t("biopond.totalBioponds")}</div>
          <div className="value">{totals.total}</div>
        </div>
        <div className="db-card db-kpi">
          <div className="ic-wrap" style={{ background: "var(--db-success-light)", color: "var(--db-success)" }}><CheckCircle2 size={20} /></div>
          <div className="label">{t("biopond.available")}</div>
          <div className="value">{totals.available}</div>
        </div>
        <div className="db-card db-kpi">
          <div className="ic-wrap" style={{ background: "var(--db-danger-light)", color: "var(--db-danger)" }}><AlertOctagon size={20} /></div>
          <div className="label">{t("biopond.occupied")}</div>
          <div className="value">{totals.occupied}</div>
        </div>
        <div className="db-card db-kpi">
          <div className="ic-wrap" style={{ background: "var(--db-warning-light)", color: "var(--db-warning)" }}><Percent size={20} /></div>
          <div className="label">{t("biopond.utilization")}</div>
          <div className="value">{totals.utilization}%</div>
        </div>
      </div>

      <div className="db-toolbar">
        <div className="db-search-input grow">
          <Search size={15} />
          <input className="db-input" style={{ width: "100%" }} placeholder={t("biopond.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="db-pill-group">
          {[{ v: "all", l: t("common.all") }, { v: "available", l: t("biopond.available") }, { v: "occupied", l: t("biopond.occupied") }].map((f) => (
            <button key={f.v} className={`db-pill ${statusFilter === f.v ? "active" : ""}`} onClick={() => setStatusFilter(f.v)}>{f.l}</button>
          ))}
        </div>
      </div>

      {displayRacks.map((rack) => (
        <div className="biopond-rack" key={rack.id}>
          <div className="biopond-rack-head">
            <div className="name">{rack.name}</div>
            <div className="actions">
              <button className="biopond-rack-icon-btn" title={t("biopond.renameRack")} onClick={() => { setRenameTarget(rack.id); setRenameValue(rack.name); }}><Pencil size={13} /></button>
              <button className="biopond-rack-icon-btn" title={t("biopond.deleteRack")} onClick={() => setDeleteRackId(rack.id)}><Trash2 size={13} /></button>
              <button className="db-btn db-btn-sm" onClick={() => addBiopondToRack(rack.id).catch((err) => handleBiopondError(err, "biopond.failedAddBiopond"))}><Plus size={13} /> {t("biopond.addBiopond")}</button>
            </div>
          </div>

          {rack.bioponds.length === 0 ? (
            <EmptyState title={t("biopond.noMatchTitle")} message={t("biopond.noMatchMessage")} />
          ) : (
            <div className="biopond-grid">
              {rack.bioponds.map((b) => (
                <div className="biopond-pill-wrap" key={b.id}>
                  <button
                    className={`biopond-pill ${b.status === "Available" ? "available" : "occupied"}`}
                    title={b.status === "Occupied" ? `${t("biopond.feedSource")}: ${b.feedSource}\n${t("biopond.harvestDate")}: ${fmtDate(b.harvestDate)}\n${t("biopond.updated")}: ${fmtDate(b.updatedAt)}` : t("biopond.available")}
                    onClick={() => (b.status === "Available" ? openAddForm(rack.id, b) : openDetail(rack.id, b))}
                  >
                    <span>{t("biopond.biopondLabel")} {b.number}</span>
                    {b.status === "Occupied" && <span className="sub">{t("biopond.occupied")}</span>}
                  </button>
                  <button
                    className="biopond-delete-btn"
                    title={t("biopond.deleteBiopond")}
                    onClick={(e) => { e.stopPropagation(); setDeleteBiopondTarget({ rackId: rack.id, biopondId: b.id }); }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add Production Line */}
      <Modal open={addLineOpen} onClose={() => setAddLineOpen(false)} title={t("biopond.addProductionLineTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={() => setAddLineOpen(false)}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="add-line-form" type="submit">{t("biopond.addLine")}</button></>}>
        <form id="add-line-form" onSubmit={handleAddLine}>
          <div className="db-field"><label>{t("biopond.rackName")}</label><input value={lineForm.name} onChange={(e) => setLineForm({ ...lineForm, name: e.target.value })} required /></div>
          <div className="db-field"><label>{t("biopond.numberOfBioponds")}</label><input type="number" min={1} value={lineForm.count} onChange={(e) => setLineForm({ ...lineForm, count: e.target.value })} required /></div>
        </form>
      </Modal>

      {/* Rename rack */}
      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title={t("biopond.renameRackTitle")}
        footer={<><button className="db-btn db-btn-outline" onClick={() => setRenameTarget(null)}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="rename-form" type="submit">{t("common.save")}</button></>}>
        <form id="rename-form" onSubmit={handleRename}>
          <div className="db-field"><label>{t("biopond.rackName")}</label><input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} required autoFocus /></div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteRackId}
        onClose={() => setDeleteRackId(null)}
        onConfirm={confirmDeleteRack}
        title={t("biopond.deleteRackTitle")}
        message={t("biopond.deleteRackMessage")}
      />

      {/* Add / Edit production data */}
      <Modal open={!!formTarget} onClose={closeForm} title={formTarget?.mode === "edit" ? t("biopond.editProductionData") : t("biopond.startProduction")}
        footer={<><button className="db-btn db-btn-outline" onClick={closeForm}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="biopond-form" type="submit">{t("common.save")}</button></>}>
        <form id="biopond-form" onSubmit={handleSaveForm}>
          <div className="db-field">
            <label>{t("biopond.numberOfBabyMaggot")}</label>
            <input type="number" min={1} placeholder="18000" value={formData.babyMaggotQty} onChange={(e) => setFormData({ ...formData, babyMaggotQty: e.target.value })} required />
          </div>
          <div className="db-field-row">
            <div className="db-field">
              <label>{t("biopond.dateIn")}</label>
              <input type="date" value={formData.dateIn} onChange={(e) => handleDateInChange(e.target.value)} required />
            </div>
            <div className="db-field">
              <label>{t("biopond.feedInAmount")}</label>
              <input type="number" min={0} placeholder="80" value={formData.feedInKg} onChange={(e) => setFormData({ ...formData, feedInKg: e.target.value })} required />
            </div>
          </div>
          <div className="db-field">
            {/* Free text, not a locked-in dropdown — Client is a paid-only
                module (server/middleware/plan.js), so a free-plan farm has
                no clients to pick from at all. Only required once the farm
                actually has client records to track the source against. */}
            <label>{hotels.length > 0 ? t("biopond.feedSource") : t("biopond.feedSourceOptional")}</label>
            <input
              type="text"
              list="feed-source-suggestions"
              style={{ width: "100%" }}
              placeholder={t("biopond.feedSourcePlaceholder")}
              value={formData.feedSource}
              onChange={(e) => setFormData({ ...formData, feedSource: e.target.value })}
              required={hotels.length > 0}
            />
            {hotels.length > 0 && (
              <datalist id="feed-source-suggestions">
                {hotels.map((h) => <option key={h.id} value={h.name} />)}
              </datalist>
            )}
          </div>
          <div className="db-field">
            <label>{t("biopond.harvestDate")} <span style={{ fontWeight: 500, color: "var(--db-muted)" }}>{t("biopond.harvestDateAuto", { days: HARVEST_DAYS })}</span></label>
            <input type="date" value={formData.harvestDate} onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })} required />
          </div>
        </form>
      </Modal>

      {/* Occupied biopond detail */}
      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={detailBiopond ? `${t("biopond.biopondLabel")} ${detailBiopond.number}` : ""}
        footer={detailBiopond && (
          <>
            <button className="db-btn db-btn-ghost" onClick={() => { setDeleteBiopondTarget(detailTarget); setDetailTarget(null); }}><Trash2 size={14} /> {t("common.delete")}</button>
            <button className="db-btn db-btn-outline" onClick={() => openEditForm(detailTarget.rackId, detailBiopond)}><Pencil size={14} /> {t("common.edit")}</button>
            <button className="db-btn db-btn-outline" onClick={() => { setReleaseTarget({ ...detailTarget, type: "release" }); setDetailTarget(null); }}>{t("biopond.releaseBiopondBtn")}</button>
            <button className="db-btn db-btn-primary" onClick={() => { setReleaseTarget({ ...detailTarget, type: "harvest" }); setDetailTarget(null); }}><CheckCircle2 size={14} /> {t("biopond.markAsHarvested")}</button>
          </>
        )}
      >
        {detailBiopond && (
          <div className="biopond-detail-grid">
            <div className="row"><span className="l">{t("biopond.numberOfBabyMaggot")}</span><span className="v">{fmtNumber(detailBiopond.babyMaggotQty)}</span></div>
            <div className="row"><span className="l">{t("biopond.dateIn")}</span><span className="v">{fmtDate(detailBiopond.dateIn)}</span></div>
            <div className="row"><span className="l">{t("biopond.feedInAmount")}</span><span className="v">{detailBiopond.feedInKg} kg</span></div>
            <div className="row"><span className="l">{t("biopond.feedSource")}</span><span className="v">{detailBiopond.feedSource}</span></div>
            <div className="row"><span className="l">{t("biopond.harvestDate")}</span><span className="v">{fmtDate(detailBiopond.harvestDate)}</span></div>
            <div className="row"><span className="l">{t("common.status")}</span><span className="v"><Badge>{detailBiopond.status}</Badge></span></div>
            {detailBiopond.createdBy && <div className="row"><span className="l">{t("biopond.recordedBy")}</span><span className="v">{detailBiopond.createdBy}</span></div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!releaseTarget}
        onClose={() => setReleaseTarget(null)}
        onConfirm={handleRelease}
        tone="warn"
        confirmLabel={releaseTarget?.type === "harvest" ? t("biopond.markAsHarvested") : t("biopond.releaseBiopondBtn")}
        title={releaseTarget?.type === "harvest" ? t("biopond.markHarvestedTitle") : t("biopond.releaseThisBiopond")}
        message={releaseTarget?.type === "harvest" ? t("biopond.markHarvestedMessage") : t("biopond.releaseMessage")}
      />

      <ConfirmDialog
        open={!!deleteBiopondTarget}
        onClose={() => setDeleteBiopondTarget(null)}
        onConfirm={confirmDeleteBiopond}
        title={t("biopond.deleteBiopondTitle", { number: deleteBiopondCandidate?.number ?? "" })}
        message={deleteBiopondCandidate?.status === "Occupied" ? t("biopond.deleteOccupiedMessage") : t("biopond.deleteAvailableMessage")}
      />

      <Modal open={quotaLimit != null} onClose={() => setQuotaLimit(null)} title={t("biopond.limitReachedTitle")}
        footer={
          <button className="db-btn db-btn-primary" onClick={() => navigate("/dashboard/upgrade")}>{t("plan.viewUpgradeOptions")}</button>
        }
      >
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--db-canvas)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--db-accent)" }}>
            <Lock size={22} />
          </div>
          <p style={{ color: "var(--db-muted)", fontSize: ".9rem", lineHeight: 1.6 }}>{t("biopond.limitReachedDesc", { limit: quotaLimit })}</p>
        </div>
      </Modal>
    </div>
  );
}
