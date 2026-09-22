"use client";

import { useState } from "react";

type DashboardNav =
  | "dashboard"
  | "conciliacion"
  | "historial"
  | "facturas-sii"
  | "clientes-morosos"
  | "config";

interface NavItem {
  key: DashboardNav;
  label: string;
  icon: string;
}

export const Sidebar = () => {
  const [activeNav, setActiveNav] = useState<DashboardNav>("dashboard");

  const navItems: NavItem[] = [
    { key: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 6h6m-5.5-6a3 3 0 110-5.5 3.3 3.3 0 005.5 0 3 3 0 11-5.5 0z" },
    { key: "conciliacion", label: "Conciliación", icon: "M9 19V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13c0 2 2 2 2 2h14a2 2 0 002-2v-7m-5-3l-3.138 5.326L16.07 21.375c.538.434.21.927-.262 1.073l-4.893-.696L5.37 21.85c-.429.53-.972.225-1.03-.262l-1.158-4.983L.829 9.36l4.465-3.536a1.967 1.967 0 01.03-.651zm0 0l3.138-5.326L8.93 9.375c-.538-.434-.21-.927.262-1.073l4.893.696L18.63 1.65c.429-.53.21-.927-.262-1.073L13.97 2.38l-4.465 3.536a1.967 1.967 0 01-.03.651z" },
    { key: "historial", label: "Historial", icon: "M9 19V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13c0 2 2 2 2 2h14a2 2 0 002-2v-7M5 10h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v3" },
    { key: "facturas-sii", label: "Facturas SII", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8m0 7h8a2 2 0 002-2v-2a2 2 0 00-2-2H8v2zm-2 4h2m-2 4h2m-6 4h2m4-6h2m-6 4h2" },
    { key: "clientes-morosos", label: "Clientes Morosos", icon: "M12 8v4l3 3m5-1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h6zm0 0h.01M12 8V7m0 8v1m0 0v1m0-8v1m0 0v1m0-8v1" },
    { key: "config", label: "Configuración", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2m-6 4h12m-2-4l-2-2m2 2l2-2m2 2l-2 2m2 2l-2-2" },
  ];

  const navMap: Record<DashboardNav, string> = {
    dashboard: "dashboard",
    conciliacion: "conciliacion",
    historial: "historial",
    "facturas-sii": "facturas-sii",
    "clientes-morosos": "clientes-morosos",
    config: "config",
  };

  const handleNavChange = (key: DashboardNav) => {
    setActiveNav(key);
    console.log(`Navegando a: ${navMap[key]}`);
  };

  return (
    <aside
      className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border p-4 flex flex-col space-y-2 overflow-y-auto"
    >
      <div className="h-full">
        <nav>
          <div className="list-none p-0 m-0 flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = activeNav === item.key;
              const normalClasses = "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary/20 hover:text-primary";
              const activeClasses = "data-[state=active]:bg-primary/10 data-[state=active]:text-primary";
              const combinedClasses = isActive
                ? `${normalClasses} ${activeClasses}`
                : normalClasses;

              return (
                <div key={item.key} className="flex items-center gap-2">
                  <button
                    data-nav={item.key}
                    className={combinedClasses}
                    onClick={() => handleNavChange(item.key)}
                    aria-label={item.label}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
};