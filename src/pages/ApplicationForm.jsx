import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Save, HandCoins, Phone } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Field from "../components/ui/Field";
import FileDrop from "../components/ui/FileDrop";
import {
  APPLICATION_DOCUMENTS,
  AVAILABILITY_TYPES,
  COMMUNES,
  DRIVING,
  EMPLOYER_TYPES,
  EXPERIENCE_RANGES,
  GENDERS,
  GUARANTOR_LINKS,
  HEARD_FROM,
  LANGUAGES,
  METIERS,
  getMetier,
} from "../data/providerForm";
import { EASE } from "../lib/motion";
import { api } from "../lib/api";

const STORAGE_KEY = "saacare:candidature";
const RESUME_DAYS = 7;

/** Les six étapes du cahier des charges §5.1. */
const STEPS = ["Qui êtes-vous", "Où habitez-vous", "Que savez-vous faire", "Votre expérience", "Vos documents", "Disponibilité et validation"];

const EMPTY_EXPERIENCE = { employerType: "", duration: "", tasks: "", leaveReason: "" };
const EMPTY_GUARANTOR = { name: "", link: "", phone: "" };

const EMPTY_FORM = {
  lastName: "",
  firstName: "",
  birthDate: "",
  gender: "",
  phone: "",
  phoneAlt: "",
  preferredLanguage: "",
  commune: "",
  quartier: "",
  avenue: "",
  landmark: "",
  zones: [],
  metier: "",
  secondaryMetiers: [],
  experience: "",
  skills: [],
  languages: [],
  driving: [],
  experiences: [EMPTY_EXPERIENCE, EMPTY_EXPERIENCE],
  guarantors: [EMPTY_GUARANTOR, EMPTY_GUARANTOR],
  documents: {},
  availabilityType: "",
  startDate: "",
  expectedPay: "",
  heardFrom: "",
  consentTerms: false,
  consentData: false,
};

function ageFrom(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age -= 1;
  return age;
}

/** Brouillon conservé dans le navigateur 7 jours (les photos ne sont pas conservées). */
function loadDraft() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { savedAt, step, form } = JSON.parse(raw);
    if (Date.now() - savedAt > RESUME_DAYS * 86400000) return null;
    return { step, form: { ...EMPTY_FORM, ...form, documents: {} } };
  } catch {
    return null;
  }
}

/** Compression côté navigateur : 1 600 px de large maximum, qualité 0,8, WebP (§5.2). */
async function compressImage(file) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
  } catch {
    return file;
  }
}

export default function ApplicationForm() {
  const draft = useMemo(loadDraft, []);
  const [step, setStep] = useState(draft?.step ?? 0);
  const [form, setForm] = useState(draft?.form ?? EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleIn = (field, value) =>
    setForm((f) => ({ ...f, [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value] }));
  const setRow = (field, index, key, value) =>
    setForm((f) => ({ ...f, [field]: f[field].map((row, i) => (i === index ? { ...row, [key]: value } : row)) }));

  /* Enregistrement automatique à chaque changement d'étape. */
  useEffect(() => {
    try {
      const { documents, ...rest } = form;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), step, form: rest }));
    } catch {
      /* Stockage indisponible : la saisie reste en mémoire. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const metier = getMetier(form.metier);
  const age = ageFrom(form.birthDate);

  /** Messages en français courant, sans vocabulaire technique. */
  const validate = (index) => {
    const e = [];
    if (index === 0) {
      if (!form.lastName.trim()) e.push("Écrivez votre nom.");
      if (!form.firstName.trim()) e.push("Écrivez votre prénom.");
      if (!form.birthDate) e.push("Indiquez votre date de naissance.");
      else if (age < 18) e.push("SaaCare ne place aucune personne de moins de 18 ans. Vous pourrez postuler dès vos 18 ans.");
      if (!form.gender) e.push("Choisissez femme ou homme.");
      if (form.phone.replace(/\D/g, "").length < 9) e.push("Écrivez un numéro de téléphone complet.");
      if (!form.preferredLanguage) e.push("Choisissez la langue dans laquelle nous vous appelons.");
    }
    if (index === 1) {
      if (!form.commune) e.push("Choisissez votre commune.");
      if (!form.quartier.trim()) e.push("Écrivez votre quartier.");
      if (form.zones.length === 0) e.push("Choisissez au moins une commune où vous acceptez de travailler.");
    }
    if (index === 2) {
      if (!form.metier) e.push("Choisissez votre métier principal.");
      if (!form.experience) e.push("Indiquez depuis combien de temps vous faites ce métier.");
      if (form.languages.length === 0) e.push("Choisissez au moins une langue parlée.");
    }
    if (index === 3) {
      const g = form.guarantors[0];
      if (!g.name.trim() || !g.link || g.phone.replace(/\D/g, "").length < 9) e.push("Donnez au moins un garant : nom, lien et téléphone.");
    }
    if (index === 4) {
      APPLICATION_DOCUMENTS.filter((d) => d.required).forEach((d) => {
        if (!(form.documents[d.id]?.length > 0)) e.push(`Ajoutez : ${d.label.toLowerCase()}.`);
      });
    }
    if (index === 5) {
      if (!form.availabilityType) e.push("Choisissez votre disponibilité.");
      if (!form.startDate) e.push("Indiquez quand vous pouvez commencer.");
      if (!form.heardFrom) e.push("Dites-nous comment vous avez connu SaaCare.");
      if (!form.consentTerms) e.push("Acceptez les conditions pour envoyer votre candidature.");
      if (!form.consentData) e.push("Acceptez le traitement de votre dossier.");
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (e.length === 0) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const back = () => {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 0));
  };

  const onFiles = async (id, files) => {
    const compressed = await Promise.all(files.map(compressImage));
    setForm((f) => ({ ...f, documents: { ...f.documents, [id]: compressed } }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const e5 = validate(5);
    setErrors(e5);
    if (e5.length) return;
    setSending(true);
    setServerError("");
    try {
      await api.apply({
        domain: metier?.pole ?? "",
        specialties: form.skills,
        fullName: `${form.lastName} ${form.firstName}`.trim(),
        phone: form.phone.trim(),
        commune: form.commune,
        experience: EXPERIENCE_RANGES.find((r) => r.value === form.experience)?.label ?? form.experience,
        languages: form.languages,
        motivation: buildSummary(form, metier),
      });
      window.localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(err.message || "Votre candidature n'a pas pu être envoyée.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Seo title="Candidature envoyée" description="Votre candidature SaaCare a bien été reçue." path="/devenir-prestataire/postuler" noindex />
        <PageHero align="center" eyebrow="Candidature reçue" title={`Merci ${form.firstName}. Voici la prochaine étape.`} subtitle="Vous allez recevoir un SMS avec votre numéro de candidature et un lien pour suivre votre dossier." compact />
        <section className="bg-paper-100 py-16">
          <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-soft">
            <CheckCircle2 className="mx-auto size-12 text-teal-600" aria-hidden="true" />
            <p className="mt-4 text-sm leading-relaxed text-ink-900">
              Un recruteur vous appelle pour un entretien de dix minutes. Gardez votre téléphone allumé. Nous restons à vos côtés.
            </p>
            <p className="mt-4 rounded-xl bg-peach p-4 text-sm font-medium text-ink-900">Rappel : SaaCare ne vous demandera jamais d'argent.</p>
            <Link to="/" className="mt-6 inline-flex font-semibold text-teal-700 underline underline-offset-2">
              Retour à l'accueil
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title="Formulaire de candidature" description="Postulez en 6 étapes depuis votre téléphone pour rejoindre le registre SaaCare. Candidature entièrement gratuite." path="/devenir-prestataire/postuler" />

      <PageHero
        eyebrow="Candidature gratuite"
        title="Postuler chez SaaCare"
        subtitle="Six étapes, moins de 8 minutes. Vos réponses sont enregistrées sur ce téléphone : vous pouvez reprendre plus tard."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Devenir prestataire", to: "/devenir-prestataire" }, { label: "Postuler" }]}
        compact
      />

      <section className="bg-paper-100 py-10 sm:py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {draft && step > 0 && (
            <p className="mb-5 flex items-center gap-2 rounded-xl bg-sky px-4 py-3 text-sm text-ink-900">
              <Save className="size-4 text-teal-700" aria-hidden="true" />
              Nous avons repris votre candidature là où vous l'aviez laissée. Ajoutez à nouveau vos photos à l'étape 5.
            </p>
          )}

          {/* ---------------- Barre de progression ---------------- */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-ink-900">
                Étape {step + 1} sur {STEPS.length} · <span className="font-normal">{STEPS[step]}</span>
              </p>
              <p className="text-xs text-ink-900/70">{Math.round(((step + 1) / STEPS.length) * 100)} %</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-100" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step + 1} aria-label="Progression de la candidature">
              <motion.div className="h-full rounded-full bg-teal-600" initial={false} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4, ease: EASE }} />
            </div>
          </div>

          <form onSubmit={onSubmit} noValidate className="rounded-3xl border border-ink-900/8 bg-white p-5 shadow-soft sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3, ease: EASE }} className="flex flex-col gap-5">
                <h2 className="font-display text-2xl font-bold text-ink-900">{STEPS[step]}</h2>

                {step === 0 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Nom" autoComplete="family-name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
                      <Field label="Prénom" autoComplete="given-name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required />
                      <Field label="Date de naissance" type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} required />
                      <Field label="Langue pour vous appeler" as="select" options={LANGUAGES.map((l) => ({ value: l, label: l }))} value={form.preferredLanguage} onChange={(e) => set("preferredLanguage", e.target.value)} required />
                      <Field label="Téléphone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} hint="Nous vous envoyons un SMS à ce numéro" required />
                      <Field label="Second téléphone (facultatif)" type="tel" inputMode="tel" value={form.phoneAlt} onChange={(e) => set("phoneAlt", e.target.value)} />
                    </div>
                    <Choice legend="Vous êtes" options={GENDERS} value={form.gender} onChange={(v) => set("gender", v)} />
                    {age !== null && age < 18 && (
                      <p className="flex items-start gap-2.5 rounded-xl bg-coral-100 p-4 text-sm text-coral-800" role="alert">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        SaaCare ne place aucune personne de moins de 18 ans. Vous pourrez postuler dès vos 18 ans.
                      </p>
                    )}
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Commune" as="select" options={COMMUNES.map((c) => ({ value: c, label: c }))} value={form.commune} onChange={(e) => set("commune", e.target.value)} required />
                      <Field label="Quartier" value={form.quartier} onChange={(e) => set("quartier", e.target.value)} required />
                      <Field label="Avenue (facultatif)" value={form.avenue} onChange={(e) => set("avenue", e.target.value)} />
                      <Field label="Point de repère" value={form.landmark} onChange={(e) => set("landmark", e.target.value)} hint="Exemple : près de l'église, derrière le marché" />
                    </div>
                    <Chips legend="Où acceptez-vous de travailler ?" options={COMMUNES} selected={form.zones} onToggle={(v) => toggleIn("zones", v)} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Field
                      label="Métier principal"
                      as="select"
                      options={METIERS.map((m) => ({ value: m.value, label: m.label }))}
                      value={form.metier}
                      onChange={(e) => setForm((f) => ({ ...f, metier: e.target.value, skills: [], secondaryMetiers: f.secondaryMetiers.filter((s) => s !== e.target.value) }))}
                      required
                    />
                    {metier && <Chips legend={`Ce que vous savez faire comme ${metier.label.toLowerCase()}`} options={metier.skills} selected={form.skills} onToggle={(v) => toggleIn("skills", v)} />}
                    <Choice legend="Depuis combien de temps ?" options={EXPERIENCE_RANGES} value={form.experience} onChange={(v) => set("experience", v)} />
                    <Chips legend="Langues parlées" options={LANGUAGES} selected={form.languages} onToggle={(v) => toggleIn("languages", v)} />
                    <Chips legend="Autres métiers (facultatif)" options={METIERS.filter((m) => m.value !== form.metier).map((m) => m.label)} selected={form.secondaryMetiers.map((v) => getMetier(v)?.label)} onToggle={(label) => toggleIn("secondaryMetiers", METIERS.find((m) => m.label === label).value)} />
                    <Chips legend="Permis et véhicule (facultatif)" options={DRIVING} selected={form.driving} onToggle={(v) => toggleIn("driving", v)} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <p className="text-sm text-ink-900/80">Vos deux dernières expériences, si vous en avez.</p>
                    {form.experiences.map((xp, i) => (
                      <fieldset key={i} className="rounded-2xl border border-ink-900/10 p-4">
                        <legend className="px-1 text-sm font-semibold text-ink-900">Expérience {i + 1}</legend>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Pour qui ?" as="select" options={EMPLOYER_TYPES} value={xp.employerType} onChange={(e) => setRow("experiences", i, "employerType", e.target.value)} />
                          <Field label="Combien de temps ?" value={xp.duration} onChange={(e) => setRow("experiences", i, "duration", e.target.value)} hint="Exemple : 2 ans" />
                          <Field label="Vos tâches" value={xp.tasks} onChange={(e) => setRow("experiences", i, "tasks", e.target.value)} />
                          <Field label="Pourquoi êtes-vous parti ?" value={xp.leaveReason} onChange={(e) => setRow("experiences", i, "leaveReason", e.target.value)} />
                        </div>
                      </fieldset>
                    ))}
                    <p className="flex items-start gap-2.5 rounded-xl bg-mint p-4 text-sm text-ink-900">
                      <Phone className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                      Vos garants seront vraiment appelés. Prévenez-les. Un garant au minimum, hors de votre famille de préférence.
                    </p>
                    {form.guarantors.map((g, i) => (
                      <fieldset key={i} className="rounded-2xl border border-ink-900/10 p-4">
                        <legend className="px-1 text-sm font-semibold text-ink-900">Garant {i + 1}{i === 1 ? " (facultatif)" : ""}</legend>
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <Field label="Nom" value={g.name} onChange={(e) => setRow("guarantors", i, "name", e.target.value)} required={i === 0} />
                          <Field label="Lien avec vous" as="select" options={GUARANTOR_LINKS} value={g.link} onChange={(e) => setRow("guarantors", i, "link", e.target.value)} required={i === 0} />
                          <Field label="Téléphone" type="tel" inputMode="tel" value={g.phone} onChange={(e) => setRow("guarantors", i, "phone", e.target.value)} required={i === 0} />
                        </div>
                      </fieldset>
                    ))}
                  </>
                )}

                {step === 4 && (
                  <>
                    <p className="text-sm text-ink-900/80">Prenez les photos avec votre téléphone, dans un endroit bien éclairé. 5 Mo maximum par fichier.</p>
                    {APPLICATION_DOCUMENTS.map((doc) => (
                      <FileDrop key={doc.id} label={doc.label} hint={doc.hint} required={doc.required} multiple={doc.id === "certificates"} accept="image/*,application/pdf" files={form.documents[doc.id] ?? []} onChange={(files) => onFiles(doc.id, files)} />
                    ))}
                  </>
                )}

                {step === 5 && (
                  <>
                    <Choice legend="Votre disponibilité" options={AVAILABILITY_TYPES} value={form.availabilityType} onChange={(v) => set("availabilityType", v)} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Je peux commencer le" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
                      <Field label="Salaire souhaité (indicatif)" value={form.expectedPay} onChange={(e) => set("expectedPay", e.target.value)} hint="En dollars ou en francs, par mois ou par jour" />
                    </div>
                    <Field label="Comment avez-vous connu SaaCare ?" as="select" options={HEARD_FROM} value={form.heardFrom} onChange={(e) => set("heardFrom", e.target.value)} required />
                    <p className="flex items-start gap-2.5 rounded-xl bg-peach p-4 text-sm font-medium text-ink-900">
                      <HandCoins className="mt-0.5 size-5 shrink-0 text-coral-700" aria-hidden="true" />
                      Votre candidature est entièrement gratuite. SaaCare ne vous demandera jamais d'argent.
                    </p>
                    <Consent checked={form.consentTerms} onChange={(v) => set("consentTerms", v)}>
                      J'accepte les{" "}
                      <Link to="/cgu" className="font-semibold text-teal-700 underline underline-offset-2">
                        conditions générales
                      </Link>{" "}
                      et je certifie que mes réponses sont vraies.
                    </Consent>
                    <Consent checked={form.consentData} onChange={(v) => set("consentData", v)}>
                      J'accepte que SaaCare utilise mes informations et mes documents pour vérifier mon dossier (
                      <Link to="/confidentialite" className="font-semibold text-teal-700 underline underline-offset-2">
                        confidentialité
                      </Link>
                      ).
                    </Consent>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {(errors.length > 0 || serverError) && (
              <div className="mt-6 rounded-xl border border-coral-500/40 bg-coral-100 p-4 text-sm text-coral-800" role="alert">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  Il manque quelque chose
                </p>
                <ul className="mt-2 list-disc pl-5">
                  {[...errors, serverError].filter(Boolean).map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink-900/8 pt-6">
              <button type="button" onClick={back} disabled={step === 0} className="inline-flex min-h-12 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-900/80 hover:text-ink-900 disabled:invisible">
                <ChevronLeft className="size-4" aria-hidden="true" /> Retour
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="inline-flex min-h-12 items-center gap-1.5 rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white hover:bg-teal-700">
                  Continuer <ChevronRight className="size-4" aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" disabled={sending} className="inline-flex min-h-12 items-center gap-1.5 rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                  <Check className="size-4" aria-hidden="true" />
                  {sending ? "Envoi…" : "Envoyer ma candidature"}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Choice({ legend, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink-900">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className={`flex min-h-12 cursor-pointer items-center rounded-xl border px-4 text-sm font-medium transition-colors ${value === o.value ? "border-teal-600 bg-teal-50 text-teal-700" : "border-ink-900/15 bg-white text-ink-900"}`}>
            <input type="radio" className="sr-only" name={legend} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Chips({ legend, options, selected, onToggle }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink-900">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <label key={o} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm transition-colors ${active ? "border-teal-600 bg-teal-600 text-white" : "border-ink-900/15 bg-white text-ink-900"}`}>
              <input type="checkbox" className="sr-only" checked={active} onChange={() => onToggle(o)} />
              {active && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Consent({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-900">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#01433D]" />
      <span>{children}</span>
    </label>
  );
}

/** Agrège le dossier dans le champ texte accepté par l'API actuelle. */
function buildSummary(form, metier) {
  const label = (list, v) => list.find((x) => x.value === v)?.label ?? v;
  return [
    `Métier principal : ${metier?.label ?? form.metier}`,
    form.secondaryMetiers.length ? `Autres métiers : ${form.secondaryMetiers.map((v) => getMetier(v)?.label).join(", ")}` : "",
    `Né(e) le ${form.birthDate} · ${label(GENDERS, form.gender)} · langue d'appel : ${form.preferredLanguage}`,
    form.phoneAlt ? `Second téléphone : ${form.phoneAlt}` : "",
    `Adresse : ${form.commune}, ${form.quartier}${form.avenue ? `, ${form.avenue}` : ""}${form.landmark ? ` (repère : ${form.landmark})` : ""}`,
    `Communes d'intervention : ${form.zones.join(", ")}`,
    form.driving.length ? `Permis et véhicule : ${form.driving.join(", ")}` : "",
    ...form.experiences
      .filter((x) => x.employerType || x.tasks)
      .map((x, i) => `Expérience ${i + 1} : ${label(EMPLOYER_TYPES, x.employerType)} · ${x.duration} · ${x.tasks} · départ : ${x.leaveReason}`),
    ...form.guarantors.filter((g) => g.name).map((g, i) => `Garant ${i + 1} : ${g.name} (${label(GUARANTOR_LINKS, g.link)}) · ${g.phone}`),
    `Pièces jointes préparées : ${Object.values(form.documents).flat().length}`,
    `Disponibilité : ${label(AVAILABILITY_TYPES, form.availabilityType)} · début ${form.startDate}${form.expectedPay ? ` · prétention ${form.expectedPay}` : ""}`,
    `Connu par : ${label(HEARD_FROM, form.heardFrom)}`,
  ]
    .filter(Boolean)
    .join("\n");
}
