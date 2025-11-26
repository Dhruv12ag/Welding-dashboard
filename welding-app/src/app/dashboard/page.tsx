"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher, Alert } from "@/lib/api";
import dynamic from "next/dynamic";
import { io, Socket } from "socket.io-client";

import DashboardStatsCard from "@/components/DashboardStatsCard";
import AlertsTable from "@/components/AlertTable";

// Dynamically import Chart to avoid SSR issues
const LineChart = dynamic(() => import("@/components/LineChart"), {
  ssr: false,
});

// Define the shape of data coming from Socket
interface LiveReading {
  machineId: number;
  voltageValue: number;
  currentValue: number;
  timestamp: string;
}

interface Machine {
  id: number;
  name: string;
  model?: string | null;
  location?: string | null;
  status?: string;
}

export default function DashboardPage() {
  // 1. Fetch Machines from API
  const { data: machines } = useSWR<Machine[]>("/api/machines", fetcher);

  // 2. State for Machine Selection
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    null
  );

  // Set default machine when machines load
  useEffect(() => {
    if (machines && machines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(machines[0].id);
    }
  }, [machines, selectedMachineId]);

  // 2. State for Live Data (Instant values for Cards)
  const [liveData, setLiveData] = useState<LiveReading | null>(null);

  // 3. State for Graph History (Array of last 20 readings)
  const [graphHistory, setGraphHistory] = useState<LiveReading[]>([]);

  // 4. Fetch Alerts (Existing Logic)
  const { data: alerts } = useSWR<Alert[]>("/api/alerts", fetcher, {
    refreshInterval: 3000,
  });

  // 5. SOCKET.IO CONNECTION
  useEffect(() => {
    // Connect to the BACKEND server (Port 3001), not Next.js
    const socket: Socket = io("http://localhost:3001");

    console.log(`Listening for updates on: machine-${selectedMachineId}`);

    // Listen for specific machine events
    socket.on(`machine-${selectedMachineId}`, (newReading: LiveReading) => {
      // DEBUG LOG: Open Browser Console (F12) to see exactly what arrives
      console.log("⚡ Socket Received:", newReading);

      setLiveData(newReading);

      // Update Graph History: Keep last 20 points, remove oldest
      setGraphHistory((prev) => {
        const updated = [...prev, newReading];
        if (updated.length > 20) return updated.slice(updated.length - 20);
        return updated;
      });
    });

    // Cleanup when component unmounts or machine ID changes
    return () => {
      socket.disconnect();
    };
  }, [selectedMachineId]); // Re-run this if user selects a different machine

  // Prepare Data for the Chart Component
  const chartLabels = useMemo(
    () =>
      graphHistory.map((d) =>
        new Date(d.timestamp).toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      ),
    [graphHistory]
  );

  const chartData = useMemo(
    () =>
      // Ensure currentValue is treated as a number for the graph
      graphHistory.map((d) => Number(d.currentValue)),
    [graphHistory]
  );

  // Get selected machine name
  const selectedMachineName = useMemo(
    () =>
      machines?.find((m) => m.id === selectedMachineId)?.name ||
      "Select Machine",
    [machines, selectedMachineId]
  );

  // Dynamic Cards
  const cards = [
    {
      title: "Selected Machine",
      value: selectedMachineName,
    },
    {
      title: "Live Current",
      // Force Number() conversion to prevent string/type errors
      value: liveData ? `${Number(liveData.currentValue).toFixed(2)} A` : "--",
    },
    {
      title: "Live Voltage",
      // Force Number() conversion to prevent string/type errors
      value: liveData ? `${Number(liveData.voltageValue).toFixed(2)} V` : "--",
    },
    {
      title: "Active Alerts",
      value: alerts?.length ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Machine Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Select Machine:</span>
          <select
            className="p-2 border rounded-md bg-background text-foreground"
            value={selectedMachineId || ""}
            onChange={(e) => {
              setSelectedMachineId(Number(e.target.value));
              setGraphHistory([]); // Clear graph when switching
              setLiveData(null);
            }}
          >
            <option value="">Choose Machine </option>
            {machines?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <DashboardStatsCard {...c} key={c.title} />
        ))}
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chart Section */}
        <div className="p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Live Current Trend</h3>
            {/* Small indicator dot */}
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  liveData ? "bg-green-500 animate-pulse" : "bg-gray-300"
                }`}
              ></span>
              <span className="text-xs text-gray-500">
                {liveData ? "Live" : "Waiting..."}
              </span>
            </div>
          </div>

          <LineChart
            labels={chartLabels}
            data={chartData}
            label={`Current (Amps) - ${selectedMachineName}`}
          />
        </div>

        {/* Alerts Table */}
        <AlertsTable alerts={alerts ?? []} />
      </div>
    </div>
  );
}
