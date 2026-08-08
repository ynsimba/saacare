import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UploadCloud, FileText, X, AlertTriangle } from "lucide-react";
import { EASE } from "../../lib/motion";

const MAX_SIZE_MB = 8;
const ACCEPTED = "application/pdf,image/jpeg,image/png,image/webp";

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Zone de dépôt de fichiers : glisser-déposer ou parcourir.
 * Les fichiers sont conservés en mémoire (objets `File`) et remontés au parent ;
 * l'envoi réel dépend d'un point d'entrée d'upload côté serveur.
 */
export default function FileDrop({
  label,
  hint,
  required = false,
  multiple = true,
  files = [],
  onChange,
  accept = ACCEPTED,
}) {
  const inputRef = useRef(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (list) => {
    const incoming = Array.from(list);
    const tooLarge = incoming.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    const valid = incoming.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024);

    setError(
      tooLarge.length
        ? `${tooLarge.length} fichier${tooLarge.length > 1 ? "s dépassent" : " dépasse"} ${MAX_SIZE_MB} Mo et ${
            tooLarge.length > 1 ? "ont" : "a"
          } été ignoré${tooLarge.length > 1 ? "s" : ""}.`
        : ""
    );

    if (valid.length) onChange(multiple ? [...files, ...valid] : valid.slice(0, 1));
  };

  const removeAt = (index) => {
    onChange(files.filter((_, i) => i !== index));
    setError("");
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-900">
          {label}
          {required && <span className="ml-1 text-teal-700">*</span>}
        </label>
        {!required && <span className="text-xs text-ink-900/40">Facultatif</span>}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`rounded-md border border-dashed transition-colors duration-300 ${
          dragging ? "border-teal-600 bg-teal-50" : "border-ink-900/20 bg-paper-100/60 hover:border-ink-900/35"
        }`}
      >
        <label
          htmlFor={id}
          className="flex cursor-pointer flex-col items-center gap-2 px-4 py-6 text-center"
        >
          <span
            className={`grid size-10 place-items-center rounded-full transition-colors duration-300 ${
              dragging ? "bg-teal-600 text-white" : "bg-white text-ink-900/40"
            }`}
          >
            <UploadCloud className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-ink-900/75">
            Déposez vos fichiers ou <span className="text-teal-700 underline underline-offset-2">parcourez</span>
          </span>
          {hint && <span className="text-xs text-ink-900/50">{hint}</span>}
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-900/35">
            PDF, JPG, PNG · {MAX_SIZE_MB} Mo max
          </span>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-coral-700" role="alert">
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-2 flex flex-col gap-1.5 overflow-hidden"
          >
            {files.map((file, index) => (
              <motion.li
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex items-center gap-2.5 rounded-md border border-ink-900/8 bg-white px-3 py-2"
              >
                <FileText className="size-4 shrink-0 text-teal-700" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink-900">{file.name}</span>
                  <span className="block text-xs text-ink-900/45">{formatSize(file.size)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Retirer ${file.name}`}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-ink-900/40 transition-colors hover:bg-ink-900/6 hover:text-coral-700"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
