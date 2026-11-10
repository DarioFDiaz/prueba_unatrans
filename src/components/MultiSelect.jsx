import { useEffect, useId, useRef, useState } from "react";

export default function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && options.length > 8) searchRef.current?.focus();
  }, [open, options.length]);

  const query = search.trim().toLowerCase();
  const visible = options.filter((option) => option.toLowerCase().includes(query));
  const summary = selected.length === 0
    ? "Todas"
    : selected.length === 1
      ? selected[0]
      : `${selected.length} seleccionadas`;

  function toggle(option) {
    if (selected.includes(option)) onChange(selected.filter((item) => item !== option));
    else onChange([...selected, option]);
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${summary}`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2.5 text-left text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <span className="truncate">{summary}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lg">
          {options.length > 8 && (
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              aria-label={`Buscar en ${label}`}
              className="w-full border-b border-line px-3 py-2 text-sm outline-none"
            />
          )}
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs text-muted">
            <span>Sin marcas se muestran todas</span>
            {selected.length > 0 && (
              <button
                type="button"
                className="font-semibold text-brand"
                onClick={() => onChange([])}
              >
                Ver todas
              </button>
            )}
          </div>
          <ul id={listId} role="listbox" aria-multiselectable="true" className="max-h-60 overflow-auto py-1">
            {visible.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">Sin coincidencias</li>
            )}
            {visible.map((option) => {
              const checked = selected.includes(option);
              return (
                <li key={option} role="option" aria-selected={checked}>
                  <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-paper">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(option)}
                      className="h-4 w-4 accent-brand"
                    />
                    <span className="truncate">{option}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Chevron({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6.5 8 10.5 12 6.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
