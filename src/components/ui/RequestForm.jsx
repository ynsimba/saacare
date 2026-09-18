import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Send, MessageCircle, Info } from "lucide-react";
import Field from "./Field";
import Button from "./Button";
import { domains, getDomainBySlug } from "../../data/domains";
import { COMMUNES } from "../../data/providerForm";
import { FREQUENCIES, WHATSAPP_HREF } from "../../data/site";
import { api } from "../../lib/api";
import { EASE } from "../../lib/motion";

/**
 * Formulaire court de demande client.
 * `compact` : panneau latéral profil prestataire (service figé, densifié).
 */
export default function RequestForm({
  domainSlug = "",
  providerReference = "",
  defaultCommune = "",
  detailed = false,
  compact = false,
  className = "",
}) {
  const [form, setForm] = useState({
    service: domainSlug,
    commune: defaultCommune,
    frequency: "",
    date: "",
    dueDate: "",
    firstName: "",
    phone: "",
    email: "",
    address: "",
    need: "",
  });
  const [status, setStatus] = useState("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const isWale = form.service === "wale";
  const domain = getDomainBySlug(form.service);
  const lockService = Boolean(providerReference && domainSlug);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const data = await api.request({ ...form, providerReference });
      setReference(data?.reference ?? "");
      setStatus("done");
    } catch (err) {
      setError(err.message || "Votre demande n'a pas pu être envoyée.");
      setStatus("idle");
    }
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
            className={`flex flex-col items-center gap-2 text-center ${compact ? "py-4" : "gap-3 py-8"}`}
            role="status"
          >
            <span className={`grid place-items-center rounded-full bg-teal-50 ${compact ? "size-10" : "size-14"}`}>
              <CheckCircle2 className={compact ? "size-5 text-teal-600" : "size-8 text-teal-600"} aria-hidden="true" />
            </span>
            <p className={`font-display font-bold text-ink-900 ${compact ? "text-base" : "text-xl"}`}>Demande reçue</p>
            {reference && (
              <p className="rounded-lg bg-paper-200 px-3 py-1.5 text-sm text-ink-900">
                N° <strong>{reference}</strong>
              </p>
            )}
            <p className="text-sm leading-relaxed text-ink-900/70">
              Un conseiller vous rappelle au {form.phone}.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={onSubmit}
            className={`flex flex-col ${compact ? "gap-2.5" : "gap-4"}`}
          >
            {lockService && compact && domain && (
              <p className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
                {domain.name}
                {providerReference ? ` · ${providerReference}` : ""}
              </p>
            )}

            <div className={`grid grid-cols-1 ${compact ? "gap-2.5" : "gap-4 sm:grid-cols-2"}`}>
              {!lockService && (
                <Field
                  label="Service"
                  as="select"
                  required
                  value={form.service}
                  onChange={set("service")}
                  options={domains.map((d) => ({
                    value: d.slug,
                    label: d.name,
                    description: d.tagline,
                  }))}
                />
              )}
              <Field
                label="Commune"
                as="select"
                required
                value={form.commune}
                onChange={set("commune")}
                options={COMMUNES.map((c) => ({ value: c, label: c }))}
              />
              <Field
                label="Fréquence"
                as="select"
                required
                value={form.frequency}
                onChange={set("frequency")}
                options={FREQUENCIES}
              />
              {isWale ? (
                <Field
                  label="Date d'accouchement"
                  type="date"
                  required
                  value={form.dueDate}
                  onChange={set("dueDate")}
                  hint={compact ? undefined : "Date prévue ou estimée"}
                />
              ) : (
                <Field label="Date souhaitée" type="date" required value={form.date} onChange={set("date")} />
              )}
              <Field label="Prénom" autoComplete="given-name" required value={form.firstName} onChange={set("firstName")} />
              <Field
                label="Téléphone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                value={form.phone}
                onChange={set("phone")}
                hint={compact ? undefined : "Nous vous rappelons à ce numéro"}
              />
            </div>

            {detailed && (
              <>
                <Field
                  label="Adresse d'intervention"
                  value={form.address}
                  onChange={set("address")}
                  required
                  hint="Commune, quartier, avenue et point de repère"
                />
                <Field label="Votre besoin" as="textarea" rows={3} value={form.need} onChange={set("need")} required />
                <Field label="Courriel (facultatif)" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
              </>
            )}

            {isWale && !compact && (
              <p className="flex gap-2.5 rounded-xl bg-peach p-3.5 text-sm leading-relaxed text-ink-900">
                <Info className="mt-0.5 size-4 shrink-0 text-coral-700" aria-hidden="true" />
                Réservation anticipée dès le 3e trimestre : un acompte de 50 % confirme vos dates.
              </p>
            )}
            {domain && !domain.available && (
              <p className="flex gap-2.5 rounded-xl bg-sky p-3 text-sm leading-relaxed text-ink-900">
                <Info className="mt-0.5 size-4 shrink-0 text-teal-700" aria-hidden="true" />
                {domain.name} ouvre bientôt. Nous enregistrons votre demande.
              </p>
            )}

            {error && (
              <div className="rounded-xl border border-coral-500/30 bg-coral-100 p-3 text-sm text-coral-800" role="alert">
                <p>{error}</p>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            )}

            <div className={`border-t border-ink-900/8 ${compact ? "space-y-2.5 pt-3" : "flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between"}`}>
              {!compact && (
                <p className="text-xs leading-relaxed text-ink-900/65 sm:max-w-xs">
                  Vos données servent uniquement à traiter votre demande.{" "}
                  <Link to="/confidentialite" className="font-semibold text-teal-700 underline underline-offset-2">
                    Confidentialité
                  </Link>
                </p>
              )}
              <Button
                type="submit"
                size={compact ? "md" : "lg"}
                className={compact ? "w-full" : "w-full sm:w-auto"}
                disabled={status === "sending"}
              >
                <span className="inline-flex items-center gap-2">
                  <Send className="size-4" aria-hidden="true" />
                  {status === "sending"
                    ? "Envoi…"
                    : compact
                      ? "Envoyer la demande"
                      : providerReference
                        ? "Demander ce prestataire"
                        : "Envoyer ma demande"}
                </span>
              </Button>
              {compact && (
                <p className="text-center text-[0.7rem] leading-relaxed text-ink-900/55">
                  <Link to="/confidentialite" className="font-semibold text-teal-700 underline underline-offset-2">
                    Confidentialité
                  </Link>
                </p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
