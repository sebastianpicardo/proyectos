"use client";

import { useState, useEffect } from "react";

export const Header = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900 data-[data-theme=dark]:bg-gray-900 data-[data-theme=light]:bg-white shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 6h6m-5.5-6a3 3 0 110-5.5 3.3 3.3 0 005.5 0 3 3 0 11-5.5 0z"/>
          </svg>
        </div>
        <div>
<h1 className="text-lg font-semibold tracking-tight">Bienvenido seba</h1>
<p className="text-sm text-muted/80">Sistema de Conciliación</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <div className="relative">
          <span className="text-sm text-muted/60">RUT:</span>
          <span className="ml-2 text-sm font-medium">76.123.456-7</span>
        </div>
        <div className="relative">
          <span className="text-sm text-muted/60">Empresa:</span>
          <span className="ml-2 text-sm font-medium">Razón Social Ltda.</span>
        </div>
        <div className="relative">
          <span className="text-sm text-muted/60">Estado:</span>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2h2a2 2 0 002 2v4l3-3m3 3L12 9l-3 3m6 2a8 8 0 11-16 0 8 8 0 0116 0z"/>
            </svg>
            <span className="hidden data-[state=active]:block">Activo</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          id="themeToggle" 
          className="rounded-lg bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          aria-label="Alternar modo oscuro/claro"
        >
          <svg id="themeIconSun" className="w-4 h-4 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3vma 18M12a6 6 0 000 12v-2m4.01-4.99a2 2 0 01-2.83 0l1.41-1.41M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg id="themeIconMoon" className="w-4 h-4 block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
        </button>
      </div>
    </header>
  );
};
