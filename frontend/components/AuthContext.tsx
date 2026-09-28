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
    hcaptcha: {
      render: (container: string, options: { sitekey: string; theme: string; size: string }) => number;
      getResponse: (widgetId: number) => string;
      reset: (widgetId: number) => void;
    };
    hcaptchaLoaded: boolean;
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
  isSuperAdmin?: boolean;
  hasProfile?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<void>;
  register: (name: string, email: string, password: string, captchaToken?: string) => Promise<void>;
  loginWithGoogle: (captchaToken?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkProfile: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "629871162355-6t58ueo0l0825hlikqi6tub2p0fa02em.apps.googleusercontent.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://marketingos-fy99.onrender.com";
const SUPER_ADMIN_EMAIL = "sebastian.picardo@gmail.com";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure isSuperAdmin is set correctly based on email
        parsed.isSuperAdmin = parsed.email === SUPER_ADMIN_EMAIL;
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const saveUser = (newUser: User) => {
    // Ensure isSuperAdmin is always based on email
    newUser.isSuperAdmin = newUser.email === SUPER_ADMIN_EMAIL;
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("token", "mock-jwt-token");
  };

  const checkProfile = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.hasProfile) {
          saveUser({ ...user, hasProfile: true });
          return true;
        }
      }
    } catch {
      // Fallback to localStorage
    }
    return false;
  };

  const login = async (email: string, password: string, captchaToken?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });

      if (response.ok) {
        const data = await response.json();
        saveUser(data.user);
        // Check profile after login
        const hasProfile = await checkProfile();
        if (!hasProfile && !user?.isSuperAdmin) {
          router.push("/planes");
        } else {
          router.push("/conciliacion");
        }
        return;
      }
      const error = await response.json();
      throw new Error(error.message || "Credenciales inválidas");
    } catch (err) {
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, captchaToken?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, captchaToken }),
      });

      if (response.ok) {
        const data = await response.json();
        saveUser(data.user);
        router.push("/planes");
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
          isSuperAdmin: email === SUPER_ADMIN_EMAIL,
          hasProfile: false,
        };
        saveUser(newUser);
        router.push("/planes");
      } else {
        throw new Error("Error al registrar");
      }
    }
  };

  const loginWithGoogle = async (captchaToken?: string) => {
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

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              const res = await fetch(`${API_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: response.credential, captchaToken }),
              });

              if (res.ok) {
                const data = await res.json();
                saveUser(data.user);
                const hasProfile = await checkProfile();
                if (!hasProfile && !data.user.isSuperAdmin) {
                  router.push("/planes");
                } else {
                  router.push("/conciliacion");
                }
              } else {
                throw new Error("Error en autenticación Google");
              }
            } catch (err) {
              // Mock Google login for demo (only super admin)
              const mockUser: User = {
                id: `google_${Date.now()}`,
                name: "Sebastián Picardo",
                email: SUPER_ADMIN_EMAIL,
                avatar: "https://lh3.googleusercontent.com/placeholder",
                level: 1,
                points: 0,
                consecutiveDays: 0,
                provider: "google",
                isSuperAdmin: true,
                hasProfile: false,
              };
              saveUser(mockUser);
              router.push("/planes");
            }
          },
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
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
      // Ensure isSuperAdmin is always based on email
      updated.isSuperAdmin = updated.email === SUPER_ADMIN_EMAIL;
      saveUser(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout, updateUser, checkProfile }}>
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