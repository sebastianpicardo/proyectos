"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

type CartolaRow = {
  fecha: string;
  descripcion: string;
  rut: string;
  monto: number;
  tipo: "abono" | "cargo";
};

type FacturaSIIRow = {
  folio: string;
  rutEmisor: string;
  rutReceptor: string;
  razonSocial: string;
  montoTotal: number;
  estado: "emitida" | "pendiente" | "conciliada";
};

type UploadState = {
  cartola: File | null;
  facturas: File | null;
  loading: boolean;
  bankFormat: string;
};

const extractRUT = (rutString: string): string => {
  const cleaned = rutString.replace(/[^0-9kK]/g, "").toUpperCase();
  return cleaned;
};

const parseChileanAmount = (value: string): number => {
  const cleaned = value
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/^$/, "0");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const parseCSV = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      if (lines.length < 2) {
        reject(new Error("El archivo CSV está vacío o tiene solo una fila (cabecera)."));
        return;
      }

      const headerLine = lines[0].toLowerCase();
      const separator = headerLine.includes(";") ? ";" : ",";
      const headers = headerLine.split(separator);

      const rows: any = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(separator);
        const row: any = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j].trim()] = cells[j]?.trim ?? "";
        }
        rows.push(row);
      }

      resolve({ headers, rows, separator });
    };

reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(new Error("Error al leer el archivo."));
      };

    reader.readAsText(file, "UTF-8");
  });
};

export const Dropzone = ({
  onUploadSuccess,
  onError,
}: {
  onUploadSuccess?: (data: {
    totalFacturado: number;
    totalPagado: number;
    totalPendiente: number;
    conciliados: any[];
    pendientes: any[];
  }) => void;
  onError?: (error: Error) => void;
}) => {
  const [cartola, setCartola] = useState<File | null>(null);
  const [facturas, setFacturas] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");

  const CHILEAN_BANKS = [
    { name: "Banco de Chile", code: "CHD" },
    { name: "Santander", code: "BSANT" },
    { name: "BCI", code: "BCI" },
    { name: "Estado", code: "ESTADO" },
    { name: "Scotiabank", code: "SCOTI" },
    { name: "Itaú", code: "ITAU" }
  ];

  const handleCartolaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCartola(file);
    if (file) {
      parseCSV(file).then(({ headers, rows }) => {
        console.log("Cartola CSV headers:", headers);
        console.log("Cartola CSV rows:", rows.length, "filas");
      }).catch((err) => {
        toast.error("Error al parsear cartola", { description: err.message });
      });
    }
  };

  const handleFacturasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFacturas(file);
    if (file) {
      parseCSV(file).then(({ headers, rows }) => {
        console.log("Facturas SII CSV headers:", headers);
        console.log("Facturas SII CSV rows:", rows.length, "filas");
      }).catch((err) => {
        toast.error("Error al parsear facturas SII", { description: err.message });
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent, type: "cartola" | "facturas") => {
    e.preventDefault();
    e.stopPropagation();

    const zone = e.currentTarget?.closest?.("[data-zone]") || e.currentTarget?.parentElement;
    if (zone) {
      zone.classList.remove("bg-primary/10", "border-primary/40");
      zone.classList.add("border-border", "bg-primary/50");
    }

    const files = (e.target as HTMLInputElement).files || (e as React.DragEvent).dataTransfer?.files;
    if (files && files.length > 0) {
      if (type === "cartola") {
        setCartola(files[0]);
      } else {
        setFacturas(files[0]);
      }

      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        toast.info("Archivo cargado", { description: `${file.name} - ${file.size} bytes` });
      };

      reader.onerror = (event: ProgressEvent<FileReader>) => {
        toast.error("Error al leer archivo", { description: event.target?.error?.message || "Error desconocido" });
      };

      reader.readAsText(file, "UTF-8");
    }
  };

  const processInMemory = async () => {
    if (!cartola && !facturas) return;

    setLoading(true);

    try {
      const cartolaData: CartolaRow[] = [];
      const facturasData: FacturaSIIRow[] = [];

      if (cartola) {
        await parseCSV(cartola).then(({ rows }) => {
          rows.forEach((row: any) => {
            const monto = parseChileanAmount(row.Monto || row.monto || row.montos || "0");
            cartolaData.push({
              fecha: row.Fecha || row.fecha || "",
              descripcion: row.Descripcion || row.descripcion || "Sin descripción",
              rut: extractRUT(row.RUT || row.rut || ""),
              monto,
              tipo: (row.Tipo || row.tipo || "abono").toLowerCase() === "cargo" ? "cargo" : "abono",
            });
          });
        });
      }

      if (facturas) {
        await parseCSV(facturas).then(({ rows }) => {
          rows.forEach((row: any) => {
            const monto = parseChileanAmount(row.MontoTotal || row.monto_total || row.monto || "0");
            facturasData.push({
              folio: row.Folio || row.folio || "",
              rutEmisor: extractRUT(row["RUT Emisor"] || row.rut_emisor || ""),
              rutReceptor: extractRUT(row["RUT Receptor"] || row.rut_receptor || ""),
              razonSocial: row.RazonSocial || row.razon_social || row.razonSocial || "Sin razón social",
              montoTotal: monto,
              estado: (row.Estado || row.estado || "pendiente").toLowerCase() as any,
            });
          });
        });
      }

      // Calculate metrics
      const totalFacturado = facturasData.reduce((sum, f) => sum + f.montoTotal, 0);
      const totalPagado = cartolaData.reduce((sum, c) => sum + Math.abs(c.monto), 0);
      const totalPendiente = totalFacturado - totalPagado;

      // Simple matching: RUT + Monto exacto
      const conciliados = cartolaData.filter((c) =>
        facturasData.some(
          (f) => f.rutEmisor === c.rut || f.rutReceptor === c.rut && Math.abs(f.montoTotal - c.monto) < 1
        )
      );

      const pendientes = facturasData.filter(
        (f) => !conciliados.some((c) => c.rut === (f.rutEmisor || f.rutReceptor))
      );

      onUploadSuccess?.({
        totalFacturado,
        totalPagado,
        totalPendiente,
        conciliados,
        pendientes,
      });

      toast.success("Conciliación completada", {
        description: `Total Facturado: $${totalFacturado.toLocaleString("es-CL")} | Pagado: $${totalPagado.toLocaleString("es-CL")} | Pendiente: $${totalPendiente.toLocaleString("es-CL")}`,
      });
    } catch (err) {
      onError?.(err as Error);
      toast.error("Error en la conciliación", {
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    processInMemory();
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Cartola Bancaria */}
      <div
        className="group relative rounded-2xl border-2 border-border/50 hover:border-primary/40 bg-card/50 transition-all duration-300 cursor-pointer select-none [&_input]:hidden"
        data-zone
      >
        <input
          type="file"
          id="cartolaInput"
          accept=".csv,.xlsx,.xls"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          onChange={(e) => handleCartolaChange(e)}
        />
        <div
          className="min-h-[220px] flex flex-col items-center justify-center py-8 border-2 border-border/50 rounded-2xl flex-shrink-0 transition-all duration-300 group-border-border/50 group-hover:border-primary/40 group-bg-primary/50 cursor-pointer select-none"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.remove("border-border", "bg-primary/50");
            zone.classList.add("bg-primary/10", "border-primary/40");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
            handleFileDrop(e, "cartola");
          }}
        >
          <svg className="w-8 h-8 mb-3 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0v4h16v-4H4zm0 0v4h12v-2h4v-4h-4v-2h-12zm0 0v4h16v-4H4z"/>
          </svg>
          <h3 className="text-lg font-medium mb-1">Cartola Bancaria</h3>
          <p className="text-sm text-muted/60">CSV/Excel Banco de Chile, Santander, BCI, Estado, Scotiabank, Itaú</p>
          <p className="text-xs mt-1 text-muted/50">Arrastra y suelta aquí o haz clic para seleccionar</p>
        </div>
        {cartola && (
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L12 4l-8 8" />
            </svg>
            <span>Archivo seleccionado: {cartola.name}</span>
          </div>
        )}
        {selectedBank && (
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="mt-2 block w-full rounded border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-sm dark:text-gray-200"
          >
            <option value="">Seleccionar banco</option>
            {CHILEAN_BANKS.map((bank) => (
              <option key={bank.code} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        )}
        {loading && (
          <div className="mt-3 flex items-center justify-center pt-2">
            <svg className="w-5 h-5 mr-2 text-primary animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="ml-2 text-sm text-primary">Procesando conciliación...</span>
          </div>
        )}
      </div>

      {/* Registro de Ventas / Facturas SII */}
      <div
        className="group relative rounded-2xl border-2 border-border/50 hover:border-primary/40 bg-card/50 transition-all duration-300 cursor-pointer select-none [&_input]:hidden"
        data-zone
      >
        <input
          type="file"
          id="facturasInput"
          accept=".csv,.xlsx,.xls"
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
          onChange={(e) => handleFacturasChange(e)}
        />
        <div
          className="min-h-[220px] flex flex-col items-center justify-center py-8 border-2 border-border/50 rounded-2xl flex-shrink-0 transition-all duration-300 group-border-border/50 group-hover:border-primary/40 group-bg-primary/50 cursor-pointer select-none"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.remove("border-border", "bg-primary/50");
            zone.classList.add("bg-primary/10", "border-primary/40");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
            handleFileDrop(e, "facturas");
          }}
        >
          <svg className="w-8 h-8 mb-3 text-primary/60 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0v4h16v-4H4zm0 0v4h12v-2h4v-4h-4v-2h-12zm0 0v4h16v-4H4z"/>
          </svg>
          <h3 className="text-lg font-medium mb-1">Facturas / Ventas SII</h3>
          <p className="text-sm text-muted/60">CSV/Excel Registro de Ventas SII</p>
          <p className="text-xs mt-1 text-muted/50">Arrastra y suelta aquí o haz clic para seleccionar</p>
        </div>
        {facturas && (
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L12 4l-8 8" />
            </svg>
            <span>Archivo seleccionado: {facturas.name}</span>
          </div>
        )}
        {loading && (
          <div className="mt-3 flex items-center justify-center pt-2">
            <svg className="w-5 h-5 mr-2 text-primary animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="ml-2 text-sm text-primary">Procesando conciliación...</span>
          </div>
        )}
      </div>
    </div>
  );
};