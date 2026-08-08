import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { EASE } from "../../lib/motion";

export default function AccordionItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div
      className={`group relative rounded-2xl border transition-colors duration-500 ${
        open ? "border-teal-200 bg-teal-50/40" : "border-transparent hover:bg-ink-900/3"
      }`}
    >
      {/* Liseré vertical qui apparaît sur l'élément ouvert */}
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{ scaleY: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="absolute left-0 top-4 h-[calc(100%-2rem)] w-0.5 origin-top rounded-full bg-teal-600"
      />
      <h3>
        <button
          type="button"
          id={`accordion-btn-${id}`}
          aria-expanded={open}
          aria-controls={`accordion-panel-${id}`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-gold-500 sm:px-5"
        >
          <span
            className={`font-medium transition-colors duration-300 ${
              open ? "text-teal-800" : "text-ink-900 group-hover:text-ink-950"
            }`}
          >
            {question}
          </span>
          <motion.span
            animate={{ rotate: open ? 135 : 0, backgroundColor: open ? "#9f1a4a" : "#dcefec" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full"
          >
            <Plus
              className={`size-4 transition-colors duration-300 ${open ? "text-white" : "text-teal-700"}`}
              aria-hidden="true"
            />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`accordion-panel-${id}`}
            role="region"
            aria-labelledby={`accordion-btn-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.42, ease: EASE }, opacity: { duration: 0.28 } }}
            className="overflow-hidden"
          >
            <motion.p
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.42, ease: EASE }}
              className="px-4 pb-5 pr-10 text-sm leading-relaxed text-ink-900/65 sm:px-5"
            >
              {answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
