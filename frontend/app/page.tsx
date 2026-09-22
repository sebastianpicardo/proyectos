"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConciliacionDashboard from "./conciliacion/page";

const AUTHORIZED_EMAILS = [
  "seba@empresa.com",
  "admin@test.com",
  "usuario@dominio.com",
];

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error("Email vacío", { description: "Por favor ingresa tu email institucional" });
      return;
    }

    if (AUTHORIZED_EMAILS.includes(trimmedEmail)) {
      localStorage.setItem("token", "mock-jwt-token-" + trimmedEmail);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: trimmedEmail.split("@")[0].toUpperCase(),
          email: trimmedEmail,
          level: 1,
          points: 0,
          consecutiveDays: 0,
        }),
      );
      setShowLogin(false);
      router.push("/conciliacion");
    } else {
      toast.error("No autorizado", {
        description: "Tu email no está en la lista blanca de usuarios permitidos",
      });
    }
  };

  useEffect(() => {
    // Verificar si ya hay sesión activa al cargar
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      // Usuario ya autenticado, redirigir al dashboard
      setShowLogin(false);
      router.push("/conciliacion");
    } else {
      // No hay sesión, mostrar login (por defecto)
      setShowLogin(true);
    }
  }, [router]);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
            Inicio de Sesión
          </h2>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-muted/60">
                Email institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-border px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="tu@email.com"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded bg-primary py-3 px-4 font-medium text-primary-foreground hover:bg-primary/10 transition-colors mt-4"
            >
              Acceder al Sistema
            </button>
          </form>
          <p className="text-center mt-6 text-muted/60 text-xs">
            ¿No tienes una cuenta?{" "}
          </p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, renderizar el dashboard
  return <ConciliacionDashboard />;
}