import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Headset, MessageCircle, Phone, Mail, X } from "lucide-react";
import { PHONE, PHONE_HREF, WHATSAPP_HREF, HOURS } from "../../data/site";
import { EASE, useIsReducedMotion } from "../../lib/motion";

/**
 * CTA permanent « Support client » : bouton flottant avec avatar casque/micro,
 * panneau de contact rapide (WhatsApp, appel, message).
 */
export default function SupportCTA() {
  const [open, setOpen] = useState(false);
  const reduced = useIsReducedMotion();
  const panelId = useId();
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-20 left-4 z-40 flex flex-col items-start gap-3 xl:bottom-8 xl:left-8"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Support client"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="w-[min(100vw-2rem,18.5rem)] overflow-hidden rounded-2xl border border-ink-900/8 bg-white shadow-lifted"
          >
            <div className="flex items-start gap-3 bg-navy-800 px-4 py-4 text-paper-50">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-500/20 text-gold-200 ring-1 ring-white/15">
                <Headset className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-base font-bold">Support client</p>
                <p className="mt-0.5 text-xs text-paper-50/70">{HOURS}</p>
              </div>
            </div>

            <ul className="flex flex-col p-2">
              <li>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-900 transition-colors hover:bg-teal-50"
                >
                  <MessageCircle className="size-4.5 text-teal-600" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={PHONE_HREF}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-900 transition-colors hover:bg-teal-50"
                >
                  <Phone className="size-4.5 text-teal-600" aria-hidden="true" />
                  {PHONE}
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-900 transition-colors hover:bg-teal-50"
                >
                  <Mail className="size-4.5 text-teal-600" aria-hidden="true" />
                  Envoyer un message
                </Link>
              </li>
              <li>
                <Link
                  to="/aide"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-900 transition-colors hover:bg-teal-50"
                >
                  Centre d'aide
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Fermer le support client" : "Ouvrir le support client"}
        onClick={() => setOpen((v) => !v)}
        whileHover={reduced ? undefined : { scale: 1.04 }}
        whileTap={reduced ? undefined : { scale: 0.96 }}
        className="group flex min-h-12 items-center gap-2.5 rounded-full bg-teal-600 py-2.5 pl-2.5 pr-4 text-sm font-semibold text-white shadow-[0_12px_32px_-10px_rgba(1,67,61,0.75)] transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        <span className="relative grid size-9 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -40 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 40 }}
                transition={{ duration: 0.2 }}
              >
                <X className="size-4.5" aria-hidden="true" />
              </motion.span>
            ) : (
              <motion.span
                key="headset"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Headset className="size-4.5" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && (
            <span
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-gold-500 ring-2 ring-teal-600"
              aria-hidden="true"
            />
          )}
        </span>
        <span className="pr-0.5">Support client</span>
      </motion.button>
    </div>
  );
}
