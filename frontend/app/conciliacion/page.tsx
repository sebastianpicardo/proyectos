"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dropzone } from "./components/Dropzone";
import { HealthScore } from "./components/HealthScore";
import { ResultsTable } from "./components/ResultsTable";
import { toast } from "sonner";

const ConciliacionDashboard = () => {
  const [activeSection, setActiveSection] = useState<"dashboard" | "conciliacion">("dashboard");

  const handleUploadSuccess = (data: any) => {
    toast.success("Conciliación completada", {
      description: `Total: $${data.totalFacturado.toLocaleString("es-CL")} | Pagado: $${data.totalPagado.toLocaleString("es-CL")} | Pendiente: $${data.totalPendiente.toLocaleString("es-CL")}`,
    });
  };

  const handleError = (error: Error) => {
    toast.error("Error en la conciliación", {
      description: error.message,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Dropzone onUploadSuccess={handleUploadSuccess} onError={handleError} />
            <HealthScore />
            <ResultsTable />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConciliacionDashboard;