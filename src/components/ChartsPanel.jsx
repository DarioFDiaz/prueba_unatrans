import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  estadoShares,
  formatCop,
  formatPercent,
  margenDeOperacion,
  optionLabel,
  rentabilidadPorZona,
} from "../lib/metrics.js";

const CHARTS = [
  { id: "estado", label: "Porcentaje por estado" },
  { id: "zona", label: "Rentabilidad por zona" },
  { id: "margen", label: "Porcentaje de margen" },
];

const COLORS = ["#0f6e6b", "#df6d38", "#1f4e79", "#c4a35a", "#6b4c7a", "#3d8b6e", "#c45252", "#4c6b8a", "#8a6a3d", "#2f6f8f"];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e5d9cb",
  boxShadow: "none",
  fontSize: 13,
};

export default function ChartsPanel({ rows }) {
  const [chart, setChart] = useState("estado");

  return (
    <section className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CHARTS.map((item) => {
          const active = chart === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setChart(item.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                active ? "bg-brand text-white" : "bg-paper text-ink hover:bg-[#e7f3f2]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {chart === "estado" && <EstadoChart rows={rows} />}
        {chart === "zona" && <ZonaChart rows={rows} />}
        {chart === "margen" && <MargenChart rows={rows} />}
      </div>
    </section>
  );
}

function EstadoChart({ rows }) {
  const data = useMemo(() => estadoShares(rows), [rows]);

  return (
    <div>
      <h2 className="text-lg font-semibold">Porcentaje por estado</h2>
      <p className="mt-1 text-sm text-muted">
        Parte de las {rows.length} operaciones filtradas que está en cada estado.
      </p>
      {rows.length === 0 ? (
        <EmptyChart />
      ) : (
        <div className="mt-4 grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
          <div className="h-72 min-w-0 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={data.length > 1 ? 2 : 0}
                  isAnimationActive={motionAllowed()}
                >
                  {data.map((item, index) => (
                    <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, item) => [
                    `${formatPercent(item.payload.percent)} · ${value} operaciones`,
                    name,
                  ]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid gap-2">
            {data.map((item, index) => (
              <li key={item.name} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="shrink-0 tabular-nums font-medium">
                  {formatPercent(item.percent)}
                  <span className="ml-2 font-normal text-muted">{item.count}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ZonaChart({ rows }) {
  const data = useMemo(() => rentabilidadPorZona(rows), [rows]);
  const total = data.reduce((sum, item) => sum + item.margen, 0);
  const lideres = data.filter((item) => item.destacada);
  const liderTexto = lideres.length === 1
    ? ` La más alta es ${lideres[0].zona}, con ${formatCop(lideres[0].margen)}.`
    : lideres.length > 1
      ? ` ${lideres.map((item) => item.zona).join(", ")} comparten el margen más alto: ${formatCop(lideres[0].margen)}.`
      : "";

  return (
    <div>
      <h2 className="text-lg font-semibold">Rentabilidad por zona</h2>
      <p className="mt-1 text-sm text-muted">
        Suma de Margen_COP por zona, en orden alfabético.{liderTexto}
      </p>
      {rows.length === 0 ? (
        <EmptyChart />
      ) : (
        <>
          <p className="mt-3 text-sm">
            Margen filtrado: <strong className="tabular-nums">{formatCop(total)}</strong>
          </p>
          <div className="mt-4 min-w-0" style={{ height: Math.max(180, data.length * 48 + 24) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid horizontal={false} stroke="#e5d9cb" />
                <XAxis
                  type="number"
                  tickFormatter={formatAxis}
                  tick={{ fill: "#5d6b7c", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="zona"
                  width={128}
                  tickFormatter={shortLabel}
                  tick={{ fill: "#1b2330", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div style={tooltipStyle} className="bg-white px-3 py-2">
                        <p className="font-medium">{item.zona}</p>
                        <p className="tabular-nums">{formatCop(item.margen)}</p>
                        <p className="text-muted">{item.operaciones} operaciones</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="margen" radius={[0, 8, 8, 0]} isAnimationActive={motionAllowed()}>
                  {data.map((item) => (
                    <Cell
                      key={item.zona}
                      fill={item.destacada ? "#df6d38" : item.margen < 0 ? "#c45252" : "#0f6e6b"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="py-2 font-medium">Zona</th>
                  <th className="py-2 text-right font-medium">Operaciones</th>
                  <th className="py-2 text-right font-medium">Margen_COP</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.zona} className={item.destacada ? "bg-[#fff4ee] font-medium" : undefined}>
                    <td className="rounded-l-lg px-2 py-2">{item.zona}</td>
                    <td className="px-2 py-2 text-right tabular-nums">{item.operaciones}</td>
                    <td className={`rounded-r-lg px-2 py-2 text-right tabular-nums ${item.margen < 0 ? "text-rose-700" : ""}`}>
                      {formatCop(item.margen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function MargenChart({ rows }) {
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const result = useMemo(() => margenDeOperacion(rows, query), [rows, query]);
  const canChart = result.status === "found"
    && result.costoPct != null
    && result.margenPct != null
    && result.costos >= 0
    && result.margen >= 0
    && result.costos + result.margen > 0;

  return (
    <div>
      <h2 className="text-lg font-semibold">Porcentaje de margen</h2>
      <p className="mt-1 text-sm text-muted">
        Busca un ID_Operacion dentro de los datos filtrados. El costo y el margen se calculan sobre Ingresos_COP.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(draft.trim());
        }}
      >
        <label className="sr-only" htmlFor="operation-id">ID de la operación</label>
        <input
          id="operation-id"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escribe el ID de la operación"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </form>

      <div className="mt-5">
        {result.status === "empty" && (
          <p className="rounded-2xl bg-paper px-4 py-8 text-center text-sm text-muted">
            Escribe un ID y pulsa Buscar para ver esa operación.
          </p>
        )}
        {result.status === "missing" && (
          <p role="status" className="rounded-2xl bg-amber-50 px-4 py-8 text-center text-sm text-amber-900">
            No hay una operación con el ID «{query}» en los datos filtrados.
          </p>
        )}
        {result.status === "found" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              {result.duplicates > 1 && (
                <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Hay {result.duplicates} operaciones con este ID. Se muestra la primera.
                </p>
              )}
              <p className="text-sm text-muted">Fila {result.row.__row} del Excel</p>
              <h3 className="mt-1 text-2xl font-semibold">{optionLabel(result.row.ID_Operacion)}</h3>
              <p className="mt-1 text-sm text-muted">
                {optionLabel(result.row.Zona)} · {optionLabel(result.row.Tipo_Servicio)} · {optionLabel(result.row.Estado)}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <Metric label="Ingresos_COP" value={formatCop(result.ingresos)} detail="Total del ingreso" />
                <Metric label="Costos_COP" value={formatCop(result.costos)} detail={formatPercent(result.costoPct)} />
                <Metric label="Margen_COP" value={formatCop(result.margen)} detail={formatPercent(result.margenPct)} />
              </div>
              {result.ingresos === 0 && (
                <p className="mt-3 text-sm text-muted">Esta operación no tiene ingresos, así que no hay porcentaje que calcular.</p>
              )}
              {result.ingresos !== 0 && result.margen < 0 && (
                <p className="mt-3 text-sm text-rose-700">El margen es negativo: el costo supera el ingreso.</p>
              )}
            </div>
            {canChart ? (
              <div className="h-72 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Costo", value: result.costos, percent: result.costoPct },
                        { name: "Margen", value: result.margen, percent: result.margenPct },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={2}
                      isAnimationActive={motionAllowed()}
                    >
                      <Cell fill="#1f4e79" />
                      <Cell fill="#0f6e6b" />
                    </Pie>
                    <Tooltip
                      formatter={(value, name, item) => [
                        `${formatCop(value)} · ${formatPercent(item.payload.percent)} del ingreso`,
                        name,
                      ]}
                      contentStyle={tooltipStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[#1f4e79]" /> Costo</span>
                  <span className="inline-flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-brand" /> Margen</span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums">{value}</p>
      <p className="text-sm tabular-nums text-muted">{detail}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <p className="mt-4 rounded-2xl bg-paper px-4 py-12 text-center text-sm text-muted">
      No hay operaciones con los filtros actuales.
    </p>
  );
}

function formatAxis(value) {
  return new Intl.NumberFormat("es-CO", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shortLabel(value) {
  const text = String(value);
  return text.length > 16 ? `${text.slice(0, 15)}…` : text;
}

function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
