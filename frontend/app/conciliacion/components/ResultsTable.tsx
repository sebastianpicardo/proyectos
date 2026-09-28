"use client";

import { useState, useMemo } from "react";
import { Search, Filter, FileText, Eye, Download, CheckCircle, AlertCircle } from "lucide-react";

interface Invoice {
  id: string;
  rut: string;
  nombre: string;
  monto: number;
  estado: "conciliada" | "pendiente" | "sin_factura";
  tipo?: "abono" | "cargo";
  fecha?: string;
  folio?: string;
}

interface ConciliationData {
  conciliados: Array<{
    id: string;
    rut: string;
    descripcion: string;
    monto: number;
    tipo?: "abono" | "cargo";
  }>;
  pendientes: Array<{
    id: string;
    rut: string;
    monto: number;
    razonSocial?: string;
  }>;
}

export const ResultsTable = ({ data }: { data?: ConciliationData }) => {
  const [filter, setFilter] = useState<"all" | "conciliada" | "pendiente" | "sin_factura">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Invoice; direction: "asc" | "desc" } | null>(null);

  const defaultInvoices: Invoice[] = [
    { id: "FAC-001", rut: "76.123.456-7", nombre: "Empresa ABC SpA", monto: 12450000, estado: "conciliada", tipo: "abono", fecha: "2024-01-15", folio: "FOL-001" },
    { id: "FAC-002", rut: "76.987.654-3", nombre: "Comercial XYZ Ltda", monto: 8750000, estado: "pendiente", tipo: "abono", fecha: "2024-01-14", folio: "FOL-002" },
    { id: "FAC-003", rut: "76.555.444-1", nombre: "Servicios Global SA", monto: 6200000, estado: "conciliada", tipo: "abono", fecha: "2024-01-13", folio: "FOL-003" },
    { id: "FAC-004", rut: "76.333.222-9", nombre: "Distribuidora Norte", monto: 4100000, estado: "conciliada", tipo: "abono", fecha: "2024-01-12", folio: "FOL-004" },
    { id: "FAC-005", rut: "76.777.888-5", nombre: "Industrial Sur SpA", monto: 3850000, estado: "conciliada", tipo: "abono", fecha: "2024-01-11", folio: "FOL-005" },
    { id: "FAC-006", rut: "76.111.222-3", nombre: "Cliente Tech", monto: 18000000, estado: "pendiente", tipo: "abono", fecha: "2024-01-10", folio: "FOL-006" },
    { id: "FAC-007", rut: "76.444.333-2", nombre: "Cliente Retail", monto: 9500000, estado: "pendiente", tipo: "abono", fecha: "2024-01-09", folio: "FOL-007" },
    { id: "FAC-008", rut: "76.999.888-7", nombre: "Constructora Andina", monto: 5400000, estado: "pendiente", tipo: "abono", fecha: "2024-01-08", folio: "FOL-008" },
    { id: "FAC-009", rut: "76.666.555-4", nombre: "Logística Central", monto: 3350000, estado: "pendiente", tipo: "abono", fecha: "2024-01-07", folio: "FOL-009" },
    { id: "FAC-010", rut: "76.888.999-6", nombre: "Exportadora del Sur", monto: 2100000, estado: "sin_factura", tipo: "cargo", fecha: "2024-01-06", folio: "FOL-010" },
  ];

  const invoices: Invoice[] = useMemo(() => {
    if (data?.conciliados?.length) {
      return [
        ...(data?.conciliados?.map((c) => ({
          id: c.id || `CONC-${c.rut}`,
          rut: c.rut,
          nombre: c.descripcion || "Cliente",
          monto: c.monto,
          estado: "conciliada" as const,
          tipo: c.tipo,
          fecha: new Date().toISOString().split("T")[0],
        })) || []),
        ...(data?.pendientes?.map((p) => ({
          id: p.id || `PEND-${p.rut}`,
          rut: p.rut,
          nombre: p.razonSocial || "Sin conciliar",
          monto: p.monto,
          estado: "pendiente" as const,
          tipo: "abono" as const,
          fecha: new Date().toISOString().split("T")[0],
        })) || [])
      ];
    }
    return defaultInvoices;
  }, [data]);

  const formattedMonto = (monto: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(monto);

  const filteredData = useMemo(() => {
    return invoices.filter((item) => {
      if (filter !== "all" && item.estado !== filter) return false;
      if (
        searchTerm &&
        !item.rut.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [invoices, filter, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key: keyof Invoice) => {
    setSortConfig((current) => {
      if (current?.key === key && current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getEstadoStyles = (estado: Invoice["estado"]) => {
    switch (estado) {
      case "conciliada":
        return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Conciliada", icon: <CheckCircle className="w-3 h-3" /> };
      case "pendiente":
        return { bg: "bg-amber-100", text: "text-amber-700", label: "Pendiente", icon: <AlertCircle className="w-3 h-3" /> };
      case "sin_factura":
        return { bg: "bg-rose-100", text: "text-rose-700", label: "Sin Factura", icon: <FileText className="w-3 h-3" /> };
    }
  };

  const getTipoLabel = (tipo?: "abono" | "cargo") => {
    if (!tipo) return null;
    return tipo === "cargo" 
      ? { label: "Cargo", color: "bg-rose-100 text-rose-700" }
      : { label: "Abono", color: "bg-emerald-100 text-emerald-700" };
  };

  // Summary counts
  const counts = useMemo(() => ({
    all: invoices.length,
    conciliada: invoices.filter(i => i.estado === "conciliada").length,
    pendiente: invoices.filter(i => i.estado === "pendiente").length,
    sin_factura: invoices.filter(i => i.estado === "sin_factura").length,
  }), [invoices]);

  // Filter options defined outside JSX
  const filterOptions = [
    { value: "all" as const, label: "Todas", count: counts.all, color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
    { value: "conciliada" as const, label: "Conciliadas", count: counts.conciliada, color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
    { value: "pendiente" as const, label: "Pendientes", count: counts.pendiente, color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
    { value: "sin_factura" as const, label: "Sin Factura", count: counts.sin_factura, color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Table Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Resultados de Conciliación</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {sortedData.length} de {invoices.length} registros
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por RUT, nombre, folio o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              aria-label="Buscar facturas"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${filter === f.value ? f.color.replace("hover:", "") + " shadow-sm" : f.color}`}
                aria-pressed={filter === f.value}
              >
                {f.label}
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/50">
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-200">
                {[
                  { key: "id", label: "Concepto", icon: <FileText className="w-3.5 h-3.5" /> },
                  { key: "rut", label: "RUT", icon: null },
                  { key: "nombre", label: "Cliente / Descripción", icon: null },
                  { key: "monto", label: "Monto CLP", icon: null },
                  { key: "estado", label: "Estado", icon: null },
                  { key: "tipo", label: "Tipo", icon: null },
                  { key: "fecha", label: "Fecha", icon: null },
                  { key: "actions", label: "Acciones", icon: null },
                ].map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => col.key !== "actions" && handleSort(col.key as keyof Invoice)}
                    style={{ userSelect: "none" }}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.icon && <span className="text-slate-400">{col.icon}</span>}
                      {col.label}
                      {sortConfig?.key === col.key && (
                        <span className="text-indigo-600">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <Filter className="w-10 h-10 text-slate-300" aria-hidden="true" />
                      <p className="font-medium text-slate-600">No se encontraron resultados</p>
                      <p className="text-sm">Intenta cambiar los filtros o la búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => {
                  const estadoStyles = getEstadoStyles(item.estado);
                  const tipoInfo = getTipoLabel(item.tipo);
                  
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {item.id.split("-").pop()}
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">{item.id}</span>
                            {tipoInfo && (
                              <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${tipoInfo.color}`}>
                                {tipoInfo.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">
                        {item.rut}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 truncate max-w-[200px]">{item.nombre}</p>
                        {item.folio && (
                          <p className="text-xs text-slate-400">Folio: {item.folio}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 tabular-nums">
                        {formattedMonto(item.monto)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estadoStyles.bg} ${estadoStyles.text}`}>
                          {estadoStyles.icon}
                          {estadoStyles.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.tipo && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            item.tipo === "cargo" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {item.tipo === "cargo" ? "Cargo" : "Abono"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                        {item.fecha}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label={`Ver detalle de ${item.id}`}
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            aria-label={`Descargar ${item.id}`}
                          >
                            <Download className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Mostrando <span className="font-medium text-slate-900">{sortedData.length}</span> de <span className="font-medium text-slate-900">{invoices.length}</span> resultados
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}