"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { Loader2, Shield, AlertCircle } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
  requireProfile?: boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requireSuperAdmin = false, 
  requireProfile = false,
  fallbackPath = "/planes"
}: ProtectedRouteProps) {
  const { user, loading, checkProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user) {
      // Check super admin requirement
      if (requireSuperAdmin && !user.isSuperAdmin) {
        router.push(fallbackPath);
        return;
      }

      // Check profile requirement
      if (requireProfile && !user.hasProfile && !user.isSuperAdmin) {
        router.push(fallbackPath);
        return;
      }
    }
  }, [user, loading, router, requireSuperAdmin, requireProfile, fallbackPath]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will be handled by parent layout redirect
  }

  // Check access permissions
  const hasAccess = (!requireSuperAdmin || user.isSuperAdmin) && 
                    (!requireProfile || user.hasProfile || user.isSuperAdmin);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
          <p className="text-slate-600 mb-6">
            {requireSuperAdmin 
              ? "Esta sección requiere permisos de super administrador." 
              : "Necesitas completar tu perfil para acceder a esta sección."}
          </p>
          <button
            onClick={() => window.location.href = fallbackPath}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Ir a {fallbackPath === "/planes" ? "Planes" : "Inicio"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}