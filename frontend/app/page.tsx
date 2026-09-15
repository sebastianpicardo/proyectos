"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userLevel, setUserLevel] = useState(1);
  const [userPoints, setUserPoints] = useState(0);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState<"dashboard" | "conciliacion" | "profile" | "ranking" | "settings">("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsed = JSON.parse(userData);
      setIsAuthenticated(true);
      setUserName(parsed.name || "Usuario");
      setUserLevel(parsed.level || 1);
      setUserPoints(parsed.points || 0);
      setConsecutiveDays(parsed.consecutiveDays || 0);
    }
  }, []);

  const pointsForNextLevel = userLevel * 100;
  const progress = userPoints % 100;
  const progressPercentage = (progress / 100) * 100;
  const levelLabel =
    userLevel >= 5
      ? "Maestro"
      : userLevel >= 3
      ? "Avanzado"
      : userLevel >= 2
      ? "Intermedio"
      : "Principiante";

  const menuItems = [
    { name: "Perfil", href: "/profile" },
    { name: "Configuración", href: "/settings" },
    { name: "Progreso y Rangos", href: "/ranking" },
  ];

  const handleLogin = () => {
    localStorage.setItem("token", "mock-jwt-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Administrador",
        email: "admin@test.com",
        level: 1,
        points: 0,
        consecutiveDays: 0,
      })
    );
    setIsAuthenticated(true);
    setUserName("Administrador");
    setUserLevel(1);
    setUserPoints(0);
    setConsecutiveDays(0);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUserName("");
    setUserLevel(1);
    setUserPoints(0);
    setConsecutiveDays(0);
    router.push("/");
  };

  const incrementPoints = (amount: number = 1) => {
    setUserPoints((prev) => prev + amount);
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastActivityDate");
    if (lastDate !== today) {
      const newConsecutive = consecutiveDays + 1;
      setConsecutiveDays(newConsecutive);
      localStorage.setItem("lastActivityDate", today);
      if (newConsecutive >= 1) {
        setUserPoints((prev) => prev + 2);
      }
    }
  };

  // Renderizar items del menú como variable fuera del JSX
  const menuElements = menuItems.map((item, index) => {
    const isProfile = isAuthenticated && item.name === "Perfil";
    const itemStyle = {
      padding: "0.75rem 1rem",
      borderRadius: "6px",
      color: isAuthenticated ? "#1e2341" : "#4a5568",
      cursor: "pointer",
      transition: "background 0.2s",
      marginBottom: "0.25rem",
      fontSize: "0.875rem",
      fontWeight: isProfile ? "500" : "400",
    };
    const handleClick = () => {
      setMenuOpen(false);
      if (item.href) router.push(item.href);
    };
    return <div key={index} style={itemStyle} onClick={handleClick}>{item.name}</div>;
  });

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif" }}>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: isAuthenticated ? "#fff" : "#6366f1",
          padding: "1rem 2rem",
          borderBottom: isAuthenticated ? "1px solid #e2e8f0" : "none",
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

        {menuOpen && (
          <div style={{
            position: "absolute", top: "100%", right: 0,
            background: "white", padding: "1rem", borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: "140px",
            marginTop: "4px", marginBottom: "1rem"
          }}>
            {menuElements}
          </div>
        )}
      </header>

      <main
        style={{
          marginTop: isAuthenticated ? "80px" : 0,
          padding: "2rem",
          minHeight: "calc(100vh - 80px)",
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

            {/* Progress Bar */}
            <div style={{ background: "#f1f5f9", borderRadius: "999px", height: "8px", overflow: "hidden", marginBottom: "1.5rem" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  background: "#3b82f6",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {/* Level Info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Nivel {userLevel}</span>
              <span style={{ color: "#1e2341", fontWeight: "600", fontSize: "0.875rem" }}>
                {getLevelLabel(userLevel)} ({progress} / 100 pts)
              </span>
            </div>

            {/* Conciliation Form */}
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
              <h3 style={{ color: "#1e2341", marginBottom: "1rem", fontSize: "1.25rem" }}>
                Conciliación de Datos
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ background: "#f8f9fa", borderRadius: 6, padding: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#3b82f6" }}>125450</div>
                  <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Total Facturado</div>
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

              <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem" }}>
                Arrastra y suelta tus archivos CSV o haz clic para upload.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <button
                  style={{
                    background: "#3b82f6", color: "white", padding: "0.75rem",
                    borderRadius: 6, fontSize: "0.875rem", fontWeight: "500", border: "none",
                    cursor: "pointer", transition: "background 0.2s"
                  }}
                  onClick={() => {
                    incrementPoints(5);
                    alert("Función: Subir Cartola Bancaria CSV - Próximamente con integración real")
                  }}
                >
                  Subir Cartola Bancaria
                </button>
                <button
                  style={{
                    background: "#10b981", color: "white", padding: "0.75rem",
                    borderRadius: 6, fontSize: "0.875rem", fontWeight: "500", border: "none",
                    cursor: "pointer", transition: "background 0.2s"
                  }}
                  onClick={() => {
                    incrementPoints(5);
                    alert("Función: Subir Facturas SII CSV - Próximamente con integración real")
                  }}
                >
                  Subir Facturas SII
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <button
                style={{
                  background: "#f3f4f6", color: "#1e2341", padding: "0.75rem",
                  borderRadius: 6, fontSize: "0.875rem", fontWeight: "500", border: "none",
                  cursor: "pointer", width: "100%"
                }}
                onClick={() => setView("profile")}
              >
                Perfil de Usuario
              </button>
              <button
                style={{
                  background: "#f3f4f6", color: "#1e2341", padding: "0.75rem",
                  borderRadius: 6, fontSize: "0.875rem", fontWeight: "500", border: "none",
                  cursor: "pointer", width: "100%"
                }}
                onClick={() => setView("ranking")}
              >
                Mi Progreso
              </button>
            </div>

            {/* Sistema de Rangos Visual */}
            <div style={{ background: "#fff", padding: "2rem", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginTop: "2rem" }}>
              <h4 style={{ color: "#1e2341", marginBottom: "1rem", fontSize: "1rem" }}>
                Sistema de Rangos tipo Duolingo
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
                {[1, 2, 3, 4, 5].map((level) => {
                  const isCurrent = level === userLevel;
                  const label = level === 1 ? "Principiante" : level === 2 ? "Intermedio" : level === 3 ? "Avanzado" : level === 4 ? "Experto" : "Maestro";
                  const minPts = (level - 1) * 100;
                  const maxPts = level * 100 - 1;
                  return (
                    <div
                      style={{
                        height: "30px",
                        borderRadius: "4px",
                        background: isCurrent ? "#3b82f6" : "#e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isCurrent ? "white" : "#64748b", fontSize: "0.65rem",
                      }}
                    >
                      {isCurrent ? label : `${minPts}-${maxPts} pts`}
                    </div>
                  );
                })}
              </div>

              <div>
                <div style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                  Puntos actuales: <strong style={{ color: "#1e2341" }}>{userPoints}</strong>
                </div>
                <div>
                  {userPoints >= 1000 && (
                    <span style={{ color: "#f59e0b", fontWeight: "bold", fontSize: "0.875rem" }}>
                      ¡Felicidades! Has alcanzado el Nivel Máximo ⭐
                    </span>
                  )}
                  {userPoints < 1000 && (
                    <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
                      {1000 - userPoints} pts para Nivel Máximo
                    </span>
                  )}
                </div>
              </div>
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

function getLevelLabel(level: number) {
  if (level >= 5) return "Maestro";
  if (level >= 3) return "Avanzado";
  if (level >= 2) return "Intermedio";
  return "Principiante";
}