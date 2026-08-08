import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  UserRound,
  BriefcaseBusiness,
  CalendarClock,
  Wallet,
  FolderCheck,
  ShieldCheck,
  Lock,
  Camera,
  Info,
  AlertTriangle,
  Star,
} from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Field from "../components/ui/Field";
import FileDrop from "../components/ui/FileDrop";
import DomainIcon from "../components/ui/DomainIcon";
import { domains } from "../data/domains";
import {
  GENDERS,
  ID_DOCUMENT_TYPES,
  COMMUNES,
  EXPERIENCE_YEARS,
  EXPERIENCE_LEVELS,
  AVAILABILITY_STATUS,
  WEEK_DAYS,
  TIME_SLOTS,
  RESPONSE_TIMES,
  LANGUAGES,
  MOBILE_MONEY_OPERATORS,
  CARD_NETWORKS,
  DOCUMENT_TYPES,
  VERIFICATION_CHECKS,
} from "../data/providerForm";
import { EASE } from "../lib/motion";
import { api } from "../lib/api";

const STEPS = [
  { id: "identite", label: "Identité", icon: UserRound },
  { id: "profil", label: "Profil", icon: BriefcaseBusiness },
  { id: "dispo", label: "Disponibilité", icon: CalendarClock },
  { id: "paiement", label: "Paiement", icon: Wallet },
  { id: "documents", label: "Documents", icon: FolderCheck },
  { id: "engagement", label: "Engagement", icon: ShieldCheck },
];

const EMPTY_FORM = {
  // 1 — Identité
  lastName: "",
  middleName: "",
  firstName: "",
  photo: [],
  birthDate: "",
  gender: "",
  nationality: "Congolaise (RDC)",
  address: "",
  commune: "",
  phone: "",
  phoneAlt: "",
  email: "",
  idType: "",
  idNumber: "",
  // 2 — Profil professionnel
  domain: "",
  specialties: [],
  bio: "",
  experienceYears: "",
  experienceLevel: "",
  languages: [],
  certifications: "",
  formerEmployer: "",
  // 3 — Disponibilité
  availabilityStatus: "DISPONIBLE",
  days: [],
  slots: [],
  responseTime: "",
  emergencies: false,
  hourlyRate: "",
  // 4 — Paiement
  payoutMethod: "MOBILE_MONEY",
  mmOperator: "",
  mmNumber: "",
  bankNetwork: "",
  bankHolder: "",
  bankNumber: "",
  // 5 — Documents
  documents: {},
  // 6 — Engagement
  consentVerification: false,
  consentAccuracy: false,
  consentTerms: false,
};

export default function BecomeProvider() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleIn = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));

  const activeDomain = domains.find((d) => d.slug === form.domain);

  /* Validation par étape : « Continuer » reste désactivé tant que l'essentiel
     manque, plutôt que d'échouer au moment de l'envoi final. */
  const stepValid = useMemo(() => {
    const identity =
      form.lastName.trim() &&
      form.firstName.trim() &&
      form.birthDate &&
      form.gender &&
      form.commune &&
      form.phone.trim().length >= 8 &&
      form.email.trim() &&
      form.idType &&
      form.idNumber.trim();

    const profile =
      form.domain &&
      form.specialties.length > 0 &&
      form.bio.trim().length >= 40 &&
      form.experienceYears &&
      form.experienceLevel &&
      form.languages.length > 0;

    const availability =
      form.availabilityStatus && form.days.length > 0 && form.slots.length > 0 && form.responseTime;

    const payout =
      form.payoutMethod === "MOBILE_MONEY"
        ? form.mmOperator && form.mmNumber.trim().length >= 8
        : form.bankNetwork && form.bankHolder.trim() && form.bankNumber.trim();

    const documents = (form.documents.identite?.length ?? 0) > 0;

    const engagement = form.consentVerification && form.consentAccuracy && form.consentTerms;

    return [identity, profile, availability, payout, documents, engagement].map(Boolean);
  }, [form]);

  const canContinue = stepValid[step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stepValid.every(Boolean)) {
      setError("Certaines étapes sont incomplètes. Revenez en arrière pour les compléter.");
      return;
    }
    setSending(true);
    setError("");

    try {
      /* Le point d'entrée actuel n'accepte qu'un sous-ensemble des champs.
         Le reste du dossier est agrégé dans `motivation` en attendant que le
         schéma serveur et l'envoi de pièces soient étendus. */
      await api.apply({
        domain: form.domain,
        specialties: form.specialties,
        fullName: [form.lastName, form.middleName, form.firstName].filter(Boolean).join(" "),
        phone: form.phone.trim(),
        commune: form.commune,
        experience: form.experienceYears,
        languages: form.languages,
        motivation: buildSummary(form),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Impossible d'envoyer votre candidature.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Seo
          title="Candidature envoyée"
          description="Votre candidature prestataire SaaCare a bien été reçue."
          path="/devenir-prestataire"
          noindex
        />
        <PageHero
          align="center"
          eyebrow="Dossier reçu"
          title="Votre candidature est entre nos mains."
          subtitle={`Merci ${form.firstName || ""}. Notre équipe qualité examine votre dossier pour le domaine ${
            activeDomain?.name ?? "sélectionné"
          }.`}
          breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Devenir prestataire" }]}
          compact
        />

        <section className="bg-paper-100 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="scale" className="rounded-lg border border-ink-900/8 bg-white p-8 shadow-soft">
              <motion.span
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 16 }}
                className="mx-auto grid size-16 place-items-center rounded-full bg-teal-50"
              >
                <CheckCircle2 className="size-9 text-teal-600" aria-hidden="true" />
              </motion.span>

              <h2 className="mt-6 text-center font-display text-xl font-semibold text-ink-900">
                Ce qui se passe maintenant
              </h2>

              <ol className="mt-6 flex flex-col gap-4">
                {[
                  "Vérification du dossier et des pièces (2 à 3 jours ouvrés)",
                  "Entretien avec l'équipe qualité",
                  "Formation obligatoire propre à votre domaine",
                  "Activation de votre profil et premières missions",
                ].map((label, i) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal-50 font-mono text-xs font-semibold text-teal-700">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-900/70">{label}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-6 border-t border-ink-900/8 pt-5 text-sm leading-relaxed text-ink-900/60">
                Vous recevrez un e-mail à <strong className="text-ink-900">{form.email}</strong> à chaque
                étape. Une question d'ici là ?{" "}
                <Link to="/contact" className="font-semibold text-teal-700 underline underline-offset-4">
                  Contactez-nous
                </Link>
                .
              </p>
            </Reveal>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo
        title="Devenir prestataire"
        description="Rejoignez le réseau de professionnels vérifiés SaaCare : garde d'enfants, chauffeur, soutien scolaire ou services à domicile. Dossier de candidature en ligne."
        path="/devenir-prestataire"
      />

      <PageHero
        eyebrow="Rejoindre SaaCare"
        title="Devenez prestataire vérifié"
        subtitle="Un dossier complet, c'est une activation plus rapide. Comptez une quinzaine de minutes et gardez vos pièces justificatives à portée de main."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Devenir prestataire" }]}
        compact
      />

      <section className="bg-paper-100 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
          <div>
            {/* ---------------- Fil des étapes ---------------- */}
            <ol className="mb-8 flex gap-1.5 overflow-x-auto pb-1" aria-label="Progression du dossier">
              {STEPS.map((s, i) => {
                const done = i < step && stepValid[i];
                const current = i === step;
                return (
                  <li key={s.id} className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => i <= step && setStep(i)}
                      disabled={i > step}
                      aria-current={current ? "step" : undefined}
                      className="w-full text-left disabled:cursor-not-allowed"
                    >
                      <span
                        className={`block h-1 rounded-full transition-colors duration-500 ${
                          current ? "bg-teal-600" : done ? "bg-teal-600/40" : "bg-ink-900/10"
                        }`}
                      />
                      <span
                        className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors duration-300 ${
                          current ? "text-ink-900" : "text-ink-900/40"
                        }`}
                      >
                        {done ? (
                          <Check className="size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
                        ) : (
                          <s.icon className="size-3.5 shrink-0" aria-hidden="true" />
                        )}
                        <span className="truncate">{s.label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <form
              onSubmit={onSubmit}
              className="rounded-lg border border-ink-900/8 bg-white p-6 shadow-soft sm:p-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {step === 0 && <StepIdentity form={form} set={set} />}
                  {step === 1 && (
                    <StepProfile form={form} set={set} toggleIn={toggleIn} activeDomain={activeDomain} />
                  )}
                  {step === 2 && <StepAvailability form={form} set={set} toggleIn={toggleIn} />}
                  {step === 3 && <StepPayout form={form} set={set} />}
                  {step === 4 && <StepDocuments form={form} set={set} />}
                  {step === 5 && <StepEngagement form={form} set={set} activeDomain={activeDomain} />}
                </motion.div>
              </AnimatePresence>

              {error && (
                <p
                  className="mt-6 flex items-start gap-2 rounded-md border border-coral-500/30 bg-coral-100/60 px-3.5 py-2.5 text-sm text-coral-800"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}

              {/* ---------------- Navigation ---------------- */}
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-ink-900/8 pt-6">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold text-ink-900/60 transition-colors hover:text-ink-900 disabled:pointer-events-none disabled:opacity-0"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" /> Retour
                </button>

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={next}
                    disabled={!canContinue}
                    className="inline-flex items-center gap-1.5 rounded-md bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-35"
                  >
                    Continuer <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!canContinue || sending}
                    className="inline-flex items-center gap-1.5 rounded-md bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-35"
                  >
                    <Check className="size-4" aria-hidden="true" />
                    {sending ? "Envoi en cours…" : "Envoyer ma candidature"}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ---------------- Colonne latérale ---------------- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <TrustPanel />
          </aside>
        </div>
      </section>
    </>
  );
}

/* ================================================================
   Étape 1 — Identité
   ================================================================ */
function StepIdentity({ form, set }) {
  return (
    <StepShell
      title="Votre identité"
      description="Ces informations servent à vérifier qui vous êtes. Elles ne sont jamais affichées publiquement en totalité."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Nom" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required />
        <Field label="Postnom" value={form.middleName} onChange={(e) => set("middleName", e.target.value)} />
        <Field
          label="Prénom"
          value={form.firstName}
          onChange={(e) => set("firstName", e.target.value)}
          required
        />
      </div>

      <FileDrop
        label="Photo de profil"
        hint="Portrait net, visage dégagé — c'est la première chose que voient les familles"
        multiple={false}
        accept="image/jpeg,image/png,image/webp"
        files={form.photo}
        onChange={(files) => set("photo", files)}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Date de naissance"
          type="date"
          value={form.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          required
        />
        <Field
          label="Genre"
          as="select"
          options={GENDERS}
          value={form.gender}
          onChange={(e) => set("gender", e.target.value)}
          required
        />
        <Field
          label="Nationalité"
          value={form.nationality}
          onChange={(e) => set("nationality", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.6fr_1fr]">
        <Field
          label="Adresse"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
          hint="Avenue, numéro, quartier"
        />
        <Field
          label="Commune"
          as="select"
          options={COMMUNES.map((c) => ({ value: c, label: c }))}
          value={form.commune}
          onChange={(e) => set("commune", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Téléphone principal"
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          hint="Celui qui reçoit les paiements"
          required
        />
        <Field
          label="Téléphone secondaire"
          type="tel"
          value={form.phoneAlt}
          onChange={(e) => set("phoneAlt", e.target.value)}
        />
        <Field
          label="Adresse e-mail"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
      </div>

      <Fieldset legend="Pièce d'identité">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Type de pièce"
            as="select"
            options={ID_DOCUMENT_TYPES}
            value={form.idType}
            onChange={(e) => set("idType", e.target.value)}
            required
          />
          <Field
            label="Numéro de la pièce"
            value={form.idNumber}
            onChange={(e) => set("idNumber", e.target.value)}
            required
          />
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-900/55">
          <Camera className="mt-0.5 size-3.5 shrink-0 text-teal-700" aria-hidden="true" />
          La photo de la pièce est demandée à l'étape « Documents ».
        </p>
      </Fieldset>
    </StepShell>
  );
}

/* ================================================================
   Étape 2 — Profil professionnel
   ================================================================ */
function StepProfile({ form, set, toggleIn, activeDomain }) {
  return (
    <StepShell
      title="Votre profil professionnel"
      description="C'est ce que verront les familles. Soyez précis : les profils détaillés reçoivent nettement plus de demandes."
    >
      <div>
        <Legend>Domaine d'activité *</Legend>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {domains.map((d) => {
            const active = form.domain === d.slug;
            return (
              <label
                key={d.slug}
                className={`flex cursor-pointer flex-col gap-2 rounded-md border p-4 transition-colors duration-300 ${
                  active ? "border-teal-600 bg-teal-50" : "border-ink-900/10 bg-white hover:border-ink-900/25"
                }`}
              >
                <input
                  type="radio"
                  name="domain"
                  value={d.slug}
                  checked={active}
                  onChange={() => {
                    set("domain", d.slug);
                    set("specialties", []);
                  }}
                  className="sr-only"
                />
                <DomainIcon
                  name={d.icon}
                  className={`size-5 ${active ? "text-teal-700" : "text-ink-900/45"}`}
                />
                <span className="text-sm font-medium text-ink-900">{d.shortName}</span>
              </label>
            );
          })}
        </div>
      </div>

      {activeDomain && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Legend>Spécialités *</Legend>
          <p className="mt-1 text-xs text-ink-900/50">Sélectionnez tout ce que vous savez faire.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeDomain.services.map((service) => (
              <Chip
                key={service}
                active={form.specialties.includes(service)}
                onClick={() => toggleIn("specialties", service)}
              >
                {service}
              </Chip>
            ))}
          </div>
        </motion.div>
      )}

      <Field
        label="Présentation"
        as="textarea"
        rows={5}
        value={form.bio}
        onChange={(e) => set("bio", e.target.value)}
        hint={`Votre parcours, votre façon de travailler — ${form.bio.length}/40 caractères minimum`}
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Années d'expérience"
          as="select"
          options={EXPERIENCE_YEARS}
          value={form.experienceYears}
          onChange={(e) => set("experienceYears", e.target.value)}
          required
        />
        <Field
          label="Niveau"
          as="select"
          options={EXPERIENCE_LEVELS.map(({ value, label }) => ({ value, label }))}
          value={form.experienceLevel}
          onChange={(e) => set("experienceLevel", e.target.value)}
          required
        />
      </div>

      <div>
        <Legend>Langues parlées *</Legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang}
              active={form.languages.includes(lang)}
              onClick={() => toggleIn("languages", lang)}
            >
              {lang}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Certifications / formations"
          value={form.certifications}
          onChange={(e) => set("certifications", e.target.value)}
          hint="Facultatif — les justificatifs se déposent plus loin"
        />
        <Field
          label="Ancien employeur"
          value={form.formerEmployer}
          onChange={(e) => set("formerEmployer", e.target.value)}
          hint="Facultatif — nous pouvons le contacter comme référence"
        />
      </div>
    </StepShell>
  );
}

/* ================================================================
   Étape 3 — Disponibilité et tarif
   ================================================================ */
function StepAvailability({ form, set, toggleIn }) {
  return (
    <StepShell
      title="Vos disponibilités"
      description="Elles conditionnent les missions qui vous seront proposées. Vous pourrez les modifier à tout moment depuis votre espace."
    >
      <div>
        <Legend>Statut actuel *</Legend>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {AVAILABILITY_STATUS.map((s) => {
            const active = form.availabilityStatus === s.value;
            return (
              <label
                key={s.value}
                className={`cursor-pointer rounded-md border p-4 transition-colors duration-300 ${
                  active ? "border-teal-600 bg-teal-50" : "border-ink-900/10 bg-white hover:border-ink-900/25"
                }`}
              >
                <input
                  type="radio"
                  name="availabilityStatus"
                  checked={active}
                  onChange={() => set("availabilityStatus", s.value)}
                  className="sr-only"
                />
                <span className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${
                      s.value === "DISPONIBLE"
                        ? "bg-teal-500"
                        : s.value === "OCCUPE"
                          ? "bg-gold-500"
                          : "bg-ink-900/25"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-ink-900">{s.label}</span>
                </span>
                <span className="mt-1 block text-xs leading-snug text-ink-900/50">{s.hint}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <Legend>Jours disponibles *</Legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {WEEK_DAYS.map((d) => (
            <Chip key={d.value} active={form.days.includes(d.value)} onClick={() => toggleIn("days", d.value)}>
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Legend>Plages horaires *</Legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TIME_SLOTS.map((s) => {
            const active = form.slots.includes(s.value);
            return (
              <label
                key={s.value}
                className={`cursor-pointer rounded-md border p-3 text-center transition-colors duration-300 ${
                  active ? "border-teal-600 bg-teal-50" : "border-ink-900/10 bg-white hover:border-ink-900/25"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleIn("slots", s.value)}
                  className="sr-only"
                />
                <span className="block text-sm font-medium text-ink-900">{s.label}</span>
                <span className="mt-0.5 block font-mono text-[0.62rem] text-ink-900/45">{s.hint}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Délai moyen d'intervention"
          as="select"
          options={RESPONSE_TIMES}
          value={form.responseTime}
          onChange={(e) => set("responseTime", e.target.value)}
          required
        />
        <Field
          label="Tarif horaire souhaité (USD)"
          type="number"
          min="1"
          value={form.hourlyRate}
          onChange={(e) => set("hourlyRate", e.target.value)}
          hint="Indicatif — le devis final est validé avec le client"
        />
      </div>

      <Toggle
        checked={form.emergencies}
        onChange={(v) => set("emergencies", v)}
        label="J'accepte les missions en urgence"
        hint="Demandes à traiter dans les deux heures, en dehors de vos créneaux habituels."
      />
    </StepShell>
  );
}

/* ================================================================
   Étape 4 — Moyens de paiement
   ================================================================ */
function StepPayout({ form, set }) {
  const isMM = form.payoutMethod === "MOBILE_MONEY";

  return (
    <StepShell
      title="Comment souhaitez-vous être payé ?"
      description="Ces coordonnées servent uniquement à vous reverser vos gains, sous 24 heures après validation d'une mission."
    >
      <div className="flex gap-3">
        {[
          { value: "MOBILE_MONEY", label: "Mobile Money" },
          { value: "BANQUE", label: "Virement bancaire" },
        ].map((m) => {
          const active = form.payoutMethod === m.value;
          return (
            <label
              key={m.value}
              className={`flex-1 cursor-pointer rounded-md border p-4 text-center transition-colors duration-300 ${
                active ? "border-teal-600 bg-teal-50" : "border-ink-900/10 bg-white hover:border-ink-900/25"
              }`}
            >
              <input
                type="radio"
                name="payoutMethod"
                checked={active}
                onChange={() => set("payoutMethod", m.value)}
                className="sr-only"
              />
              <span className="text-sm font-medium text-ink-900">{m.label}</span>
            </label>
          );
        })}
      </div>

      {isMM ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Opérateur"
            as="select"
            options={MOBILE_MONEY_OPERATORS}
            value={form.mmOperator}
            onChange={(e) => set("mmOperator", e.target.value)}
            required
          />
          <Field
            label="Numéro Mobile Money"
            type="tel"
            value={form.mmNumber}
            onChange={(e) => set("mmNumber", e.target.value)}
            hint="Le compte doit être à votre nom"
            required
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Réseau"
              as="select"
              options={CARD_NETWORKS}
              value={form.bankNetwork}
              onChange={(e) => set("bankNetwork", e.target.value)}
              required
            />
            <Field
              label="Titulaire du compte"
              value={form.bankHolder}
              onChange={(e) => set("bankHolder", e.target.value)}
              required
            />
          </div>
          <Field
            label="Numéro de compte / IBAN"
            value={form.bankNumber}
            onChange={(e) => set("bankNumber", e.target.value)}
            required
          />
        </div>
      )}

      <div className="flex gap-3 rounded-md border border-gold-200 bg-gold-100/50 p-4">
        <Lock className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-900/70">
          Vos coordonnées financières sont conservées séparément de votre profil public et ne sont jamais
          visibles par les clients. Elles ne servent qu'au reversement de vos gains.
        </p>
      </div>
    </StepShell>
  );
}

/* ================================================================
   Étape 5 — Documents
   ================================================================ */
function StepDocuments({ form, set }) {
  const setDoc = (id, files) => set("documents", { ...form.documents, [id]: files });

  return (
    <StepShell
      title="Vos justificatifs"
      description="Seule la pièce d'identité est obligatoire. Chaque document supplémentaire accélère la vérification et renforce votre dossier."
    >
      {DOCUMENT_TYPES.map((doc) => (
        <FileDrop
          key={doc.id}
          label={doc.label}
          hint={doc.hint}
          required={doc.required}
          files={form.documents[doc.id] ?? []}
          onChange={(files) => setDoc(doc.id, files)}
        />
      ))}

      <div className="flex gap-3 rounded-md border border-ink-900/8 bg-paper-100 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-ink-900/70">
          Un extrait de casier judiciaire peut vous être demandé plus tard, uniquement pour les domaines où
          la loi l'exige — notamment la garde d'enfants. Il n'est jamais demandé à l'inscription.
        </p>
      </div>
    </StepShell>
  );
}

/* ================================================================
   Étape 6 — Engagement
   ================================================================ */
function StepEngagement({ form, set, activeDomain }) {
  const fileCount = Object.values(form.documents).flat().length;

  return (
    <StepShell
      title="Vérification et engagement"
      description="Dernière étape. Vous autorisez SaaCare à mener les contrôles qui permettront d'afficher votre badge de confiance."
    >
      <div className="rounded-md border border-ink-900/8 bg-paper-100 p-5">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-900/45">Récapitulatif</p>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <SummaryRow
            term="Nom complet"
            detail={[form.lastName, form.middleName, form.firstName].filter(Boolean).join(" ")}
          />
          <SummaryRow term="Domaine" detail={activeDomain?.name} />
          <SummaryRow term="Commune" detail={form.commune} />
          <SummaryRow
            term="Spécialités"
            detail={`${form.specialties.length} sélectionnée${form.specialties.length > 1 ? "s" : ""}`}
          />
          <SummaryRow
            term="Disponibilité"
            detail={`${form.days.length} jour${form.days.length > 1 ? "s" : ""} · ${form.slots.length} plage${
              form.slots.length > 1 ? "s" : ""
            }`}
          />
          <SummaryRow term="Documents" detail={`${fileCount} fichier${fileCount > 1 ? "s" : ""}`} />
        </dl>
      </div>

      <div>
        <Legend>Ce que nous allons vérifier</Legend>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VERIFICATION_CHECKS.map((check) => (
            <li
              key={check.key}
              className="flex items-start gap-2.5 rounded-md border border-ink-900/8 bg-white p-3"
            >
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
              <span>
                <span className="block text-sm font-medium text-ink-900">{check.label}</span>
                <span className="block text-xs leading-snug text-ink-900/55">{check.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <Consent
          checked={form.consentVerification}
          onChange={(v) => set("consentVerification", v)}
          label="J'autorise SaaCare à vérifier mon identité, mes documents et mes références auprès des tiers concernés."
        />
        <Consent
          checked={form.consentAccuracy}
          onChange={(v) => set("consentAccuracy", v)}
          label="Je certifie que les informations et documents fournis sont exacts. Toute fausse déclaration entraîne le refus ou la suspension du profil."
        />
        <Consent
          checked={form.consentTerms}
          onChange={(v) => set("consentTerms", v)}
          label={
            <>
              J'accepte les{" "}
              <Link to="/cgu" className="font-semibold text-teal-700 underline underline-offset-2">
                conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link to="/confidentialite" className="font-semibold text-teal-700 underline underline-offset-2">
                politique de confidentialité
              </Link>
              .
            </>
          }
        />
      </div>
    </StepShell>
  );
}

/* ================================================================
   Colonne latérale — confiance et score
   ================================================================ */
function TrustPanel() {
  return (
    <div className="flex flex-col gap-4">
      {/* Aperçu du badge */}
      <div className="overflow-hidden rounded-lg border border-ink-900/8 bg-white shadow-soft">
        <div className="bg-gradient-to-br from-navy-800 to-ink-950 px-5 py-5 text-white">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-teal-300">
            Votre futur badge
          </p>
          <p className="mt-2 flex items-center gap-2 font-display text-lg font-semibold">
            <span className="size-2 rounded-full bg-teal-400" aria-hidden="true" />
            Prestataire vérifié
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/70">
            {["Identité", "Expérience", "Documents"].map((label) => (
              <li key={label} className="inline-flex items-center gap-1">
                <Check className="size-3 text-teal-400" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs leading-relaxed text-ink-900/60">
            Ce badge s'affiche sur votre profil une fois les contrôles terminés. Il est retiré si les
            conditions ne sont plus réunies.
          </p>
        </div>
      </div>

      {/* Score de confiance */}
      <div className="rounded-lg border border-ink-900/8 bg-white p-5 shadow-soft">
        <p className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-900/45">
          <Star className="size-3 text-gold-600" aria-hidden="true" />
          Score SaaCare
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-900/60">
          Calculé après vos premières missions à partir de votre note, de votre ponctualité, de votre taux
          d'acceptation et du nombre de litiges. Il ne se déclare pas : il se construit sur le terrain.
        </p>
        <div className="mt-4 flex items-center gap-2.5 rounded-md bg-paper-100 px-3 py-2.5">
          <span className="font-display text-xl font-semibold text-ink-900">—</span>
          <span className="text-xs leading-snug text-ink-900/50">
            En attente de vos
            <br />
            premières missions
          </span>
        </div>
      </div>

      {/* Réassurance */}
      <ul className="flex flex-col gap-2.5 rounded-lg border border-ink-900/8 bg-paper-50 p-5">
        {[
          "Dossier étudié sous 2 à 3 jours ouvrés",
          "Aucun frais d'inscription",
          "Vos données financières restent privées",
        ].map((label) => (
          <li key={label} className="flex items-start gap-2 text-xs leading-relaxed text-ink-900/65">
            <Check className="mt-0.5 size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================
   Petits composants partagés
   ================================================================ */
function StepShell({ title, description, children }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-900/55">{description}</p>
      <div className="mt-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Legend({ children }) {
  return <span className="block text-sm font-medium text-ink-900">{children}</span>;
}

function Fieldset({ legend, children }) {
  return (
    <fieldset className="rounded-md border border-ink-900/8 bg-paper-100/60 p-4">
      <legend className="px-1.5 text-sm font-medium text-ink-900">{legend}</legend>
      <div className="mt-2">{children}</div>
    </fieldset>
  );
}

function Chip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md border px-3.5 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
        active
          ? "border-teal-600 bg-teal-600 text-white"
          : "border-ink-900/10 bg-white text-ink-900/65 hover:border-ink-900/25 hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-ink-900/8 bg-white p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-ink-900/25 text-teal-600 focus-visible:outline-2 focus-visible:outline-gold-500"
      />
      <span>
        <span className="block text-sm font-medium text-ink-900">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-900/55">{hint}</span>}
      </span>
    </label>
  );
}

function Consent({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-900/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-ink-900/25 text-teal-600 focus-visible:outline-2 focus-visible:outline-gold-500"
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryRow({ term, detail }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink-900/6 py-1.5">
      <dt className="text-xs text-ink-900/50">{term}</dt>
      <dd className="truncate text-sm font-medium text-ink-900">{detail || "—"}</dd>
    </div>
  );
}

/** Agrège les champs non pris en charge par le schéma serveur actuel. */
function buildSummary(form) {
  return [
    form.bio,
    "",
    `Niveau : ${form.experienceLevel}`,
    `Disponibilité : ${form.availabilityStatus} · jours ${form.days.join(", ")} · plages ${form.slots.join(", ")}`,
    `Délai d'intervention : ${form.responseTime}${form.emergencies ? " · accepte les urgences" : ""}`,
    form.hourlyRate ? `Tarif horaire souhaité : ${form.hourlyRate} USD` : "",
    form.certifications ? `Certifications : ${form.certifications}` : "",
    form.formerEmployer ? `Ancien employeur : ${form.formerEmployer}` : "",
    `Pièce d'identité : ${form.idType} n° ${form.idNumber}`,
    `Reversement : ${
      form.payoutMethod === "MOBILE_MONEY"
        ? `${form.mmOperator} ${form.mmNumber}`
        : `${form.bankNetwork} ${form.bankNumber}`
    }`,
  ]
    .filter(Boolean)
    .join("\n");
}
