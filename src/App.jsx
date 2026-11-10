import { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import WelcomeView from "./components/WelcomeView.jsx";
import { REQUIRED_COLUMNS } from "./lib/metrics.js";
import { missingRequired, readExcelFile } from "./lib/parseExcel.js";

const EXCEL_EXTENSION = /\.(xlsx|xls|xlsm)$/i;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export default function App() {
  const [dataset, setDataset] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFile(file) {
    if (!file) return;

    if (!EXCEL_EXTENSION.test(file.name)) {
      setError("Sube un archivo Excel (.xlsx, .xls o .xlsm).");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError("El archivo supera 20 MB. Prueba con un Excel más liviano.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const parsed = await readExcelFile(file);
      const missing = missingRequired(parsed.headers, REQUIRED_COLUMNS);
      if (missing.length) {
        setError(`Faltan columnas obligatorias: ${missing.join(", ")}.`);
        return;
      }
      if (!parsed.rows.length) {
        setError("El archivo tiene encabezados, pero ninguna fila con datos.");
        return;
      }
      setDataset({ ...parsed, fileName: file.name });
    } catch (readError) {
      console.error(readError);
      setError("No se pudo leer ese archivo. Comprueba que sea un Excel válido.");
    } finally {
      setLoading(false);
    }
  }

  if (!dataset) {
    return <WelcomeView onFile={handleFile} error={error} loading={loading} />;
  }

  return (
    <Dashboard
      dataset={dataset}
      onReset={() => {
        setDataset(null);
        setError("");
      }}
    />
  );
}
