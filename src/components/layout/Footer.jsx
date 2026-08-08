import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Mail,
  MapPin,
  Phone,
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
  Lock,
  ChevronDown,
  MessageCircle,
  Clock,
} from "lucide-react";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import { EASE, useIsReducedMotion } from "../../lib/motion";

const YEAR = new Date().getFullYear();
const PHONE = "+243 816 483 538";
const PHONE_HREF = "tel:+243816483538";
const WHATSAPP_HREF = "https://wa.me/243816483538";
const EMAIL = "contact@saacare.com";

const COLUMNS = [
  {
    title: "Plateforme",
    links: [
      { to: "/comment-ca-marche", label: "Comment ça marche" },
      { to: "/trouver-un-prestataire", label: "Trouver un prestataire" },
      { to: "/devenir-prestataire", label: "Devenir prestataire" },
      { to: "/a-propos", label: "À propos" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Assistance",
    links: [
      { to: "/contact", label: "Nous contacter" },
      { to: "/faq", label: "Centre d'aide" },
      { to: "/connexion", label: "Espace membre" },
      { to: "/devenir-prestataire", label: "Espace prestataire" },
    ],
  },
  {
    title: "Légal",
    links: [
      { to: "/mentions-legales", label: "Mentions légales" },
      { to: "/cgu", label: "Conditions d'utilisation" },
      { to: "/cgv", label: "Conditions de vente" },
      { to: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

const CONTACT = [
  {
    icon: MapPin,
    label: "Concession COTEX N° 63, Ave Colonel Mondjiba",
    sub: "Kinshasa, RDC",
    href: null,
  },
  { icon: Phone, label: PHONE, sub: "Lun – Sam, 8 h – 18 h", href: PHONE_HREF },
  { icon: Mail, label: EMAIL, sub: "Réponse sous 24 h ouvrées", href: `mailto:${EMAIL}` },
];

/** Vrai à partir de la largeur `lg` — sert à replier les colonnes sur mobile uniquement. */
function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setDesktop(mq.matches);
    const handler = (e) => setDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return desktop;
}

export default function Footer() {
  const isDesktop = useIsDesktop();
  const reduced = useIsReducedMotion();
  const [openColumn, setOpenColumn] = useState(null);

  return (
    <footer className="noise-overlay relative isolate overflow-hidden bg-gradient-to-b from-navy-900 via-navy-900 to-ink-950 text-white">
      {/* Filet dégradé en haut de page */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-teal-500),var(--color-gold-500),transparent)]"
        aria-hidden="true"
      />

      {/* Halos + trame */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(159,26,74,0.24),transparent)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="aurora-blob -left-32 bottom-0 size-[28rem] bg-teal-500/12 animate-aurora-slow" />
        <div className="aurora-blob -right-24 top-10 size-80 bg-gold-500/8 animate-aurora" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_60%_at_50%_0%,#000,transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------------- Bande d'assistance ---------------- */}
        <Reveal
          variant="up"
          className="flex flex-col gap-6 border-b border-white/8 py-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <h2 className="text-balance font-display text-2xl font-semibold leading-snug text-paper-50 sm:text-[1.75rem]">
              Une question avant de réserver ? Parlons-en.
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
              <Clock className="size-3.5 shrink-0 text-teal-300" aria-hidden="true" />
              Notre équipe répond sous 24 heures ouvrées.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/contact" size="lg" withArrow magnetic>
              Nous écrire
            </Button>
            <Button href={WHATSAPP_HREF} variant="glass" size="lg" magnetic rel="noopener noreferrer" target="_blank">
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </span>
            </Button>
          </div>
        </Reveal>

        {/* ---------------- Colonnes ---------------- */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-2 border-t border-white/8 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-y-12 lg:py-16">
          <Reveal variant="blur" className="mb-6 lg:mb-0">
            {/* Fond navy : c'est la version claire du logo qui s'applique. */}
            <Link to="/" className="group inline-flex items-center" aria-label="SaaCare — Accueil">
              <img
                src="/logo-1.png"
                alt=""
                width={2480}
                height={781}
                loading="lazy"
                className="h-10 w-auto object-contain object-left transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.04]"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Des professionnels vérifiés, formés et suivis pour la garde d'enfants, le transport, le
              soutien scolaire et les services à domicile — à Kinshasa.
            </p>

            <ul className="mt-7 flex flex-col gap-2">
              {CONTACT.map(({ icon: Icon, label, sub, href }) => (
                <li key={label}>
                  <ContactRow icon={Icon} label={label} sub={sub} href={href} />
                </li>
              ))}
            </ul>
          </Reveal>

          {COLUMNS.map((col, colIndex) => {
            const isOpen = isDesktop || openColumn === col.title;

            return (
              <div
                key={col.title}
                className="border-b border-white/8 py-1 last:border-b-0 lg:border-b-0 lg:py-0"
              >
                <h3 className="lg:mb-5">
                  <button
                    type="button"
                    onClick={() => setOpenColumn((current) => (current === col.title ? null : col.title))}
                    aria-expanded={isDesktop ? undefined : isOpen}
                    className="flex w-full items-center justify-between gap-3 py-4 text-left lg:pointer-events-none lg:py-0"
                  >
                    <span className="flex items-baseline gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                      <span className="text-teal-400/60">0{colIndex + 1}</span>
                      {col.title}
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-white/40 transition-transform duration-500 lg:hidden ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={isDesktop || reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25 } }}
                      className="overflow-hidden"
                    >
                      <ul className="flex flex-col gap-1 pb-5 lg:pb-0">
                        {col.links.map((l) => (
                          <li key={`${col.title}-${l.to}-${l.label}`}>
                            <FooterLink to={l.to}>{l.label}</FooterLink>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ---------------- Réassurance ---------------- */}
        <Reveal
          variant="fade"
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 rounded-2xl border border-white/8 bg-white/3 px-6 py-4"
        >
          <span className="inline-flex items-center gap-2 text-xs text-white/55">
            <ShieldCheck className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
            Prestataires vérifiés et formés
          </span>
          <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 text-xs text-white/55">
            <Lock className="size-4 shrink-0 text-teal-300" aria-hidden="true" />
            Paiement protégé jusqu'à validation
          </span>
        </Reveal>

        {/* ---------------- Barre de bas de page ---------------- */}
        <div className="flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <p className="text-xs text-white/45">© {YEAR} SaaCare RDC. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            <p className="hidden font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/35 sm:block">
              Kinshasa · RDC
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              className="group inline-flex min-h-11 items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-sm text-white/55 transition-colors duration-300 hover:border-white/25 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-500"
            >
              Retour en haut
              <ArrowUp
                className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Signature typographique ---------------- */}
      <div className="pointer-events-none relative h-[9vw] min-h-[3.5rem] select-none overflow-hidden" aria-hidden="true">
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, ease: EASE }}
          className="absolute inset-x-0 -bottom-[2.5vw] block text-center font-display text-[15vw] font-semibold leading-none tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.10)]"
        >
          SaaCare
        </motion.span>
      </div>
    </footer>
  );
}

/** Ligne de contact : la pastille s'illumine et l'ensemble glisse légèrement au survol. */
function ContactRow({ icon: Icon, label, sub, href }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:bg-teal-500/20">
        <Icon className="size-4 text-teal-300" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm leading-snug text-white/70 transition-colors duration-300 group-hover:text-white">
          {label}
        </span>
        <span className="mt-0.5 block text-[0.7rem] text-white/35">{sub}</span>
      </span>
    </>
  );

  const className =
    "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-300 hover:bg-white/4";

  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <span className={`${className} cursor-default`}>{content}</span>
  );
}

/** Lien de colonne : un point teal apparaît et pousse le texte au survol. */
function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group flex min-h-11 items-center gap-0 rounded-lg py-2.5 text-sm text-white/60 transition-colors duration-300 hover:text-white"
    >
      <span
        className="mr-0 size-1 shrink-0 scale-0 rounded-full bg-teal-400 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:mr-2 group-hover:scale-100"
        aria-hidden="true"
      />
      <span>{children}</span>
      <ArrowUpRight
        className="ml-1 size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60"
        aria-hidden="true"
      />
    </Link>
  );
}
