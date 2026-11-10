export const FILTER_COLUMNS = [
  { key: "Zona", label: "Zona" },
  { key: "Tipo_Servicio", label: "Tipo de servicio" },
  { key: "Estado", label: "Estado" },
];

export const REQUIRED_COLUMNS = [
  "Zona",
  "Tipo_Servicio",
  "Estado",
  "ID_Operacion",
  "Ingresos_COP",
  "Costos_COP",
  "Margen_COP",
];

const MONEY_COLUMNS = new Set(["Ingresos_COP", "Costos_COP", "Margen_COP"]);

export function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  let normalized = trimmed.replace(/[^\d,.-]/g, "");
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = normalized.split(",");
    normalized = parts.length === 2 && parts[1].length <= 2
      ? `${parts[0].replace(/\./g, "")}.${parts[1]}`
      : normalized.replace(/,/g, "");
  }

  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

export function optionLabel(value) {
  if (value == null || String(value).trim() === "") return "(Sin valor)";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDate(value);
  return String(value).trim();
}

export function formatCop(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatPercent(value) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export function displayValue(value) {
  if (value == null || value === "") return "—";
  if (value instanceof Date && !Number.isNaN(value.getTime())) return formatDate(value);
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(value);
  }
  return String(value);
}

export function formatCell(header, value) {
  if (value == null || value === "") return "—";
  if (MONEY_COLUMNS.has(header)) return formatCop(value);
  return displayValue(value);
}

export function isMoneyColumn(header) {
  return MONEY_COLUMNS.has(header);
}

export function uniqueOptions(rows, column) {
  const values = new Set(rows.map((row) => optionLabel(row[column])));
  return [...values].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base", numeric: true }));
}

export function applyFilters(rows, filters) {
  return rows.filter((row) =>
    FILTER_COLUMNS.every(({ key }) => {
      const selected = filters[key];
      if (!selected?.length) return true;
      return selected.includes(optionLabel(row[key]));
    }),
  );
}

export function estadoShares(rows) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = optionLabel(row.Estado);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const items = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es", { sensitivity: "base" }));

  return withRoundedPercents(items);
}

export function rentabilidadPorZona(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const zona = optionLabel(row.Zona);
    const current = grouped.get(zona) || { zona, margen: 0, operaciones: 0 };
    current.margen += toNumber(row.Margen_COP);
    current.operaciones += 1;
    grouped.set(zona, current);
  });

  const list = [...grouped.values()].sort((a, b) =>
    a.zona.localeCompare(b.zona, "es", { sensitivity: "base", numeric: true }),
  );
  const top = list.reduce((max, item) => Math.max(max, item.margen), Number.NEGATIVE_INFINITY);

  return list.map((item) => ({
    ...item,
    destacada: list.length > 0 && item.margen === top,
  }));
}

export function margenDeOperacion(rows, id) {
  const query = id.trim().toLowerCase();
  if (!query) return { status: "empty" };

  const matches = rows.filter(
    (row) => optionLabel(row.ID_Operacion).toLowerCase() === query,
  );

  if (!matches.length) return { status: "missing" };

  const row = matches[0];
  const ingresos = toNumber(row.Ingresos_COP);
  const costos = toNumber(row.Costos_COP);
  const margen = toNumber(row.Margen_COP);

  return {
    status: "found",
    duplicates: matches.length,
    row,
    ingresos,
    costos,
    margen,
    costoPct: ingresos !== 0 ? (costos / ingresos) * 100 : null,
    margenPct: ingresos !== 0 ? (margen / ingresos) * 100 : null,
  };
}

function formatDate(value) {
  const snapped = snapDateOnly(value);
  if (!snapped.dateOnly) {
    return new Intl.DateTimeFormat("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: snapped.utc ? "UTC" : undefined,
  }).format(snapped.date);
}

function snapDateOnly(value) {
  const local = nearMidnight(value.getHours(), value.getMinutes(), value.getSeconds(), value.getMilliseconds());
  if (local != null) {
    return { dateOnly: true, utc: false, date: new Date(value.getTime() + local) };
  }

  const utc = nearMidnight(value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), value.getUTCMilliseconds());
  if (utc != null) {
    return { dateOnly: true, utc: true, date: new Date(value.getTime() + utc) };
  }

  return { dateOnly: false, utc: false, date: value };
}

function nearMidnight(hours, minutes, seconds, milliseconds) {
  const elapsed = (((hours * 60 + minutes) * 60 + seconds) * 1000) + milliseconds;
  const day = 24 * 60 * 60 * 1000;
  if (elapsed <= 2000) return 0;
  if (day - elapsed <= 2000) return 2000;
  return null;
}

function withRoundedPercents(items, digits = 1) {
  const factor = 10 ** digits;
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (!total) return items.map((item) => ({ ...item, percent: 0 }));

  const scaled = items.map((item) => (item.count / total) * 100 * factor);
  const floors = scaled.map((value) => Math.floor(value));
  let remainder = Math.round(100 * factor) - floors.reduce((sum, value) => sum + value, 0);
  const order = scaled
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let index = 0; index < order.length && remainder > 0; index += 1) {
    floors[order[index].index] += 1;
    remainder -= 1;
  }

  return items.map((item, index) => ({
    ...item,
    percent: floors[index] / factor,
  }));
}
