"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ConciliacionDashboard from "./conciliacion/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir inmediatamente a la conciliación dashboard
    router.push("/conciliacion");
  }, []);

  // Render null o componente placeholder mientras se redirige
  return null;
}

/* 
// Descomentar esta alternativa si se quiere renderizar el dashboard directamente:
export default function Home() {
  return <ConciliacionDashboard />;
}
*/