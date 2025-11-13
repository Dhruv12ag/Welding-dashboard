"use client";

import { Machine, LiveReading } from "@/lib/api";
import MachineCard from "@/components/MachineCard";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DevicesPage() {
  const machines: Machine[] = [
    { id: 1, name: "Welding Machine A", location: "Floor 1", status: "active" },
    { id: 2, name: "Welding Machine B", location: "Floor 1", status: "active" },
    {
      id: 3,
      name: "Welding Machine C",
      location: "Floor 2",
      status: "inactive",
    },
  ];

  const readings: LiveReading[] = [
    {
      id: 1,
      machineId: 1,
      currentValue: 150,
      voltageValue: 220,
      temperatureValue: 450,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      machineId: 2,
      currentValue: 165,
      voltageValue: 220,
      temperatureValue: 480,
      timestamp: new Date().toISOString(),
    },
    {
      id: 3,
      machineId: 3,
      currentValue: 0,
      voltageValue: 0,
      temperatureValue: 25,
      timestamp: new Date().toISOString(),
    },
  ];

  const readingMap: Record<number, LiveReading> = {};
  readings?.forEach((r) => {
    readingMap[r.machineId] = r;
  });

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar / Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Devices</h1>

            {!machines ? (
              <p className="text-gray-500">Loading machines...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {machines.map((m) => (
                  <MachineCard
                    key={m.id}
                    machine={m}
                    latestReading={readingMap[m.id]}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
