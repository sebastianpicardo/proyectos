"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dropzone } from "./components/Dropzone";
import { HealthScore } from "./components/HealthScore";
import { ResultsTable } from "./components/ResultsTable";
import { toast } from "sonner";

const AUTHORIZED_EMAILS = [
  "seba@empresa.com",
  "admin@test.com",
  "usuario@dominio.com",
];

const ConciliacionDashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Verificar sesión al cargar el componente
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      // Sin sesión → redirigir a raíz (mostrará login)
      router.push("/");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      // Verificar email en white list
      if (!AUTHORIZED_EMAILS.includes(user.email)) {
        // Usuario no autorizado → redirigir a raíz
        router.push("/");
      }
    } catch (e) {
      // Token corrupto → redirigir a raíz
      router.push("/");
    }
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