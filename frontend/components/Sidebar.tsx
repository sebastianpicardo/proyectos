"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Receipt,
  UserX,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BarChart2,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Zap,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Conciliación", href: "/conciliacion", icon: ArrowLeftRight },
  { name: "Historial", href: "/historial", icon: History },
  { name: "Facturas SII", href: "/facturas", icon: Receipt },
  { name: "Clientes Morosos", href: "/morosos", icon: UserX },
  { name: "Configuración", href: "/settings", icon: Settings },
];

const quickActions = [
  { name: "Subir Cartola", href: "/conciliacion", icon: FileText, color: "text-blue-500 bg-blue-50" },
  { name: "Subir Facturas", href: "/facturas", icon: Receipt, color: "text-green-500 bg-green-50" },
  { name: "Ver Métricas", href: "/", icon: BarChart2, color: "text-purple-500 bg-purple-50" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        aria-label="Navegación principal"
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2" aria-label="Ir al inicio">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">Conciliador</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center" aria-label="Ir al inicio">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </Link>
          )}
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Navegación principal">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-indigo-50 text-indigo-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                  ${isCollapsed ? "justify-center px-2" : ""}
                `}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon
                  className={`
                    w-5 h-5 flex-shrink-0 transition-transform duration-200
                    ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}
                  `}
                  aria-hidden="true"
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions - only show when expanded */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-200">
            <h3 className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Acciones Rápidas
            </h3>
            <div className="space-y-2">
              {quickActions.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    hover:-translate-x-1 hover:shadow-md
                  `}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-slate-700">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* User Section / Footer */}
        <div className="p-4 border-t border-slate-200">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Administrador</p>
                <p className="text-xs text-slate-500 truncate">analista@empresa.cl</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm" title="Administrador">
                A
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
        aria-label="Abrir menú de navegación"
        aria-expanded={isMobileOpen}
      >
        <LayoutDashboard className="w-6 h-6" />
      </button>
    </>
  );
}