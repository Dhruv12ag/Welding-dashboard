"use client";

import Sidebar from "@/components/Sidebar";
import AlertsTable from "@/components/AlertTable";
import { Alert } from "@/lib/api";

export default function AlertsPage() {
  // -------- Dummy Alerts Data --------
  const alerts: Alert[] = [
    {
      id: 1,
      machineId: 1,
      parameter: "current",
      actualValue: 180,
      thresholdValue: 150,
      severity: "high",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      machineId: 2,
      parameter: "temperature",
      actualValue: 460,
      thresholdValue: 400,
      severity: "medium",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      machineId: 3,
      parameter: "voltage",
      actualValue: 260,
      thresholdValue: 240,
      severity: "low",
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Alerts</h1>

          <div className="flex gap-4 mt-4">
            <input
              type="text"
              placeholder="Search alerts..."
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black w-60"
            />

            <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black">
              <option value="">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black">
              <option value="">All Machines</option>
              <option value="1">Machine 1</option>
              <option value="2">Machine 2</option>
              <option value="3">Machine 3</option>
            </select>
          </div>

          <AlertsTable alerts={alerts} />
        </main>
      </div>
    </div>
  );
}
