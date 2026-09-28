"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { DragDropZone } from "@/components/DragDropZone";
import { ResultsTable } from "./components/ResultsTable";
import { XPGamification } from "@/components/XPGamification";
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
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  FileText as FileTextIcon,
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

interface ConciliationData {
  totalFacturado: number;
  totalPagado: number;
  totalPendiente: number;
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

export default function ConciliacionPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [conciliationData, setConciliationData] = useState<ConciliationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; xp: number } | null>(null);
  const [user, setUser] = useState<UserData>({
    name: "Administrador",
    email: "admin@test.com",
    level: 1,
    points: 0,
    consecutiveDays: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsed = JSON.parse(userData);
      setIsAuthenticated(true);
      setUser({
        name: parsed.name || "Administrador",
        email: parsed.email || "admin@test.com",
        level: parsed.level || 1,
        points: parsed.points || 0,
        consecutiveDays: parsed.consecutiveDays || 0,
      });
    } else {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    router.push("/");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleFileUpload = async (type: "cartola" | "facturas", file: File) => {
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate XP gain
    const xpGain = 50;
    const newPoints = user.points + xpGain;
    const newLevel = calculateLevel(newPoints);
    
    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastActivityDate");
    let newConsecutive = user.consecutiveDays;
    if (lastDate !== today) {
      newConsecutive = user.consecutiveDays + 1;
      localStorage.setItem("lastActivityDate", today);
    }

    const updatedUser: UserData = {
      ...user,
      points: newPoints,
      level: newLevel,
      consecutiveDays: newConsecutive,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // Generate mock conciliation data
    const mockData: ConciliationData = {
      totalFacturado: 125450000,
      totalPagado: 89200000,
      totalPendiente: 36250000,
      conciliados: [
        { id: "CONC-001", rut: "76.123.456-7", descripcion: "Empresa ABC SpA", monto: 12450000, tipo: "abono" },
        { id: "CONC-002", rut: "76.987.654-3", descripcion: "Comercial XYZ Ltda", monto: 8750000, tipo: "abono" },
        { id: "CONC-003", rut: "76.555.444-1", descripcion: "Servicios Global SA", monto: 6200000, tipo: "abono" },
        { id: "CONC-004", rut: "76.333.222-9", descripcion: "Distribuidora Norte", monto: 4100000, tipo: "abono" },
        { id: "CONC-005", rut: "76.777.888-5", descripcion: "Industrial Sur SpA", monto: 3850000, tipo: "abono" },
      ],
      pendientes: [
        { id: "PEND-001", rut: "76.111.222-3", monto: 18000000, razonSocial: "Cliente Tech" },
        { id: "PEND-002", rut: "76.444.333-2", monto: 9500000, razonSocial: "Cliente Retail" },
        { id: "PEND-003", rut: "76.999.888-7", monto: 5400000, razonSocial: "Constructora Andina" },
        { id: "PEND-004", rut: "76.666.555-4", monto: 3350000, razonSocial: "Logística Central" },
      ],
    };

    setConciliationData(mockData);
    setIsProcessing(false);

    // Show toast
    setToast({ message: type === "cartola" ? "Cartola procesada" : "Facturas procesadas", xp: xpGain });
    localStorage.setItem("pendingXPToast", JSON.stringify({ message: type === "cartola" ? "Cartola procesada" : "Facturas procesadas", xp: xpGain }));

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
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);

  if (!isAuthenticated) {
    return null; // Router will redirect
  }

  const healthScore = conciliationData 
    ? Math.round((conciliationData.totalPagado / conciliationData.totalFacturado) * 100)
    : 71;

  return (
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

        <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
          {/* Page Header */}
          <div className="animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Conciliación Bancaria</h1>
            <p className="text-slate-500 mt-1">Sube tus archivos y ejecuta la conciliación automática por RUT y monto</p>
          </div>

          {/* XP Gamification Compact Bar */}
          <XPGamification user={user} onClose={() => setShowXPModal(false)} compact />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Facturado"
              value={formatCLP(conciliationData?.totalFacturado || 125450000)}
              icon={<DollarSign className="w-6 h-6" />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              trend={{ value: "+12.5%", label: "vs mes anterior", positive: true }}
            />
            <MetricCard
              title="Conciliado con Éxito"
              value={`${healthScore}%`}
              icon={<CheckCircle className="w-6 h-6" />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              progress={{ 
                current: conciliationData?.totalPagado || 89200000, 
                total: conciliationData?.totalFacturado || 125450000, 
                label: "Facturas conciliadas" 
              }}
              trend={{ value: "+3.2%", label: "vs mes anterior", positive: true }}
            />
            <MetricCard
              title="Pendientes / Morosidad"
              value={formatCLP(conciliationData?.totalPendiente || 36250000)}
              icon={<AlertTriangle className="w-6 h-6" />}
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              trend={{ value: "-8.1%", label: "vs mes anterior", positive: true }}
            />
            <MetricCard
              title="Salud Financiera"
              value={`${healthScore}%`}
              icon={<TrendingUp className="w-6 h-6" />}
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              trend={{ value: "+5 pts", label: "vs mes anterior", positive: true }}
            />
          </div>

          {/* Drag & Drop Upload Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DragDropZone
              title="Cartola Bancaria CSV"
              description="Arrastra tu archivo de movimientos bancarios o haz clic para seleccionar"
              icon={<Upload className="w-6 h-6" />}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              accept=".csv,text/csv"
              onFileSelect={(file) => handleFileUpload("cartola", file)}
              isProcessing={isProcessing}
              maxSize={10}
            />

            <DragDropZone
              title="Facturas SII CSV"
              description="Arrastra tu archivo de facturas emitidas o haz clic para seleccionar"
              icon={<FileTextIcon className="w-6 h-6" />}
              iconBg="bg-green-100"
              iconColor="text-green-600"
              accept=".csv,text/csv"
              onFileSelect={(file) => handleFileUpload("facturas", file)}
              isProcessing={isProcessing}
              maxSize={10}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                if (conciliationData) {
                  // Already processed, just show toast
                  setToast({ message: "Conciliación re-ejecutada", xp: 25 });
                  localStorage.setItem("pendingXPToast", JSON.stringify({ message: "Conciliación re-ejecutada", xp: 25 }));
                  setTimeout(() => setToast(null), 4000);
                }
              }}
              disabled={isProcessing}
              className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Procesando...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-5 h-5" />
                  Ejecutar Conciliación Automática
                </>
              )}
            </button>
            <button
              onClick={() => handleNavigate("/historial")}
              className="flex-1 py-3 px-6 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <FileTextIcon className="w-5 h-5" />
              Ver Historial
            </button>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
            <ResultsTable data={conciliationData ?? undefined} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Resumen de Conciliación
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Facturas totales procesadas", value: conciliationData ? (conciliationData.conciliados.length + conciliationData.pendientes.length).toString() : "1,247", icon: FileTextIcon, color: "text-blue-500 bg-blue-50" },
                  { label: "Conciliadas automáticamente", value: conciliationData ? conciliationData.conciliados.length.toString() : "1,112", icon: CheckCircleIcon, color: "text-green-500 bg-green-50" },
                  { label: "Requieren revisión manual", value: conciliationData ? conciliationData.pendientes.length.toString() : "135", icon: AlertTriangleIcon, color: "text-orange-500 bg-orange-50" },
                  { label: "Tiempo estimado ahorrado", value: "~47 horas", icon: Zap, color: "text-purple-500 bg-purple-50" },
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

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
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

      {/* XP Modal */}
      {showXPModal && (
        <XPGamification 
          user={user} 
          onClose={() => setShowXPModal(false)} 
        />
      )}

      {/* XP Gain Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in" role="status" aria-live="polite">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 min-w-[300px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">¡Experiencia ganada!</p>
              <p className="text-sm text-slate-300">{toast.message} <span className="font-bold text-amber-300">+{toast.xp} XP</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}