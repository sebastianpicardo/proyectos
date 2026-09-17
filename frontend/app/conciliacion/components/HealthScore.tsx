"use client";

import { useState, useEffect } from "react";

type HealthScoreProps = {
  totalFacturado?: number;
  totalPagado?: number;
  totalPendiente?: number;
};

export const HealthScore = ({ 
  totalFacturado, 
  totalPagado, 
  totalPendiente 
}: HealthScoreProps = {}) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const html = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const applyTheme = (theme: 'light' | 'dark') => {
      html.setAttribute('data-theme', theme);
    };

    applyTheme(theme);

    const listener = () => {
      applyTheme(theme);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
    };
  }, [theme]);

  const formatCLP = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const tfTotalFacturado = totalFacturado || 125450;
  const tfTotalPagado = totalPagado || 89200;
  const tfTotalPendiente = totalPendiente || (tfTotalFacturado - tfTotalPagado);
  const healthScore = Math.round((tfTotalPagado / tfTotalFacturado) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Health Score Card */}
      <div className="rounded-2xl border p-6 bg-card backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted/60 mb-1">Salud Financiera de Cobranza</p>
            <p className="text-2xl font-bold" id="healthScore">{healthScore}%</p>
          </div>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" id="healthScoreIcon">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V6a2 2 0 00-2-2H5a2 2 0 00-2 2v13c0 2 2 2 2 2h14a2 2 0 002-2v-7m-5-3l-3.138 5.326L16.07 21.375c.538.434.21.927-.262 1.073l-4.893-.696L5.37 21.85c-.429.53-.972.225-1.03-.262l-1.158-4.983L.829 9.36l4.465-3.536a1.967 1.967 0 01.03-.651zm0 0l3.138-5.326L8.93 9.375c-.538-.434-.21-.927.262-1.073l4.893.696L18.63 1.65c.429-.53.21-.927-.262-1.073L13.97 2.38l-4.465 3.536a1.967 1.967 0 01-.03.651zm0 0l3.138-5.326L8.93 9.375c-.538-.434-.21-.927.262-1.073l4.893.696L18.63 1.65c.429-.53.21-.927-.262-1.073L13.97 2.38l-4.465 3.536a1.967 1.967 0 01-.03.651z"/>
            </svg>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-2 rounded-full bg-border/30 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-success to-primary transition-width" style={{ width: `${healthScore}%` }}></div>
          </div>
          <p className="text-sm text-muted/60 mt-1">Puntos de Eficiencia: <span id="efficiencyPoints">{tfTotalPagado.toLocaleString("es-CL")}</span></p>
        </div>
      </div>
      
      {/* Total Facturado Card */}
      <div className="rounded-2xl border p-6 bg-card backdrop-blur-sm">
        <p className="text-sm text-muted/60 mb-1">Total Facturado</p>
        <p className="text-2xl font-bold" id="totalFacturado">{formatCLP(tfTotalFacturado)}</p>
      </div>
      
      {/* Total Pagado Card */}
      <div className="rounded-2xl border p-6 bg-card backdrop-blur-sm">
        <p className="text-sm text-muted/60 mb-1">Total Pagado</p>
        <p className="text-2xl font-bold" id="totalPagado">{formatCLP(tfTotalPagado)}</p>
      </div>
      
      {/* Efficiency Points Card */}
      <div className="rounded-2xl border p-6 bg-card backdrop-blur-sm">
        <p className="text-sm text-muted/60 mb-1">Puntos de Eficiencia</p>
        <p className="text-2xl font-bold" id="efficiencyValue">{tfTotalPagado.toLocaleString("es-CL")}</p>
        <p className="text-sm text-muted/60">vs mes anterior</p>
      </div>
      
      {/* Pendiente Card */}
      <div className="rounded-2xl border p-6 bg-card backdrop-blur-sm">
        <p className="text-sm text-muted/60 mb-1">Pendiente por Conciliar</p>
        <p className="text-2xl font-bold" id="totalPendiente">{formatCLP(tfTotalPendiente)}</p>
        <p className="text-sm text-muted/60">% de cobertura: {(100 - healthScore)}%</p>
      </div>
    </div>
  );
};