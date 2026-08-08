import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, CheckCircle2, Send, Clock } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import Reveal, { Stagger, RevealItem } from "../components/ui/Reveal";
import Spotlight from "../components/ui/Spotlight";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { EASE } from "../lib/motion";
import { api } from "../lib/api";

const CONTACT_INFO = [
  { icon: Mail, label: "contact@saacare.com", sub: "Réponse sous 24 h ouvrées", href: "mailto:contact@saacare.com" },
  { icon: Phone, label: "+243 816 483 538", sub: "Du lundi au samedi, 8 h – 18 h", href: "tel:+243816483538" },
  {
    icon: MapPin,
    label: "Concession COTEX N° 63, Ave Colonel Mondjiba, Kinshasa, Congo-Kinshasa",
    sub: "Sur rendez-vous uniquement",
    href: null,
  },
];

const SUBJECT_LABELS = {
  reservation: "Question sur une réservation",
  litige: "Litige ou réclamation",
  prestataire: "Devenir prestataire",
  partenariat: "Partenariat",
  autre: "Autre",
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const subjectValue = String(form.get("subject") || "");
    try {
      await api.contact({
        name: String(form.get("name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        subject: SUBJECT_LABELS[subjectValue] || subjectValue,
        message: String(form.get("message") || "").trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Impossible d’envoyer le message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Seo
        title="Contact"
        description="Contactez l'équipe SaaCare pour toute question sur une réservation, un litige ou un partenariat."
        path="/contact"
      />

      <PageHero
        eyebrow="Contact"
        title="Une question ? Écrivez-nous."
        subtitle="Notre équipe répond sous 24 heures ouvrées, pour toute question relative à une réservation, un litige ou un partenariat."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Contact" }]}
        compact
      />

      <section className="bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr] lg:px-8">
          <Stagger as="ul" className="flex flex-col gap-4">
            {CONTACT_INFO.map(({ icon: Icon, label, sub, href }) => (
              <RevealItem as="li" key={label} variant="left">
                <Spotlight
                  tone="teal"
                  lift={4}
                  className="group flex items-center gap-4 rounded-2xl border border-ink-900/8 bg-white p-5 transition-[box-shadow,border-color] duration-500 hover:border-ink-900/12 hover:shadow-lifted"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:bg-teal-600 group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    {href ? (
                      <a href={href} className="link-underline block font-medium text-ink-900">
                        {label}
                      </a>
                    ) : (
                      <span className="block text-sm font-medium leading-snug text-ink-900 sm:text-[0.95rem]">
                        {label}
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs text-ink-900/55">{sub}</span>
                  </span>
                </Spotlight>
              </RevealItem>
            ))}

            <RevealItem as="li" variant="left">
              <div className="flex items-start gap-3 rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 p-5">
                <Clock className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-ink-900/70">
                  Pour un litige en cours, précisez la référence de la prestation : notre équipe qualité
                  traite ces demandes en priorité.
                </p>
              </div>
            </RevealItem>
          </Stagger>

          <Reveal variant="right" delay={0.1}>
            <div className="rounded-2xl border border-ink-900/8 bg-white p-6 sm:p-8 lg:p-9">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex flex-col items-center gap-3 py-14 text-center"
                    role="status"
                  >
                    <motion.span
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 16 }}
                      className="grid size-16 place-items-center rounded-full bg-teal-50"
                    >
                      <CheckCircle2 className="size-9 text-teal-600" aria-hidden="true" />
                    </motion.span>
                    <p className="mt-2 font-display text-xl font-semibold text-ink-900">Message envoyé</p>
                    <p className="max-w-xs text-sm leading-relaxed text-ink-900/65">
                      Merci pour votre message. Notre équipe vous répond sous 24 heures ouvrées.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-3 text-sm font-semibold text-teal-700 underline underline-offset-4"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="mb-1 border-b border-ink-900/8 pb-5">
                      <h2 className="font-display text-xl font-semibold text-ink-900">Votre message</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-900/55">
                        Remplissez le formulaire — nous vous répondons sous 24 h ouvrées.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field id="contact-name" name="name" label="Nom complet" autoComplete="name" required />
                      <Field id="contact-email" name="email" label="E-mail" type="email" autoComplete="email" required />
                    </div>

                    <Field
                      id="contact-subject"
                      name="subject"
                      label="Sujet"
                      as="select"
                      required
                      defaultValue=""
                      placeholder="Sélectionnez un sujet…"
                      options={[
                        {
                          value: "reservation",
                          label: "Question sur une réservation",
                          description: "Suivi, modification ou annulation d’une prestation.",
                        },
                        {
                          value: "litige",
                          label: "Litige ou réclamation",
                          description: "Signaler un problème — précisez la référence si possible.",
                        },
                        {
                          value: "prestataire",
                          label: "Devenir prestataire",
                          description: "Candidature, documents ou statut de votre dossier.",
                        },
                        {
                          value: "partenariat",
                          label: "Partenariat",
                          description: "Collaboration, presse ou opportunité business.",
                        },
                        {
                          value: "autre",
                          label: "Autre",
                          description: "Toute autre demande adressée à l’équipe SaaCare.",
                        },
                      ]}
                    />

                    <Field
                      id="contact-message"
                      name="message"
                      label="Message"
                      as="textarea"
                      rows={5}
                      required
                      hint="Évitez d’y coller des données sensibles (mots de passe, codes OTP)."
                    />

                    {error && (
                      <p className="rounded-lg border border-coral-500/30 bg-coral-100/60 px-3 py-2 text-sm text-coral-800" role="alert">
                        {error}
                      </p>
                    )}

                    <div className="mt-2 flex flex-col gap-4 border-t border-ink-900/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs leading-relaxed text-ink-900/50 sm:max-w-[16rem]">
                        En envoyant, vous acceptez d’être recontacté par l’équipe SaaCare.
                      </p>
                      <Button type="submit" size="lg" className="w-full shrink-0 sm:w-auto" disabled={sending}>
                        <span className="inline-flex items-center gap-2">
                          <Send className={`size-4 ${sending ? "animate-pulse" : ""}`} aria-hidden="true" />
                          {sending ? "Envoi en cours…" : "Envoyer le message"}
                        </span>
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
