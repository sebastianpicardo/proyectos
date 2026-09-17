"use client";

import { useState } from "react";

type OverdueInvoice = {
  id: string;
  rut: string;
  monto: number;
  diasVencida: number;
  razonSocial?: string;
};

const overdueData: OverdueInvoice[] = [
  { id: "FAC-001", rut: "76.123.456-7", monto: 150000, diasVencida: 45, razonSocial: "Empresa Auto Ltda." },
  { id: "FAC-002", rut: "76.987.654-3", monto: 89000, diasVencida: 28, razonSocial: "Cliente Manuel" },
  { id: "FAC-003", rut: "76.555.777-8", monto: 234000, diasVencida: 12, razonSocial: "Automatización Comercial" },
];

export const OverdueInvoices = () => {
  const [showModal, setShowModal] = useState(false);

  const generateReminder = (invoice: OverdueInvoice) => {
    const message = `Hola, recordatorio de factura #${invoice.id} por $${invoice.monto.toLocaleString("es-CL")} vencida hace ${invoice.diasVencida} días`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="rounded-2xl border bg-card backdrop-blur-sm p-6">
      <h3 className="text-lg font-medium mb-4">Facturas Vencidas</h3>
      <table className="min-w-full divide-y divide-border/50 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="p-3 text-left text-xs font-medium text-muted/60 dark:text-gray-400">RUT</th>
            <th className="p-3 text-left text-xs font-medium text-muted/60 dark:text-gray-400">Monto</th>
            <th className="p-3 text-left text-xs font-medium text-muted/60 dark:text-gray-400">Vencida</th>
            <th className="p-3 text-left text-xs font-medium text-muted/60 dark:text-gray-400">Acción</th>
          </tr>
        </thead>
        <tbody>
          {overdueData.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-primary/5 transition-colors">
              <td className="font-medium">{invoice.rut}</td>
              <td className="font-medium">
                ${
                  invoice.monto.toLocaleString("es-CL")
                }
              </td>
              <td className="text-sm text-muted/60">
                {new Date().toLocaleDateString("es-CL")}
              </td>
              <td>
                <button onClick={() => generateReminder(invoice)} className="text-primary hover:underline text-sm">
                  Generar Recordatorio
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};