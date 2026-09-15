"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUserName(userData);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = () => {
    // Simular login - en producción esto haría fetch al backend
    localStorage.setItem("token", "mock-jwt-token");
    localStorage.setItem("user", "Administrador");
    setIsAuthenticated(true);
    setUserName("Administrador");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserName("");
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center rounded-full bg-indigo-100 p-2.5 mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.99 4.59-3.2 1.58 1.68 4.74L10 11.06l6.15 1.68L18.7 6.91l-4.56-3.09L12 2z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">¡Hola, bienvenido al sistema!</h1>
            <p className="text-gray-600 text-lg">Has iniciado sesión como <strong className="text-indigo-600">Administrador</strong></p>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl border border-indigo-200/50">
              <h3 className="font-semibold text-indigo-600 mb-2">Resumen del MVP</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <svg className="h-4 w-4 rounded-full bg-indigo-100 flex-shrink-0 mt-1.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.99 4.59-3.2 1.58 1.68 4.74L10 11.06l6.15 1.68L18.7 6.91l-4.56-3.09L12 2z"/>
                  </svg>
                  <span>Autenticación JWT</span>
                  <span className="ml-auto text-indigo-500 font-medium">✓</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 rounded-full bg-indigo-100 flex-shrink-0 mt-1.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.99 4.59-3.2 1.58 1.68 4.74L10 11.06l6.15 1.68L18.7 6.91l-4.56-3.09L12 2z"/>
                  </svg>
                  <span>Conciliación de Datos</span>
                  <span className="ml-auto text-indigo-500 font-medium">✓</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-4 w-4 rounded-full bg-indigo-100 flex-shrink-0 mt-1.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.99 4.59-3.2 1.58 1.68 4.74L10 11.06l6.15 1.68L18.7 6.91l-4.56-3.09L12 2z"/>
                  </svg>
                  <span>Frontend Next.js</span>
                  <span className="ml-auto text-indigo-500 font-medium">✓</span>
                </li>
              </ul>
            </div>

            <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-3xl border border-purple-200/50">
              <h3 className="font-semibold text-purple-600 mb-2">Herramientas Disponibles</h3>
              <p className="text-gray-600 text-sm">El sistema está listo para procesar:</p>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                <li>Cartola bancaria (CSV/Excel)</li>
                <li>Facturas SII (CSV)</li>
                <li>Cruce automático por RUT y monto</li>
                <li>Reporte de pagado/pendiente</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-indigo-200/20">
            <button
              onClick={handleLogout}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m7-4l-2 2m2 2l2 2m7-4l-2 2m2 2l2 2"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de login
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center border-indigo-200/50">
        <Image
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          className="mx-auto mb-6"
        />
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Sistema de Conciliación</h1>
        <p className="text-gray-600 mb-8">Automated bank reconciliation and invoice matching</p>
        
        <div className="space-y-4">
          <Link
            href="#"
            onClick={() => {
              // Simular login automático para demo
              localStorage.setItem("token", "mock-jwt-token");
              localStorage.setItem("user", "Administrador");
              setIsAuthenticated(true);
            }}
            className="group bg-indigo-600 text-white rounded-full px-6 py-3 text-lg font-medium transition-all hover:bg-indigo-700 shadow-lg"
          >
            Ingresar al Sistema
          </Link>
          
          <div className="flex items-center justify-center pt-4">
            <span className="text-gray-500 text-sm">Versión 1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}