import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeartHandshake, Baby, House, Stethoscope, Camera, PhoneCall, ClipboardList, Globe, CheckCircle2, Send, MessageCircle } from "lucide-react";
import Seo from "../lib/Seo";
import PageHero from "../components/ui/PageHero";
import SectionHeading from "../components/ui/SectionHeading";
import Field from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Stagger, RevealItem } from "../components/ui/Reveal";
import { domains } from "../data/domains";
import { COMMUNES } from "../data/providerForm";
import { FREQUENCIES, WHATSAPP_HREF } from "../data/site";
import { api } from "../lib/api";
import { EASE } from "../lib/motion";

/** Offre diaspora (plan d'affaires §26) : le produit réel, c'est la preuve du service rendu. */
const USES = [
  { icon: HeartHandshake, title: "Un parent âgé", text: "Présence à domicile, courses, rendez-vous et démarches administratives." },
  { icon: Baby, title: "Un neveu, une nièce", text: "Une nounou vérifiée pour votre frère ou votre sœur à Kinshasa." },
  { icon: House, title: "Une maison inoccupée", text: "Entretien régulier et petits travaux, pendant votre absence." },
  { icon: Stethoscope, title: "Une naissance", text: "Saa Walé pour votre sœur, avec un compte rendu quotidien écrit et vocal." },
];

const PROOF = [
  { icon: Camera, title: "Rapport de visite mensuel", text: "Avec photographies horodatées." },
  { icon: ClipboardList, title: "Compte rendu du superviseur", text: "Ce qui a été fait, ce qui est à prévoir." },
  { icon: PhoneCall, title: "Appel de contrôle", text: "Nous appelons votre famille pour vérifier que tout va bien." },
];

export default function Diaspora() {
  return (
    <>
      <Seo
        title="Offre diaspora — un service fiable pour votre famille à Kinshasa"
        description="Vous vivez à l'étranger ? Aide à domicile, garde d'enfants, entretien ou accompagnement Walé pour votre famille à Kinshasa, avec un rapport de visite mensuel."
        path="/diaspora"
      />

      <PageHero
        eyebrow="Diaspora"
        title="Votre famille à Kinshasa, bien accompagnée."
        subtitle="Vous payez depuis Bruxelles, Paris, Johannesburg ou Montréal. Nous intervenons à Kinshasa, et nous vous prouvons chaque mois que le service a été rendu."
        breadcrumb={[{ label: "Accueil", to: "/" }, { label: "Diaspora" }]}
        compact
      >
        <Button href="#demande-diaspora" size="lg" variant="onDark" withArrow>
          Faire une demande
        </Button>
      </PageHero>

      <section className="bg-paper-100 py-16 sm:py-20" aria-labelledby="uses-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Pour qui" title={<span id="uses-heading">Ce que vous pouvez organiser à distance</span>} />
          <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {USES.map(({ icon: Icon, title, text }) => (
              <RevealItem key={title} variant="up" className="rounded-2xl bg-white p-6">
                <Icon className="size-6 text-teal-600" aria-hidden="true" />
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-900/75">{text}</p>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="proof-heading">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading eyebrow="La preuve, chaque mois" title={<span id="proof-heading">Vous savez ce que votre argent a produit</span>} />
            <ul className="mt-8 flex flex-col gap-3">
              {PROOF.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4 rounded-2xl bg-mint p-5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-teal-700" aria-hidden="true" />
                  <span>
                    <strong className="block font-display text-ink-900">{title}</strong>
                    <span className="text-sm text-ink-900/80">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="h-fit rounded-3xl bg-navy-800 p-6 text-paper-50 sm:p-8">
            <Globe className="size-7 text-gold-500" aria-hidden="true" />
            <h3 className="mt-4 font-display text-2xl font-bold">Payer depuis l'étranger</h3>
            <ul className="mt-5 flex flex-col gap-2.5 text-sm text-paper-50/90">
              <li>Paiement en euros ou en dollars, chaque mois</li>
              <li>Facture au nom du payeur résidant à l'étranger</li>
              <li>Un contact local distinct pour l'intervention</li>
              <li>Suivi renforcé et reporting inclus dans l'offre diaspora</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="demande-diaspora" className="scroll-mt-24 bg-paper-100 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-ink-900/8 bg-white p-5 shadow-soft sm:p-8">
            <h2 className="font-display text-2xl font-bold text-ink-900">Faire une demande depuis l'étranger</h2>
            <p className="mt-1.5 text-sm text-ink-900/75">Nous vous rappelons, ou nous vous écrivons sur WhatsApp.</p>
            <DiasporaForm />
          </div>
        </div>
      </section>
    </>
  );
}

/** Adresse de facturation étrangère et contact local distinct (cahier des charges §1.5). */
function DiasporaForm() {
  const [form, setForm] = useState({
    firstName: "",
    country: "",
    phone: "",
    email: "",
    billingAddress: "",
    localName: "",
    localPhone: "",
    service: "",
    commune: "",
    frequency: "",
    need: "",
  });
  const [status, setStatus] = useState("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const data = await api.request({
        service: form.service,
        commune: form.commune,
        frequency: form.frequency,
        firstName: form.firstName,
        phone: form.phone,
        email: form.email,
        address: `Facturation (${form.country}) : ${form.billingAddress}`,
        need: `Offre diaspora — payeur à l'étranger (${form.country}). Contact local : ${form.localName}, ${form.localPhone}. Besoin : ${form.need}`,
      });
      setReference(data?.reference ?? "");
      setStatus("done");
    } catch (err) {
      setError(err.message || "Votre demande n'a pas pu être envoyée.");
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status === "done" ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, ease: EASE }} className="flex flex-col items-center gap-3 py-10 text-center" role="status">
          <CheckCircle2 className="size-12 text-teal-600" aria-hidden="true" />
          <p className="font-display text-xl font-bold text-ink-900">Demande reçue</p>
          {reference && <p className="rounded-lg bg-paper-200 px-3 py-1.5 text-sm">Numéro : <strong>{reference}</strong></p>}
          <p className="max-w-sm text-sm text-ink-900/80">Nous vous contactons, puis nous appelons votre contact à Kinshasa.</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-navy-600">Vous, à l'étranger</legend>
            <Field label="Prénom" value={form.firstName} onChange={set("firstName")} required />
            <Field label="Pays de résidence" value={form.country} onChange={set("country")} required />
            <Field label="Téléphone ou WhatsApp" type="tel" value={form.phone} onChange={set("phone")} required hint="Avec l'indicatif du pays" />
            <Field label="Courriel" type="email" value={form.email} onChange={set("email")} required />
            <Field label="Adresse de facturation" value={form.billingAddress} onChange={set("billingAddress")} required className="sm:col-span-2" />
          </fieldset>
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-navy-600">Votre contact à Kinshasa</legend>
            <Field label="Nom du contact local" value={form.localName} onChange={set("localName")} required />
            <Field label="Téléphone du contact" type="tel" value={form.localPhone} onChange={set("localPhone")} required />
            <Field label="Service" as="select" options={domains.map((d) => ({ value: d.slug, label: d.name }))} value={form.service} onChange={set("service")} required />
            <Field label="Commune" as="select" options={COMMUNES.map((c) => ({ value: c, label: c }))} value={form.commune} onChange={set("commune")} required />
            <Field label="Fréquence" as="select" options={FREQUENCIES} value={form.frequency} onChange={set("frequency")} required />
            <Field label="Le besoin" value={form.need} onChange={set("need")} required />
          </fieldset>
          {error && (
            <div className="rounded-xl border border-coral-500/30 bg-coral-100 p-3.5 text-sm text-coral-800" role="alert">
              <p>{error}</p>
              <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 font-semibold underline underline-offset-2">
                <MessageCircle className="size-4" aria-hidden="true" /> Écrivez-nous sur WhatsApp
              </a>
            </div>
          )}
          <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:ml-auto sm:w-auto">
            <span className="inline-flex items-center gap-2">
              <Send className="size-4" aria-hidden="true" />
              {status === "sending" ? "Envoi…" : "Envoyer ma demande"}
            </span>
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
