"use client";

import { useState } from "react";

type Invoice = {
  id: string;
  rut: string;
  nombre: string;
  monto: number;
  estado: "conciliada" | "pendiente" | "sin_factura";
  tipo?: "abono" | "cargo";
};

type ConciliationResult = {
  totalFacturado: number;
  totalPagado: number;
  totalPendiente: number;
  conciliados: Invoice[];
  pendientes: Invoice[];
};

export const ResultsTable = ({ result }: { result?: ConciliationResult }) => {
  const [filter, setFilter] = useState<"all" | "conciliada" | "pendiente" | "sin_factura">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const invoices: Invoice[] = result?.conciliados?.length
    ? [
        ...result?.conciliados?.map((c, i) => ({
          id: c.id || `CONC-${i + 1}`,
          rut: c.rut,
          nombre: c.descripcion || "Cliente",
          monto: c.monto,
          estado: "conciliada",
          tipo: c.tipo,
        })) || [],
        ...result?.pendientes?.map((p, i) => ({
          id: p.id || `PEND-${i + 1}`,
          rut: p.rut,
          nombre: "Sin conciliar",
          monto: p.montoTotal,
          estado: "pendiente",
        }) || [])
      ]
    : [
        { id: "FAC-001", rut: "76.123.456-7", nombre: "Cliente Automatico", monto: 50000, estado: "conciliada" },
        { id: "FAC-002", rut: "76.987.654-3", nombre: "Cliente Manuel", monto: 32000, estado: "pendiente" },
        { id: "FAC-003", rut: "76.555.777-8", nombre: "Cliente Automático", monto: 75000, estado: "conciliada" },
        { id: "FAC-004", rut: "76.444.333-2", nombre: "Cliente Sofía", monto: 18000, estado: "sin_factura" },
        { id: "FAC-005", rut: "76.111.222-3", nombre: "Cliente Tech", monto: 42000, estado: "pendiente" },
        { id: "FAC-006", rut: "76.333.444-5", nombre: "Cliente Retail", monto: 95000, estado: "conciliada" },
      ];

  const formattedMonto = (monto: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(monto);

  const filteredData = invoices.filter((item) => {
    if (filter !== "all" && item.estado !== filter) return false;
    if (searchTerm && !item.rut.toLowerCase().includes(searchTerm.toLowerCase()) && !item.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rounded-2xl border bg-card backdrop-blur-sm p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm-items-center mb-4">
        <h3 className="text-xl font-bold tracking-tight">Resultados de Conciliación</h3>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded text-xs font-medium bg-primary/5 text-primary hover:bg-primary/10 transition-colors" data-filter="all">Todas</button>
          <button className="px-3 py-1 rounded text-xs font-medium bg-success/5 text-success hover:bg-success/10 transition-colors" data-filter="conciliada">Conciliadas</button>
          <button className="px-3 py-1 rounded text-xs font-medium bg-warning/5 text-warning hover:bg-warning/10 transition-colors" data-filter="pendiente">Pendientes</button>
          <button className="px-3 py-1 rounded text-xs font-medium bg-error/5 text-error hover:bg-error/10 transition-colors" data-filter="sin_factura">Sin Factura</button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-sm font-medium text-muted/60 px-6 py-3">Concepto</th>
              <th className="text-left text-sm font-medium text-muted/60 px-6 py-3">Monto CLP</th>
              <th className="text-left text-sm font-medium text-muted/60 px-6 py-3">Estado</th>
              <th className="text-left text-sm font-medium text-muted/60 px-6 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => {
              const estadoClass = item.estado === "conciliada"
                ? "bg-success/10 text-success"
                : item.estado === "pendiente"
                ? "bg-warning/10 text-warning"
                : "bg-error/10 text-error";
              const estadoText = item.estado === "conciliada"
                ? "Conciliada"
                : item.estado === "pendiente"
                ? "Pendiente"
                : "Sin Factura";
              const tipoLabel = item.tipo === "cargo" ? "Cargo" : item.tipo === "abono" ? "Abono" : "";
              return (
                <tr key={item.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                  <td className="text-left text-sm font-medium px-6 py-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13c0 2 2 2 2 2h14a2 2 0 002-2v-7m-5-3l-3.138 5.326L16.07 21.375c.538.434.21.927-.262 1.073l-4.893-.696L5.37 21.85c-.429.53-.972.225-1.03-.262l-1.158-4.983L.829 9.36l4.465-3.536a1.967 1.967 0 01.03-.651zm0 0l3.138-5.326L8.93 9.375c-.538-.434-.21-.927.262-1.073l4.893.696L18.63 1.65c.429-.53.21-.927-.262-1.073L13.97 2.38l-4.465 3.536a1.967 1.967 0 01-.03.651zm0 0l3.138-5.326L8.93 9.375c-.538-.434-.21-.927.262-1.073l4.893.696L18.63 1.65c.429-.53.21-.927-.262-1.073L13.97 2.38l-4.465 3.536a1.967 1.967 0 01-.03.651z"/>
                      </svg>
                      <span>{item.id}</span>
                      {tipoLabel && <span className="text-xs ms-1 bg-primary/20 text-primary rounded px-1 py-0.5">{tipoLabel}</span>}
                    </div>
                  </td>
                  <td className="text-left text-sm font-medium px-6 py-3">{formattedMonto(item.monto)}</td>
                  <td className="text-left text-sm font-medium px-6 py-3">
                    <span className={["px-2", "py-0.5", "rounded", "text-xs", "font-medium", estadoClass].join(" ")}>
                      {estadoText}
                    </span>
                  </td>
                  <td className="text-left text-sm font-medium px-6 py-3">
                    <button className="px-2 py-0.5 rounded text-xs bg-primary/5 text-primary hover:bg-primary/10 transition-colors">Ver</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};