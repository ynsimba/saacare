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
          className="flex flex-col gap-4 border-b border-white/8 py-6 sm:gap-6 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:py-12"
        >
          <div>
            <h2 className="text-balance font-display text-xl font-semibold leading-snug text-paper-50 sm:text-2xl lg:text-[1.75rem]">
              Une question avant de réserver ? Parlons-en.
            </h2>
            <p className="mt-1.5 hidden items-center gap-2 text-sm text-white/55 sm:flex">
              <Clock className="size-3.5 shrink-0 text-teal-300" aria-hidden="true" />
              Notre équipe répond sous 24 heures ouvrées.
            </p>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Button to="/contact" size="md" withArrow magnetic className="flex-1 sm:flex-none">
              Nous écrire
            </Button>
            <Button
              href={WHATSAPP_HREF}
              variant="glass"
              size="md"
              magnetic
              rel="noopener noreferrer"
              target="_blank"
              className="flex-1 sm:flex-none"
            >
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </span>
            </Button>
          </div>
        </Reveal>

        {/* ---------------- Colonnes ---------------- */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-0 py-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-y-12 lg:py-14">
          <Reveal variant="blur" className="mb-4 lg:mb-0">
            <Link to="/" className="group inline-flex items-center" aria-label="SaaCare — Accueil">
              <img
                src="/logo-1.png"
                alt=""
                width={2480}
                height={781}
                loading="lazy"
                className="h-8 w-auto object-contain object-left transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.04] sm:h-10"
              />
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55 line-clamp-2 sm:mt-4 sm:line-clamp-none">
              Des professionnels vérifiés, formés et suivis pour la garde d'enfants, le transport, le
              soutien scolaire et les services à domicile — à Kinshasa.
            </p>

            <ul className="mt-4 flex flex-col gap-0.5 sm:mt-6 sm:gap-1">
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
                className="border-b border-white/8 last:border-b-0 lg:border-b-0"
              >
                <h3 className="lg:mb-4">
                  <button
                    type="button"
                    onClick={() => setOpenColumn((current) => (current === col.title ? null : col.title))}
                    aria-expanded={isDesktop ? undefined : isOpen}
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left sm:py-3.5 lg:pointer-events-none lg:py-0"
                  >
                    <span className="flex items-baseline gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/45 sm:text-xs">
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
                      transition={{ height: { duration: 0.35, ease: EASE }, opacity: { duration: 0.2 } }}
                      className="overflow-hidden"
                    >
                      <ul className="flex flex-col gap-0.5 pb-3 lg:pb-0">
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
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3 sm:gap-x-10 sm:rounded-2xl sm:px-6 sm:py-4"
        >
          <span className="inline-flex items-center gap-2 text-[0.7rem] text-white/55 sm:text-xs">
            <ShieldCheck className="size-3.5 shrink-0 text-teal-300 sm:size-4" aria-hidden="true" />
            Prestataires vérifiés
          </span>
          <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 text-[0.7rem] text-white/55 sm:text-xs">
            <Lock className="size-3.5 shrink-0 text-teal-300 sm:size-4" aria-hidden="true" />
            Paiement protégé
          </span>
        </Reveal>

        {/* ---------------- Barre de bas de page ---------------- */}
        <div className="flex flex-col items-center justify-between gap-3 py-5 sm:flex-row sm:gap-4 sm:py-8">
          <p className="text-center text-[0.7rem] text-white/45 sm:text-left sm:text-xs">
            © {YEAR} SaaCare RDC. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <p className="hidden font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/35 sm:block">
              Kinshasa · RDC
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
              className="group inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 px-3.5 py-2 text-xs text-white/55 transition-colors duration-300 hover:border-white/25 hover:text-white focus-visible:outline-2 focus-visible:outline-gold-500 sm:min-h-11 sm:text-sm"
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

      {/* ---------------- Signature typographique (desktop / tablette) ---------------- */}
      <div
        className="pointer-events-none relative hidden select-none overflow-hidden sm:block sm:h-[7vw] sm:min-h-[2.75rem] lg:h-[9vw] lg:min-h-[3.5rem]"
        aria-hidden="true"
      >
        <motion.span
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, ease: EASE }}
          className="absolute inset-x-0 -bottom-[2.5vw] block text-center font-display text-[12vw] font-semibold leading-none tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.10)] lg:text-[15vw]"
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
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:bg-teal-500/20 sm:size-9 sm:rounded-xl">
        <Icon className="size-3.5 text-teal-300 sm:size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm leading-snug text-white/70 transition-colors duration-300 group-hover:text-white">
          {label}
        </span>
        <span className="mt-0.5 hidden text-[0.7rem] text-white/35 sm:block">{sub}</span>
      </span>
    </>
  );

  const className =
    "group flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors duration-300 hover:bg-white/4 sm:gap-3 sm:rounded-xl sm:px-2 sm:py-2";

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
      className="group flex min-h-9 items-center gap-0 rounded-lg py-1.5 text-sm text-white/60 transition-colors duration-300 hover:text-white sm:min-h-10 sm:py-2"
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
