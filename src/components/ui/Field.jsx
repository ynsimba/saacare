import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { EASE } from "../../lib/motion";

/**
 * Champ de formulaire à libellé flottant, avec soulignement animé au focus.
 * Couvre input, textarea et select (liste custom via `options`) via la prop `as`.
 */
export default function Field({
  label,
  as = "input",
  type = "text",
  id,
  hint,
  className = "",
  children,
  options,
  ...props
}) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(Boolean(props.defaultValue || props.value));

  useEffect(() => {
    setFilled(Boolean(props.value ?? props.defaultValue));
  }, [props.value, props.defaultValue]);

  const isTextarea = as === "textarea";
  const isSelect = as === "select";
  const useCustomSelect = isSelect && Array.isArray(options);
  // Sur un select, le label reste toujours en haut pour ne pas chevaucher
  // le placeholder / la valeur affichée.
  const floating = isSelect || focused || filled;

  const shared = {
    id: fieldId,
    onFocus: (e) => {
      setFocused(true);
      props.onFocus?.(e);
    },
    onBlur: (e) => {
      setFocused(false);
      setFilled(Boolean(e.target.value));
      props.onBlur?.(e);
    },
    onChange: (e) => {
      setFilled(Boolean(e.target.value));
      props.onChange?.(e);
    },
    className: [
      "peer w-full rounded-lg border border-ink-900/10 bg-paper-100 px-3.5 text-sm text-ink-900 outline-none",
      "transition-[border-color,background-color,box-shadow] duration-300",
      "placeholder:text-transparent",
      "focus:border-teal-600/40 focus:bg-white focus:shadow-[0_0_0_3px_rgba(159,26,74,0.12)]",
      isTextarea ? "min-h-[140px] resize-y pb-3 pt-7" : "h-14 pb-2 pt-6",
      isSelect ? "cursor-pointer appearance-none pr-10" : "",
    ].join(" "),
  };

  if (useCustomSelect) {
    return (
      <CustomSelectField
        fieldId={fieldId}
        label={label}
        hint={hint}
        className={className}
        options={options}
        required={props.required}
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder ?? "Sélectionnez…"}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {isTextarea ? (
          <textarea {...props} {...shared} rows={props.rows ?? 5} />
        ) : isSelect ? (
          <select {...props} {...shared}>
            {children}
          </select>
        ) : (
          <input {...props} {...shared} type={type} />
        )}

        <FloatingLabel htmlFor={fieldId} floating={floating} textarea={isTextarea}>
          {label}
        </FloatingLabel>

        {isSelect && (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-900/40"
          />
        )}

        <FocusLine active={focused} />
      </div>
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-900/50">{hint}</p>}
    </div>
  );
}

function FloatingLabel({ htmlFor, floating, textarea = false, children }) {
  return (
    <motion.label
      htmlFor={htmlFor}
      initial={false}
      animate={
        floating
          ? { top: 10, scale: 1, color: "rgba(3, 41, 76, 0.55)" }
          : { top: textarea ? 22 : 22, scale: 1.05, color: "rgba(3, 41, 76, 0.45)" }
      }
      transition={{ duration: 0.22, ease: EASE }}
      className="pointer-events-none absolute left-3.5 origin-left text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
    >
      {children}
    </motion.label>
  );
}

function FocusLine({ active }) {
  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{ scaleX: active ? 1 : 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="absolute inset-x-3 bottom-0 h-[2px] origin-left rounded-full bg-[linear-gradient(90deg,var(--color-teal-500),var(--color-coral-500))]"
    />
  );
}

function CustomSelectField({
  fieldId,
  label,
  hint,
  className = "",
  options,
  required,
  name,
  defaultValue = "",
  value: controlledValue,
  onChange,
  placeholder,
}) {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selected = options.find((opt) => opt.value === value) ?? null;
  const floating = true;
  const listboxId = `${fieldId}-listbox`;

  useEffect(() => {
    if (!open) return;

    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFocused(false);
        rootRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const commit = (next) => {
    if (!isControlled) setInternalValue(next);
    onChange?.({ target: { value: next, name, id: fieldId } });
    setOpen(false);
    setFocused(false);
  };

  const onTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setFocused(true);
      const idx = Math.max(
        0,
        options.findIndex((opt) => opt.value === value)
      );
      setActiveIndex(idx);
    }
  };

  const onListKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, (i < 0 ? -1 : i) + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, (i < 0 ? options.length : i) - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0) commit(options[activeIndex].value);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={value}
          required={required}
          onChange={() => {}}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />

        <button
          id={fieldId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          onClick={() => {
            setOpen((o) => !o);
            setFocused(true);
            const idx = options.findIndex((opt) => opt.value === value);
            setActiveIndex(idx >= 0 ? idx : 0);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (!open) setFocused(false);
          }}
          onKeyDown={onTriggerKeyDown}
          className={[
            "flex h-14 w-full items-center rounded-lg border bg-paper-100 px-3.5 pt-5 text-left text-sm outline-none transition-[border-color,background-color,box-shadow] duration-300",
            open || focused
              ? "border-teal-600/40 bg-white shadow-[0_0_0_3px_rgba(159,26,74,0.12)]"
              : "border-ink-900/10",
          ].join(" ")}
        >
          <span className={`truncate pr-8 leading-none ${selected ? "text-ink-900" : "text-ink-900/45"}`}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-900/40 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        <FloatingLabel htmlFor={fieldId} floating={floating}>
          {label}
        </FloatingLabel>
        <FocusLine active={focused || open} />
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={fieldId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            onKeyDown={onListKeyDown}
            className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-30 max-h-72 overflow-auto rounded-xl border border-ink-900/10 bg-white p-1.5 shadow-lifted"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isActive = index === activeIndex;

              return (
                <li key={opt.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(opt.value)}
                    className={[
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                      isActive ? "bg-teal-50" : "bg-transparent",
                      isSelected ? "text-teal-800" : "text-ink-900",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        isSelected
                          ? "border-teal-600 bg-teal-600 text-white"
                          : "border-ink-900/15 bg-paper-100 text-transparent",
                      ].join(" ")}
                    >
                      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-snug">{opt.label}</span>
                      {opt.description && (
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-900/50">
                          {opt.description}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-900/50">{hint}</p>}
    </div>
  );
}
