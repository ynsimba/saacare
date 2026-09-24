import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Download, ExternalLink, FileText, X } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, initials } from "../../components/admin/DeskUI";
import { getDomainBySlug } from "../../data/domains";
import {
  CIVIL_STATUSES,
  EMERGENCY_RELATIONS,
  ID_TYPES,
  RELIGIONS,
} from "../../data/providerForm";

const STATUS = {
  pending: { label: "En attente", tone: "bg-desk-butter" },
  approved: { label: "Approuvé", tone: "bg-desk-mint" },
  rejected: { label: "Refusé", tone: "bg-desk-pink" },
  suspended: { label: "Désactivé", tone: "bg-desk-lilac" },
  banned: { label: "Banni", tone: "bg-desk-pink" },
};

const DOC_LABELS = {
  photo: "Photo d’identité",
  identity: "Pièce d’identité",
  cv: "CV",
  motivationLetter: "Lettre de motivation",
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso.includes("T") ? iso : `${iso}T12:00:00`));
  } catch {
    return iso;
  }
}

function labelOf(options, value) {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label || value;
}

function Field({ label, children }) {
  return (
    <div className="rounded-2xl bg-desk-canvas px-4 py-3">
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-desk-ink">{children || "—"}</dd>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DocumentViewer({ title, doc }) {
  if (!doc?.dataUrl) {
    return (
      <div className="flex flex-col rounded-2xl border border-dashed border-desk-ink/15 bg-desk-canvas/60 p-4">
        <p className="text-sm font-semibold text-desk-ink">{title}</p>
        <p className="mt-2 text-sm text-desk-ink/50">Document non fourni</p>
      </div>
    );
  }

  const mime = doc.mime || "";
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf" || /\.pdf$/i.test(doc.name || "");

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-desk-ink/5">
      <div className="flex items-start justify-between gap-2 border-b border-desk-ink/8 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-desk-ink">{title}</p>
          <p className="mt-0.5 truncate text-xs text-desk-ink/50">{doc.name || "fichier"}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <a
            href={doc.dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-full bg-desk-canvas text-desk-ink transition-colors hover:bg-desk-mint"
            aria-label={`Ouvrir ${title}`}
            title="Ouvrir"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
          <a
            href={doc.dataUrl}
            download={doc.name || title}
            className="inline-flex size-9 items-center justify-center rounded-full bg-desk-canvas text-desk-ink transition-colors hover:bg-desk-mint"
            aria-label={`Télécharger ${title}`}
            title="Télécharger"
          >
            <Download className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="bg-desk-canvas/40 p-3">
        {isImage ? (
          <img
            src={doc.dataUrl}
            alt={title}
            className="mx-auto max-h-72 w-auto max-w-full rounded-lg object-contain"
          />
        ) : isPdf ? (
          <iframe
            title={title}
            src={doc.dataUrl}
            className="h-72 w-full rounded-lg bg-white"
          />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-desk-ink/55">
            <FileText className="size-8" aria-hidden="true" />
            <p className="text-sm">Aperçu non disponible — ouvrez ou téléchargez le fichier.</p>
          </div>
        )}
      </div>
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
      setItem((prev) => {
        const next = data.item;
        if (!next) return prev;
        return {
          ...next,
          documents: next.documents ?? prev?.documents,
        };
      });
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  };

  const status = STATUS[item?.status] || { label: item?.status || "—", tone: "bg-desk-canvas" };
  const domain = getDomainBySlug(item?.domain);
  const zones = Array.isArray(item?.zones) ? item.zones.filter(Boolean) : [];
  const languages = Array.isArray(item?.languages) ? item.languages.filter(Boolean) : [];
  const skills = Array.isArray(item?.skills) ? item.skills.filter(Boolean) : [];
  const docs = item?.documents || {};
  const composedName = [item?.lastName, item?.middleName, item?.firstName].filter(Boolean).join(" ");

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
        <DeskHeading as="h1">Dossier candidature</DeskHeading>
      </div>
      <p className="mt-2 text-sm text-desk-ink/60">
        Toutes les informations et pièces soumises à l’inscription, avant ou après validation.
      </p>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}

      {!item && !error && <p className="mt-6 text-sm text-desk-ink/55">Chargement…</p>}

      {item && (
        <div className="mt-5 space-y-6">
          <section className="rounded-3xl bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              {docs.photo?.dataUrl ? (
                <img
                  src={docs.photo.dataUrl}
                  alt=""
                  className="size-16 shrink-0 rounded-full object-cover ring-2 ring-desk-butter"
                />
              ) : (
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-desk-butter text-xl font-bold">
                  {initials(item.user?.fullName || composedName || "")}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-desk-ink">
                    {composedName || item.user?.fullName || "—"}
                  </h2>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-desk-ink/60">
                  {item.metier || "Métier non renseigné"}
                  {domain ? ` · ${domain.name}` : item.domain ? ` · ${item.domain}` : ""}
                </p>
                {item.reference && (
                  <p className="mt-1 font-mono text-xs text-desk-ink/45">{item.reference}</p>
                )}
                <p className="mt-1 text-xs text-desk-ink/45">
                  Candidature reçue le {formatDate(item.createdAt)}
                </p>
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

          <Section title="1. Identité">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Nom">{item.lastName}</Field>
              <Field label="Post-nom">{item.middleName}</Field>
              <Field label="Prénom">{item.firstName}</Field>
              <Field label="État civil">{labelOf(CIVIL_STATUSES, item.maritalStatus)}</Field>
              <Field label="Lieu de naissance">{item.birthPlace}</Field>
              <Field label="Date de naissance">{formatDate(item.birthDate)}</Field>
              <Field label="Religion">{labelOf(RELIGIONS, item.religion)}</Field>
            </dl>
          </Section>

          <Section title="2. Pièce d’identité">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Type">{labelOf(ID_TYPES, item.idType)}</Field>
              <Field label="Délivrée le">{formatDate(item.idIssuedAt)}</Field>
              <Field label="Expire le">{formatDate(item.idExpiresAt)}</Field>
            </dl>
          </Section>

          <Section title="3. Coordonnées">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="E-mail">{item.user?.email}</Field>
              <Field label="Téléphone">{item.user?.phone}</Field>
              <Field label="Commune">{item.user?.commune}</Field>
              <Field label="Adresse">{item.user?.address}</Field>
              <Field label="Compte créé le">{formatDate(item.user?.createdAt)}</Field>
              <Field label="Dossier mis à jour">{formatDate(item.updatedAt)}</Field>
            </dl>
          </Section>

          <Section title="4. Contact d’urgence">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Nom">{item.emergencyName}</Field>
              <Field label="Téléphone">{item.emergencyPhone}</Field>
              <Field label="Relation">{labelOf(EMERGENCY_RELATIONS, item.emergencyRelation)}</Field>
            </dl>
          </Section>

          <Section title="5. Documents téléversés">
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(DOC_LABELS).map(([key, title]) => (
                <DocumentViewer key={key} title={title} doc={docs[key]} />
              ))}
            </div>
          </Section>

          <Section title="6. Candidature professionnelle">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Pôle / domaine">{domain?.name || item.domain}</Field>
              <Field label="Métier / service">{item.metier}</Field>
              <Field label="Niveau">{item.level}</Field>
              <Field label="Expérience">{item.experience ? `${item.experience} an(s)` : null}</Field>
              <Field label="Disponibilité">{item.availability}</Field>
              <Field label="Sceau SaaTrust">{item.seal}</Field>
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
          </Section>

          <p className="text-sm">
            <Link to="/admin/prestataires/validation" className="font-semibold text-desk-ink underline-offset-2 hover:underline">
              ← Retour à la validation
            </Link>
            <span className="mx-2 text-desk-ink/30">·</span>
            <Link to="/admin/prestataires" className="font-semibold text-desk-ink underline-offset-2 hover:underline">
              Tous les prestataires
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
