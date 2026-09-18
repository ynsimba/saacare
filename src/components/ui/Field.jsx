import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { EASE } from "../../lib/motion";

/**
 * Champ de formulaire à libellé flottant, avec soulignement animé au focus.
 * Couvre input, textarea et select (liste custom via `options`) via la prop `as`.
 * `searchable` : saisie libre + suggestions filtrées dès `searchMinLength` caractères (défaut 3).
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
  searchable = false,
  searchMinLength = 3,
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
  const isDateLike = as === "input" && ["date", "datetime-local", "month", "time", "week"].includes(type);
  const useCustomSelect = isSelect && Array.isArray(options);
  // Select et date : le label reste en haut (placeholder natif / segments de date).
  const floating = isSelect || isDateLike || focused || filled;
  const showDateValue = !isDateLike || focused || filled;

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
      "transition-[border-color,background-color] duration-300",
      "placeholder:text-transparent",
      "focus:border-teal-600/40 focus:bg-white focus:outline-none focus-visible:outline-none",
      isTextarea ? "min-h-[140px] resize-y pb-3 pt-7" : "h-14 pb-2 pt-6",
      isSelect ? "cursor-pointer appearance-none pr-10" : "",
      isDateLike
        ? [
            "scheme-light cursor-text pr-3",
            // Masque jj/mm/aaaa vide pour éviter le chevauchement avec le label.
            showDateValue
              ? "[&::-webkit-datetime-edit]:text-ink-900"
              : "[&::-webkit-datetime-edit]:text-transparent",
            "[&::-webkit-datetime-edit-fields-wrapper]:p-0",
            "[&::-webkit-calendar-picker-indicator]:ml-auto",
            "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:rounded-md",
            "[&::-webkit-calendar-picker-indicator]:p-1",
            "[&::-webkit-calendar-picker-indicator]:opacity-55",
            "[&::-webkit-calendar-picker-indicator]:hover:opacity-90",
            "[&::-webkit-calendar-picker-indicator]:hover:bg-ink-900/5",
          ].join(" ")
        : "",
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
        searchable={searchable}
        searchMinLength={searchMinLength}
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
          {props.required ? " *" : ""}
        </FloatingLabel>

        {isSelect && (
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-900/40"
          />
        )}
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
          ? { top: 10, scale: 1, color: "rgba(16,42,42, 0.55)" }
          : { top: textarea ? 22 : 22, scale: 1.05, color: "rgba(16,42,42, 0.45)" }
      }
      transition={{ duration: 0.22, ease: EASE }}
      className="pointer-events-none absolute left-3.5 origin-left text-[0.68rem] font-semibold uppercase tracking-[0.12em]"
    >
      {children}
    </motion.label>
  );
}

function normalizeSearch(text = "") {
  return String(text)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
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
  searchable = false,
  searchMinLength = 3,
}) {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = isControlled ? controlledValue : internalValue;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);

  const selected = options.find((opt) => String(opt.value) === String(value)) ?? null;
  const q = normalizeSearch(query);
  const floating = true;
  const listboxId = `${fieldId}-listbox`;

  const visibleOptions = (() => {
    if (!searchable) return options;
    if (!typing || q.length === 0) return options;
    if (q.length < searchMinLength) return [];
    return options.filter((opt) => {
      if (opt.value === "" || opt.value == null) return false;
      const hay = normalizeSearch(`${opt.label || ""} ${opt.description || ""}`);
      return hay.includes(q);
    });
  })();

  useEffect(() => {
    if (!open) return;

    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        setTyping(false);
        setQuery("");
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setFocused(false);
        setTyping(false);
        setQuery("");
        (searchable ? inputRef.current : rootRef.current?.querySelector("button"))?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, searchable]);

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
    setTyping(false);
    setQuery("");
  };

  const openList = (startTyping = false) => {
    setOpen(true);
    setFocused(true);
    setTyping(startTyping);
    if (!startTyping) setQuery("");
    const idx = Math.max(
      0,
      options.findIndex((opt) => String(opt.value) === String(value))
    );
    setActiveIndex(idx);
  };

  const onTriggerKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openList(false);
    }
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openList(true);
      setActiveIndex((i) => Math.min(visibleOptions.length - 1, (i < 0 ? -1 : i) + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, (i < 0 ? visibleOptions.length : i) - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && visibleOptions[activeIndex]) {
        commit(visibleOptions[activeIndex].value);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setTyping(false);
      setQuery("");
    }
  };

  const onListKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(visibleOptions.length - 1, (i < 0 ? -1 : i) + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, (i < 0 ? visibleOptions.length : i) - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIndex >= 0) commit(visibleOptions[activeIndex].value);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(visibleOptions.length - 1);
    }
  };

  const displayValue = typing ? query : selected?.label ?? "";
  const showMinHint = searchable && typing && q.length > 0 && q.length < searchMinLength;
  const showEmpty = open && searchable && typing && q.length >= searchMinLength && visibleOptions.length === 0;

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

        {searchable ? (
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            autoComplete="off"
            value={displayValue}
            placeholder={typing || focused ? `Tapez au moins ${searchMinLength} caractères…` : placeholder}
            onFocus={() => {
              setFocused(true);
              setTyping(true);
              setOpen(true);
              setQuery(selected?.label && !query ? "" : query);
            }}
            onClick={() => {
              setTyping(true);
              setOpen(true);
            }}
            onChange={(e) => {
              const next = e.target.value;
              setTyping(true);
              setQuery(next);
              setOpen(true);
              setActiveIndex(0);
              // Effacer la sélection si l'utilisateur recommence à saisir
              if (selected && next !== selected.label) {
                if (!isControlled) setInternalValue("");
                if (value) onChange?.({ target: { value: "", name, id: fieldId } });
              }
            }}
            onKeyDown={onSearchKeyDown}
            className={[
              "h-14 w-full rounded-lg border bg-paper-100 px-3.5 pt-5 pr-10 text-left text-sm outline-none transition-[border-color,background-color] duration-300 focus-visible:outline-none",
              open || focused
                ? "border-teal-600/40 bg-white"
                : "border-ink-900/10",
              displayValue ? "text-ink-900" : "text-ink-900/45",
            ].join(" ")}
          />
        ) : (
          <button
            id={fieldId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            onClick={() => {
              setOpen((o) => !o);
              setFocused(true);
              const idx = options.findIndex((opt) => String(opt.value) === String(value));
              setActiveIndex(idx >= 0 ? idx : 0);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!open) setFocused(false);
            }}
            onKeyDown={onTriggerKeyDown}
            className={[
              "flex h-14 w-full items-center rounded-lg border bg-paper-100 px-3.5 pt-5 text-left text-sm outline-none transition-[border-color,background-color] duration-300 focus-visible:outline-none",
              open || focused
                ? "border-teal-600/40 bg-white"
                : "border-ink-900/10",
            ].join(" ")}
          >
            <span className={`truncate pr-8 leading-none ${selected ? "text-ink-900" : "text-ink-900/45"}`}>
              {selected?.label ?? placeholder}
            </span>
          </button>
        )}

        <ChevronDown
          aria-hidden="true"
          className={`pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-900/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />

        <FloatingLabel htmlFor={fieldId} floating={floating}>
          {label}
          {required ? " *" : ""}
        </FloatingLabel>
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
            {showMinHint && (
              <li className="px-3 py-2.5 text-xs text-ink-900/50" role="presentation">
                Saisissez au moins {searchMinLength} caractères pour filtrer…
              </li>
            )}
            {showEmpty && (
              <li className="px-3 py-2.5 text-xs text-ink-900/50" role="presentation">
                Aucun résultat pour « {query} ».
              </li>
            )}
            {!showMinHint &&
              visibleOptions.map((opt, index) => {
                const isSelected = String(opt.value) === String(value);
                const isActive = index === activeIndex;

                return (
                  <li key={`${opt.value}-${index}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      data-index={index}
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commit(opt.value)}
                      className={[
                        "w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                        isActive ? "bg-teal-50" : "bg-transparent",
                        isSelected ? "text-teal-800" : "text-ink-900",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-medium leading-snug">{opt.label}</span>
                      {opt.description && (
                        <span className="mt-0.5 block text-xs leading-relaxed text-ink-900/50">
                          {opt.description}
                        </span>
                      )}
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
