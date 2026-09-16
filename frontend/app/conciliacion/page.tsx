"use client";

import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dropzone } from "./components/Dropzone";
import { HealthScore } from "./components/HealthScore";
import { ResultsTable } from "./components/ResultsTable";

export const ConciliacionDashboard = () => {
  const [activeSection, setActiveSection] = useState<"dashboard" | "conciliacion">("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Dropzone />
            <HealthScore />
            <ResultsTable />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          </div>
        </main>
      </div>
    </div>
  );
};