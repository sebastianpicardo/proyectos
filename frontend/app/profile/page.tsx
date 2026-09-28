"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { XPGamification } from "@/components/XPGamification";
import { User, Mail, Lock, Calendar, Star, Flame, Trophy, Award, Target, Sparkles, Edit2, Save, Loader2, CheckCircle, ArrowLeft, Camera, Building, TrendingDown, Settings, Plus, Search, Filter, Download, Eye, Phone, MapPin, TrendingUp, DollarSign, AlertTriangle, Zap, Crown, FileText, AlertCircle, TrendingDown as TrendingDownIcon } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

const levelData = [
  { level: 1, name: "Novato", title: "Principiante", color: "from-slate-400 to-slate-500", xp: 0 },
  { level: 2, name: "Aprendiz", title: "Intermedio", color: "from-blue-400 to-blue-500", xp: 100 },
  { level: 3, name: "Analista", title: "Analista Junior", color: "from-green-400 to-green-500", xp: 250 },
  { level: 4, name: "Senior", title: "Analista Senior", color: "from-purple-400 to-purple-500", xp: 500 },
  { level: 5, name: "Experto", title: "Experto", color: "from-orange-400 to-orange-500", xp: 1000 },
  { level: 6, name: "Maestro", title: "Maestro Conciliador", color: "from-yellow-400 via-orange-500 to-red-500", xp: 2000 },
];

const achievements = [
  { id: "first_upload", name: "Primera Carga", description: "Sube tu primera cartola bancaria", icon: "📤", unlocked: false },
  { id: "streak_7", name: "Semana Perfecta", description: "7 días consecutivos usando el sistema", icon: "🔥", unlocked: false, progress: 0, target: 7 },
  { id: "reconcile_100", name: "Centurión", description: "Concilia 100 facturas exitosamente", icon: "✅", unlocked: false, progress: 0, target: 100 },
  { id: "level_5", name: "Experto Financiero", description: "Alcanza el nivel Experto", icon: "🏆", unlocked: false },
  { id: "perfect_month", name: "Mes Perfecto", description: "30 días sin errores de conciliación", icon: "📅", unlocked: false, progress: 0, target: 30 },
  { id: "master", name: "Maestro Conciliador", description: "Alcanza el nivel Máster (2000 XP)", icon: "👑", unlocked: false },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showXPModal, setShowXPModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "progress" | "achievements" | "settings">("overview");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: "",
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

  const formatCLP = (value: number) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(value);

  const currentLevel = levelData.find(l => l.level === user?.level) || levelData[0];
  const nextLevel = levelData.find(l => l.level === (user?.level || 1) + 1) || levelData[levelData.length - 1];
  const xpInCurrentLevel = (user?.points || 0) - currentLevel.xp;
  const xpNeededForNext = nextLevel.xp - currentLevel.xp;
  const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);

  const updatedAchievements = achievements.map(a => {
    if (a.id === "streak_7") return { ...a, unlocked: (user?.consecutiveDays || 0) >= 7, progress: Math.min(user?.consecutiveDays || 0, 7) };
    if (a.id === "level_5") return { ...a, unlocked: (user?.level || 0) >= 5 };
    if (a.id === "master") return { ...a, unlocked: (user?.level || 0) >= 6 };
    return a;
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
    if (user) {
      updateUser({ name: profile.name, email: profile.email });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

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
          {/* Back Button */}
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 lg:p-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center border-4 border-white/30">
                      {editing ? (
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { /* handle avatar upload */ }} />
                      ) : (
                        <span className="text-4xl font-bold text-white">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                      )}
                    </div>
                    {editing && (
                      <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center cursor-pointer hover:bg-indigo-600 transition-colors">
                        <Camera className="w-4 h-4" />
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                      </label>
                    )}
                  </div>
                  <div>
                    {editing ? (
                      <div className="flex items-center gap-4">
                        <input type="text" value={profile.name} onChange={(e) => handleInputChange("name", e.target.value)} className="text-3xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 w-auto" />
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${currentLevel.color} text-white`}>
                          {currentLevel.title}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${currentLevel.color} text-white`}>
                          {currentLevel.title}
                        </span>
                      </div>
                    )}
                    <p className="text-indigo-100 mt-1">{user?.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-indigo-200">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Miembro desde Enero 2024</span>
                      <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {profile.company}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {editing ? (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(false); setSaved(false); }} className="px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors">Cancelar</button>
                      <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-white text-indigo-600 rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <Save className="w-4 h-4" /> Guardar </>}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setEditing(true)} className="px-4 py-2 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center gap-2">
                      <Edit2 className="w-4 h-4" /> Editar Perfil
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300 font-medium">Nivel {currentLevel.level}</span>
                <span className="text-white font-semibold">{xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-indigo-100">
                <span>{currentLevel.name}</span>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-300" />
                  <span>{user?.points?.toLocaleString() || 0} XP total</span>
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span>{user?.consecutiveDays || 0} días racha</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 overflow-x-auto">
              <nav className="flex gap-1 p-1" aria-label="Perfil">
                {[
                  { id: "overview", label: "Resumen", icon: User },
                  { id: "progress", label: "Progreso", icon: Target },
                  { id: "achievements", label: "Logros", icon: Trophy },
                  { id: "settings", label: "Configuración", icon: Settings },
                ].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6 lg:p-8">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard title="Total Facturado" value={formatCLP(125450000)} icon={<DollarSign className="w-6 h-6" />} iconBg="bg-green-100" iconColor="text-green-600" trend={{ value: "+12.5%", label: "vs mes anterior", positive: true }} />
                    <MetricCard title="Conciliado" value="71%" icon={<CheckCircle className="w-6 h-6" />} iconBg="bg-blue-100" iconColor="text-blue-600" progress={{ current: 89200000, total: 125450000, label: "Facturas conciliadas" }} />
                    <MetricCard title="Pendientes" value={formatCLP(36250000)} icon={<AlertTriangle className="w-6 h-6" />} iconBg="bg-amber-100" iconColor="text-amber-600" />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> Estadísticas de Actividad</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="Conciliaciones realizadas" value="47" icon={CheckCircle} color="text-green-500 bg-green-50" />
                      <StatCard label="Facturas procesadas" value="1,247" icon={FileText} color="text-blue-500 bg-blue-50" />
                      <StatCard label="Días consecutivos" value={`${user?.consecutiveDays || 0}`} icon={Flame} color="text-orange-500 bg-orange-50" />
                      <StatCard label="Tiempo ahorrado" value="~47h" icon={Zap} color="text-purple-500 bg-purple-50" />
                    </div>
                  </div>

                  {editing && (
                    <div className="space-y-6">
                      <h3 className="font-semibold text-slate-900">Información Personal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Nombre completo" icon={User} value={profile.name} onChange={(v) => handleInputChange("name", v)} placeholder="Juan Pérez" />
                        <FormField label="Email" icon={Mail} value={profile.email} onChange={(v) => handleInputChange("email", v)} type="email" placeholder="tu@email.com" />
                        <FormField label="Empresa" icon={Building} value={profile.company} onChange={(v) => handleInputChange("company", v)} placeholder="Mi Empresa SpA" />
                        <FormField label="Teléfono" icon={Phone} value={profile.phone} onChange={(v) => handleInputChange("phone", v)} type="tel" placeholder="+56 9 1234 5678" />
                        <FormField label="Dirección" icon={MapPin} value={profile.address} onChange={(v) => handleInputChange("address", v)} className="md:col-span-2" placeholder="Av. Providencia 1234, Santiago" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Tu Camino de Niveles</h3>
                    <div className="space-y-3">
                      {levelData.map((level) => {
                        const isCurrent = level.level === user?.level;
                        const isUnlocked = level.level <= (user?.level || 0);
                        return (
                          <div key={level.level} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrent ? "bg-indigo-50 border border-indigo-200" : isUnlocked ? "bg-green-50 border border-green-200" : "bg-slate-50 border border-slate-200"}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isCurrent ? "bg-gradient-to-br " + currentLevel.color + " text-white" : isUnlocked ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                              {isUnlocked ? <CheckCircle className="w-6 h-6" /> : <span className="font-bold text-xl">{level.level}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={`font-semibold ${isUnlocked ? "text-slate-900" : "text-slate-600"}`}>{level.title}</p>
                                {isCurrent && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">Actual</span>}
                                {isUnlocked && level.level < (user?.level || 0) && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Completado</span>}
                              </div>
                              <p className="text-xs text-slate-500">{level.xp.toLocaleString()} XP requeridos</p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? "bg-indigo-100 text-indigo-600" : isUnlocked ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                              {level.level === 6 && <Crown className="w-5 h-5" />}
                              {level.level !== 6 && (isUnlocked ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Estadísticas de Progreso</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard label="XP Actual" value={`${(user?.points || 0).toLocaleString()}`} icon={Star} color="text-amber-500 bg-amber-50" />
                      <StatCard label="XP al siguiente nivel" value={`${Math.max(0, xpNeededForNext - xpInCurrentLevel).toLocaleString()}`} icon={Target} color="text-indigo-500 bg-indigo-50" />
                      <StatCard label="Racha actual" value={`${user?.consecutiveDays || 0} días`} icon={Flame} color="text-orange-500 bg-orange-50" />
                      <StatCard label="Nivel actual" value={`${currentLevel.level} - ${currentLevel.name}`} icon={Trophy} color="text-purple-500 bg-purple-50" />
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === "achievements" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Tus Logros</h3>
                  <div className="space-y-3">
                    {updatedAchievements.map((achievement) => {
                      const achProgress = achievement.progress || 0;
                      const achTarget = achievement.target || 1;
                      const achPercentage = achTarget > 0 ? (achProgress / achTarget) * 100 : 0;
                      return (
                        <div key={achievement.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${achievement.unlocked ? "bg-amber-50 border border-amber-200" : "bg-slate-50 border border-slate-200 opacity-60"}`}>
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl ${achievement.unlocked ? "bg-amber-100" : "bg-slate-100"}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${achievement.unlocked ? "text-slate-900" : "text-slate-600"}`}>
                              {achievement.name}
                              {achievement.unlocked && <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Desbloqueado</span>}
                            </p>
                            <p className="text-sm text-slate-500">{achievement.description}</p>
                            {!achievement.unlocked && achievement.target && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${achPercentage}%` }} />
                                </div>
                                <span className="text-xs text-slate-500 whitespace-nowrap">{achProgress} / {achTarget}</span>
                              </div>
                            )}
                          </div>
                          {achievement.unlocked && <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900">Configuración de Cuenta</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-slate-900 mb-3">Cambiar Contraseña</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Contraseña actual" icon={Lock} value="" onChange={() => {}} type="password" placeholder="••••••••" />
                        <FormField label="Nueva contraseña" icon={Lock} value="" onChange={() => {}} type="password" placeholder="••••••••" />
                        <FormField label="Confirmar contraseña" icon={Lock} value="" onChange={() => {}} type="password" placeholder="••••••••" />
                      </div>
                      <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Actualizar Contraseña</button>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <h4 className="font-medium text-slate-900 mb-3">Autenticación de Dos Factores</h4>
                      <p className="text-sm text-slate-500 mb-4">Añade una capa extra de seguridad</p>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Configurar 2FA</button>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Zona de Peligro</h4>
                      <p className="text-sm text-red-700 mb-4">Esta acción es irreversible y eliminará todos tus datos permanentemente.</p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Eliminar Cuenta</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {saved && (
            <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
              <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5" />
                <span>Cambios guardados correctamente</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, iconBg, iconColor, trend, progress, className = "" }: any) {
  return (
    <div className={`card-hover bg-white rounded-2xl border border-slate-200 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
          {trend && <div className="mt-3 flex items-center gap-2"><span className={`flex items-center gap-1 text-sm font-medium ${trend.positive ? "text-green-600" : "text-red-600"}`}>{trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}{trend.value}</span><span className="text-xs text-slate-500">{trend.label}</span></div>}
          {progress && <div className="mt-4"><div className="flex items-center justify-between mb-1.5"><span className="text-sm font-medium text-slate-600">{progress.label}</span><span className="text-sm font-semibold text-slate-900">{progress.current.toLocaleString()} / {progress.total.toLocaleString()}</span></div><div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${Math.min((progress.current / progress.total) * 100, 100)}%` }} /></div></div>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}><span className={iconColor}>{icon}</span></div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl p-4 text-center card-hover">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function FormField({ label, icon: Icon, value, onChange, type = "text", placeholder, className = "" }: { label: string; icon: React.ComponentType<{ className?: string }>; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
      </div>
    </div>
  );
}