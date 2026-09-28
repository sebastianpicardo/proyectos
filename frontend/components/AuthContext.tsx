"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: (callback: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: string }) => void;
        };
      };
    };
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  points: number;
  consecutiveDays: number;
  provider: "email" | "google";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GOOGLE_CLIENT_ID = "154471456297-e6smfhb4e2u5imvmt8rhqqa7d0hcubo2.apps.googleusercontent.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://marketingos-fy99.onrender.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const saveUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", "mock-jwt-token");
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Try backend API first
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        saveUser(data.user);
        router.push("/conciliacion");
        return;
      }
    } catch {
      // Fallback to local mock
    }

    // Mock login for demo
    if (email && password.length >= 6) {
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: email.split("@")[0],
        email,
        level: 1,
        points: 0,
        consecutiveDays: 0,
        provider: "email",
      };
      saveUser(newUser);
      router.push("/conciliacion");
    } else {
      throw new Error("Credenciales inválidas");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        saveUser(data.user);
        router.push("/conciliacion");
        return;
      }
      const error = await response.json();
      throw new Error(error.message || "Error al registrar");
    } catch (err) {
      // Mock register for demo
      if (name && email && password.length >= 6) {
        const newUser: User = {
          id: `user_${Date.now()}`,
          name,
          email,
          level: 1,
          points: 0,
          consecutiveDays: 0,
          provider: "email",
        };
        saveUser(newUser);
        router.push("/conciliacion");
      } else {
        throw new Error("Datos inválidos");
      }
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Load Google Identity Services
      if (typeof window !== "undefined" && !window.google) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
          document.head.appendChild(script);
        });
      }

      // Initialize Google Identity Services
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              // Send credential to backend
              const res = await fetch(`${API_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential }),
              });

              if (res.ok) {
                const data = await res.json();
                saveUser(data.user);
                router.push("/conciliacion");
              } else {
                throw new Error("Error en autenticación Google");
              }
            } catch (err) {
              // Mock Google login for demo
              const mockUser: User = {
                id: `google_${Date.now()}`,
                name: "Usuario Google",
                email: "usuario@gmail.com",
                avatar: "https://lh3.googleusercontent.com/placeholder",
                level: 1,
                points: 0,
                consecutiveDays: 0,
                provider: "google",
              };
              saveUser(mockUser);
              router.push("/conciliacion");
            }
          },
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup if prompt doesn't work
            window.google.accounts.id.renderButton(
              document.getElementById("google-btn")!,
              { theme: "outline", size: "large", width: "100%" }
            );
          }
        });
      }
    } catch (err) {
      console.error("Google login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      saveUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}