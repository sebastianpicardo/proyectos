"use client";

import { useState } from "react";

type OverdueInvoice = {
  id: string;
  rut: string;
  monto: number;
  fechaVencimiento: string;
  diasVencida: number;
};

const overdueData: OverdueInvoice[] = [
  { id: "FAC-001", rut: "76.123.456-7", monto: 150000, fechaVencimiento: "2025-01-15", diasVencida: 45 },
  { id: "FAC-002", rut: "76.987.654-3", monto: 89000, fechaVencimiento: "2025-02-20", diasVencida: 28 },
  { id: "FAC-003", rut: "76.555.777-8", monto: 234000, fechaVencimiento: "2025-03-10", diasVencida: 12 },
];

export const OverdueInvoices = () => {
  const [showModal, setShowModal] = useState(false);

  const generateReminder = (invoice: OverdueInvoice) => {
    const whatsappMessage = `Hola, te recordamos que la factura #${invoice.id} por $${invoice.monto.toLocaleString("es-CL")} CLP está vencida desde hace ${invoice.diasVencida} días. Por favor, realice el pago a la brevedad. Quedamos a su disposición.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
      <h3 className="text-lg font-medium mb-4">Facturas Vencidas</h3>
      <div className="overflow-x-auto">
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
                  {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
                    invoice.monto
                  )}
                </td>
                <td className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(invoice.fechaVencimiento).toLocaleDateString("es-CL")}
                </td>
                <td>
                  <button
                    onClick={() => generateReminder(invoice)}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Generar Recordatorio
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-600/50 backdrop-blur-zxl z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h4 className="text-xl font-bold mb-4">Generar Recordatorio</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Elige el medio para enviar el recordatorio a{" "}
              {overdueData[0]?.rut ?? "cliente"}:
            </p>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  alert("WhatsApp reminder generated");
                  setShowModal(false);
                }}
                className="flex-1 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                WhatsApp
              </button>
              <button
                onClick={() => {
                  alert("Email reminder generated");
                  setShowModal(false);
                }}
                className="flex-1 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Email
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};