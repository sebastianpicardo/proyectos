"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { XPGamification } from "@/components/XPGamification";
import { History, FileText, DollarSign, CheckCircle, AlertTriangle, TrendingUp, Calendar, Download, Eye, Filter, Search } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

interface HistoryItem {
  id: string;
  fecha: string;
  tipo: "cartola" | "facturas" | "conciliacion";
  archivo: string;
  totalFacturado: number;
  totalPagado: number;
  totalPendiente: number;
  facturasProcesadas: number;
  conciliadas: number;
  pendientes: number;
  estado: "completado" | "procesando" | "error";
}

export default function HistorialPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "completado" | "procesando" | "error">("all");
  const [searchTerm, setSearchTerm] = useState("");
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
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const mockHistory: HistoryItem[] = [
      { id: "1", fecha: "2024-01-15 10:30", tipo: "conciliacion", archivo: "cartola_ene.csv + facturas_ene.csv", totalFacturado: 125450000, totalPagado: 89200000, totalPendiente: 36250000, facturasProcesadas: 45, conciliadas: 38, pendientes: 7, estado: "completado" },
      { id: "2", fecha: "2024-01-14 14:22", tipo: "facturas", archivo: "facturas_sii_ene.csv", totalFacturado: 98500000, totalPagado: 0, totalPendiente: 98500000, facturasProcesadas: 32, conciliadas: 0, pendientes: 32, estado: "completado" },
      { id: "3", fecha: "2024-01-14 09:15", tipo: "cartola", archivo: "cartola_banco_chile_ene.csv", totalFacturado: 0, totalPagado: 0, totalPendiente: 0, facturasProcesadas: 0, conciliadas: 0, pendientes: 0, estado: "completado" },
      { id: "4", fecha: "2024-01-13 16:45", tipo: "conciliacion", archivo: "cartola_dic.csv + facturas_dic.csv", totalFacturado: 112300000, totalPagado: 78900000, totalPendiente: 33400000, facturasProcesadas: 38, conciliadas: 31, pendientes: 7, estado: "completado" },
      { id: "5", fecha: "2024-01-12 11:20", tipo: "conciliacion", archivo: "cartola_nov.csv + facturas_nov.csv", totalFacturado: 95600000, totalPagado: 67200000, totalPendiente: 28400000, facturasProcesadas: 31, conciliadas: 26, pendientes: 5, estado: "completado" },
      { id: "6", fecha: "2024-01-10 08:30", tipo: "facturas", archivo: "facturas_sii_dic.csv", totalFacturado: 87200000, totalPagado: 0, totalPendiente: 87200000, facturasProcesadas: 28, conciliadas: 0, pendientes: 28, estado: "completado" },
    ];
    setHistory(mockHistory);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);

  const getTipoIcon = (tipo: HistoryItem["tipo"]) => {
    switch (tipo) {
      case "cartola": return <FileText className="w-4 h-4 text-blue-500" />;
      case "facturas": return <FileText className="w-4 h-4 text-green-500" />;
      case "conciliacion": return <TrendingUp className="w-4 h-4 text-purple-500" />;
    }
  };

  const getEstadoStyles = (estado: HistoryItem["estado"]) => {
    switch (estado) {
      case "completado": return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completado" };
      case "procesando": return { bg: "bg-blue-100", text: "text-blue-700", label: "Procesando" };
      case "error": return { bg: "bg-red-100", text: "text-red-700", label: "Error" };
    }
  };

  const filteredHistory = history.filter((h) => {
    if (filter !== "all" && h.estado !== filter) return false;
    if (searchTerm && !h.archivo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`
        lg:ml-64 transition-all duration-300
        ${sidebarCollapsed ? "lg:ml-16" : ""}
      `}>
        <Header user={user} onLogout={handleLogout} onNavigate={handleNavigate} />

        <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen">
          <div className="animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Historial de Procesos</h1>
            <p className="text-slate-500 mt-1">Revisa el historial de cargas y conciliaciones realizadas</p>
          </div>

          <XPGamification user={user} onClose={() => setShowXPModal(false)} compact />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Procesos" value={history.length} iconBg="bg-indigo-100" iconColor="text-indigo-600" />
            <MetricCard title="Completados" value={history.filter(h => h.estado === "completado").length} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <MetricCard title="Facturas Totales" value={history.reduce((sum, h) => sum + h.facturasProcesadas, 0)} iconBg="bg-blue-100" iconColor="text-blue-600" />
            <MetricCard title="Conciliadas" value={history.reduce((sum, h) => sum + h.conciliadas, 0)} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Historial de Conciliaciones</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{filteredHistory.length} de {history.length} registros</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar por nombre de archivo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                  <div className="flex items-center gap-2">
                    {(["all", "completado", "procesando", "error"] as const).map((f) => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${filter === f ? (f === "all" ? "bg-slate-900 text-white" : f === "completado" ? "bg-emerald-100 text-emerald-700" : f === "procesando" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700") + " shadow-sm" : (f === "all" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : f === "completado" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : f === "procesando" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-red-100 text-red-700 hover:bg-red-200")}`} aria-pressed={filter === f}>
                        {f === "all" ? "Todos" : f === "completado" ? "Completados" : f === "procesando" ? "Procesando" : "Errores"}
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/50">
                          {history.filter(h => f === "all" || h.estado === f).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-200">
                    {["Fecha", "Tipo", "Archivo", "Facturas", "Conciliadas", "Pendientes", "Total Facturado", "Total Pagado", "Estado", "Acciones"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr><td colSpan={10} className="px-6 py-12 text-center"><div className="flex flex-col items-center gap-3 text-slate-500"><Filter className="w-10 h-10 text-slate-300" /><p className="font-medium text-slate-600">No se encontraron registros</p></div></td></tr>
                  ) : (
                    filteredHistory.map((h) => {
                      const estadoStyles = getEstadoStyles(h.estado);
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{h.fecha}</td>
                          <td className="px-4 py-3"><div className="flex items-center gap-2">{getTipoIcon(h.tipo)}<span className="capitalize text-sm font-medium text-slate-700">{h.tipo}</span></div></td>
                          <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[200px]">{h.archivo}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{h.facturasProcesadas}</td>
                          <td className="px-4 py-3 text-sm font-medium text-emerald-600">{h.conciliadas}</td>
                          <td className="px-4 py-3 text-sm font-medium text-amber-600">{h.pendientes}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 tabular-nums">{h.totalFacturado > 0 ? formatCLP(h.totalFacturado) : "-"}</td>
                          <td className="px-4 py-3 text-sm font-medium text-emerald-600 tabular-nums">{h.totalPagado > 0 ? formatCLP(h.totalPagado) : "-"}</td>
                          <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estadoStyles.bg} ${estadoStyles.text}`}>{estadoStyles.label}</span></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-1"><button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><Eye className="w-4 h-4" /></button><button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><Download className="w-4 h-4" /></button></div></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getEstadoStyles(estado: HistoryItem["estado"]) {
  switch (estado) {
    case "completado": return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completado" };
    case "procesando": return { bg: "bg-blue-100", text: "text-blue-700", label: "Procesando" };
    case "error": return { bg: "bg-red-100", text: "text-red-700", label: "Error" };
  }
}