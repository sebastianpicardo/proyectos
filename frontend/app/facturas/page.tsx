"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { XPGamification } from "@/components/XPGamification";
import { FileText, DollarSign, CheckCircle, AlertTriangle, Upload, FileText as FileTextIcon, Filter, Download, Search, Eye } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

interface Invoice {
  id: string;
  folio: string;
  rutEmisor: string;
  rutReceptor: string;
  razonSocial: string;
  montoTotal: number;
  fecha: string;
  estado: "emitida" | "pendiente" | "conciliada";
}

export default function FacturasPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<"all" | "emitida" | "pendiente" | "conciliada">("all");
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
    // Mock data
    const mockInvoices: Invoice[] = [
      { id: "1", folio: "FOL-001", rutEmisor: "76.123.456-7", rutReceptor: "76.987.654-3", razonSocial: "Empresa ABC SpA", montoTotal: 12450000, fecha: "2024-01-15", estado: "conciliada" },
      { id: "2", folio: "FOL-002", rutEmisor: "76.987.654-3", rutReceptor: "76.123.456-7", razonSocial: "Comercial XYZ Ltda", montoTotal: 8750000, fecha: "2024-01-14", estado: "pendiente" },
      { id: "3", folio: "FOL-003", rutEmisor: "76.555.444-1", rutReceptor: "76.333.222-9", razonSocial: "Servicios Global SA", montoTotal: 6200000, fecha: "2024-01-13", estado: "emitida" },
      { id: "4", folio: "FOL-004", rutEmisor: "76.333.222-9", rutReceptor: "76.777.888-5", razonSocial: "Distribuidora Norte", montoTotal: 4100000, fecha: "2024-01-12", estado: "conciliada" },
      { id: "5", folio: "FOL-005", rutEmisor: "76.777.888-5", rutReceptor: "76.555.444-1", razonSocial: "Industrial Sur SpA", montoTotal: 3850000, fecha: "2024-01-11", estado: "pendiente" },
      { id: "6", folio: "FOL-006", rutEmisor: "76.111.222-3", rutReceptor: "76.444.333-2", razonSocial: "Cliente Tech", montoTotal: 18000000, fecha: "2024-01-10", estado: "emitida" },
      { id: "7", folio: "FOL-007", rutEmisor: "76.444.333-2", rutReceptor: "76.111.222-3", razonSocial: "Cliente Retail", montoTotal: 9500000, fecha: "2024-01-09", estado: "conciliada" },
      { id: "8", folio: "FOL-008", rutEmisor: "76.999.888-7", rutReceptor: "76.666.555-4", razonSocial: "Constructora Andina", montoTotal: 5400000, fecha: "2024-01-08", estado: "pendiente" },
    ];
    setInvoices(mockInvoices);
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

  const filteredInvoices = invoices.filter((inv) => {
    if (filter !== "all" && inv.estado !== filter) return false;
    if (searchTerm && !inv.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !inv.folio.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !inv.rutEmisor.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getEstadoStyles = (estado: Invoice["estado"]) => {
    switch (estado) {
      case "conciliada": return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Conciliada" };
      case "pendiente": return { bg: "bg-amber-100", text: "text-amber-700", label: "Pendiente" };
      case "emitida": return { bg: "bg-blue-100", text: "text-blue-700", label: "Emitida" };
    }
  };

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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Facturas SII</h1>
            <p className="text-slate-500 mt-1">Gestiona tus facturas emitidas y recibidas del Registro de Ventas SII</p>
          </div>

          <XPGamification user={user} onClose={() => setShowXPModal(false)} compact />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Facturas" value={invoices.length.toString()} iconBg="bg-blue-100" iconColor="text-blue-600" />
            <MetricCard title="Conciliadas" value={invoices.filter(i => i.estado === "conciliada").length} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
            <MetricCard title="Pendientes" value={invoices.filter(i => i.estado === "pendiente").length} iconBg="bg-amber-100" iconColor="text-amber-600" />
            <MetricCard title="Monto Total" value={formatCLP(invoices.reduce((sum, i) => sum + i.montoTotal, 0))} iconBg="bg-green-100" iconColor="text-green-600" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Listado de Facturas</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{filteredInvoices.length} de {invoices.length} facturas</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar por folio, RUT, razón social..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(["all", "emitida", "pendiente", "conciliada"] as const).map((f) => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${filter === f ? (f === "all" ? "bg-slate-900 text-white" : f === "emitida" ? "bg-blue-100 text-blue-700" : f === "pendiente" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700") + " shadow-sm" : (f === "all" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : f === "emitida" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : f === "pendiente" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200")}`} aria-pressed={filter === f}>
                        {f === "all" ? "Todas" : f === "emitida" ? "Emitidas" : f === "pendiente" ? "Pendientes" : "Conciliadas"}
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/50">
                          {invoices.filter(i => f === "all" || i.estado === f).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-200">
                    {["Folio", "Fecha", "RUT Emisor", "Razón Social", "Monto", "Estado", "Acciones"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="flex flex-col items-center gap-3 text-slate-500"><Filter className="w-10 h-10 text-slate-300" /><p className="font-medium text-slate-600">No se encontraron facturas</p></div></td></tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const estadoStyles = getEstadoStyles(inv.estado);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-slate-600">{inv.folio}</td>
                          <td className="px-4 py-3 text-sm text-slate-500">{inv.fecha}</td>
                          <td className="px-4 py-3 text-sm font-mono text-slate-600">{inv.rutEmisor}</td>
                          <td className="px-4 py-3"><p className="font-medium text-slate-900 truncate max-w-[200px]">{inv.razonSocial}</p></td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 tabular-nums">{formatCLP(inv.montoTotal)}</td>
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