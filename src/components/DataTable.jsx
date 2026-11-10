import { formatCell, isMoneyColumn, toNumber } from "../lib/metrics.js";

export default function DataTable({ headers, rows }) {
  if (!rows.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-white px-4 py-12 text-center text-sm text-muted">
        Ninguna operación coincide con los filtros.
      </p>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <caption className="sr-only">Operaciones cargadas desde el Excel, en el orden original</caption>
          <thead className="sticky top-0 z-10 bg-ink text-white">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-3 font-medium ${alignClass(header)}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.__row} className="odd:bg-white even:bg-[#fbf8f3] hover:bg-[#e7f3f2]">
                {headers.map((header) => (
                  <td
                    key={header}
                    className={`whitespace-nowrap px-3 py-2.5 ${cellClass(header, row[header])}`}
                  >
                    {formatCell(header, row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function alignClass(header) {
  return isMoneyColumn(header) ? "text-right" : "text-left";
}

function cellClass(header, value) {
  if (header === "Margen_COP") {
    const amount = toNumber(value);
    if (amount > 0) return "text-right font-medium tabular-nums text-emerald-700";
    if (amount < 0) return "text-right font-medium tabular-nums text-rose-700";
    return "text-right tabular-nums";
  }
  if (isMoneyColumn(header) || typeof value === "number") return "text-right tabular-nums";
  return "text-left";
}
