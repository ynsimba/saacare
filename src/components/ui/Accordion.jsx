import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { EASE } from "../../lib/motion";

export default function AccordionItem({ question, answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="group">
      <h3>
        <button
          type="button"
          id={`accordion-btn-${id}`}
          aria-expanded={open}
          aria-controls={`accordion-panel-${id}`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-900/[0.02] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold-500 sm:px-6 sm:py-5"
        >
          <span
            className={`text-[0.95rem] font-medium leading-snug transition-colors duration-300 sm:text-base ${
              open ? "text-teal-800" : "text-ink-900"
            }`}
          >
            {question}
          </span>
          <motion.span
            animate={{ rotate: open ? 135 : 0, backgroundColor: open ? "#01433D" : "#DDEFEA" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
          >
            <Plus
              className={`size-3.5 transition-colors duration-300 ${open ? "text-white" : "text-teal-700"}`}
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
            transition={{ height: { duration: 0.38, ease: EASE }, opacity: { duration: 0.24 } }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl px-5 pb-5 text-sm leading-relaxed text-ink-900/65 sm:px-6 sm:pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
