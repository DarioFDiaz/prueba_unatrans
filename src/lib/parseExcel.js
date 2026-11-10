export async function readExcelFile(file) {
  const buffer = await file.arrayBuffer();
  return parseExcelArrayBuffer(buffer);
}

export async function parseExcelArrayBuffer(buffer) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  if (!workbook.SheetNames.length) {
    throw new Error("El archivo no tiene hojas.");
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  if (!matrix.length || matrix[0].every((cell) => cell == null || cell === "")) {
    throw new Error("La primera hoja no tiene encabezados.");
  }

  const headers = uniqueHeaders(matrix[0]);
  const rows = [];

  for (let index = 1; index < matrix.length; index += 1) {
    const source = matrix[index] || [];
    const hasValue = headers.some((_, column) => {
      const value = source[column];
      return value != null && value !== "";
    });
    if (!hasValue) continue;

    const row = { __row: index + 1 };
    headers.forEach((header, column) => {
      row[header] = source[column] ?? null;
    });
    rows.push(row);
  }

  return {
    sheetName,
    sheetCount: workbook.SheetNames.length,
    headers,
    rows,
  };
}

export function missingRequired(headers, required) {
  return required.filter((column) => !headers.includes(column));
}

function uniqueHeaders(raw) {
  const seen = new Map();
  return (raw || []).map((cell, index) => {
    const base = cell == null || String(cell).trim() === ""
      ? `Columna_${index + 1}`
      : String(cell).trim();
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}
