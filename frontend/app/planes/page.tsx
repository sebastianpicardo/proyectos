"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, CheckCircle, XCircle, ArrowRight, Shield, Users, Cpu, FileText, Zap, Star, Award, Lock, Globe, Check, ChevronRight, User as UserIcon } from "lucide-react";
import { useAuth } from "@/components/AuthContext";

export default function PlanesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showAnnual, setShowAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Ideal para emprendedores y pequeñas empresas que están comenzando",
      monthlyPrice: 29900,
      yearlyPrice: 299000,
      features: [
        "Hasta 50 conciliaciones/mes",
        "Hasta 200 facturas/mes",
        "Hasta 50 clientes",
        "Subida manual CSV/Excel",
        "Reporte básico PDF",
        "Soporte por email (48h)",
      ],
      limits: {
        conciliaciones: 50,
        facturas: 200,
        clientes: 50,
        apiAccess: false,
        prioritySupport: false,
      },
      color: "bg-blue-500",
      badge: null,
    },
    {
      id: "professional",
      name: "Professional",
      description: "Para empresas en crecimiento que necesitan mayor volumen y automatización",
      monthlyPrice: 79900,
      yearlyPrice: 799000,
      features: [
        "Hasta 200 conciliaciones/mes",
        "Hasta 1.000 facturas/mes",
        "Hasta 200 clientes",
        "Subida automática bancaria (API)",
        "Conciliación automática con IA",
        "Reportes avanzados + Excel",
        "Soporte prioritario email (24h)",
        "Alertas de morosidad automáticas",
      ],
      limits: {
        conciliaciones: 200,
        facturas: 1000,
        clientes: 200,
        apiAccess: false,
        prioritySupport: true,
      },
      color: "bg-purple-500",
      badge: "Más Popular",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Para grandes organizaciones con necesidades críticas y personalizadas",
      monthlyPrice: 199900,
      yearlyPrice: 1999000,
      features: [
        "Conciliaciones ilimitadas",
        "Facturas ilimitadas",
        "Clientes ilimitados",
        "API REST completa + Webhooks",
        "Integración ERP/Contable nativa",
        "SSO / SAML / LDAP",
        "Auditoría completa y logs",
        "Soporte 24/7 dedicado + SLA 99.9%",
        "Infraestructura dedicada opcional",
        "Onboarding personalizado",
      ],
      limits: {
        conciliaciones: -1,
        facturas: -1,
        clientes: -1,
        apiAccess: true,
        prioritySupport: true,
      },
      color: "bg-indigo-500",
      badge: "Para grandes equipos",
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPeriod = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">Conciliador</span>
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/conciliacion" className="text-slate-600 hover:text-indigo-600 font-medium text-sm">Conciliación</a>
                <a href="/planes" className="text-indigo-600 font-semibold text-sm">Planes</a>
                <a href="/historial" className="text-slate-600 hover:text-indigo-600 font-medium text-sm">Historial</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-slate-600">{user.name}</span>
              <a href="/profile" className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
                <UserIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Elige el plan perfecto para tu negocio</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Planes flexibles para <span className="text-indigo-600">cada etapa</span> de tu negocio
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Desde emprendedores hasta grandes empresas. Escala sin límites con la conciliación 
            bancaria más inteligente de Chile.
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!showAnnual ? "text-indigo-600" : "text-slate-500"}`}>Mensual</span>
            <button
              onClick={() => setShowAnnual(!showAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showAnnual ? "bg-indigo-600" : "bg-slate-200"
              }`}
              role="switch"
              aria-checked={showAnnual}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAnnual ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${showAnnual ? "text-indigo-600" : "text-slate-500"}`}>Anual</span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Ahorra 17%
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              showAnnual={showAnnual}
              isSuperAdmin={user.isSuperAdmin}
            />
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Comparación detallada</h2>
            <p className="text-slate-600">Todas las características incluidas en cada plan</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 font-semibold text-slate-900">Característica</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center p-4 font-semibold text-slate-900">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${plan.color}`} />
                        <span className="font-semibold">{plan.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <FeatureRow feature="Conciliaciones/mes" values={["50", "200", "Ilimitadas"]} />
                <FeatureRow feature="Facturas/mes" values={["200", "1.000", "Ilimitadas"]} />
                <FeatureRow feature="Clientes" values={["50", "200", "Ilimitados"]} />
                <FeatureRow feature="Subida CSV/Excel manual" values={["✓", "✓", "✓"]} />
                <FeatureRow feature="Subida automática bancaria (API)" values={["✗", "✓", "✓"]} />
                <FeatureRow feature="Conciliación automática IA" values={["✗", "✓", "✓"]} />
                <FeatureRow feature="Reportes básicos PDF" values={["✓", "✓", "✓"]} />
                <FeatureRow feature="Reportes avanzados + Excel" values={["✗", "✓", "✓"]} />
                <FeatureRow feature="Alertas de morosidad" values={["✗", "✓", "✓"]} />
                <FeatureRow feature="Soporte email" values={["48h", "24h", "24/7"]} />
                <FeatureRow feature="Soporte prioritario" values={["✗", "✓", "✓"]} />
                <FeatureRow feature="API REST + Webhooks" values={["✗", "✗", "✓"]} />
                <FeatureRow feature="Integración ERP/Contable" values={["✗", "✗", "✓"]} />
                <FeatureRow feature="SSO / SAML / LDAP" values={["✗", "✗", "✓"]} />
                <FeatureRow feature="Auditoría y logs" values={["✗", "✗", "✓"]} />
                <FeatureRow feature="SLA 99.9%" values={["✗", "✗", "✓"]} />
                <FeatureRow feature="Infraestructura dedicada" values={["✗", "✗", "✓"]} />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Preguntas frecuentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FAQItem 
              question="¿Puedo cambiar de plan después?" 
              answer="Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratean."
            />
            <FAQItem 
              question="¿Qué métodos de pago aceptan?" 
              answer="Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), transferencia bancaria y pagos con Webpay/Transbank."
            />
            <FAQItem 
              question="¿Hay contrato de permanencia?" 
              answer="No. Puedes cancelar en cualquier momento. En planes anuales, te reembolsamos la parte no usada."
            />
            <FAQItem 
              question="¿Ofrecen prueba gratuita?" 
              answer="Sí, todos los planes incluyen 14 días de prueba gratuita sin necesidad de tarjeta de crédito."
            />
            <FAQItem 
              question="¿Cómo funciona la conciliación automática?" 
              answer="Nuestra IA analiza tus movimientos bancarios y facturas SII, haciendo match por RUT, monto y fecha con 99.9% de precisión."
            />
            <FAQItem 
              question="¿Qué soporte incluye cada plan?" 
              answer="Starter: email 48h. Professional: email prioritario 24h + chat. Enterprise: 24/7 dedicado con SLA 99.9%."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">¿Listo para automatizar tu conciliación?</h2>
            <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
              Únete a más de 500 empresas que ya confían en Conciliador Pro. 
              Prueba gratis 14 días, sin tarjeta de crédito.
            </p>
            <a href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all shadow-lg">
              Comenzar prueba gratis
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl">Conciliador</span>
              </div>
              <p className="text-slate-400 text-sm">Conciliación bancaria inteligente para empresas chilenas.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/conciliacion" className="hover:text-white">Conciliación</a></li>
                <li><a href="/planes" className="hover:text-white">Planes</a></li>
                <li><a href="/historial" className="hover:text-white">Historial</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Términos</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
            © 2024 Conciliador Pro. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlanCard({ plan, selected, onSelect, showAnnual, isSuperAdmin }: any) {
  const price = showAnnual ? plan.yearlyPrice : plan.monthlyPrice;
  const period = showAnnual ? "/año" : "/mes";
  const monthlyEquivalent = showAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer transition-all duration-200 rounded-2xl border-2 p-8 ${
        selected 
          ? "border-indigo-500 bg-indigo-50 shadow-xl ring-2 ring-indigo-500/20" 
          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {plan.badge}
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${plan.color}`}>
          {plan.id === "starter" && <Star className="w-7 h-7 text-white" />}
          {plan.id === "professional" && <Award className="w-7 h-7 text-white" />}
          {plan.id === "enterprise" && <Cpu className="w-7 h-7 text-white" />}
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
        <p className="text-slate-600 mt-2">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold text-slate-900">
          {formatPrice(price)}
          <span className="text-slate-500 font-normal text-lg">{period}</span>
        </div>
        {showAnnual && (
          <p className="text-sm text-green-600 mt-1">
            Equivale a {formatPrice(Math.round(plan.yearlyPrice / 12))}/mes
          </p>
        )}
        {!showAnnual && (
          <p className="text-sm text-slate-500 mt-1">
            {formatPrice(plan.yearlyPrice)}/año (ahorra 17%)
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, index: number) => (
          <li key={index} className="flex items-start gap-3 text-slate-600 text-sm">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all ${
          selected 
            ? "bg-indigo-600 text-white hover:bg-indigo-700" 
            : "bg-slate-100 text-slate-900 hover:bg-slate-200"
        }`}
      >
        {selected ? "Plan actual" : "Seleccionar plan"}
      </button>
    </div>
  );
}

function FeatureRow({ feature, values }: { feature: string; values: string[] }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="p-4 font-medium text-slate-700">{feature}</td>
      {values.map((value: string, index: number) => (
        <td key={index} className="text-center p-4">
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium ${
            value === "✓" || value === "Ilimitadas" || value === "Ilimitados" || value.includes("24/7") || value.includes("✓") 
              ? "bg-green-100 text-green-700" 
              : value === "✗" 
                ? "bg-red-100 text-red-700" 
                : "bg-slate-100 text-slate-700"
          }`}>
            {value}
          </span>
        </td>
      ))}
    </tr>
  );
}

function FAQItem({ question, answer }: any) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-6 text-left flex items-center justify-between"
      >
        <h3 className="font-semibold text-slate-900 pr-4">{question}</h3>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 pb-6 text-slate-600">{answer}</div>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}