import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, initials } from "../../components/admin/DeskUI";

const STATUS = {
  pending: { label: "En attente", tone: "bg-desk-butter" },
  approved: { label: "Approuvé", tone: "bg-desk-mint" },
  rejected: { label: "Refusé", tone: "bg-desk-pink" },
  suspended: { label: "Désactivé", tone: "bg-desk-lilac" },
  banned: { label: "Banni", tone: "bg-desk-pink" },
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function Field({ label, children }) {
  return (
    <div className="rounded-2xl bg-desk-canvas px-4 py-3">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-desk-ink">{children || "—"}</dd>
    </div>
  );
}

export default function AdminProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setError("");
    setItem(null);
    api
      .adminPrestataire(id)
      .then((data) => setItem(data.item))
      .catch((err) => setError(err.message || "Impossible de charger ce dossier."));
  }, [id]);

  const setStatus = async (status) => {
    if (!item) return;
    setBusy(true);
    setError("");
    try {
      const data = await api.updateProviderStatus(item.id, status);
      setItem(data.item);
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  };

  const status = STATUS[item?.status] || { label: item?.status || "—", tone: "bg-desk-canvas" };
  const zones = Array.isArray(item?.zones) ? item.zones.filter(Boolean) : [];
  const languages = Array.isArray(item?.languages) ? item.languages.filter(Boolean) : [];
  const skills = Array.isArray(item?.skills) ? item.skills.filter(Boolean) : [];

  return (
    <>
      <Seo
        title={item?.user?.fullName ? `${item.user.fullName} — Admin` : "Dossier prestataire"}
        path={`/admin/prestataires/${id}`}
        noindex
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white text-desk-ink transition-colors hover:bg-desk-mint"
          aria-label="Retour"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <DeskHeading as="h1">Dossier prestataire</DeskHeading>
      </div>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {!item && !error && <p className="mt-6 text-sm text-desk-ink/55">Chargement…</p>}

      {item && (
        <div className="mt-5 space-y-5">
          <section className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-desk-butter text-xl font-bold">
                {initials(item.user?.fullName || "")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-desk-ink">{item.user?.fullName || "—"}</h2>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-desk-ink/60">{item.metier || "Métier non renseigné"}</p>
                {item.reference && (
                  <p className="mt-1 font-mono text-xs text-desk-ink/45">{item.reference}</p>
                )}
              </div>
            </div>

            {item.status === "pending" && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-desk-ink/8 pt-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("approved")}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-desk-ink pl-4 pr-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Approuver
                  <span className="flex size-7 items-center justify-center rounded-full bg-white text-desk-ink">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("rejected")}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-desk-canvas pl-4 pr-1.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                >
                  Refuser
                  <span className="flex size-7 items-center justify-center rounded-full bg-white">
                    <X className="size-3.5" aria-hidden="true" />
                  </span>
                </button>
              </div>
            )}

            {item.status === "approved" && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-desk-ink/8 pt-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("suspended")}
                  className="inline-flex h-10 items-center rounded-full bg-desk-lilac px-4 text-sm font-semibold disabled:opacity-50"
                >
                  Désactiver
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("banned")}
                  className="inline-flex h-10 items-center rounded-full bg-desk-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Bannir
                </button>
              </div>
            )}

            {(item.status === "rejected" || item.status === "suspended" || item.status === "banned") && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-desk-ink/8 pt-5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setStatus("approved")}
                  className="inline-flex h-10 items-center rounded-full bg-desk-mint px-4 text-sm font-semibold disabled:opacity-50"
                >
                  Réactiver
                </button>
                {item.status !== "banned" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setStatus("banned")}
                    className="inline-flex h-10 items-center rounded-full bg-desk-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Bannir
                  </button>
                )}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold tracking-tight">Coordonnées</h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="E-mail">{item.user?.email}</Field>
              <Field label="Téléphone">{item.user?.phone || "Non renseigné"}</Field>
              <Field label="Commune">{item.user?.commune || "Non renseignée"}</Field>
              <Field label="Adresse">{item.user?.address || "Non renseignée"}</Field>
              <Field label="Membre depuis">{formatDate(item.user?.createdAt)}</Field>
              <Field label="Dossier mis à jour">{formatDate(item.updatedAt)}</Field>
            </dl>
          </section>

          <section>
            <h3 className="text-lg font-semibold tracking-tight">Profil professionnel</h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Domaine">{item.domain}</Field>
              <Field label="Métier">{item.metier}</Field>
              <Field label="Niveau">{item.level}</Field>
              <Field label="Expérience">{item.experience ? `${item.experience} an(s)` : null}</Field>
              <Field label="Note">{item.rating ? `${item.rating} / 5 (${item.reviews || 0} avis)` : null}</Field>
              <Field label="Disponibilité">{item.availability}</Field>
              <Field label="Missions">{item.missions || null}</Field>
              <Field label="Heures">{item.hours || null}</Field>
              <Field label="Sceau">{item.seal}</Field>
            </dl>
            {item.bio && (
              <div className="mt-3 rounded-2xl bg-white px-4 py-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">Bio</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-desk-ink/80">{item.bio}</p>
              </div>
            )}
            {zones.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {zones.map((z) => (
                  <span key={z} className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                    {z}
                  </span>
                ))}
              </div>
            )}
            {languages.length > 0 && (
              <p className="mt-3 text-sm text-desk-ink/65">
                Langues : <span className="font-medium text-desk-ink">{languages.join(", ")}</span>
              </p>
            )}
            {skills.length > 0 && (
              <p className="mt-2 text-sm text-desk-ink/65">
                Compétences : <span className="font-medium text-desk-ink">{skills.join(", ")}</span>
              </p>
            )}
          </section>

          <p className="text-sm">
            <Link to="/admin/prestataires" className="font-semibold text-desk-ink underline-offset-2 hover:underline">
              ← Retour à la liste
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
