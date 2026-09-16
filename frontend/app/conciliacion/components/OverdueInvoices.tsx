"use client";

import { useState } from "react";

type OverdueInvoice = {
  id: string;
  rut: string;
  monto: number;
  diasVencida: number;
};

const overdueData: OverdueInvoice[] = [
  { id: "FAC-001", rut: "76.123.456-7", monto: 150000, diasVencida: 45 },
  { id: "FAC-002", rut: "76.987.654-3", monto: 89000, diasVencida: 28 },
  { id: "FAC-003", rut: "76.555.777-8", monto: 234000, diasVencida: 12 },
];

export const OverdueInvoices = () => {
  const [showModal, setShowModal] = useState(false);

  const generateReminder = (invoice: OverdueInvoice) => {
    const message = `Hola, recordatorio de factura #${invoice.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-medium mb-4">Facturas Vencidas</h3>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">RUT</th>
            <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Monto</th>
            <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Vencimiento</th>
            <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Acción</th>
          </tr>
        </thead>
        <tbody>
          {overdueData.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="font-medium">{invoice.rut}</td>
              <td className="font-medium">
                ${invoice.monto.toLocaleString("es-CL")}
              </td>
              <td className="text-sm text-gray-600 dark:text-gray-300">
                {new Date().toLocaleDateString("es-CL")}
              </td>
              <td>
                <button onClick={() => generateReminder(invoice)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
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