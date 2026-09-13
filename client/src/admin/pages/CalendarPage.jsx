import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Bell, UserCheck } from "lucide-react";
import Modal from "../../components/ui/Modal.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { eventColors } from "../../data/dummyData.js";
import { api } from "../../api/client.js";
import { fmtDate } from "../../utils/format.js";
import { localISODate } from "../../context/BiopondContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

const EVENT_TYPES = Object.keys(eventColors);
const VIEWS = ["Month", "Week", "Day", "Agenda"];
const REMINDER_OPTIONS = ["None", "Same day", "1 day before", "3 days before", "7 days before"];

function ymd(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }

function buildMonthGrid(anchor) {
  const first = startOfMonth(anchor);
  const startWeekday = first.getDay();
  const gridStart = addDays(first, -startWeekday);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

const emptyForm = { type: "Maggot Harvest", title: "", date: "", employee: "", reminder: "Same day", notes: "" };

const VIEW_LABEL_KEYS = { Month: "calendar.viewMonth", Week: "calendar.viewWeek", Day: "calendar.viewDay", Agenda: "calendar.viewAgenda" };

export default function CalendarPage() {
  const { t } = useLanguage();
  const [anchor, setAnchor] = useState(new Date());
  const [view, setView] = useState("Month");
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTypes, setActiveTypes] = useState(EVENT_TYPES);
  const [dayModalDate, setDayModalDate] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    api.get("/calendar-events").then(setEvents).catch(() => {});
    api.get("/employees").then(setEmployees).catch(() => {});
  }, []);

  const filtered = events.filter((e) => activeTypes.includes(e.type));
  const days = useMemo(() => buildMonthGrid(anchor), [anchor]);
  const today = localISODate();

  const eventsFor = (dateStr) => filtered.filter((e) => e.date === dateStr);

  const toggleType = (t) => setActiveTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const openAdd = (dateStr) => {
    setEditingId(null);
    setForm({ ...emptyForm, date: dateStr || ymd(anchor) });
    setFormOpen(true);
  };

  const openEdit = (ev) => {
    setEditingId(ev.id);
    setForm({ type: ev.type, title: ev.title, date: ev.date, employee: ev.employee || ev.pic || "", reminder: ev.reminder || "Same day", notes: ev.notes || "" });
    setFormOpen(true);
  };

  const saveEvent = async (e) => {
    e.preventDefault();
    const isEdit = !!editingId;
    const targetId = editingId;
    setFormOpen(false);
    try {
      if (isEdit) {
        const updated = await api.patch(`/calendar-events/${targetId}`, form);
        setEvents((prev) => prev.map((ev) => ev.id === targetId ? updated : ev));
      } else {
        const created = await api.post("/calendar-events", form);
        setEvents((prev) => [...prev, created]);
      }
    } catch (err) {
      alert(err.message || t("calendar.failedSave"));
    }
  };

  const confirmDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    setDayModalDate(null);
    try {
      await api.delete(`/calendar-events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message || t("calendar.failedDelete"));
    }
  };

  const agendaList = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <div className="db-content-header">
        <h1>{t("calendar.title")}</h1>
        <p>{t("calendar.subtitle")}</p>
      </div>

      <div className="db-toolbar">
        <div className="db-pill-group">
          {VIEWS.map((v) => <button key={v} className={`db-pill ${view === v ? "active" : ""}`} onClick={() => setView(v)}>{t(VIEW_LABEL_KEYS[v])}</button>)}
        </div>
        <div className="grow" />
        {view !== "Agenda" && (
          <>
            <button className="db-btn db-btn-outline db-btn-sm" onClick={() => setAnchor(addMonths(anchor, -1))}><ChevronLeft size={14} /></button>
            <div style={{ fontWeight: 700, minWidth: 130, textAlign: "center" }}>{anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
            <button className="db-btn db-btn-outline db-btn-sm" onClick={() => setAnchor(addMonths(anchor, 1))}><ChevronRight size={14} /></button>
          </>
        )}
        <button className="db-btn db-btn-primary db-btn-sm" onClick={() => openAdd(null)}><Plus size={14} /> {t("calendar.addEvent")}</button>
      </div>

      <div className="db-card" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {EVENT_TYPES.map((et) => (
            <label key={et} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".8rem", fontWeight: 600, cursor: "pointer" }}>
              <input type="checkbox" checked={activeTypes.includes(et)} onChange={() => toggleType(et)} />
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: eventColors[et], display: "inline-block" }} />
              {t(`eventType.${et}`)}
            </label>
          ))}
        </div>
      </div>

      {view === "Agenda" ? (
        <div className="db-card">
          <div className="db-card-head"><h3>{t("calendar.agenda")}</h3></div>
          {agendaList.length === 0 ? <div className="db-empty"><p>{t("calendar.noEventsMatch")}</p></div> : agendaList.map((e) => (
            <div className="db-list-item" key={e.id}>
              <div className="ic" style={{ background: eventColors[e.type] + "22", color: eventColors[e.type] }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: eventColors[e.type], display: "block" }} />
              </div>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openEdit(e)}>
                <div className="t">{e.title}</div>
                <div className="s">{fmtDate(e.date)} · {t(`eventType.${e.type}`)}</div>
              </div>
              <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDeleteId(e.id)}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      ) : view === "Month" ? (
        <div className="db-card">
          <div className="db-cal-grid" style={{ marginBottom: 8 }}>
            {["daySun", "dayMon", "dayTue", "dayWed", "dayThu", "dayFri", "daySat"].map((k) => <div key={k} className="db-cal-dow">{t(`calendar.${k}`)}</div>)}
          </div>
          <div className="db-cal-grid">
            {days.map((d) => {
              const dateStr = ymd(d);
              const inMonth = d.getMonth() === anchor.getMonth();
              const dayEvents = eventsFor(dateStr);
              return (
                <div key={dateStr} className={`db-cal-cell ${!inMonth ? "muted" : ""} ${dateStr === today ? "today" : ""}`} onClick={() => setDayModalDate(dateStr)}>
                  <div className="num">{d.getDate()}</div>
                  {dayEvents.slice(0, 3).map((e) => (
                    <div key={e.id} className="db-cal-event" style={{ background: eventColors[e.type] }}>{e.title}</div>
                  ))}
                  {dayEvents.length > 3 && <div style={{ fontSize: ".65rem", color: "var(--db-muted)", marginTop: 2 }}>+{dayEvents.length - 3} {t("calendar.more")}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Week / Day — simplified single-row slice of the same grid
        <div className="db-card">
          <div className="db-cal-grid" style={{ gridTemplateColumns: view === "Day" ? "1fr" : "repeat(7,1fr)" }}>
            {(view === "Day" ? [anchor] : Array.from({ length: 7 }, (_, i) => addDays(startOfMonth(anchor), i))).map((d) => {
              const dateStr = ymd(d);
              const dayEvents = eventsFor(dateStr);
              return (
                <div key={dateStr} className={`db-cal-cell ${dateStr === today ? "today" : ""}`} onClick={() => setDayModalDate(dateStr)} style={{ minHeight: 160 }}>
                  <div className="num">{d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}</div>
                  {dayEvents.map((e) => <div key={e.id} className="db-cal-event" style={{ background: eventColors[e.type], marginTop: 6 }}>{e.title}</div>)}
                  {dayEvents.length === 0 && <div style={{ fontSize: ".76rem", color: "var(--db-muted)", marginTop: 8 }}>{t("calendar.noEvents")}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day detail modal */}
      <Modal open={!!dayModalDate} onClose={() => setDayModalDate(null)} title={dayModalDate ? fmtDate(dayModalDate, { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : ""}
        footer={<button className="db-btn db-btn-primary" onClick={() => { openAdd(dayModalDate); }}><Plus size={14} /> {t("calendar.addEvent")}</button>}>
        {dayModalDate && eventsFor(dayModalDate).length === 0 && <div className="db-empty"><p>{t("calendar.noEventsScheduled")}</p></div>}
        {dayModalDate && eventsFor(dayModalDate).map((e) => (
          <div key={e.id} className="db-card" style={{ marginBottom: 10, borderLeft: `4px solid ${eventColors[e.type]}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{e.title}</div>
                <div style={{ fontSize: ".78rem", color: "var(--db-muted)", marginTop: 2 }}>{t(`eventType.${e.type}`)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => openEdit(e)}><Pencil size={13} /></button>
                <button className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDeleteId(e.id)}><Trash2 size={13} /></button>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: ".82rem", color: "var(--db-ink-soft)", display: "grid", gap: 4 }}>
              {e.biopondId && <div>{t("calendar.biopond")}: <b>{e.biopondId}</b> · {t("calendar.batch")}: <b>{e.batchId}</b> · {t("calendar.estQty")}: <b>{e.estQty}</b></div>}
              {e.hotel && <div>{t("calendar.hotel")}: <b>{e.hotel}</b> · {e.subject}</div>}
              {e.location && <div>{t("calendar.location")}: {e.location}</div>}
              {e.pic && <div>{t("calendar.pic")}: {e.pic} {e.contact && `· ${e.contact}`}</div>}
              {e.customer && <div>{t("calendar.customer")}: <b>{e.customer}</b> · {e.product} · {e.qty}</div>}
              {e.address && <div>{t("calendar.address")}: {e.address} {e.time && `· ${e.time}`}</div>}
              {e.holidayName && <div>{e.impact}</div>}
              {e.employeeSchedule && <div>{t("calendar.employeeSchedule")}: {e.employeeSchedule}</div>}
              {e.cageId && <div>{t("calendar.cage")}: <b>{e.cageId}</b> · {t("calendar.estProduction")}: {e.estProduction}</div>}
              {e.employee && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><UserCheck size={13} /> {e.employee}</div>}
              {e.reminder && e.reminder !== "None" && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Bell size={13} /> {t("calendar.reminder")}: {t(`reminder.${e.reminder}`)}</div>}
              {e.notes && <div>{t("calendar.notes")}: {e.notes}</div>}
            </div>
          </div>
        ))}
      </Modal>

      {/* Add/Edit form modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? t("calendar.editEvent") : t("calendar.addEvent")}
        footer={<><button className="db-btn db-btn-outline" onClick={() => setFormOpen(false)}>{t("common.cancel")}</button><button className="db-btn db-btn-primary" form="event-form" type="submit">{t("calendar.saveEvent")}</button></>}>
        <form id="event-form" onSubmit={saveEvent}>
          <div className="db-field-row">
            <div className="db-field">
              <label>{t("calendar.category")}</label>
              <select className="db-select" style={{ width: "100%" }} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {EVENT_TYPES.map((et) => <option key={et} value={et}>{t(`eventType.${et}`)}</option>)}
              </select>
            </div>
            <div className="db-field">
              <label>{t("common.date")}</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
          </div>
          <div className="db-field">
            <label>{t("calendar.title_")}</label>
            <input placeholder={t("calendar.eventTitlePlaceholder")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="db-field-row">
            <div className="db-field">
              <label>{t("calendar.assignEmployee")}</label>
              <select className="db-select" style={{ width: "100%" }} value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}>
                <option value="">{t("calendar.unassigned")}</option>
                {employees.map((emp) => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
              </select>
            </div>
            <div className="db-field">
              <label>{t("calendar.reminder")}</label>
              <select className="db-select" style={{ width: "100%" }} value={form.reminder} onChange={(e) => setForm({ ...form, reminder: e.target.value })}>
                {REMINDER_OPTIONS.map((r) => <option key={r} value={r}>{t(`reminder.${r}`)}</option>)}
              </select>
            </div>
          </div>
          <div className="db-field">
            <label>{t("calendar.notes")}</label>
            <textarea rows={2} placeholder={t("calendar.optionalNotes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("calendar.deleteEventTitle")}
        message={t("calendar.deleteEventMessage")}
      />
    </div>
  );
}
