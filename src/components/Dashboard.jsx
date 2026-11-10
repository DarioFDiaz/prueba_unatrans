import { useMemo, useState } from "react";
import ChartsPanel from "./ChartsPanel.jsx";
import DataTable from "./DataTable.jsx";
import MultiSelect from "./MultiSelect.jsx";
import { FILTER_COLUMNS, applyFilters, uniqueOptions } from "../lib/metrics.js";

const EMPTY_FILTERS = { Zona: [], Tipo_Servicio: [], Estado: [] };

export default function Dashboard({ dataset, onReset }) {
  const [view, setView] = useState("tabla");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const options = useMemo(() => ({
    Zona: uniqueOptions(dataset.rows, "Zona"),
    Tipo_Servicio: uniqueOptions(dataset.rows, "Tipo_Servicio"),
    Estado: uniqueOptions(dataset.rows, "Estado"),
  }), [dataset.rows]);

  const filtered = useMemo(
    () => applyFilters(dataset.rows, filters),
    [dataset.rows, filters],
  );

  const chips = FILTER_COLUMNS.flatMap(({ key, label }) =>
    filters[key].map((value) => ({ key, label, value })),
  );

  function removeChip(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== value),
    }));
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand">Análisis de operaciones</p>
            <h1 className="truncate text-xl font-semibold">{dataset.fileName}</h1>
            <p className="text-sm text-muted">
              Hoja {dataset.sheetName}
              {dataset.sheetCount > 1 ? " · se cargó solo la primera hoja" : ""}
              {" · "}
              {dataset.headers.length} columnas
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Cargar otro archivo
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            {FILTER_COLUMNS.map(({ key, label }) => (
              <MultiSelect
                key={key}
                label={label}
                options={options[key]}
                selected={filters[key]}
                onChange={(values) => setFilters((current) => ({ ...current, [key]: values }))}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted" aria-live="polite">
              {filtered.length === dataset.rows.length
                ? `${dataset.rows.length} operaciones`
                : `${filtered.length} de ${dataset.rows.length} operaciones`}
            </p>
            {chips.length > 0 && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-sm font-semibold text-brand"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={`${chip.key}-${chip.value}`}>
                  <button
                    type="button"
                    onClick={() => removeChip(chip.key, chip.value)}
                    className="rounded-full bg-paper px-3 py-1 text-sm hover:bg-[#e7f3f2]"
                  >
                    {chip.label}: {chip.value}
                    <span className="ml-2 text-muted" aria-hidden="true">×</span>
                    <span className="sr-only">Quitar filtro</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <nav className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white p-1 shadow-sm sm:flex sm:w-fit" aria-label="Vistas">
          {[
            ["tabla", "Tabla"],
            ["graficos", "Gráficos"],
          ].map(([id, label]) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setView(id)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  active ? "bg-brand text-white" : "text-ink hover:bg-paper"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 min-w-0">
          {view === "tabla" ? (
            <DataTable headers={dataset.headers} rows={filtered} />
          ) : (
            <ChartsPanel rows={filtered} />
          )}
        </div>
      </main>
    </div>
  );
}
