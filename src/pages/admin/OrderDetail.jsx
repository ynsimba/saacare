import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, UserRound } from "lucide-react";
import Seo from "../../lib/Seo";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { api } from "../../lib/api";
import { DeskAlert, DeskHeading, initials } from "../../components/admin/DeskUI";
import { domains } from "../../data/domains";

const STATUS = {
  nouvelle: "Nouvelle",
  proposee: "Proposée (attente prestataire)",
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

function domainLabel(slug) {
  return domains.find((d) => d.slug === slug)?.name || slug || "—";
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function formatAmount(n) {
  if (n == null || n === 0) return "Sur devis / —";
  return new Intl.NumberFormat("fr-CD", { style: "currency", currency: "CDF", maximumFractionDigits: 0 }).format(n);
}

function Info({ label, children, wide = false }) {
  return (
    <div className={`rounded-2xl bg-desk-canvas px-4 py-3 ${wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/45">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm font-medium text-desk-ink">{children || "—"}</dd>
    </div>
  );
}

function providerLabel(p) {
  const name = p.fullName || p.metier || "Prestataire";
  const bits = [name];
  if (p.metier && p.fullName) bits.push(p.metier);
  if (p.reference) bits.push(p.reference);
  if (p.preferred) bits.push("★ choix client");
  return bits.join(" — ");
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [providerId, setProviderId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [assignError, setAssignError] = useState("");

  const load = () =>
    api
      .adminOrder(id)
      .then((data) => {
        setItem(data.item);
        setProviderId(data.item?.provider?.id ? String(data.item.provider.id) : "");
      })
      .catch((err) => setError(err.message || "Impossible de charger cette commande."));

  useEffect(() => {
    load();
  }, [id]);

  const options = useMemo(() => {
    if (!item) return [];
    const preferred = item.clientPreferredProviders || [];
    const suggested = item.suggestedProviders || [];
    const map = new Map();
    preferred.forEach((p) => map.set(String(p.id), p));
    suggested.forEach((p) => {
      if (!map.has(String(p.id))) map.set(String(p.id), p);
    });
    // Inclure le prestataire actuel même s’il n’est plus dans les listes
    if (item.provider?.id && !map.has(String(item.provider.id))) {
      map.set(String(item.provider.id), { ...item.provider, preferred: true });
    }
    return Array.from(map.values());
  }, [item]);

  const selectOptions = useMemo(
    () => [
      { value: "", label: "— Choisir un prestataire —" },
      ...options.map((p) => ({
        value: String(p.id),
        label: providerLabel(p),
        description: [p.commune, p.level, p.rating ? `${p.rating}/5` : null].filter(Boolean).join(" · "),
      })),
    ],
    [options]
  );

  const preferred = item?.clientPreferredProviders || [];
  const canAssign = item?.assignable !== false && !["annulee", "terminee"].includes(item?.status);

  const onAssign = async (e) => {
    e.preventDefault();
    if (!providerId) {
      setAssignError("Sélectionnez un prestataire.");
      return;
    }
    setSaving(true);
    setAssignError("");
    setOk("");
    try {
      const res = await api.assignAdminOrder(id, {
        providerProfileId: Number(providerId),
        note: note.trim() || null,
      });
      setItem(res.item);
      setProviderId(res.item?.provider?.id ? String(res.item.provider.id) : providerId);
      setOk(res.message || "Prestataire assigné.");
      setNote("");
    } catch (err) {
      setAssignError(err.message || "Assignation impossible.");
    } finally {
      setSaving(false);
    }
  };

  const quickAssign = (pid) => {
    setProviderId(String(pid));
  };

  return (
    <>
      <Seo title={item?.reference ? `Commande ${item.reference}` : "Commande"} path={`/admin/commandes/${id}`} noindex />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white hover:bg-desk-mint"
          aria-label="Retour"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <DeskHeading as="h1">Détail commande</DeskHeading>
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
            <p className="font-mono text-xs font-bold tracking-wide text-desk-ink/50">{item.reference}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{item.metier || item.domain || "Commande"}</h2>
            <p className="mt-1 text-sm text-desk-ink/60">{STATUS[item.status] || item.status}</p>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-desk-ink/45">Détails de la course</h2>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Montant">{formatAmount(item.amount)}</Info>
              <Info label="Service">{[domainLabel(item.domain), item.metier].filter(Boolean).join(" · ") || "—"}</Info>
              <Info label="Commune">{item.commune || "—"}</Info>
              {item.address ? <Info label="Adresse">{item.address}</Info> : null}
              <Info label="Date souhaitée">{item.desiredDate ? formatDate(item.desiredDate) : "—"}</Info>
              <Info label="Créée le">{formatDate(item.createdAt)}</Info>
              <Info label="Client">
                {item.client?.id ? (
                  <Link to={`/admin/clients/${item.client.id}`} className="underline-offset-2 hover:underline">
                    {item.client.fullName}
                  </Link>
                ) : (
                  "—"
                )}
                {item.client?.phone ? (
                  <>
                    <br />
                    <a href={`tel:${item.client.phone}`} className="text-desk-ink/70 underline-offset-2 hover:underline">
                      {item.client.phone}
                    </a>
                  </>
                ) : null}
              </Info>
              <Info label="Prestataire">
                {item.provider?.id ? (
                  <Link to={`/admin/prestataires/${item.provider.id}`} className="underline-offset-2 hover:underline">
                    {item.provider.fullName || item.provider.metier}
                    {item.provider.reference ? ` (${item.provider.reference})` : ""}
                  </Link>
                ) : (
                  "Non assigné"
                )}
              </Info>
              {item.trip ? (
                <Info label="Trajet">
                  {TRIP_STATUS[item.trip.status] || item.trip.status}
                  {item.trip.status === "en_route" ? (
                    <>
                      {" · "}
                      <Link to={`/admin/missions/${item.id}`} className="underline-offset-2 hover:underline">
                        Suivi GPS
                      </Link>
                    </>
                  ) : null}
                </Info>
              ) : null}
              <Info label="Besoin" wide>
                {item.need || "—"}
              </Info>
            </dl>
          </section>

          {canAssign && (
            <section className="rounded-3xl bg-white p-5 sm:p-6">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
                <UserRound className="size-5" strokeWidth={1.75} aria-hidden="true" />
                Assigner la course
              </h2>
              <p className="mt-2 text-sm text-desk-ink/60">
                Confirmez le prestataire demandé par le client, ou choisissez-en un autre parmi les profils approuvés.
              </p>

              {preferred.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-desk-ink/45">Choix / favoris du client</p>
                  <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                    {preferred.map((p) => {
                      const selected = String(p.id) === String(providerId);
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => quickAssign(p.id)}
                            className={`flex w-full items-start gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors ${
                              selected ? "bg-desk-mint ring-1 ring-desk-ink/10" : "bg-desk-canvas hover:bg-desk-mint/50"
                            }`}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">
                              {initials(p.fullName || p.metier || "")}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold">{p.fullName || p.metier}</span>
                              <span className="mt-0.5 block text-xs text-desk-ink/55">
                                {[p.metier, p.reference, p.commune].filter(Boolean).join(" · ")}
                              </span>
                              <span className="mt-1 inline-flex rounded-full bg-white px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-desk-ink/60">
                                Choix client
                              </span>
                            </span>
                            {selected && <Check className="mt-1 size-4 shrink-0 text-desk-ink" aria-hidden="true" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <form onSubmit={onAssign} className="mt-5 space-y-3">
                <Field
                  label="Prestataire"
                  as="select"
                  searchable
                  required
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  placeholder="Nom, métier ou référence…"
                  options={selectOptions}
                />
                <Field
                  label="Note au client (opt.)"
                  as="textarea"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                {assignError && <DeskAlert>{assignError}</DeskAlert>}
                {ok && <p className="text-sm font-medium text-teal-800">{ok}</p>}

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={saving || !providerId} withArrow={false}>
                    {saving
                      ? "Envoi…"
                      : item.provider?.id && String(item.provider.id) === String(providerId)
                        ? "Renvoyer la proposition"
                        : "Proposer à ce prestataire"}
                  </Button>
                  {item.provider?.id && (
                    <Link
                      to={`/admin/prestataires/${item.provider.id}`}
                      className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-desk-ink/70 hover:bg-desk-canvas"
                    >
                      Voir le profil
                    </Link>
                  )}
                </div>
              </form>
            </section>
          )}

          {!canAssign && (
            <p className="rounded-3xl bg-desk-canvas px-5 py-4 text-sm text-desk-ink/60">
              Cette commande est {STATUS[item.status]?.toLowerCase() || item.status} : l’assignation n’est plus modifiable.
            </p>
          )}
        </div>
      )}
    </>
  );
}
