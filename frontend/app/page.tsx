"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { DragDropZone } from "@/components/DragDropZone";
import { XPGamification } from "@/components/XPGamification";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthContext";
import { 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Upload, 
  FileText, 
  ArrowUpFromLine,
  Zap, 
  TrendingUp, 
  Users,
  Star,
  FileText as FileTextIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
  isSuperAdmin?: boolean;
  hasProfile?: boolean;
}

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, checkProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [cartolaFile, setCartolaFile] = useState<File | null>(null);
  const [facturasFile, setFacturasFile] = useState<File | null>(null);
  const [cartolaProcessed, setCartolaProcessed] = useState(false);
  const [facturasProcessed, setFacturasProcessed] = useState(false);
  const [cartolaProcessing, setCartolaProcessing] = useState(false);
  const [facturasProcessing, setFacturasProcessing] = useState(false);
  const [cartolaError, setCartolaError] = useState<string | null>(null);
  const [facturasError, setFacturasError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; xp: number } | null>(null);

  // Check profile on mount and redirect if needed
  useEffect(() => {
    if (!loading && user && !user.isSuperAdmin && !user.hasProfile) {
      router.push("/planes");
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleFileUpload = async (type: "cartola" | "facturas", file: File) => {
    if (type === "cartola") {
      setCartolaFile(file);
      setCartolaError(null);
      setCartolaProcessing(true);
    } else {
      setFacturasFile(file);
      setFacturasError(null);
      setFacturasProcessing(true);
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate XP gain
    const xpGain = 50;
    const newPoints = (user?.points || 0) + 50;
    const newLevel = calculateLevel(newPoints);
    
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastActivityDate");
    let newConsecutive = user?.consecutiveDays || 0;
    if (lastDate !== today) {
      newConsecutive = (user?.consecutiveDays || 0) + 1;
      localStorage.setItem("lastActivityDate", today);
    }

    const updatedUser = {
      ...user,
      points: newPoints,
      level: newLevel,
      consecutiveDays: newConsecutive,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    // Show toast
    setToast({ message: type === "cartola" ? "Cartola procesada" : "Facturas procesadas", xp: 50 });
    localStorage.setItem("pendingXPToast", JSON.stringify({ message: type === "cartola" ? "Cartola procesada" : "Facturas procesadas", xp: 50 }));

    if (type === "cartola") {
      setCartolaProcessing(false);
      setCartolaProcessed(true);
    } else {
      setFacturasProcessing(false);
      setFacturasProcessed(true);
    }

    // Auto-hide toast
    setTimeout(() => setToast(null), 4000);
  };

  const calculateLevel = (points: number): number => {
    if (points >= 2000) return 6;
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
};

const formatCLP = (value: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  // Check profile on mount and redirect if needed
  useEffect(() => {
    if (!loading && user && !user.isSuperAdmin && !user.hasProfile) {
      router.push("/planes");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/25">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Conciliador Pro</h1>
            <p className="text-slate-300 mb-8">Sistema profesional de conciliación bancaria con gamificación integrada</p>
            
            <a href="/login" className="w-full py-3 px-6 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-colors shadow-lg shadow-white/10 block">
              Ingresar al Sistema
            </a>
            
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-400">Precisión</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{"<1s"}</p>
                <p className="text-xs text-slate-400">Procesamiento</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-xs text-slate-400">Disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireProfile={false} fallbackPath="/planes">
      <div className="min-h-screen bg-slate-50">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <div className={`
          lg:ml-64 transition-all duration-300
          ${sidebarCollapsed ? "lg:ml-16" : ""}
        `}>
          <Header 
            user={user} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate}
          />

          <main className="p-4 lg:p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-6 lg:mb-8 animate-fade-in">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Conciliación Bancaria</h1>
              <p className="text-slate-500 mt-1">Gestiona y concilia tus movimientos bancarios con facturas SII de forma inteligente</p>
            </div>

            {/* XP Gamification Compact Bar */}
            <XPGamification user={user} onClose={() => setShowXPModal(false)} compact />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <MetricCard
                title="Total Facturado"
                value={formatCLP(125450000)}
                icon={<DollarSign className="w-6 h-6" />}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                trend={{ value: "+12.5%", label: "vs mes anterior", positive: true }}
              />
              <MetricCard
                title="Conciliado con Éxito"
                value="89.2%"
                icon={<CheckCircle className="w-6 h-6" />}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                progress={{ current: 89200000, total: 125450000, label: "Facturas conciliadas" }}
                trend={{ value: "+3.2%", label: "vs mes anterior", positive: true }}
              />
              <MetricCard
                title="Pendientes / Morosidad"
                value={formatCLP(36250000)}
                icon={<AlertTriangle className="w-6 h-6" />}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                trend={{ value: "-8.1%", label: "vs mes anterior", positive: true }}
              />
              <MetricCard
                title="Salud Financiera"
                value="71%"
                icon={<TrendingUp className="w-6 h-6" />}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                trend={{ value: "+5 pts", label: "vs mes anterior", positive: true }}
              />
            </div>

            {/* Drag & Drop Upload Zones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DragDropZone
                title="Cartola Bancaria CSV"
                description="Arrastra tu archivo de movimientos bancarios o haz clic para seleccionar"
                icon={<Upload className="w-6 h-6" />}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                accept=".csv,text/csv"
                onFileSelect={(file) => handleFileUpload("cartola", file)}
                isProcessing={cartolaProcessing}
                processed={cartolaProcessed}
                error={cartolaError}
                maxSize={10}
              />

              <DragDropZone
                title="Facturas SII CSV"
                description="Arrastra tu archivo de facturas emitidas o haz clic para seleccionar"
                icon={<FileText className="w-6 h-6" />}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                accept=".csv,text/csv"
                onFileSelect={(file) => handleFileUpload("facturas", file)}
                isProcessing={facturasProcessing}
                processed={facturasProcessed}
                error={facturasError}
                maxSize={10}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => handleNavigate("/conciliacion")}
                className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowUpFromLine className="w-5 h-5" />
                Ejecutar Conciliación Automática
              </button>
              <button
                onClick={() => handleNavigate("/historial")}
                className="flex-1 py-3 px-6 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Ver Historial de Conciliaciones
              </button>
            </div>

            {/* Recent Activity / Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Resumen Rápido
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Facturas totales este mes", value: "1,247", icon: FileText, color: "text-blue-500 bg-blue-50" },
                    { label: "Conciliadas automáticamente", value: "1,112 (89.2%)", icon: CheckCircle, color: "text-green-500 bg-green-50" },
                    { label: "Requieren revisión manual", value: "135 (10.8%)", icon: AlertTriangle, color: "text-orange-500 bg-orange-50" },
                    { label: "Tiempo ahorrado", value: "~47 horas", icon: Zap, color: "text-purple-500 bg-purple-50" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">{item.label}</p>
                        <p className="font-semibold text-slate-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Top Clientes por Volumen
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Empresa ABC SpA", rut: "76.123.456-7", facturas: 45, monto: "$12,450,000", estado: "Al día" },
                    { name: "Comercial XYZ Ltda", rut: "76.987.654-3", facturas: 32, monto: "$8,750,000", estado: "Al día" },
                    { name: "Servicios Global SA", rut: "76.555.444-1", facturas: 28, monto: "$6,200,000", estado: "Pendiente" },
                    { name: "Distribuidora Norte", rut: "76.333.222-9", facturas: 21, monto: "$4,100,000", estado: "Al día" },
                    { name: "Industrial Sur SpA", rut: "76.777.888-5", facturas: 18, monto: "$3,850,000", estado: "Moroso" },
                  ].map((client, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{client.name}</p>
                          <p className="text-xs text-slate-500">{client.rut} • {client.facturas} facturas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{client.monto}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          client.estado === "Al día" ? "bg-green-100 text-green-700" :
                          client.estado === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {client.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}