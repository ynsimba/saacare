import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal from "../components/ui/Reveal";
import Field from "../components/ui/Field";
import FileDrop from "../components/ui/FileDrop";
import Button from "../components/ui/Button";
import { homeForRole, useAuth } from "../lib/auth";
import {
  CIVIL_STATUSES,
  COMMUNES,
  EMERGENCY_RELATIONS,
  ID_TYPES,
  METIERS,
  RELIGIONS,
} from "../data/providerForm";
import { domains } from "../data/domains";
import { EASE } from "../lib/motion";

const STEPS = [
  "Identité",
  "Pièce d’identité",
  "Coordonnées",
  "Urgence",
  "Documents",
  "Candidature",
];

async function fileToPayload(file) {
  if (!file) return null;
  let ready = file;
  if (file.type.startsWith("image/")) {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 1600 / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.8));
      if (blob && blob.size < file.size) {
        ready = new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
      }
    } catch {
      /* garder le fichier d’origine */
    }
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(ready);
  });
  return { name: ready.name, mime: ready.type || "application/octet-stream", dataUrl };
}

function ageFrom(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age -= 1;
  return age;
}

const EMPTY = {
  photo: [],
  lastName: "",
  middleName: "",
  firstName: "",
  maritalStatus: "",
  birthPlace: "",
  birthDate: "",
  religion: "",
  idType: "",
  idIssuedAt: "",
  idExpiresAt: "",
  identityDoc: [],
  phone: "",
  email: "",
  commune: "",
  address: "",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "",
  cv: [],
  motivationLetter: [],
  domain: "",
  metier: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterProvider() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (!loading && user) navigate(homeForRole(user.role), { replace: true });
  }, [loading, user, navigate]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => {
      if (key === "domain") return { ...f, domain: value, metier: "" };
      return { ...f, [key]: value };
    });
  };

  const setFiles = (key) => (files) => setForm((f) => ({ ...f, [key]: files }));

  const metierOptions = useMemo(() => {
    const all = METIERS.map((m) => ({ value: m.value, label: m.label, pole: m.pole }));
    if (!form.domain) return all.map(({ value, label }) => ({ value, label }));
    return all
      .filter((m) => m.pole === form.domain || m.pole.startsWith(`${form.domain}-`) || m.pole.startsWith(form.domain))
      .map(({ value, label }) => ({ value, label }));
  }, [form.domain]);

  const validateStep = (index) => {
    if (index === 0) {
      if (!form.photo[0]) return "La photo est obligatoire.";
      if (!form.lastName.trim()) return "Le nom est obligatoire.";
      if (!form.middleName.trim()) return "Le post-nom est obligatoire.";
      if (!form.firstName.trim()) return "Le prénom est obligatoire.";
      if (!form.maritalStatus) return "L’état civil est obligatoire.";
      if (!form.birthPlace.trim()) return "Le lieu de naissance est obligatoire.";
      if (!form.birthDate) return "La date de naissance est obligatoire.";
      const age = ageFrom(form.birthDate);
      if (age != null && age < 18) return "SaaCare n’accepte aucune candidature de moins de 18 ans.";
      if (!form.religion) return "La religion est obligatoire.";
    }
    if (index === 1) {
      if (!form.idType) return "Le type d’identité est obligatoire.";
      if (!form.idIssuedAt) return "La date de délivrance est obligatoire.";
      if (!form.idExpiresAt) return "La date d’expiration est obligatoire.";
      if (!form.identityDoc[0]) return "Le téléversement de la pièce d’identité est obligatoire.";
    }
    if (index === 2) {
      if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 9) {
        return "Le téléphone personnel est obligatoire.";
      }
      if (!form.email.trim()) return "L’e-mail est obligatoire.";
      if (!form.commune) return "La commune est obligatoire.";
      if (!form.address.trim()) return "L’adresse complète est obligatoire.";
    }
    if (index === 3) {
      if (!form.emergencyName.trim()) return "Le nom de la personne à contacter est obligatoire.";
      if (!form.emergencyPhone.trim() || form.emergencyPhone.replace(/\D/g, "").length < 9) {
        return "Le contact d’urgence est obligatoire.";
      }
      if (!form.emergencyRelation) return "La relation avec le contact d’urgence est obligatoire.";
    }
    if (index === 4) {
      if (!form.cv[0]) return "Le CV est obligatoire.";
      if (!form.motivationLetter[0]) return "La lettre de motivation est obligatoire.";
    }
    if (index === 5) {
      if (!form.domain) return "La catégorie (pôle) est obligatoire.";
      if (!form.metier) return "Le service (métier) est obligatoire.";
      if (!form.password) return "Le mot de passe est obligatoire.";
      if (form.password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
      if (!form.confirmPassword) return "La confirmation du mot de passe est obligatoire.";
      if (form.password !== form.confirmPassword) return "Les mots de passe ne correspondent pas.";
    }
    return "";
  };

  const goNext = () => {
    const msg = validateStep(step);
    setError(msg);
    if (msg) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validateStep(5);
    setError(msg);
    if (msg) return;

    setSending(true);
    try {
      const metier = METIERS.find((m) => m.value === form.metier);
      const fullName = [form.lastName, form.middleName, form.firstName].map((s) => s.trim()).filter(Boolean).join(" ");

      const [photo, identity, cv, motivationLetter] = await Promise.all([
        fileToPayload(form.photo[0]),
        fileToPayload(form.identityDoc[0]),
        fileToPayload(form.cv[0]),
        fileToPayload(form.motivationLetter[0]),
      ]);

      const nextUser = await register({
        role: "prestataire",
        fullName,
        email: form.email.trim(),
        phone: form.phone.trim(),
        commune: form.commune,
        address: form.address.trim(),
        password: form.password,
        domain: form.domain || metier?.pole || "",
        metier: metier?.label || form.metier,
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim(),
        firstName: form.firstName.trim(),
        maritalStatus: form.maritalStatus,
        birthPlace: form.birthPlace.trim(),
        birthDate: form.birthDate,
        religion: form.religion,
        idType: form.idType,
        idIssuedAt: form.idIssuedAt,
        idExpiresAt: form.idExpiresAt,
        emergencyName: form.emergencyName.trim(),
        emergencyPhone: form.emergencyPhone.trim(),
        emergencyRelation: form.emergencyRelation,
        documents: { photo, identity, cv, motivationLetter },
      });
      navigate(homeForRole(nextUser.role), { replace: true });
    } catch (err) {
      setError(err.message || "Candidature impossible.");
    } finally {
      setSending(false);
    }
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <>
      <Seo
        title="Candidature prestataire"
        description="Créez votre compte prestataire SaaCare. Votre dossier sera validé avant toute mission."
        path="/inscription/prestataire"
      />
      <PageHero
        eyebrow="Devenir prestataire"
        title="Candidater au registre"
        subtitle="Six étapes courtes. SaaCare examine votre dossier avant de vous proposer des missions."
        breadcrumb={[
          { label: "Accueil", to: "/" },
          { label: "Inscription", to: "/inscription" },
          { label: "Prestataire" },
        ]}
        compact
      />

      <section className="bg-paper-100 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <Reveal>
            <div className="mb-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-ink-900">
                  Étape {step + 1} sur {STEPS.length} · <span className="font-normal text-ink-900/70">{STEPS[step]}</span>
                </p>
                <p className="text-xs text-ink-900/55">{progress} %</p>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-teal-100"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={STEPS.length}
                aria-valuenow={step + 1}
                aria-label="Progression de la candidature"
              >
                <motion.div
                  className="h-full rounded-full bg-teal-600"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-teal-50 text-teal-700">
                  <Briefcase className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold text-ink-900">Inscription prestataire</p>
                  <p className="text-sm text-ink-900/55">Candidature gratuite · validation par SaaCare</p>
                </div>
              </div>

              <p className="mb-5 rounded-xl bg-teal-50 px-3.5 py-2.5 text-sm text-teal-900">
                Tous les champs sont obligatoires <span className="font-semibold">(marqués *)</span>.
              </p>

              <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="flex flex-col gap-4"
                  >
                    <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">{STEPS[step]}</h2>

                    {step === 0 && (
                      <>
                        <p className="text-sm text-ink-900/60">Photo récente de face, puis identité civile telle que sur votre pièce. Tous les champs sont obligatoires.</p>
                        <FileDrop
                          label="Votre photo"
                          hint="JPG, PNG ou WebP · 8 Mo max."
                          required
                          multiple={false}
                          accept="image/jpeg,image/png,image/webp"
                          files={form.photo}
                          onChange={setFiles("photo")}
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Nom" required value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
                          <Field label="Post-nom" required value={form.middleName} onChange={set("middleName")} />
                          <Field label="Prénom" required value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                          <Field label="État civil" as="select" required value={form.maritalStatus} onChange={set("maritalStatus")} options={CIVIL_STATUSES} />
                          <Field label="Lieu de naissance" required value={form.birthPlace} onChange={set("birthPlace")} placeholder="Ville / commune" />
                          <Field label="Date de naissance" type="date" required value={form.birthDate} onChange={set("birthDate")} />
                          <Field label="Religion" as="select" required value={form.religion} onChange={set("religion")} options={RELIGIONS} />
                        </div>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <p className="text-sm text-ink-900/60">Carte d’électeur, passeport ou permis de conduire.</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Type d’identité" as="select" required value={form.idType} onChange={set("idType")} options={ID_TYPES} />
                          <Field label="Date de délivrance" type="date" required value={form.idIssuedAt} onChange={set("idIssuedAt")} />
                          <Field label="Date d’expiration" type="date" required value={form.idExpiresAt} onChange={set("idExpiresAt")} />
                        </div>
                        <FileDrop
                          label="Téléverser la pièce d’identité"
                          hint="Recto (et verso si possible) · PDF ou image · 8 Mo max."
                          required
                          multiple={false}
                          files={form.identityDoc}
                          onChange={setFiles("identityDoc")}
                        />
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <p className="text-sm text-ink-900/60">Nous vous contactons uniquement sur ces informations.</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Téléphone personnel" type="tel" required value={form.phone} onChange={set("phone")} autoComplete="tel" />
                          <Field label="E-mail" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
                          <Field
                            label="Commune"
                            as="select"
                            required
                            value={form.commune}
                            onChange={set("commune")}
                            options={COMMUNES.map((c) => ({ value: c, label: c }))}
                          />
                        </div>
                        <Field
                          label="Adresse complète"
                          as="textarea"
                          rows={2}
                          required
                          value={form.address}
                          onChange={set("address")}
                          placeholder="Avenue, numéro, quartier…"
                        />
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <p className="text-sm text-ink-900/60">Personne à joindre en cas de besoin pendant une mission.</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field label="Personne à contacter" required value={form.emergencyName} onChange={set("emergencyName")} />
                          <Field label="Son contact" type="tel" required value={form.emergencyPhone} onChange={set("emergencyPhone")} />
                          <Field
                            label="Relation"
                            as="select"
                            required
                            value={form.emergencyRelation}
                            onChange={set("emergencyRelation")}
                            options={EMERGENCY_RELATIONS}
                          />
                        </div>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <p className="text-sm text-ink-900/60">CV et lettre de motivation obligatoires.</p>
                        <FileDrop
                          label="CV à téléverser"
                          hint="PDF ou image · 8 Mo max."
                          required
                          multiple={false}
                          files={form.cv}
                          onChange={setFiles("cv")}
                        />
                        <FileDrop
                          label="Lettre de motivation à téléverser"
                          hint="PDF ou image · 8 Mo max."
                          required
                          multiple={false}
                          files={form.motivationLetter}
                          onChange={setFiles("motivationLetter")}
                        />
                      </>
                    )}

                    {step === 5 && (
                      <>
                        <p className="text-sm text-ink-900/60">Pôle, métier, puis création de votre compte SaaCare.</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field
                            label="Catégorie (pôle)"
                            as="select"
                            required
                            value={form.domain}
                            onChange={set("domain")}
                            options={domains.map((d) => ({ value: d.slug, label: d.name }))}
                          />
                          <Field label="Service (métier)" as="select" required value={form.metier} onChange={set("metier")} options={metierOptions} />
                          <Field label="Mot de passe" type="password" required value={form.password} onChange={set("password")} autoComplete="new-password" hint="Au moins 8 caractères" />
                          <Field label="Confirmer le mot de passe" type="password" required value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
                    {error}
                    {/e-mail|email|compte existe/i.test(error) && (
                      <>
                        {" "}
                        <Link to="/login" className="font-semibold underline underline-offset-2">
                          Se connecter
                        </Link>
                      </>
                    )}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 pt-5">
                  {step > 0 ? (
                    <Button type="button" variant="outline" size="sm" onClick={goBack} disabled={sending}>
                      <ChevronLeft className="size-4" aria-hidden="true" />
                      Retour
                    </Button>
                  ) : (
                    <span />
                  )}

                  {step < STEPS.length - 1 ? (
                    <Button type="button" size="sm" onClick={goNext} withArrow={false}>
                      Continuer
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button type="submit" size="sm" disabled={sending || loading} withArrow={false}>
                      {sending ? "Envoi…" : "Envoyer ma candidature"}
                    </Button>
                  )}
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-ink-900/60">
                Déjà un compte ?{" "}
                <Link to="/login" className="font-semibold text-teal-700 hover:underline">
                  Se connecter
                </Link>
              </p>
              <p className="mt-2 text-center text-sm text-ink-900/60">
                Vous cherchez un prestataire ?{" "}
                <Link to="/inscription/client" className="font-semibold text-teal-700 hover:underline">
                  Créer un compte client
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
