"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Star,
  Flame,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
  History,
  Receipt,
  UserX,
  Cog,
  AlertTriangle,
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

interface HeaderProps {
  user: UserData;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const levelLabels = ["Principiante", "Intermedio", "Analista Junior", "Analista Senior", "Experto", "Maestro"];
const levelColors = [
  "bg-slate-100 text-slate-600",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
];

function getLevelInfo(level: number) {
  const idx = Math.min(Math.max(level - 1, 0), levelLabels.length - 1);
  return {
    label: levelLabels[idx],
    color: levelColors[idx],
  };
}

function calculateProgress(points: number, level: number) {
  const pointsForCurrentLevel = (level - 1) * 100;
  const pointsForNextLevel = level * 100;
  const progress = points - pointsForCurrentLevel;
  const total = pointsForNextLevel - pointsForCurrentLevel;
  return { progress, total, percentage: Math.min((progress / total) * 100, 100) };
}

export function Header({ user, onLogout, onNavigate }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { label: levelLabel, color: levelColor } = getLevelInfo(user.level);
  const { progress, total, percentage } = calculateProgress(user.points, user.level);

  const menuItems = [
    { name: "Mi Perfil", icon: User, href: "/profile" },
    { name: "Configuración", icon: Settings, href: "/settings" },
    { name: "Cerrar sesión", icon: LogOut, action: onLogout, destructive: true },
  ];

  const navShortcuts = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Conciliación", icon: ArrowLeftRight, href: "/conciliacion" },
    { name: "Historial", icon: History, href: "/historial" },
    { name: "Facturas SII", icon: Receipt, href: "/facturas" },
    { name: "Morosos", icon: UserX, href: "/morosos" },
    { name: "Configuración", icon: Cog, href: "/settings" },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Page Title / Breadcrumbs */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg lg:text-xl font-semibold text-slate-900 hidden sm:block">
            Conciliación Bancaria
          </h1>
        </div>

        {/* Center: XP Progress Bar (compact) */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
          <div className="flex items-center gap-1.5">
            <span className={`level-badge ${levelColor}`}>
              {levelLabel}
            </span>
            <Star className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span className="font-semibold text-slate-900">{user.points.toLocaleString()} XP</span>
          </div>
          <div className="flex-1 progress-bar mx-2">
            <div
              className="progress-bar-fill bg-gradient-to-r from-indigo-500 to-purple-600"
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={Math.round(percentage)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progreso nivel ${user.level}: ${percentage.toFixed(0)}%`}
            />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span>{user.consecutiveDays} días</span>
          </div>
        </div>

        {/* Right: Notifications, User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Notificaciones"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-lg py-2 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Notificaciones</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Marcar todas</button>
                </div>
                <div className="py-2 max-h-96 overflow-y-auto">
                  {[
                    { title: "Conciliación completada", desc: "34 facturas procesadas correctamente", time: "Hace 5 min", icon: "check" },
                    { title: "Nueva factura detectada", desc: "Factura #1245 pendiente de revisión", time: "Hace 1 hora", icon: "alert" },
                    { title: "Subida de nivel", desc: "¡Felicidades! Alcanzaste Analista Senior", time: "Hace 2 horas", icon: "star" },
                  ].map((notif, i) => (
                    <button
                      key={i}
                      className="w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left flex items-start gap-3"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notif.icon === "check" ? "bg-green-100 text-green-600" :
                        notif.icon === "alert" ? "bg-orange-100 text-orange-600" :
                        "bg-yellow-100 text-yellow-600"
                      }`}>
                        {notif.icon === "check" && <Check className="w-4 h-4" />}
                        {notif.icon === "alert" && <AlertTriangle className="w-4 h-4" />}
                        {notif.icon === "star" && <Star className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-500 truncate">{notif.desc}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-slate-200">
                  <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Menú de usuario"
              aria-expanded={menuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 animate-fade-in">
                {/* Quick Navigation */}
                <div className="px-3 py-2 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navegación</p>
                  <div className="space-y-1">
                    {navShortcuts.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          onNavigate(item.href);
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <item.icon className="w-4 h-4" aria-hidden="true" />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Actions */}
                <div className="p-2 space-y-1">
                  {menuItems.map((item, i) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.href) {
                          onNavigate(item.href);
                        }
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        item.destructive
                          ? "text-red-600 hover:bg-red-50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <item.icon className="w-4 h-4" aria-hidden="true" />
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Check({ className }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
}