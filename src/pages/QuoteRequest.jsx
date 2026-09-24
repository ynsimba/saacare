import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Trash2, CheckCircle2, Send, MessageCircle } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { METIERS } from "../data/providerForm";
import { WHATSAPP_HREF } from "../data/site";
import { api } from "../lib/api";
import { EASE } from "../lib/motion";

const NEED_TYPES = [
  { value: "mise-a-disposition", label: "Mise à disposition de personnel" },
  { value: "entretien", label: "Entretien de locaux" },
  { value: "chauffeurs", label: "Chauffeurs" },
  { value: "courses-livraison", label: "Courses du quotidien & livraison" },
  { value: "conformite", label: "Conformité sociale externalisée" },
];

const DURATIONS = [
  { value: "3 mois", label: "3 mois" },
  { value: "6 mois", label: "6 mois" },
  { value: "12 mois", label: "12 mois" },
  { value: "24 mois", label: "24 mois" },
  { value: "indeterminee", label: "Durée indéterminée" },
];

/** Formulaire de devis structuré multi-postes (cahier des charges §3.3). */
export default function QuoteRequest() {
  const [form, setForm] = useState({
    company: "",
    contactName: "",
    email: "",
    phone: "",
    needType: "",
    duration: "",
    location: "",
    startDate: "",
    message: "",
  });
  const [positions, setPositions] = useState([{ metier: "", count: 1 }]);
  const [status, setStatus] = useState("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setPosition = (i, key, value) => setPositions((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const data = await api.quote({ ...form, positions: positions.filter((p) => p.metier) });
      setReference(data?.reference ?? "");
      setStatus("done");
    } catch (err) {
      setError(err.message || "Votre demande de devis n'a pas pu être envoyée.");
      setStatus("idle");
    }
  };

  return (
    <>
      <Seo title="Demande de devis entreprise" description="Décrivez vos postes : nombre, métiers, durée, lieu et date de démarrage. SaaCare vous envoie un devis détaillé." path="/entreprises/devis" />

      <PageHero
        eyebrow="Entreprises"
        title="Demande de devis"
        subtitle="Décrivez vos besoins poste par poste. Nous revenons vers vous avec un devis détaillé."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Entreprises", to: "/entreprises" }, { label: "Devis" }]}
        compact
      />

      <section className="bg-paper-100 py-8 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-ink-900/8 bg-white p-5 shadow-soft sm:p-8">
            <AnimatePresence mode="wait">
              {status === "done" ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE }} className="flex flex-col items-center gap-3 py-10 text-center" role="status">
                  <CheckCircle2 className="size-12 text-teal-600" aria-hidden="true" />
                  <p className="font-display text-2xl font-bold text-ink-900">Demande de devis reçue</p>
                  {reference && <p className="rounded-lg bg-paper-200 px-3 py-1.5 text-sm">Référence : <strong>{reference}</strong></p>}
                  <p className="max-w-md text-sm leading-relaxed text-ink-900/80">Voici la prochaine étape : un commercial analyse vos postes et vous envoie un devis détaillé par courriel.</p>
                  <Link to="/entreprises" className="mt-2 text-sm font-semibold text-teal-700 underline underline-offset-2">Retour à l'offre entreprises</Link>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={onSubmit} className="flex flex-col gap-6">
                  <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <legend className="mb-3 font-display text-lg font-bold text-ink-900">Votre organisation</legend>
                    <Field label="Raison sociale" autoComplete="organization" value={form.company} onChange={set("company")} required />
                    <Field label="Nom du contact" autoComplete="name" value={form.contactName} onChange={set("contactName")} required />
                    <Field label="Courriel" type="email" autoComplete="email" value={form.email} onChange={set("email")} required />
                    <Field label="Téléphone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} required />
                  </fieldset>

                  <fieldset className="flex flex-col gap-4">
                    <legend className="mb-3 font-display text-lg font-bold text-ink-900">Votre besoin</legend>
                    <Field label="Type de besoin" as="select" options={NEED_TYPES} value={form.needType} onChange={set("needType")} required />
                    <div className="flex flex-col gap-3">
                      {positions.map((p, i) => (
                        <div key={i} className="grid grid-cols-[1fr_6rem_auto] items-start gap-2">
                          <Field label={`Métier — poste ${i + 1}`} as="select" options={METIERS.map((m) => ({ value: m.label, label: m.label }))} value={p.metier} onChange={(e) => setPosition(i, "metier", e.target.value)} required={i === 0} />
                          <Field label="Nombre" type="number" min="1" value={p.count} onChange={(e) => setPosition(i, "count", e.target.value)} />
                          <button type="button" onClick={() => setPositions((rows) => rows.filter((_, idx) => idx !== i))} disabled={positions.length === 1} aria-label={`Retirer le poste ${i + 1}`} className="mt-1.5 grid size-11 place-items-center rounded-lg text-ink-900/70 hover:bg-coral-100 hover:text-coral-800 disabled:invisible">
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setPositions((rows) => [...rows, { metier: "", count: 1 }])} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-dashed border-teal-600 px-4 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                        <Plus className="size-4" aria-hidden="true" /> Ajouter un poste
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field label="Durée" as="select" options={DURATIONS} value={form.duration} onChange={set("duration")} />
                      <Field label="Lieu" value={form.location} onChange={set("location")} hint="Commune ou ville" />
                      <Field label="Démarrage" type="date" value={form.startDate} onChange={set("startDate")} />
                    </div>
                    <Field label="Précisions (facultatif)" as="textarea" rows={4} value={form.message} onChange={set("message")} />
                  </fieldset>

                  {error && (
                    <div className="rounded-xl border border-coral-500/30 bg-coral-100 p-3.5 text-sm text-coral-800" role="alert">
                      <p>{error}</p>
                      <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2">
                        <MessageCircle className="size-4" aria-hidden="true" /> Écrivez-nous sur WhatsApp
                      </a>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 border-t border-ink-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-ink-900/70">Réponse sous 48 heures ouvrées.</p>
                    <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto">
                      <span className="inline-flex items-center gap-2">
                        <Send className="size-4" aria-hidden="true" />
                        {status === "sending" ? "Envoi…" : "Envoyer ma demande de devis"}
                      </span>
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
