"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { XPGamification } from "@/components/XPGamification";
import { User, Mail, Lock, Bell, Shield, Palette, Globe, Moon, Sun, Save, Loader2, CheckCircle, Camera, Building, Monitor, Key, Plus, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "appearance" | "integrations">("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailNewInvoice: true,
    emailConciliationComplete: true,
    emailOverdueAlert: true,
    emailWeeklyReport: false,
    pushNewInvoice: true,
    pushConciliationComplete: false,
    pushOverdueAlert: true,
  });

  // Security
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
    apiKeys: [] as string[],
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: "system" as "light" | "dark" | "system",
    density: "comfortable" as "compact" | "comfortable" | "spacious",
    language: "es-CL",
    dateFormat: "DD/MM/YYYY",
    currency: "CLP",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      const parsed = JSON.parse(userData);
      setIsAuthenticated(true);
      setProfile({
        name: parsed.name || "",
        email: parsed.email || "",
        company: "Mi Empresa SpA",
        phone: "+56 9 1234 5678",
        address: "Av. Providencia 1234, Santiago",
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    
    if (section === "profile" && user) {
      updateUser({ name: profile.name, email: profile.email });
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    if (section === "profile") {
      setProfile(prev => ({ ...prev, [field]: value }));
    } else if (section === "notifications") {
      setNotifications(prev => ({ ...prev, [field]: value }));
    } else if (section === "security") {
      setSecurity(prev => ({ ...prev, [field]: value }));
    } else if (section === "appearance") {
      setAppearance(prev => ({ ...prev, [field]: value }));
    }
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "appearance", label: "Apariencia", icon: Palette },
    { id: "integrations", label: "Integraciones", icon: Globe },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={`
        lg:ml-64 transition-all duration-300
        ${sidebarCollapsed ? "lg:ml-16" : ""}
      `}>
        <Header user={user!} onLogout={handleLogout} onNavigate={handleNavigate} />

        <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen">
          <div className="animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Configuración</h1>
            <p className="text-slate-500 mt-1">Personaliza tu cuenta y preferencias</p>
          </div>

          <XPGamification user={user!} onClose={() => setShowXPModal(false)} compact />

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 overflow-x-auto">
              <nav className="flex gap-1 p-1" aria-label="Configuración">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-600 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={(e) => { e.preventDefault(); handleSave("profile"); }} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                        {profile.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Foto de perfil</h3>
                      <p className="text-sm text-slate-500">JPG, PNG hasta 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={profile.name} onChange={(e) => handleInputChange("profile", "name", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Juan Pérez" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="email" value={profile.email} onChange={(e) => handleInputChange("profile", "email", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="tu@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Empresa</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={profile.company} onChange={(e) => handleInputChange("profile", "company", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Mi Empresa SpA" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="tel" value={profile.phone} onChange={(e) => handleInputChange("profile", "phone", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="+56 9 1234 5678" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" value={profile.address} onChange={(e) => handleInputChange("profile", "address", e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Av. Providencia 1234, Santiago" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                    <button type="button" onClick={handleLogout} className="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors">
                      Cerrar Sesión
                    </button>
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <Save className="w-4 h-4" /> Guardar Cambios </>}
                    </button>
                  </div>

                  {saved && (
                    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
                      <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>Perfil actualizado correctamente</span>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">Preferencias de Email</h3>
                  <div className="space-y-4">
                    {[
                      { key: "emailNewInvoice", label: "Nuevas facturas recibidas", desc: "Recibe notificación cuando se suban nuevas facturas al sistema" },
                      { key: "emailConciliationComplete", label: "Conciliación completada", desc: "Aviso cuando finalice una conciliación automática" },
                      { key: "emailOverdueAlert", label: "Alertas de morosidad", desc: "Notificación cuando un cliente supere los 30 días de mora" },
                      { key: "emailWeeklyReport", label: "Reporte semanal", desc: "Resumen semanal de conciliaciones y métricas clave" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(e) => handleInputChange("notifications", item.key, e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mt-8">Notificaciones Push (Navegador)</h3>
                  <div className="space-y-4">
                    {[
                      { key: "pushNewInvoice", label: "Nuevas facturas", desc: "Notificación instantánea al recibir facturas" },
                      { key: "pushConciliationComplete", label: "Conciliación lista", desc: "Aviso cuando termine el procesamiento" },
                      { key: "pushOverdueAlert", label: "Alertas urgentes", desc: "Notificación inmediata para morosidad crítica" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={notifications[item.key as keyof typeof notifications]} onChange={(e) => handleInputChange("notifications", item.key, e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:after:border-white peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button onClick={() => handleSave("notifications")} disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <Save className="w-4 h-4" /> Guardar </>}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Shield className="w-5 h-5" /> Autenticación de Dos Factores (2FA)</h3>
                    <p className="text-sm text-slate-500 mt-1">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Autenticación 2FA</p>
                        <p className="text-sm text-slate-500">Requerir código de autenticación al iniciar sesión</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={security.twoFactor} onChange={(e) => handleInputChange("security", "twoFactor", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Alertas de inicio de sesión</p>
                        <p className="text-sm text-slate-500">Recibir email cuando se detecte un nuevo inicio de sesión</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={security.loginAlerts} onChange={(e) => handleInputChange("security", "loginAlerts", e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-900">Tiempo de expiración de sesión</p>
                        <p className="text-sm text-slate-500">Cerrar sesión automáticamente tras inactividad</p>
                      </div>
                      <select value={security.sessionTimeout} onChange={(e) => handleInputChange("security", "sessionTimeout", parseInt(e.target.value))} className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value={15}>15 minutos</option>
                        <option value={30}>30 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={120}>2 horas</option>
                        <option value={480}>8 horas</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Key className="w-5 h-5" /> Claves API</h3>
                    <p className="text-sm text-slate-500 mt-1">Gestiona tus claves de acceso para integraciones</p>
                  </div>
                  <div className="space-y-3">
                    {security.apiKeys.map((key, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Key className="w-5 h-5" /></div>
                          <div>
                            <p className="font-medium text-slate-900">API Key #{i + 1}</p>
                            <p className="text-sm text-slate-500 font-mono">{key.slice(0, 12)}••••••••</p>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-red-600">Revocar</button>
                      </div>
                    ))}
                    <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Generar Nueva API Key
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-4">Cambiar Contraseña</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña actual</label><input type="password" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" /></div>
                      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Nueva contraseña</label><input type="password" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" /></div>
                      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar contraseña</label><input type="password" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" /></div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Actualizar Contraseña</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Tema</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "light", label: "Claro", icon: Sun, desc: "Siempre modo claro" },
                        { value: "dark", label: "Oscuro", icon: Moon, desc: "Siempre modo oscuro" },
                        { value: "system", label: "Sistema", icon: Monitor, desc: "Seguir preferencia del SO" },
                      ].map((theme) => (
                        <button key={theme.value} onClick={() => handleInputChange("appearance", "theme", theme.value)} className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${appearance.theme === theme.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}>
                          <theme.icon className={`w-6 h-6 ${appearance.theme === theme.value ? "text-indigo-600" : "text-slate-400"}`} />
                          <span className="font-medium text-slate-900">{theme.label}</span>
                          <span className="text-xs text-slate-500">{theme.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 mb-4">Densidad de Interfaz</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "compact", label: "Compacta", desc: "Más información en pantalla" },
                        { value: "comfortable", label: "Confortable", desc: "Equilibrio recomendado" },
                        { value: "spacious", label: "Espaciosa", desc: "Más espacio visual" },
                      ].map((density) => (
                        <button key={density.value} onClick={() => handleInputChange("appearance", "density", density.value)} className={`p-4 rounded-xl border-2 transition-all text-left ${appearance.density === density.value ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"}`}>
                          <p className="font-medium text-slate-900">{density.label}</p>
                          <p className="text-sm text-slate-500">{density.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Idioma</label>
                      <select value={appearance.language} onChange={(e) => handleInputChange("appearance", "language", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="es-CL">Español (Chile)</option>
                        <option value="es-ES">Español (España)</option>
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Formato de Fecha</label>
                      <select value={appearance.dateFormat} onChange={(e) => handleInputChange("appearance", "dateFormat", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Moneda</label>
                      <select value={appearance.currency} onChange={(e) => handleInputChange("appearance", "currency", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="CLP">CLP - Peso Chileno ($)</option>
                        <option value="USD">USD - Dólar Americano ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="UF">UF - Unidad de Fomento</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Zona Horaria</label>
                      <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="America/Santiago">America/Santiago (GMT-3)</option>
                        <option value="America/Punta_Arenas">America/Punta_Arenas (GMT-3)</option>
                        <option value="UTC">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-200">
                    <button onClick={() => handleSave("appearance")} disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <Save className="w-4 h-4" /> Guardar </>}
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === "integrations" && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-slate-900">Integraciones Disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: "Banco de Chile", desc: "Conexión directa para descarga automática de cartolas", status: "connected", color: "bg-blue-100 text-blue-700" },
                      { name: "Banco Santander", desc: "API oficial para movimientos bancarios", status: "available", color: "bg-slate-100 text-slate-700" },
                      { name: "BCI", desc: "Integración para cartolas empresariales", status: "available", color: "bg-slate-100 text-slate-700" },
                      { name: "SII", desc: "Registro de Ventas y Facturación Electrónica", status: "connected", color: "bg-green-100 text-green-700" },
                      { name: "ChileCompra", desc: "Marketplace público para proveedores del Estado", status: "available", color: "bg-slate-100 text-slate-700" },
                      { name: "ERP Contable", desc: "Exportación automática a tu software contable", status: "beta", color: "bg-amber-100 text-amber-700" },
                    ].map((integration) => (
                      <div key={integration.name} className="p-4 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{integration.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{integration.desc}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${integration.color}`}>
                            {integration.status === "connected" ? "Conectado" : integration.status === "available" ? "Disponible" : "Beta"}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          {integration.status === "connected" ? (
                            <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">Desconectar</button>
                          ) : (
                            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Conectar</button>
                          )}
                          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50">Configurar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}