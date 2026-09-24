import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { X } from "lucide-react";
import { springs, useIsReducedMotion } from "../../lib/motion";

/* Verrou de défilement partagé : plusieurs feuilles peuvent s'empiler sans
   que la première refermée ne rende la main à la page trop tôt. */
let scrollLocks = 0;
let savedOverflow = "";
function lockScroll() {
  if (scrollLocks++ === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}
function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/**
 * Feuille modale façon application mobile : monte depuis le bas avec un ressort,
 * se ferme en la glissant vers le bas (poignée ou en-tête), par Échap ou via le voile.
 * Rendue dans un portail pour échapper aux ancêtres transformés (en-tête animé,
 * transitions de page) qui fausseraient `position: fixed`.
 */
export default function BottomSheet({ open, onClose, title, children, footer, className = "", maxHeight = "88dvh" }) {
  const reduced = useIsReducedMotion();
  const controls = useDragControls();
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  /* Verrou du défilement, focus initial, piège du focus et Échap. */
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    lockScroll();
    const raf = requestAnimationFrame(() => panelRef.current?.querySelector(FOCUSABLE)?.focus({ preventScroll: true }));

    const onKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      unlockScroll();
      document.removeEventListener("keydown", onKey);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="sheet" className="fixed inset-0 z-[70]" role="presentation">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-ink-950/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "100%", transition: { duration: 0.24, ease: [0.32, 0, 0.67, 0] } }}
            transition={springs.sheet}
            drag={reduced ? false : "y"}
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.9 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 520) onClose();
            }}
            style={{ maxHeight }}
            className={`absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] bg-paper-50 shadow-[0_-24px_60px_-20px_rgba(10,30,30,0.45)] sm:bottom-3 sm:w-[calc(100%-1.5rem)] sm:rounded-[1.75rem] ${className}`}
          >
            {/* Zone de préhension : c'est elle qui déclenche le glisser, pas le contenu défilant. */}
            <div
              className="shrink-0 cursor-grab touch-none select-none px-5 pb-2 pt-2.5 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <div className="mx-auto h-1.5 w-10 rounded-full bg-ink-900/15" aria-hidden="true" />
              {title && (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <h2 id={titleId} className="font-display text-lg font-bold text-ink-900">
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="tap grid size-10 place-items-center rounded-full bg-ink-900/5 text-ink-900/70"
                    aria-label="Fermer"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
            {footer ? (
              <div className="shrink-0 border-t border-ink-900/8 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div>
            ) : (
              <div className="h-[env(safe-area-inset-bottom)] shrink-0" aria-hidden="true" />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
