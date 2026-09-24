import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Navigation,
  Package,
  Plus,
  Sparkles,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { ArrowHint, AvatarStack, Chip, DeskAlert, DeskHeading, DeskWidget, TONES } from "../../components/admin/DeskUI";

const STAT_TONES = ["mint", "butter", "lilac", "pink"];
const STAT_LINKS = {
  Clients: "/admin/clients",
  Prestataires: "/admin/prestataires",
  "En attente": "/admin/prestataires/validation",
  Approuvés: "/admin/prestataires",
};

const ORDER_STATUS = {
  nouvelle: "Nouvelle",
  proposee: "Proposée",
  confirmee: "Confirmée",
  programmee: "Programmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const REMIND_OPTIONS = [
  { value: 15, label: "15 min avant" },
  { value: 60, label: "1 h avant" },
  { value: 120, label: "2 h avant" },
  { value: 1440, label: "24 h avant" },
];

function toDayKey(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDayLabel(dayKey) {
  if (!dayKey) return "";
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard() {
  const { query = "" } = useOutletContext() || {};
  const [stats, setStats] = useState([]);
  const [pending, setPending] = useState([]);
  const [missions, setMissions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => toDayKey(new Date()));

  const loadAppointments = () =>
    api.adminAppointments().then((res) => setAppointments(res.items || []));

  useEffect(() => {
    Promise.allSettled([
      api.adminDashboard(),
      api.adminPrestatairesPending(),
      api.adminActiveMissions(),
      api.adminOrders(),
      api.adminAppointments(),
    ]).then(([dash, pend, miss, ords, appts]) => {
      if (dash.status === "fulfilled") setStats(dash.value.stats || []);
      if (pend.status === "fulfilled") setPending(pend.value.items || []);
      if (miss.status === "fulfilled") setMissions(miss.value.items || []);
      if (ords.status === "fulfilled") setOrders(ords.value.items || []);
      if (appts.status === "fulfilled") setAppointments(appts.value.items || []);
      const failed = [dash, pend, miss, ords, appts].find((r) => r.status === "rejected");
      if (failed) setError(failed.reason?.message || "Impossible de charger le tableau de bord.");
    });
  }, []);

  const todayKey = toDayKey(new Date());
  const stat = (label) => stats.find((s) => s.label === label)?.value ?? 0;
  const approved = stat("Approuvés");
  const providersTotal = approved + stat("En attente");
  const liveMissions = missions.filter((m) => m.trip?.position).length;

  const eventsByDay = useMemo(() => {
    const map = new Map();
    const push = (day, event) => {
      if (!day) return;
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(event);
    };

    appointments.forEach((a) => {
      const day = a.day || toDayKey(a.startsAt);
      push(day, {
        key: `a-${a.id}`,
        kind: "appointment",
        icon: CalendarDays,
        tone: "lilac",
        to: null,
        appointmentId: a.id,
        title: a.title,
        meta: [
          formatTime(a.startsAt) + (a.endsAt ? ` – ${formatTime(a.endsAt)}` : ""),
          a.location,
          a.attendeeName || a.attendeeEmail,
          a.reminderEnabled ? `Rappel e-mail ${a.remindMinutesBefore} min` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        sort: a.startsAt || "",
      });
    });

    orders.forEach((o) => {
      const day = toDayKey(o.desiredDate) || toDayKey(o.createdAt);
      push(day, {
        key: `o-${o.id}`,
        kind: "order",
        icon: Package,
        tone: "butter",
        to: `/admin/commandes/${o.id}`,
        title: o.metier || o.domain || o.reference,
        meta: [ORDER_STATUS[o.status] || o.status, o.client?.fullName, o.commune].filter(Boolean).join(" · "),
        sort: o.desiredDate || o.createdAt || "",
      });
    });

    pending.forEach((p) => {
      const day = toDayKey(p.updatedAt) || toDayKey(p.createdAt);
      push(day, {
        key: `p-${p.id}`,
        kind: "validation",
        icon: UserRoundCheck,
        tone: "mint",
        to: `/admin/prestataires/${p.id}`,
        title: `Validation — ${p.user?.fullName || "Prestataire"}`,
        meta: [p.metier || p.domain, "Dossier en attente"].filter(Boolean).join(" · "),
        sort: p.updatedAt || p.createdAt || "",
      });
    });

    if (todayKey) {
      missions.forEach((m) => {
        push(todayKey, {
          key: `m-${m.orderId}`,
          kind: "mission",
          icon: Navigation,
          tone: "pink",
          to: `/admin/missions/${m.orderId}`,
          title: `Mission — ${m.metier || m.domain || m.reference}`,
          meta: [m.provider?.fullName, m.destination?.commune || m.destination?.address]
            .filter(Boolean)
            .join(" · "),
          sort: "z",
        });
      });
    }

    for (const [, list] of map) {
      list.sort((a, b) => String(a.sort).localeCompare(String(b.sort)));
    }
    return map;
  }, [appointments, orders, pending, missions, todayKey]);

  const markedDays = useMemo(() => new Set(eventsByDay.keys()), [eventsByDay]);

  const dayEvents = useMemo(() => {
    const items = eventsByDay.get(selectedDay) || [];
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.title.toLowerCase().includes(q) || String(i.meta || "").toLowerCase().includes(q)
    );
  }, [eventsByDay, selectedDay, query]);

  const handleCreated = async () => {
    await loadAppointments();
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await api.deleteAdminAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message || "Suppression impossible.");
    }
  };

  return (
    <>
      <Seo title="Admin SaaCare" path="/admin/dashboard" noindex />
      <h1 className="sr-only">Tableau de bord administrateur</h1>

      {error && (
        <div className="mb-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] xl:gap-8">
        <div className="min-w-0 space-y-8">
          <section>
            <DeskHeading count={pending.length + missions.length}>Vos activités du jour</DeskHeading>
            <div className="stagger-in mt-4 grid gap-4 sm:grid-cols-2">
              <ActivityCard
                tone="mint"
                title="Validation"
                chip={`${pending.length} en attente`}
                chipIcon={Clock}
                names={pending.map((p) => p.user?.fullName || "?")}
                to="/admin/prestataires/validation"
              />
              <ActivityCard
                tone="pink"
                title="Missions actives"
                chip={`${liveMissions} en direct`}
                chipIcon={Navigation}
                names={missions.map((m) => m.provider?.fullName || "?")}
                to="/admin/missions"
              />
            </div>
          </section>

          <section>
            <DeskHeading>Suivi de la plateforme</DeskHeading>
            <div className="stagger-in mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s, i) => {
                const to = STAT_LINKS[s.label] || "/admin/dashboard";
                return (
                  <DeskWidget key={s.label} to={to} tone={STAT_TONES[i % STAT_TONES.length]} label={`Voir : ${s.label}`}>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <p className="text-3xl font-semibold leading-none tracking-tight">{s.value}</p>
                      <ArrowHint size="sm" />
                    </div>
                  </DeskWidget>
                );
              })}
            </div>

            <div className="mt-4 space-y-4">
              <ProgressCard
                tone="butter"
                category="Prestataires"
                meta={`${approved}/${providersTotal} dossiers validés`}
                title="Validation des profils"
                value={approved}
                total={providersTotal}
                to="/admin/prestataires"
                track="bg-desk-butter-strong"
              />
              <ProgressCard
                tone="pink"
                category="Missions"
                meta={`${liveMissions}/${missions.length} signaux GPS en direct`}
                title="Suivi des trajets"
                value={liveMissions}
                total={missions.length}
                to="/admin/missions"
                track="bg-[#f3b9d6]"
              />
            </div>
          </section>
        </div>

        <aside className="min-w-0">
          <DeskHeading>Calendrier</DeskHeading>
          <MonthCalendar marked={markedDays} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
          <DayAgenda
            dayKey={selectedDay}
            events={dayEvents}
            onClear={() => setSelectedDay(todayKey)}
            isToday={selectedDay === todayKey}
            onCreated={handleCreated}
            onDeleteAppointment={handleDeleteAppointment}
          />
        </aside>
      </div>
    </>
  );
}

function DayAgenda({ dayKey, events, onClear, isToday, onCreated, onDeleteAppointment }) {
  const [showForm, setShowForm] = useState(false);

  if (!dayKey) return null;

  return (
    <section className="mt-4 rounded-3xl bg-white p-4 sm:p-5" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-desk-ink/50">
            <CalendarDays className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            Agenda
            {isToday ? " · Aujourd’hui" : ""}
          </p>
          <h2 className="mt-1 text-base font-semibold capitalize leading-snug tracking-tight text-desk-ink">
            {formatDayLabel(dayKey)}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-desk-canvas px-2.5 text-xs font-semibold text-desk-ink transition-colors hover:bg-desk-mint"
            aria-expanded={showForm}
          >
            <Plus className="size-3.5" strokeWidth={2} aria-hidden="true" />
            RDV
          </button>
          {!isToday && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex size-8 items-center justify-center rounded-full text-desk-ink/40 transition-colors hover:bg-desk-canvas hover:text-desk-ink"
              aria-label="Revenir à aujourd’hui"
              title="Aujourd’hui"
            >
              <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <AppointmentForm
          dayKey={dayKey}
          onCancel={() => setShowForm(false)}
          onCreated={async () => {
            setShowForm(false);
            await onCreated?.();
          }}
        />
      )}

      <ul className="mt-4 space-y-2.5">
        {events.map((event) => {
          const { key, icon: Icon, to, title, meta, tone, kind, appointmentId } = event;
          const body = (
            <>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-sm font-semibold leading-snug">{title}</span>
                {meta && <span className="mt-0.5 block text-xs text-desk-ink/60">{meta}</span>}
              </span>
            </>
          );

          return (
            <li key={key} className="relative">
              {to ? (
                <Link
                  to={to}
                  className={`flex items-start gap-3 rounded-2xl p-3 transition-colors hover:opacity-90 ${TONES[tone] || TONES.mint}`}
                >
                  {body}
                </Link>
              ) : (
                <div className={`flex items-start gap-3 rounded-2xl p-3 ${TONES[tone] || TONES.mint}`}>
                  {body}
                  {kind === "appointment" && (
                    <button
                      type="button"
                      onClick={() => onDeleteAppointment?.(appointmentId)}
                      className="ml-auto inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-desk-ink/50 transition-colors hover:bg-white hover:text-coral-700"
                      aria-label="Supprimer le rendez-vous"
                      title="Supprimer"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
        {!events.length && !showForm && (
          <li className="rounded-2xl bg-desk-canvas px-4 py-5 text-center text-sm text-desk-ink/55">
            Aucun événement pour cette date.
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-1 block w-full font-semibold text-desk-ink underline-offset-2 hover:underline"
            >
              Ajouter un rendez-vous
            </button>
          </li>
        )}
      </ul>
    </section>
  );
}

function AppointmentForm({ dayKey, onCancel, onCreated }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [remindMinutesBefore, setRemindMinutesBefore] = useState(60);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const startsAt = new Date(`${dayKey}T${time}:00`);
      if (Number.isNaN(startsAt.getTime())) throw new Error("Horaires invalides.");
      let endsAt;
      if (endTime) {
        endsAt = new Date(`${dayKey}T${endTime}:00`);
        if (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
          throw new Error("L’heure de fin doit être après le début.");
        }
      }
      await api.createAdminAppointment({
        title: title.trim(),
        notes: notes.trim() || null,
        location: location.trim() || null,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt ? endsAt.toISOString() : null,
        attendeeName: attendeeName.trim() || null,
        attendeeEmail: attendeeEmail.trim() || null,
        reminderEnabled,
        remindMinutesBefore: reminderEnabled ? Number(remindMinutesBefore) : 60,
      });
      await onCreated?.();
    } catch (err) {
      setFormError(err.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-2xl bg-desk-canvas p-3.5">
      <p className="text-sm font-semibold">Nouveau rendez-vous</p>
      {formError && <DeskAlert>{formError}</DeskAlert>}
      <Field label="Titre" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Début" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        <Field label="Fin (opt.)" name="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <Field label="Lieu" name="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <Field
        label="Participant"
        name="attendeeName"
        value={attendeeName}
        onChange={(e) => setAttendeeName(e.target.value)}
      />
      <Field
        label="E-mail rappel"
        name="attendeeEmail"
        type="email"
        value={attendeeEmail}
        onChange={(e) => setAttendeeEmail(e.target.value)}
        hint="Aussi envoyé à votre compte admin"
      />
      <Field
        label="Notes"
        name="notes"
        as="textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm font-medium text-desk-ink">
        <input
          type="checkbox"
          checked={reminderEnabled}
          onChange={(e) => setReminderEnabled(e.target.checked)}
          className="size-4 rounded border-desk-ink/30"
        />
        Rappel par e-mail
      </label>
      {reminderEnabled && (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-desk-ink/70">Délai</span>
          <select
            value={remindMinutesBefore}
            onChange={(e) => setRemindMinutesBefore(Number(e.target.value))}
            className="w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm outline-none ring-1 ring-desk-ink/10 focus:ring-desk-ink/30"
          >
            {REMIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={saving || !title.trim()} withArrow={false}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} withArrow={false}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

function ActivityCard({ tone, title, chip, chipIcon, names, to }) {
  return (
    <Link
      to={to}
      className={`group relative flex min-h-[10.5rem] flex-col justify-end rounded-3xl p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink ${TONES[tone]}`}
      aria-label={`Ouvrir : ${title}`}
    >
      <Chip icon={chipIcon} className="absolute right-4 top-4">
        {chip}
      </Chip>
      <div className="min-h-8">
        <AvatarStack names={names} />
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <h3 className="text-xl font-semibold leading-tight tracking-tight">{title}</h3>
        <ArrowHint />
      </div>
    </Link>
  );
}

function ProgressCard({ tone, category, meta, title, value, total, to, track }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <Link
      to={to}
      className={`group block rounded-3xl p-5 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-desk-ink ${TONES[tone]}`}
      aria-label={`Ouvrir : ${title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="inline-flex items-center gap-2.5 text-sm font-semibold">
          <span className="flex size-10 items-center justify-center rounded-full bg-white">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          {category}
        </p>
        <ArrowHint />
      </div>
      <p className="mt-4 text-sm text-desk-ink/70">{meta}</p>
      <h3 className="mt-1 text-xl font-semibold leading-tight tracking-tight">{title}</h3>
      <div
        className={`mt-3 h-2 overflow-hidden rounded-full ${track}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={title}
      >
        <div className="h-full rounded-full bg-desk-ink transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}

const WEEKDAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function MonthCalendar({ marked = new Set(), selectedDay, onSelectDay }) {
  const today = new Date();
  const todayKey = toDayKey(today);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const days = Array.from({ length: cells }, (_, i) => new Date(year, month, i - offset + 1));

  const label = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const move = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div className="mt-4 rounded-3xl bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold capitalize tracking-tight">{label}</p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => move(-1)} className="rounded-full p-1.5 hover:bg-desk-canvas" aria-label="Mois précédent">
            <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => move(1)} className="rounded-full p-1.5 hover:bg-desk-canvas" aria-label="Mois suivant">
            <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-0.5 text-[0.7rem] font-medium text-desk-ink/70">
            {d}
          </span>
        ))}
        {days.map((d, i) => {
          const dayKey = toDayKey(d);
          const inMonth = d.getMonth() === month;
          const isToday = dayKey === todayKey;
          const isSelected = dayKey === selectedDay;
          const isEdge = !inMonth && (i === 0 || i === days.length - 1);
          const hasEvents = marked.has(dayKey);

          let cls = "text-desk-ink hover:bg-desk-canvas";
          if (isSelected) cls = "bg-desk-ink text-white";
          else if (isToday) cls = "bg-desk-mint text-desk-ink ring-1 ring-desk-ink/15";
          else if (hasEvents) cls = "bg-desk-mint/70 text-desk-ink hover:bg-desk-mint";
          else if (isEdge) cls = "border border-dashed border-desk-ink/40 text-desk-ink/55 hover:bg-desk-canvas";
          else if (!inMonth) cls = "text-desk-ink/35 hover:bg-desk-canvas/80";

          return (
            <span key={`${dayKey}-${i}`} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelectDay?.(dayKey)}
                className={`relative flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:size-9 ${cls}`}
                aria-current={isToday ? "date" : undefined}
                aria-pressed={isSelected}
                aria-label={formatDayLabel(dayKey)}
              >
                {d.getDate()}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-desk-ink/50" aria-hidden="true" />
                )}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
