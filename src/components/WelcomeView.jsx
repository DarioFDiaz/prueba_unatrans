import { useState } from "react";

export default function WelcomeView({ onFile, error, loading }) {
  const [dragging, setDragging] = useState(false);

  function takeFile(file) {
    if (loading || !file) return;
    onFile(file);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10 sm:px-6">
      <section className="rounded-3xl border border-line bg-white p-6 shadow-[0_18px_50px_rgba(27,35,48,0.06)] sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-lg font-semibold text-white">
            A
          </span>
          <p className="text-sm font-medium tracking-wide text-muted">Análisis de operaciones</p>
        </div>

        <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Carga el Excel y revisa cómo van las operaciones
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          La tabla muestra todas las columnas del archivo, en el mismo orden.
          Luego puedes filtrar y ver el estado, la rentabilidad por zona y el margen de una operación.
        </p>

        <ol className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          {[
            ["1", "Carga el archivo"],
            ["2", "Filtra zona, servicio y estado"],
            ["3", "Mira la tabla o los gráficos"],
          ].map(([step, text]) => (
            <li key={step} className="rounded-2xl bg-paper px-4 py-3">
              <span className="font-semibold text-brand">{step}.</span> {text}
            </li>
          ))}
        </ol>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            takeFile(event.dataTransfer.files?.[0]);
          }}
          className={`mt-8 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition ${
            dragging ? "border-brand bg-[#e7f3f2]" : "border-line bg-[#fbfaf7] hover:border-brand"
          } ${loading ? "pointer-events-none opacity-70" : ""}`}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="sr-only"
            disabled={loading}
            onChange={(event) => {
              takeFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
            <UploadIcon />
          </span>
          <span className="mt-4 text-base font-semibold">
            {loading ? "Leyendo el archivo…" : "Arrastra el Excel o haz clic para elegirlo"}
          </span>
          <span className="mt-1 text-sm text-muted">Formatos .xlsx, .xls y .xlsm</span>
        </label>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        )}
      </section>
    </main>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 8.5 12 4.5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
