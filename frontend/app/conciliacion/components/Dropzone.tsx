"use client";

import { useState } from "react";

type FileInput = {
  name: string;
  type: string;
  size: number;
};

export const Dropzone = () => {
  const [cartola, setCartola] = useState<File | null>(null);
  const [facturas, setFacturas] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");

  const CHILEAN_BANKS = [
    { name: "Banco de Chile", code: "CHD" },
    { name: "Santander", code: "BSANT" },
    { name: "BCI", code: "BCI" },
    { name: "Estado", code: "ESTADO" },
    { name: "Scotiabank", code: "SCOTI" },
    { name: "Itaú", code: "ITAU" }
  ];

  const handleCartolaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCartola(e.target.files?.[0] ?? null);
  };

  const handleFacturasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFacturas(e.target.files?.[0] ?? null);
  };

  const handleFileDrop = (e: React.DragEvent, type: "cartola" | "facturas") => {
    e.preventDefault();
    e.stopPropagation();
    
    const zone = e.currentTarget?.closest?.("[data-zone]") || e.currentTarget?.parentElement;
    if (zone) {
      zone.classList.remove("bg-primary/10", "border-primary/40");
      zone.classList.add("border-border", "bg-primary/50");
    }
    
    const files = (e.target as HTMLInputElement).files || (e as React.DragEvent).dataTransfer?.files;
    if (files && files.length > 0) {
      if (type === "cartola") {
        setCartola(files[0]);
      } else {
        setFacturas(files[0]);
      }
      processFiles(files[0], type);
    }
  };

  const processFiles = (file: File, type: "cartola" | "facturas") => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append(type, file);

    // Simulate API call to Go backend
    setTimeout(() => {
      // Mock response - in production, this would be the actual API response
      const mockData = {
        total_facturado: 125450,
        total_pagado: 89200,
        total_pendiente: 36250,
        conciliados: [
          { id: "FAC-001", rut: "76.123.456-7", monto: 50000, estado: "conciliado" }
        ],
        pendientes: [
          { id: "FAC-002", rut: "76.987.654-3", monto: 32000, estado: "pendiente" }
        ]
      };
      
      setLoading(false);
      // Here you would dispatch an action or call a callback with the data
      console.log("Conciliación completada", mockData);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Cartola Bancaria */}
      <div className="group relative rounded-2xl border-2 border-border/50 hover:border-primary/40 bg-primary/50 transition-all duration-300 cursor-pointer select-none">
        <input
          type="file"
          id="cartolaInput"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleCartolaChange(e)}
        />
        <div
          className="min-h-[200px] flex flex-col items-center justify-center py-6"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.remove("border-border", "bg-primary/50");
            zone.classList.add("bg-primary/10", "border-primary/40");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
            handleFileDrop(e, "cartola");
          }}
        >
          <svg className="w-8 h-8 mb-3 text-primary/50 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLineCap="round" strokeLineJoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0v4h16v-4H4zm0 0v4h12v-2h4v-4h-4v-2h-12zm0 0v4h16v-4H4z"/>
          </svg>
          <h3 className="text-lg font-medium mb-1">Cartola Bancaria</h3>
          <p className="text-sm text-muted/60">CSV/Excel Banco de Chile, Santander, BCI, Estado, Scotiabank, Itaú</p>
          <p className="text-xs mt-1 text-muted/50">Arrastra y suelta aquí o haz clic para seleccionar</p>
        </div>
        {cartola && (
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLineCap="round" strokeLineJoin="round" strokeWidth="2" d="M5 13l4 4L12 4l-8 8" />
            </svg>
            <span>Archivo seleccionado: {cartola.name}</span>
          </div>
        )}
        {selectedBank && (
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="mt-2 block w-full rounded border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-sm dark:text-gray-200"
          >
            <option value="">Seleccionar banco</option>
            {CHILEAN_BANKS.map((bank) => (
              <option key={bank.code} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        )}
        {loading && (
          <div className="mt-3 flex items-center justify-center pt-2">
            <svg className="w-5 h-5 mr-2 text-primary animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="ml-2 text-sm text-primary">Procesando conciliación...</span>
          </div>
        )}
      </div>

      {/* Registro de Ventas / Facturas SII */}
      <div className="group relative rounded-2xl border-2 border-border/50 hover:border-primary/40 bg-primary/50 transition-all duration-300 cursor-pointer select-none">
        <input
          type="file"
          id="facturasInput"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFacturasChange(e)}
        />
        <div
          className="min-h-[200px] flex flex-col items-center justify-center py-6"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.remove("border-border", "bg-primary/50");
            zone.classList.add("bg-primary/10", "border-primary/40");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const zone = e.currentTarget as HTMLElement;
            zone.classList.add("border-border", "bg-primary/50");
            zone.classList.remove("bg-primary/10", "border-primary/40");
            handleFileDrop(e, "facturas");
          }}
        >
          <svg className="w-8 h-8 mb-3 text-primary/50 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLineCap="round" strokeLineJoin="round" strokeWidth="2" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 0v4h16v-4H4zm0 0v4h12v-2h4v-4h-4v-2h-12zm0 0v4h16v-4H4z"/>
          </svg>
          <h3 className="text-lg font-medium mb-1">Facturas / Ventas SII</h3>
          <p className="text-sm text-muted/60">CSV/Excel Registro de Ventas SII</p>
          <p className="text-xs mt-1 text-muted/50">Arrastra y suelta aquí o haz clic para seleccionar</p>
        </div>
        {facturas && (
          <div className="mt-3 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLineCap="round" strokeLineJoin="round" strokeWidth="2" d="M5 13l4 4L12 4l-8 8" />
            </svg>
            <span>Archivo seleccionado: {facturas.name}</span>
          </div>
        )}
        {loading && (
          <div className="mt-3 flex items-center justify-center pt-2">
            <svg className="w-5 h-5 mr-2 text-primary animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth={4}
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <span className="ml-2 text-sm text-primary">Procesando conciliación...</span>
          </div>
        )}
      </div>
    </div>
  );
};