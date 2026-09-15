"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConciliacionPage() {
  const router = useRouter();
  const [tab, setTab] = useState("cartola");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', background: '#f8f9fa' }}>
      <header style={{
        borderBottom: '1px solid #e0e0e0',
        background: '#fff',
        padding: '1rem 2rem',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 9999, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'gap-3' }}>
          <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '6px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C</div>
          <div style={{ marginLeft: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#1e2341' }}>MVP Conciliación Bancaria</h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>Sistema de conciliación automática</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'gap-2', marginTop: '0.5rem' }}>
          <div style={{ width: '40px', height: '24px', background: '#cbd5e0', borderRadius: '12px', position: 'relative' }}>
            <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', position: 'absolute', left: 0, top: 0, transition: 'left 0.3s' }}></div>
          </div>
          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>Dark</span>
        </div>
      </header>

      <main style={{ marginTop: '4rem', maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e2341', marginBottom: '1rem' }}>Conciliación Bancaria</h2>
        
        <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: '#1e2341', marginBottom: '1rem' }}>Bienvenido al panel</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Sube archivos CSV de cartola bancaria y facturas SII para conciliar automáticamente mediante RUT y monto.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>01</div>
              <div style={{ color: '#64748b' }}>Cartola Bancaria</div>
            </div>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>02</div>
              <div style={{ color: '#64748b' }}>Facturas SII</div>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Sube archivos CSV para comenzar la conciliación automática mediante coincidencia de RUT y monto.
          </p>
        </div>
      </main>
    </div>
  );
}