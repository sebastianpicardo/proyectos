"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dropzone } from "./components/Dropzone";
import { HealthScore } from "./components/HealthScore";
import { ResultsTable } from "./components/ResultsTable";
import { toast } from "sonner";

const ConciliacionDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión al cargar el componente
    const token = localStorage.getItem("token");
    if (!token) {
      // Sin sesión → redirigir de inmediato a raíz /
      router.push("/");
      return;
    }
    // Si hay token, mostrar el dashboard completo
  }, [router]);

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
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Dropzone onUploadSuccess={handleUploadSuccess} onError={handleError} />
          <HealthScore />
          <ResultsTable />
        </div>
      </main>
    </div>
  );
};

export default ConciliacionDashboard;