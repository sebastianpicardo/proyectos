"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { XPGamification } from "@/components/XPGamification";
import { UserX, DollarSign, AlertTriangle, TrendingUp, Calendar, Eye, Filter, Search, AlertCircle, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

interface MorosoClient {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
  facturasPendientes: number;
  montoTotal: number;
  diasMoroso: number;
  ultimaFactura: string;
  riesgo: "alto" | "medio" | "bajo";
  estado: "activo" | "en_gestion" | "pagado" | "legal";
}

export default function MorososPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [clients, setClients] = useState<MorosoClient[]>([]);
  const [filter, setFilter] = useState<"all" | "alto" | "medio" | "bajo">("all");
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
    const mockClients: MorosoClient[] = [
      { id: "1", nombre: "Constructora Andina SpA", rut: "76.999.888-7", email: "cobranza@andina.cl", telefono: "+56 2 2345 6789", direccion: "Av. Las Condes 1245, Santiago", facturasPendientes: 5, montoTotal: 28450000, diasMoroso: 67, ultimaFactura: "2023-11-08", riesgo: "alto", estado: "en_gestion" },
      { id: "2", nombre: "Logística Central Ltda", rut: "76.666.555-4", email: "finanzas@logisticacentral.cl", telefono: "+56 2 2567 8901", direccion: "Los Olivos 3421, Estación Central", facturasPendientes: 3, montoTotal: 15200000, diasMoroso: 45, ultimaFactura: "2023-12-01", riesgo: "alto", estado: "activo" },
      { id: "3", nombre: "Exportadora del Sur SA", rut: "76.888.999-6", email: "tesoreria@exportadorasur.cl", telefono: "+56 2 2789 0123", direccion: "Panamericana Sur Km 45, Rancagua", facturasPendientes: 2, montoTotal: 8750000, diasMoroso: 32, ultimaFactura: "2023-12-15", riesgo: "medio", estado: "activo" },
      { id: "4", nombre: "Distribuidora Norte SpA", rut: "76.333.222-9", email: "contabilidad@distnorte.cl", telefono: "+56 2 2456 7890", direccion: "Av. Argentina 567, La Serena", facturasPendientes: 4, montoTotal: 22100000, diasMoroso: 89, ultimaFactura: "2023-10-12", riesgo: "alto", estado: "legal" },
      { id: "5", nombre: "Servicios Mineros Ltda", rut: "76.555.777-8", email: "pagos@serviciosmineros.cl", telefono: "+56 2 2890 1234", direccion: "Av. Pdte. Kennedy 4567, Santiago", facturasPendientes: 1, montoTotal: 3450000, diasMoroso: 18, ultimaFactura: "2024-01-08", riesgo: "bajo", estado: "activo" },
      { id: "6", nombre: "Comercial Pacifico SA", rut: "76.444.111-2", email: "admin@compacifico.cl", telefono: "+56 2 2345 1122", direccion: "Av. Perú 234, Valparaíso", facturasPendientes: 3, montoTotal: 11800000, diasMoroso: 56, ultimaFactura: "2023-11-20", riesgo: "medio", estado: "en_gestion" },
      { id: "7", nombre: "Inmobiliaria Los Andes", rut: "76.777.444-5", email: "cobranza@inmobiliarialosandes.cl", telefono: "+56 2 2678 3344", direccion: "Av. Apoquindo 4500, Santiago", facturasPendientes: 2, montoTotal: 6900000, diasMoroso: 28, ultimaFactura: "2023-12-28", riesgo: "medio", estado: "activo" },
      { id: "8", nombre: "Agroindustrial Valle Ltda", rut: "76.222.333-1", email: "finanzas@agrovalle.cl", telefono: "+56 2 2901 5566", direccion: "Camino Lo Boza 789, Talagante", facturasPendientes: 4, montoTotal: 19300000, diasMoroso: 102, ultimaFactura: "2023-09-25", riesgo: "alto", estado: "legal" },
    ];
    setClients(mockClients);
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

  const getRiesgoStyles = (riesgo: MorosoClient["riesgo"]) => {
    switch (riesgo) {
      case "alto": return { bg: "bg-red-100", text: "text-red-700", label: "Alto", icon: <AlertCircle className="w-3.5 h-3.5" /> };
      case "medio": return { bg: "bg-amber-100", text: "text-amber-700", label: "Medio", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
      case "bajo": return { bg: "bg-green-100", text: "text-green-700", label: "Bajo", icon: <CheckCircle className="w-3.5 h-3.5" /> };
    }
  };

  const getEstadoStyles = (estado: MorosoClient["estado"]) => {
    switch (estado) {
      case "activo": return { bg: "bg-blue-100", text: "text-blue-700", label: "Activo" };
      case "en_gestion": return { bg: "bg-purple-100", text: "text-purple-700", label: "En Gestión" };
      case "pagado": return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Pagado" };
      case "legal": return { bg: "bg-red-100", text: "text-red-700", label: "Legal" };
    }
  };

  const filteredClients = clients.filter((c) => {
    if (filter !== "all" && c.riesgo !== filter) return false;
    if (searchTerm && !c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !c.rut.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Clientes Morosos</h1>
            <p className="text-slate-500 mt-1">Gestiona y da seguimiento a clientes con facturas pendientes de pago</p>
          </div>

          <XPGamification user={user} onClose={() => setShowXPModal(false)} compact />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Clientes Morosos" value={clients.length} iconBg="bg-red-100" iconColor="text-red-600" />
            <MetricCard title="Monto Total Pendiente" value={formatCLP(clients.reduce((sum, c) => sum + c.montoTotal, 0))} iconBg="bg-amber-100" iconColor="text-amber-600" />
            <MetricCard title="Riesgo Alto" value={clients.filter(c => c.riesgo === "alto").length} iconBg="bg-red-100" iconColor="text-red-600" />
            <MetricCard title="Prom. Días Morosos" value={Math.round(clients.reduce((sum, c) => sum + c.diasMoroso, 0) / clients.length)} iconBg="bg-orange-100" iconColor="text-orange-600" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Listado de Morosos</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{filteredClients.length} de {clients.length} clientes</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar por nombre, RUT o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
                  </div>
                  <div className="flex items-center gap-2">
                    {(["all", "alto", "medio", "bajo"] as const).map((f) => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${filter === f ? (f === "all" ? "bg-slate-900 text-white" : f === "alto" ? "bg-red-100 text-red-700" : f === "medio" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700") + " shadow-sm" : (f === "all" ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : f === "alto" ? "bg-red-100 text-red-700 hover:bg-red-200" : f === "medio" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-green-100 text-green-700 hover:bg-green-200")}`} aria-pressed={filter === f}>
                        {f === "all" ? "Todos" : f === "alto" ? "Alto" : f === "medio" ? "Medio" : "Bajo"}
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/50">
                          {clients.filter(c => f === "all" || c.riesgo === f).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-200">
                    {["Cliente", "RUT", "Contacto", "Facturas", "Monto Total", "Días", "Riesgo", "Estado", "Acciones"].map((col) => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.length === 0 ? (
                    <tr><td colSpan={9} className="px-6 py-12 text-center"><div className="flex flex-col items-center gap-3 text-slate-500"><Filter className="w-10 h-10 text-slate-300" /><p className="font-medium text-slate-600">No se encontraron clientes</p></div></td></tr>
                  ) : (
                    filteredClients.map((c) => {
                      const riesgoStyles = getRiesgoStyles(c.riesgo);
                      const estadoStyles = getEstadoStyles(c.estado);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-slate-900">{c.nombre}</p>
                              <p className="text-xs text-slate-500">{c.rut}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-600">{c.email}</p>
                              <p className="text-slate-400">{c.telefono}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">{c.facturasPendientes} pendientes</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 tabular-nums">{formatCLP(c.montoTotal)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.diasMoroso > 60 ? "bg-red-100 text-red-700" : c.diasMoroso > 30 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              <Calendar className="w-3 h-3" />
                              {c.diasMoroso} días
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${riesgoStyles.bg} ${riesgoStyles.text}`}>
                              {riesgoStyles.icon}
                              {riesgoStyles.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estadoStyles.bg} ${estadoStyles.text}`}>
                              {estadoStyles.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100" title="Ver detalle"><Eye className="w-4 h-4" /></button>
                              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100" title="Enviar email"><Mail className="w-4 h-4" /></button>
                              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100" title="Llamar"><Phone className="w-4 h-4" /></button>
                            </div>
                          </td>
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

function getRiesgoStyles(riesgo: MorosoClient["riesgo"]) {
  switch (riesgo) {
    case "alto": return { bg: "bg-red-100", text: "text-red-700", label: "Alto", icon: <AlertCircle className="w-3.5 h-3.5" /> };
    case "medio": return { bg: "bg-amber-100", text: "text-amber-700", label: "Medio", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
    case "bajo": return { bg: "bg-green-100", text: "text-green-700", label: "Bajo", icon: <CheckCircle className="w-3.5 h-3.5" /> };
  }
}

function getEstadoStyles(estado: MorosoClient["estado"]) {
  switch (estado) {
    case "activo": return { bg: "bg-blue-100", text: "text-blue-700", label: "Activo" };
    case "en_gestion": return { bg: "bg-purple-100", text: "text-purple-700", label: "En Gestión" };
    case "pagado": return { bg: "bg-emerald-100", text: "text-emerald-700", label: "Pagado" };
    case "legal": return { bg: "bg-red-100", text: "text-red-700", label: "Legal" };
  }
}