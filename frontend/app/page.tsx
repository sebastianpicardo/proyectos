"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsed = JSON.parse(userData);
      setIsAuthenticated(true);
      setUserName(parsed.name || "Usuario");
      setUserLevel(parsed.level || 1);
      setUserPoints(parsed.points || 0);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("token", "mock-jwt-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Administrador",
        email: "admin@test.com",
        level: 1,
        points: 0,
      })
    );
    setIsAuthenticated(true);
    setUserName("Administrador");
    setUserLevel(1);
    setUserPoints(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserName("");
    setUserLevel(1);
    setUserPoints(0);
    router.push("/");
  };

  const menuItems = [
    { name: "Perfil", href: "/profile" },
    { name: "Configuración", href: "/settings" },
    { name: "Progreso y Rangos", href: "/ranking" },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
          background: isAuthenticated ? "#fff" : "#6366f1",
          padding: "1rem 2rem", borderBottom: isAuthenticated ? "1px solid #e2e8f0" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "40px", height: "40px",
              background: isAuthenticated ? "#1e293b" : "#fff",
              borderRadius: "6px", color: isAuthenticated ? "#fff" : "#1e293b",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "bold", fontSize: "1.2rem"
            }}>
              {isAuthenticated ? "A" : "S"}
            </div>
            <div>
              {isAuthenticated ? (
                "Bienvenido"
              ) : (
                "Invitado"
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: 8, cursor: "pointer", color: "#64748b",
                border: "none", background: "none"
              }}
            >
              {menuOpen ? "▲" : "▼"}
            </button>
          </div>
        </div>
      </header>

      <main
        style={{
          marginTop: isAuthenticated ? "80px" : 0,
          padding: "2rem",
        }}
      >
        {isAuthenticated ? (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ color: "#1e2341", marginBottom: "1.5rem" }}>
              ¡Hola, <strong>{userName}</strong>!
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>
              Sube archivos CSV para comenzar la conciliación automática mediante coincidencia de RUT y monto.
            </p>
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h3 style={{ color: "#1e2341", marginBottom: "1rem", fontSize: "1.25rem" }}>
                Resumen del MVP
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ background: "#f8f9fa", borderRadius: 6, padding: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>125450</div>
                  <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Total</div>
                </div>
                <div style={{ background: "#f8f9fa", borderRadius: 6, padding: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#10b981" }}>89200</div>
                  <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Pagado</div>
                </div>
                <div style={{ background: "#f8f9fa", borderRadius: 6, padding: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b" }}>36250</div>
                  <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Pendientes</div>
                </div>
              </div>
              <p style={{ marginTop: "1rem", color: "#64748b", fontSize: "0.875rem" }}>
                El sistema está listo para procesar cartolas bancarias y facturas SII.
              </p>
            </div>
            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8f9fa", borderRadius: 6 }}>
              <h4 style={{ color: "#1e2341", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                Herramientas Disponibles
              </h4>
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
                El sistema está listo para procesar cartolas bancarias y facturas SII.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <h2 style={{ color: "white", marginBottom: "1rem" }}>Sistema de Conciliación</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.2rem" }}>
              Inicia sesión para acceder al panel completo
            </p>
            <button
              onClick={() => handleLogin()}
              style={{
                background: "white", color: "#1e2341", padding: "1rem 2rem",
                borderRadius: 6, fontWeight: "600", fontSize: "1rem",
                transition: "background 0.2s", cursor: "pointer"
              }}
            >
              Ingresar al Sistema
            </button>
          </div>
        )}
      </main>
    </div>
  );
}