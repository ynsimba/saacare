import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Pencil, Plus, Trash2, X, Sparkles } from "lucide-react";
import Seo from "../../lib/Seo";
import { api } from "../../lib/api";
import Field from "../../components/ui/Field";
import Button from "../../components/ui/Button";
import { DeskAlert, DeskEmpty, DeskHeading } from "../../components/admin/DeskUI";
import { domains } from "../../data/domains";

const UNIT_LABELS = {
  heure: "À l'heure",
  journee: "À la journée",
  nuit: "À la nuit",
  semaine: "À la semaine",
  mois: "Au mois",
  seance: "À la séance",
  forfait: "Forfait",
  trimestre: "Au trimestre",
  autre: "Autre",
};

const cellBase = "bg-desk-canvas px-3 py-3 align-middle transition-colors duration-200 group-hover:bg-desk-mint/55";

function domainName(slug) {
  return domains.find((d) => d.slug === slug)?.name || slug || "—";
}

function formatAmount(n, currency = "CDF") {
  if (n == null || n === 0) return "Sur devis";
  try {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "CDF",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function formatRange(item) {
  const min = item.amountMin || 0;
  const max = item.amountMax;
  if (!min && !max) return "Sur devis";
  if (max && max !== min) return `${formatAmount(min, item.currency)} – ${formatAmount(max, item.currency)}`;
  return formatAmount(min, item.currency);
}

const emptyForm = {
  domain: "home",
  serviceName: "",
  unit: "forfait",
  unitLabel: "",
  durationLabel: "",
  amountMin: "",
  amountMax: "",
  currency: "CDF",
  description: "",
  isActive: true,
  sortOrder: "0",
};

export default function AdminTariffs() {
  const { query = "" } = useOutletContext() || {};
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ domains: [], units: [] });
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = () =>
    api
      .adminTariffs()
      .then((data) => {
        setItems(data.items || []);
        setMeta(data.meta || { domains: [], units: [] });
        setError("");
      })
      .catch((err) => setError(err.message || "Impossible de charger la grille tarifaire."));

  useEffect(() => {
    load();
  }, []);

  const domainOptions = useMemo(() => {
    const slugs = meta.domains?.length ? meta.domains : domains.map((d) => d.slug);
    return [
      { value: "", label: "— Pôle —" },
      ...slugs.map((slug) => ({ value: slug, label: domainName(slug) })),
    ];
  }, [meta.domains]);

  const unitOptions = useMemo(() => {
    const units = meta.units?.length ? meta.units : Object.keys(UNIT_LABELS);
    return units.map((u) => ({ value: u, label: UNIT_LABELS[u] || u }));
  }, [meta.units]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (domainFilter !== "all" && t.domain !== domainFilter) return false;
      if (!q) return true;
      return [t.serviceName, t.unitLabel, t.durationLabel, t.description, domainName(t.domain), UNIT_LABELS[t.unit]]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, domainFilter, query]);

  const set = (key) => (e) => {
    const value = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, domain: domainFilter !== "all" ? domainFilter : "home" });
    setShowForm(true);
    setOk("");
    setError("");
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      domain: item.domain,
      serviceName: item.serviceName || "",
      unit: item.unit || "forfait",
      unitLabel: item.unitLabel || "",
      durationLabel: item.durationLabel || "",
      amountMin: item.amountMin ? String(item.amountMin) : "",
      amountMax: item.amountMax != null ? String(item.amountMax) : "",
      currency: item.currency || "CDF",
      description: item.description || "",
      isActive: item.isActive !== false,
      sortOrder: String(item.sortOrder ?? 0),
    });
    setShowForm(true);
    setOk("");
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    const body = {
      domain: form.domain,
      serviceName: form.serviceName.trim(),
      unit: form.unit,
      unitLabel: form.unitLabel.trim() || null,
      durationLabel: form.durationLabel.trim() || null,
      amountMin: form.amountMin === "" ? 0 : Number(form.amountMin),
      amountMax: form.amountMax === "" ? null : Number(form.amountMax),
      currency: form.currency || "CDF",
      description: form.description.trim() || null,
      isActive: Boolean(form.isActive),
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editingId) {
        const res = await api.updateAdminTariff(editingId, body);
        setItems((list) => list.map((t) => (t.id === editingId ? res.item : t)));
        setOk("Tarif mis à jour.");
      } else {
        const res = await api.createAdminTariff(body);
        setItems((list) => [...list, res.item]);
        setOk("Tarif ajouté à la grille.");
      }
      closeForm();
    } catch (err) {
      setError(err.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (item) => {
    if (!window.confirm(`Supprimer « ${item.serviceName} » de la grille ?`)) return;
    try {
      await api.deleteAdminTariff(item.id);
      setItems((list) => list.filter((t) => t.id !== item.id));
      setOk("Tarif supprimé.");
    } catch (err) {
      setError(err.message || "Suppression impossible.");
    }
  };

  const onSeed = async () => {
    setSeeding(true);
    setError("");
    setOk("");
    try {
      const res = await api.seedAdminTariffs();
      setItems(res.items || []);
      setOk(res.message || "Catalogue importé.");
    } catch (err) {
      setError(err.message || "Import du catalogue impossible.");
    } finally {
      setSeeding(false);
    }
  };

  const domainFilters = [
    { key: "all", label: "Tous les pôles" },
    ...(meta.domains?.length ? meta.domains : domains.map((d) => d.slug)).map((slug) => ({
      key: slug,
      label: domains.find((d) => d.slug === slug)?.shortName || slug,
    })),
  ];

  return (
    <>
      <Seo title="Grille tarifaire" path="/admin/tarifs" noindex />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <DeskHeading as="h1">Grille tarifaire</DeskHeading>
          <p className="mt-1 text-sm text-desk-ink/55">
            Saisissez les tarifs de tous les services SaaCare. Montant à 0 = « Sur devis ».
          </p>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={seeding} onClick={onSeed} className="justify-start whitespace-nowrap">
            <Sparkles className="size-4 shrink-0" aria-hidden="true" />
            <span>{seeding ? "Import…" : "Importer le catalogue"}</span>
          </Button>
          <Button type="button" size="sm" onClick={openCreate} withArrow={false} className="justify-start whitespace-nowrap">
            <Plus className="size-4 shrink-0" aria-hidden="true" />
            <span>Nouveau tarif</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <DeskAlert>{error}</DeskAlert>
        </div>
      )}
      {ok && (
        <p className="mt-4 rounded-2xl bg-desk-mint/80 px-4 py-2.5 text-sm font-medium text-desk-ink" role="status">
          {ok}
        </p>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="mt-5 rounded-3xl bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">{editingId ? "Modifier le tarif" : "Nouveau tarif"}</h2>
            <button type="button" onClick={closeForm} className="rounded-full p-2 hover:bg-desk-canvas" aria-label="Fermer">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Pôle" as="select" searchable={false} options={domainOptions.filter((o) => o.value)} value={form.domain} onChange={set("domain")} required />
            <Field label="Service" value={form.serviceName} onChange={set("serviceName")} required placeholder="Ex. Chauffeur à la journée" />
            <Field label="Unité" as="select" searchable={false} options={unitOptions} value={form.unit} onChange={set("unit")} required />
            <Field label="Libellé d’unité" value={form.unitLabel} onChange={set("unitLabel")} placeholder="Ex. la journée (10 h)" />
            <Field label="Durée / formule" value={form.durationLabel} onChange={set("durationLabel")} placeholder="Ex. 10 heures" />
            <Field label="Devise" as="select" searchable={false} options={[{ value: "CDF", label: "CDF" }, { value: "USD", label: "USD" }]} value={form.currency} onChange={set("currency")} />
            <Field label="Montant min. (0 = sur devis)" type="number" min="0" value={form.amountMin} onChange={set("amountMin")} />
            <Field label="Montant max. (optionnel)" type="number" min="0" value={form.amountMax} onChange={set("amountMax")} />
            <Field label="Ordre d’affichage" type="number" min="0" value={form.sortOrder} onChange={set("sortOrder")} />
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-desk-ink">
                <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="size-4 rounded border-desk-ink/20" />
                Tarif actif
              </label>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description" as="textarea" rows={2} value={form.description} onChange={set("description")} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || !form.serviceName.trim()} withArrow={false}>
              {saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}
            </Button>
            <Button type="button" variant="outline" disabled={saving} onClick={closeForm}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {domainFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setDomainFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              domainFilter === f.key ? "bg-desk-ink text-white" : "bg-white text-desk-ink/70 hover:bg-desk-mint"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white">
        {filtered.length === 0 ? (
          <div className="p-6">
            <DeskEmpty>
              {items.length === 0
                ? "Aucun tarif. Cliquez sur « Importer le catalogue » ou ajoutez un tarif manuellement."
                : "Aucun tarif ne correspond à ce filtre."}
            </DeskEmpty>
          </div>
        ) : (
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 px-3 py-2 text-left text-sm">
            <thead>
              <tr className="text-xs font-medium uppercase tracking-wide text-desk-ink/55">
                <th className="px-3 py-2 font-medium">Pôle</th>
                <th className="px-3 py-2 font-medium">Service</th>
                <th className="px-3 py-2 font-medium">Unité</th>
                <th className="px-3 py-2 font-medium">Tarif</th>
                <th className="px-3 py-2 font-medium">Statut</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="group">
                  <td className={`${cellBase} rounded-l-2xl font-medium`}>{domainName(t.domain)}</td>
                  <td className={cellBase}>
                    <span className="font-medium">{t.serviceName}</span>
                    {t.durationLabel ? <span className="mt-0.5 block text-xs text-desk-ink/50">{t.durationLabel}</span> : null}
                  </td>
                  <td className={cellBase}>
                    <span>{UNIT_LABELS[t.unit] || t.unit}</span>
                    {t.unitLabel ? <span className="mt-0.5 block text-xs text-desk-ink/50">{t.unitLabel}</span> : null}
                  </td>
                  <td className={`${cellBase} font-semibold`}>{formatRange(t)}</td>
                  <td className={cellBase}>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
                        t.isActive ? "bg-desk-mint text-desk-ink" : "bg-desk-lilac/60 text-desk-ink/60"
                      }`}
                    >
                      {t.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className={`${cellBase} rounded-r-2xl`}>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(t)}
                        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(t)}
                        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-white"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-desk-ink/45">
        {filtered.length} tarif{filtered.length > 1 ? "s" : ""}
        {domainFilter !== "all" || query ? ` (sur ${items.length})` : ""}
      </p>
    </>
  );
}
