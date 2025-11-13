"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useState } from "react";

export default function SettingsPage() {
  // Dummy machine list
  const machines = [
    { id: 1, name: "Welding Machine A" },
    { id: 2, name: "Welding Machine B" },
    { id: 3, name: "Welding Machine C" },
  ];

  // Dummy threshold data
  const [thresholds, setThresholds] = useState({
    currentMax: 150,
    voltageMax: 230,
    temperatureMax: 450,
    hysteresis: 5,
  });

  const handleChange = (key: string, value: string) => {
    setThresholds((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleSave = () => {
    alert("Thresholds saved! (Dummy for now)");
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <h1 className="text-2xl font-semibold">Threshold Settings</h1>

          {/* Machine Selection */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <label className="block text-sm mb-2 text-gray-500">
              Select Machine
            </label>

            <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black">
              <option value="">Choose machine</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Threshold Form */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">Edit Thresholds</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Max */}
              <div>
                <label className="block text-sm text-gray-500">
                  Current Max (A)
                </label>
                <input
                  type="number"
                  value={thresholds.currentMax}
                  onChange={(e) => handleChange("currentMax", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-black"
                />
              </div>

              {/* Voltage Max */}
              <div>
                <label className="block text-sm text-gray-500">
                  Voltage Max (V)
                </label>
                <input
                  type="number"
                  value={thresholds.voltageMax}
                  onChange={(e) => handleChange("voltageMax", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-black"
                />
              </div>

              {/* Temp Max */}
              <div>
                <label className="block text-sm text-gray-500">
                  Temp Max (°C)
                </label>
                <input
                  type="number"
                  value={thresholds.temperatureMax}
                  onChange={(e) =>
                    handleChange("temperatureMax", e.target.value)
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-black"
                />
              </div>

              {/* Hysteresis */}
              <div>
                <label className="block text-sm text-gray-500">
                  Hysteresis
                </label>
                <input
                  type="number"
                  value={thresholds.hysteresis}
                  onChange={(e) => handleChange("hysteresis", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-black"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Save Thresholds
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
