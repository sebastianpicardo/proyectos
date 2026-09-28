"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Flame,
  Trophy,
  Award,
  Target,
  Sparkles,
  TrendingUp,
  Zap,
  Medal,
  Crown,
} from "lucide-react";

interface UserData {
  name: string;
  email: string;
  level: number;
  points: number;
  consecutiveDays: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

const levelData = [
  { level: 1, name: "Novato", title: "Principiante", color: "from-slate-400 to-slate-500", xp: 0 },
  { level: 2, name: "Aprendiz", title: "Intermedio", color: "from-blue-400 to-blue-500", xp: 100 },
  { level: 3, name: "Analista", title: "Analista Junior", color: "from-green-400 to-green-500", xp: 250 },
  { level: 4, name: "Senior", title: "Analista Senior", color: "from-purple-400 to-purple-500", xp: 500 },
  { level: 5, name: "Experto", title: "Experto", color: "from-orange-400 to-orange-500", xp: 1000 },
  { level: 6, name: "Maestro", title: "Maestro Conciliador", color: "from-yellow-400 via-orange-500 to-red-500", xp: 2000 },
];

const achievements: Achievement[] = [
  {
    id: "first_upload",
    name: "Primera Carga",
    description: "Sube tu primera cartola bancaria",
    icon: <Upload className="w-5 h-5" />,
    unlocked: false,
  },
  {
    id: "streak_7",
    name: "Semana Perfecta",
    description: "7 días consecutivos usando el sistema",
    icon: <Flame className="w-5 h-5" />,
    unlocked: false,
    progress: 0,
    target: 7,
  },
  {
    id: "reconcile_100",
    name: "Centurión",
    description: "Concilia 100 facturas exitosamente",
    icon: <CheckCircle className="w-5 h-5" />,
    unlocked: false,
    progress: 0,
    target: 100,
  },
  {
    id: "level_5",
    name: "Experto Financiero",
    description: "Alcanza el nivel Experto",
    icon: <Award className="w-5 h-5" />,
    unlocked: false,
  },
  {
    id: "perfect_month",
    name: "Mes Perfecto",
    description: "30 días sin errores de conciliación",
    icon: <Medal className="w-5 h-5" />,
    unlocked: false,
    progress: 0,
    target: 30,
  },
  {
    id: "master",
    name: "Maestro Conciliador",
    description: "Alcanza el nivel Máster (2000 XP)",
    icon: <Crown className="w-5 h-5" />,
    unlocked: false,
  },
];

interface XPGamificationProps {
  user: UserData;
  onClose: () => void;
  compact?: boolean;
}

export function XPGamification({ user, onClose, compact = false }: XPGamificationProps) {
  const [showAchievements, setShowAchievements] = useState(false);
  const [toast, setToast] = useState<{ message: string; xp: number } | null>(null);

  const currentLevel = levelData.find(l => l.level === user.level) || levelData[0];
  const nextLevel = levelData.find(l => l.level === user.level + 1) || levelData[levelData.length - 1];
  
  const xpInCurrentLevel = user.points - currentLevel.xp;
  const xpNeededForNext = nextLevel.xp - currentLevel.xp;
  const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);

  // Trigger toast on mount if there's a pending notification
  useEffect(() => {
    const pendingToast = localStorage.getItem("pendingXPToast");
    if (pendingToast) {
      const { message, xp } = JSON.parse(pendingToast);
      setToast({ message, xp });
      localStorage.removeItem("pendingXPToast");
    }
  }, []);

  // Update achievements based on user data
  const updatedAchievements = achievements.map(a => {
    if (a.id === "streak_7") {
      return { ...a, unlocked: user.consecutiveDays >= 7, progress: Math.min(user.consecutiveDays, 7) };
    }
    if (a.id === "level_5") {
      return { ...a, unlocked: user.level >= 5 };
    }
    if (a.id === "master") {
      return { ...a, unlocked: user.level >= 6 };
    }
    return a;
  });

  const triggerXPGain = (xp: number, message: string) => {
    setToast({ message, xp });
    // Store for persistence across page loads
    localStorage.setItem("pendingXPToast", JSON.stringify({ message, xp }));
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 card-hover">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{currentLevel.level}</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{currentLevel.title}</p>
              <p className="text-xs text-slate-500">{user.points.toLocaleString()} XP total</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="w-32 progress-bar">
              <div
                className={`progress-bar-fill bg-gradient-to-r ${currentLevel.color}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{user.consecutiveDays} días</span>
            </div>
          </div>
        </div>
        
        {/* Mobile: show progress bar below */}
        <div className="sm:hidden">
          <div className="progress-bar mb-2">
            <div
              className={`progress-bar-fill bg-gradient-to-r ${currentLevel.color}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP</span>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>{user.consecutiveDays} días</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-2xl">{currentLevel.level}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{currentLevel.title}</h2>
              <p className="text-slate-600">{currentLevel.name} • {user.points.toLocaleString()} XP totales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/50 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* XP Progress Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Progreso al siguiente nivel</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Star className="w-4 h-4 text-amber-500" />
                <span>{user.points.toLocaleString()} / {nextLevel.xp.toLocaleString()} XP</span>
              </div>
            </div>
            <div className="progress-bar h-3 mb-2">
              <div
                className={`progress-bar-fill bg-gradient-to-r ${currentLevel.color}`}
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progressPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Nivel {currentLevel.level}: {currentLevel.name}</span>
              <span>Siguiente: {nextLevel.name} ({nextLevel.xp - user.points} XP)</span>
            </div>
          </div>

          {/* Streak & Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4 text-center card-hover">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{user.consecutiveDays}</p>
              <p className="text-xs text-slate-500">Días Consecutivos</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center card-hover">
              <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{user.points.toLocaleString()}</p>
              <p className="text-xs text-slate-500">XP Total</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center card-hover">
              <Target className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{Math.max(0, xpNeededForNext - xpInCurrentLevel).toLocaleString()}</p>
              <p className="text-xs text-slate-500">XP para siguiente nivel</p>
            </div>
          </div>

          {/* Level Path */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Tu camino
            </h3>
            <div className="space-y-3">
              {levelData.map((level, index) => {
                const isCurrent = level.level === user.level;
                const isUnlocked = level.level <= user.level;
                const isFuture = level.level > user.level;
                
                return (
                  <div
                    key={level.level}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isCurrent ? "bg-indigo-50 border border-indigo-200" :
                      isUnlocked ? "bg-green-50 border border-green-200" :
                      "bg-slate-50 border border-slate-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCurrent ? "bg-gradient-to-br " + currentLevel.color + " text-white" :
                      isUnlocked ? "bg-green-100 text-green-600" :
                      "bg-slate-100 text-slate-400"
                    }`}>
                      {isUnlocked ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="font-bold">{level.level}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${isFuture ? "text-slate-600" : "text-slate-900"}`}>{level.title}</p>
                        {isCurrent && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">Actual</span>}
                        {isUnlocked && level.level < user.level && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Completado</span>}
                      </div>
                      <p className="text-xs text-slate-500">{level.xp.toLocaleString()} XP requeridos</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent ? "bg-indigo-100 text-indigo-600" :
                      isUnlocked ? "bg-green-100 text-green-600" :
                      "bg-slate-100 text-slate-400"
                    }`}>
                      {level.level === 6 && <Crown className="w-5 h-5" />}
                      {level.level !== 6 && (isUnlocked ? <CheckCircle className="w-4 h-4" /> : <Target className="w-4 h-4" />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Logros
            </h3>
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              {showAchievements ? "Ocultar" : "Ver todos"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <div className={showAchievements ? "space-y-3" : "hidden"}>
            {updatedAchievements.map((achievement) => {
              const achProgress = achievement.progress || 0;
              const achTarget = achievement.target || 1;
              const achPercentage = achTarget > 0 ? (achProgress / achTarget) * 100 : 0;
              
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    achievement.unlocked
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-slate-50 border border-slate-200 opacity-60"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                  }`}>
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
                        <div className="flex-1 progress-bar">
                          <div
                            className="progress-bar-fill bg-gradient-to-r from-amber-400 to-orange-500"
                            style={{ width: `${achPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{achProgress} / {achTarget}</span>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <Sparkles className="w-6 h-6 text-amber-500 animate-pulse-soft" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* XP Gain Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in" role="status" aria-live="polite">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-4 min-w-[300px]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">¡Experiencia ganada!</p>
              <p className="text-sm text-slate-300">{toast.message} <span className="font-bold text-amber-300">+{toast.xp} XP</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import icons needed
import { Upload, CheckCircle } from "lucide-react";