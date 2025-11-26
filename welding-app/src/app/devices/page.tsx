"use client";

import { useEffect, useState } from "react";
import { Machine } from "@/lib/api";
import MachineCard from "@/components/MachineCard";
import Sidebar from "@/components/Sidebar";

export default function DevicesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch("/api/machines");
        const data = await response.json();
        setMachines(data);
      } catch (error) {
        console.error("Error fetching machines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Devices</h1>

            {loading ? (
              <p className="text-gray-500">Loading machines...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {machines.map((m) => (
                  <MachineCard key={m.id} machine={m} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
