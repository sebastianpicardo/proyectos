"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, Zap, Shield } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

declare global {
  interface Window {
    onHcaptchaLoad: () => void;
    hcaptcha: {
      render: (container: string, options: { sitekey: string; theme: string; size: string }) => number;
      getResponse: (widgetId: number) => string;
      reset: (widgetId: number) => void;
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loginWithGoogle, loading } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    hcaptchaToken: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [hcaptchaLoaded, setHcaptchaLoaded] = useState(false);
  const [hcaptchaWidgetId, setHcaptchaWidgetId] = useState<number | null>(null);

  // hCaptcha site key (use test key for development)
  const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

  useEffect(() => {
    // Define global callback BEFORE loading script
    window.onHcaptchaLoad = () => {
      setHcaptchaLoaded(true);
    };

    // Load hCaptcha script with explicit render and onload callback
    const script = document.createElement("script");
    script.src = `https://js.hcaptcha.com/1/api.js?render=explicit&onload=onHcaptchaLoad`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      window.onHcaptchaLoad = () => {};
    };
  }, []);

  useEffect(() => {
    // Render hCaptcha widget when loaded
    if (hcaptchaLoaded && window.hcaptcha && !hcaptchaWidgetId) {
      const widgetId = window.hcaptcha.render("hcaptcha-widget", {
        sitekey: HCAPTCHA_SITE_KEY,
        theme: "dark",
        size: "normal",
      });
      setHcaptchaWidgetId(widgetId);
    }
  }, [hcaptchaLoaded, hcaptchaWidgetId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (isRegister && !formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    
    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    // Check hCaptcha
    if (!formData.hcaptchaToken) {
      newErrors.hcaptcha = "Por favor completa el CAPTCHA";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    // Get hCaptcha token
    if (window.hcaptcha && hcaptchaWidgetId !== null) {
      const token = window.hcaptcha.getResponse(hcaptchaWidgetId);
      setFormData(prev => ({ ...prev, hcaptchaToken: token }));
    }
    
    if (!validateForm()) return;
    
    setSubmitLoading(true);
    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.hcaptchaToken);
      } else {
        await login(formData.email, formData.password, formData.hcaptchaToken);
      }
    } catch (err: any) {
      setGeneralError(err.message || "Error en la autenticación");
      // Reset hCaptcha on error
      if (window.hcaptcha && hcaptchaWidgetId !== null) {
        window.hcaptcha.reset(hcaptchaWidgetId);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError("");
    setSubmitLoading(true);
    try {
      // Get hCaptcha token for Google login
      let token = "";
      if (window.hcaptcha && hcaptchaWidgetId !== null) {
        token = window.hcaptcha.getResponse(hcaptchaWidgetId);
        // In development with test key, token might be empty - allow it
        const isDev = process.env.NODE_ENV === "development" || window.location.hostname === "localhost";
        if (!token && !isDev) {
          setGeneralError("Por favor completa el CAPTCHA");
          setSubmitLoading(false);
          return;
        }
      }
      await loginWithGoogle(token);
    } catch (err: any) {
      setGeneralError(err.message || "Error con Google");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/25">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </h1>
            <p className="text-slate-300">
              {isRegister 
                ? "Únete a Conciliador Pro y automatiza tu conciliación bancaria"
                : "Accede a tu panel de conciliación inteligente"}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex mb-6 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => { setIsRegister(false); setGeneralError(""); setErrors({}); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isRegister 
                  ? "bg-white text-slate-900 shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => { setIsRegister(true); setGeneralError(""); setErrors({}); }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isRegister 
                  ? "bg-white text-slate-900 shadow-lg" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Error */}
          {generalError && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {generalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.name ? "border-red-500/50" : "border-white/20"
                    }`}
                    disabled={submitLoading}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.email ? "border-red-500/50" : "border-white/20"
                  }`}
                  disabled={submitLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                    errors.password ? "border-red-500/50" : "border-white/20"
                  }`}
                  disabled={submitLoading}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? "border-red-500/50" : "border-white/20"
                    }`}
                    disabled={submitLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* hCaptcha Widget */}
            <div className="pt-2">
              <div id="hcaptcha-widget" className="flex justify-center" />
              {errors.hcaptcha && (
                <p className="text-red-400 text-xs mt-1 text-center">{errors.hcaptcha}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitLoading || loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
            >
              {submitLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-500">O continuar con</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            id="google-btn"
            onClick={handleGoogleLogin}
            disabled={submitLoading || loading || (process.env.NODE_ENV === "production" && !hcaptchaLoaded)}
            className="w-full py-3 px-6 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {process.env.NODE_ENV === "production" && !hcaptchaLoaded && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando seguridad...
              </>
            )}
            {!(!hcaptchaLoaded && process.env.NODE_ENV === "production") && (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A5F3" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          {isRegister 
            ? "¿Ya tienes cuenta? " 
            : "¿No tienes cuenta? "}
          <button
            onClick={() => { setIsRegister(!isRegister); setGeneralError(""); setErrors({}); }}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {isRegister ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </p>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-xs text-slate-400">Precisión</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{"<1s"}</p>
            <p className="text-xs text-slate-400">Procesamiento</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">24/7</p>
            <p className="text-xs text-slate-400">Disponible</p>
          </div>
        </div>
        
        {/* Security Badge */}
        <div className="mt-6 text-center">
          <Shield className="w-5 h-5 text-slate-500 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Protegido por hCaptcha Enterprise</p>
        </div>
      </div>
    </div>
  );
}