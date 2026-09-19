import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Flag,
  MapPin,
  MessageSquareText,
  Phone,
  Star,
  AlertTriangle,
} from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import TripMap from "../../components/tracking/TripMap";
import TripStatusPanel from "../../components/tracking/TripStatusPanel";
import { DeskAlert, DeskHeading, initials } from "../../components/admin/DeskUI";
import { api } from "../../lib/api";
import { subscribeToMission } from "../../lib/realtime";
import { formatDistance, formatEta, formatFreshness } from "../../lib/tripFormat";

const ORDER_STATUS = {
  nouvelle: "Nouvelle",
  proposee: "Proposée",
  programmee: "Programmée",
  confirmee: "Confirmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const TRIP_STATUS = {
  en_route: "En route",
  arrive: "Arrivé",
  annule: "Annulé",
};

const SEVERITY = {
  info: { label: "Info", tone: "bg-desk-canvas" },
  warning: { label: "Attention", tone: "bg-desk-butter" },
  critical: { label: "Critique", tone: "bg-desk-pink" },
};

function formatAmount(n) {
  if (n == null || n === 0) return "—";
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function Info({ label, children }) {
  return (
    <div className="rounded-2xl bg-desk-canvas px-4 py-3">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-desk-ink">{children || "—"}</dd>
    </div>
  );
}

function PersonCard({ title, person, linkTo }) {
  if (!person) {
    return (
      <section className="rounded-3xl bg-white p-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-desk-ink/55">Non assigné.</p>
      </section>
    );
  }

  const body = (
    <div className="mt-3 flex items-start gap-3">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-desk-lilac text-sm font-bold">
        {initials(person.fullName || "")}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{person.fullName || "—"}</p>
        {person.metier && <p className="text-sm text-desk-ink/60">{person.metier}</p>}
        {person.email && <p className="mt-1 truncate text-sm text-desk-ink/55">{person.email}</p>}
        {person.phone && (
          <a href={`tel:${person.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
            <Phone className="size-3.5" aria-hidden="true" />
            {person.phone}
          </a>
        )}
        {person.rating != null && (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-desk-ink/70">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            {Number(person.rating).toFixed(1)}
            {person.reviewsCount != null ? ` · ${person.reviewsCount} avis` : ""}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section className="rounded-3xl bg-white p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {linkTo ? (
        <Link to={linkTo} className="block transition-opacity hover:opacity-90">
          {body}
        </Link>
      ) : (
        body
      )}
    </section>
  );
}

export default function AdminMissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteType, setNoteType] = useState("observation");
  const [severity, setSeverity] = useState("info");
  const [noteBody, setNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [noteOk, setNoteOk] = useState("");
  const channel = useRef(null);

  const fetcher = useCallback(() => api.adminMission(id), [id]);

  useEffect(() => {
    let cancelled = false;

    channel.current = subscribeToMission({
      orderId: Number(id),
      fetcher,
      onUpdate: (payload) => {
        if (cancelled) return;
        const item = payload.item || payload;
        setData(item);
        setNotes(item.notes || []);
        setError("");
      },
      onStatus: ({ connected, error: err }) => {
        if (cancelled) return;
        setOffline(!connected);
        if (!connected && err?.status === 404) setError("Mission introuvable.");
      },
    });

    return () => {
      cancelled = true;
      channel.current?.close();
    };
  }, [fetcher, id]);

  const submitNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    setNoteError("");
    setNoteOk("");
    try {
      const res = await api.createAdminMissionNote(id, {
        type: noteType,
        severity: noteType === "signalement" ? severity : "info",
        body: noteBody.trim(),
      });
      setNotes((prev) => [res.item, ...prev]);
      setNoteBody("");
      setNoteOk(noteType === "signalement" ? "Signalement enregistré." : "Observation enregistrée.");
    } catch (err) {
      setNoteError(err.message || "Enregistrement impossible.");
    } finally {
      setSavingNote(false);
    }
  };

  const order = data?.order;
  const trip = data?.trip;
  const destination = data?.destination;
  const path = data?.path || [];
  const reviews = data?.reviews || [];
  const payments = data?.payments || [];

  return (
    <>
      <Seo
        title={order?.reference ? `Mission ${order.reference}` : "Mission"}
        path={`/admin/missions/${id}`}
        noindex
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/missions")}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white hover:bg-desk-mint"
          aria-label="Retour aux missions"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <DeskHeading as="h1">Détail mission</DeskHeading>
        {offline && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-desk-butter px-3 py-1 text-xs font-semibold">
            Connexion intermittente
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}
      {!data && !error && <p className="mt-6 text-sm text-desk-ink/55">Chargement…</p>}

      {data && order && (
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-5">
            <section className="rounded-3xl bg-white p-5 sm:p-6">
              <p className="font-mono text-xs font-bold tracking-wide text-desk-ink/50">{order.reference}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{order.metier || order.domain || "Mission"}</h2>
              <p className="mt-1 inline-flex items-start gap-1.5 text-sm text-desk-ink/60">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {destination?.address || destination?.commune || order.commune || "Adresse non renseignée"}
              </p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Info label="Statut commande">{ORDER_STATUS[order.status] || order.status}</Info>
                <Info label="Statut course">{TRIP_STATUS[trip?.status] || (trip ? trip.status : "Pas encore de trajet")}</Info>
                <Info label="Date souhaitée">{data.desiredDate || "—"}</Info>
                <Info label="Fréquence">{data.frequency || "—"}</Info>
                <Info label="Montant">{formatAmount(data.amount)}</Info>
                <Info label="Créée le">{formatDateTime(data.createdAt)}</Info>
              </dl>

              {data.need && (
                <div className="mt-4 rounded-2xl bg-desk-canvas px-4 py-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">Besoin / brief</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{data.need}</p>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-3xl bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-5">
                <h2 className="text-lg font-semibold">Position en direct</h2>
                {trip?.route && (
                  <p className="text-sm text-desk-ink/60">
                    {formatDistance(trip.route.distanceMeters)} · {formatEta(trip.route.etaSeconds)}
                  </p>
                )}
              </div>
              <div className="mt-3 px-5">
                <TripStatusPanel trip={trip} />
              </div>
              <div className="mt-4 h-[22rem] w-full sm:h-[28rem]">
                <TripMap
                  position={trip?.position}
                  destination={destination}
                  path={path}
                  className="h-full w-full"
                />
              </div>
              <p className="px-5 py-3 text-xs text-desk-ink/50" aria-live="polite">
                {formatFreshness(trip?.position?.recordedAt)}
              </p>
            </section>

            <section className="rounded-3xl bg-white p-5">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
                <Star className="size-5" strokeWidth={1.75} aria-hidden="true" />
                Avis clients
              </h2>
              <ul className="mt-4 space-y-3">
                {reviews.map((r, i) => (
                  <li key={`${r.firstName || "avis"}-${i}`} className="rounded-2xl bg-desk-canvas px-4 py-3">
                    <p className="text-sm font-semibold">
                      {r.firstName || "Client"}
                      {r.commune ? ` · ${r.commune}` : ""}
                      {r.date ? <span className="font-normal text-desk-ink/50"> · {r.date}</span> : null}
                    </p>
                    <p className="mt-1 text-sm text-desk-ink/75">{r.text}</p>
                  </li>
                ))}
                {!reviews.length && (
                  <li className="rounded-2xl bg-desk-canvas px-4 py-5 text-center text-sm text-desk-ink/55">
                    Aucun avis publié pour ce prestataire.
                  </li>
                )}
              </ul>
            </section>
          </div>

          <aside className="min-w-0 space-y-5">
            <PersonCard title="Client" person={data.client} linkTo={data.client?.id ? `/admin/clients/${data.client.id}` : null} />
            <PersonCard
              title="Prestataire"
              person={data.provider}
              linkTo={data.provider?.id ? `/admin/prestataires/${data.provider.id}` : null}
            />

            <section className="rounded-3xl bg-white p-5">
              <h2 className="text-lg font-semibold">Paiements liés</h2>
              <ul className="mt-3 space-y-2">
                {payments.map((p) => (
                  <li key={p.id} className="flex justify-between gap-2 rounded-xl bg-desk-canvas px-3 py-2 text-sm">
                    <span className="font-mono text-xs font-bold">{p.reference}</span>
                    <span className="font-semibold">{formatAmount(p.amount)}</span>
                    <span className="text-desk-ink/55">{p.status}</span>
                  </li>
                ))}
                {!payments.length && <li className="text-sm text-desk-ink/55">Aucun paiement.</li>}
              </ul>
              <Link to="/admin/paiements" className="mt-3 inline-block text-sm font-semibold underline-offset-2 hover:underline">
                Voir les paiements
              </Link>
            </section>

            <section className="rounded-3xl bg-white p-5">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold">
                <MessageSquareText className="size-5" strokeWidth={1.75} aria-hidden="true" />
                Observations & signalements
              </h2>

              <form onSubmit={submitNote} className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNoteType("observation")}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      noteType === "observation" ? "bg-desk-ink text-white" : "bg-desk-canvas"
                    }`}
                  >
                    Observation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNoteType("signalement");
                      setSeverity("warning");
                    }}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      noteType === "signalement" ? "bg-coral-700 text-white" : "bg-desk-canvas"
                    }`}
                  >
                    <Flag className="size-3.5" aria-hidden="true" />
                    Signalement
                  </button>
                </div>

                {noteType === "signalement" && (
                  <Field
                    label="Gravité"
                    as="select"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    options={[
                      { value: "info", label: "Info" },
                      { value: "warning", label: "Attention" },
                      { value: "critical", label: "Critique" },
                    ]}
                  />
                )}

                <Field
                  label={noteType === "signalement" ? "Décrire le signalement" : "Observation"}
                  as="textarea"
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  required
                />

                {noteError && <DeskAlert>{noteError}</DeskAlert>}
                {noteOk && <p className="text-sm font-medium text-teal-800">{noteOk}</p>}

                <Button type="submit" disabled={savingNote || !noteBody.trim()} withArrow={false}>
                  {savingNote ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </form>

              <ul className="mt-5 space-y-2.5">
                {notes.map((n) => {
                  const sev = SEVERITY[n.severity] || SEVERITY.info;
                  return (
                    <li key={n.id} className={`rounded-2xl px-4 py-3 ${sev.tone}`}>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-desk-ink/55">
                        {n.type === "signalement" ? (
                          <span className="inline-flex items-center gap-1 text-coral-800">
                            <AlertTriangle className="size-3.5" aria-hidden="true" />
                            Signalement · {sev.label}
                          </span>
                        ) : (
                          <span>Observation</span>
                        )}
                        <span>· {formatDateTime(n.createdAt)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{n.body}</p>
                      {n.author?.fullName && (
                        <p className="mt-1 text-xs text-desk-ink/50">par {n.author.fullName}</p>
                      )}
                    </li>
                  );
                })}
                {!notes.length && (
                  <li className="rounded-2xl bg-desk-canvas px-4 py-4 text-center text-sm text-desk-ink/55">
                    Aucune note pour l’instant.
                  </li>
                )}
              </ul>
            </section>

            <Link
              to={`/admin/commandes/${order.id}`}
              className="block rounded-3xl bg-desk-mint px-5 py-4 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Ouvrir la fiche commande →
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
