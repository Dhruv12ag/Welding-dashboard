"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import { fetcher, Alert } from "@/lib/api";
import dynamic from "next/dynamic";
import { io, Socket } from "socket.io-client";
import { AlertCircle, AlertTriangle, Zap, Gauge } from "lucide-react";

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
  const { data: machines = [] } = useSWR<Machine[]>("/api/machines", fetcher, {
    refreshInterval: 60000, // Refresh every minute
  });

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

  // Set first machine as default when machines load
  useEffect(() => {
    if (machines.length > 0 && selectedMachineId === null) {
      setSelectedMachineId(machines[0].id);
    }
  }, [machines, selectedMachineId]);

  // 5. Fetch Alerts (Existing Logic)
  const { data: alerts } = useSWR<Alert[]>("/api/alerts?limit=50", fetcher, {
    refreshInterval: 3000,
  });

  // Filter active alerts for this machine
  const machineAlerts =
    alerts?.filter(
      (a) => a.machineId === selectedMachineId && a.status === "active"
    ) || [];

  const activeAlertsCount =
    alerts?.filter((a) => a.status === "active").length || 0;
  const highSeverityCount =
    alerts?.filter((a) => a.status === "active" && a.severity === "high")
      .length || 0;

  // 6. SOCKET.IO CONNECTION
  useEffect(() => {
    // Connect to the BACKEND server (Port 3001), not Next.js
    const socket: Socket = io("http://localhost:3001");

    if (!selectedMachineId) return;

    console.log(`Listening for updates on: machine-${selectedMachineId}`);

    // Listen for specific machine events
    socket.on(`machine-${selectedMachineId}`, (newReading: LiveReading) => {
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
  }, [selectedMachineId]);

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
    () => graphHistory.map((d) => Number(d.currentValue)),
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
      title: "Active Alerts",
      value: activeAlertsCount,
      icon: AlertCircle,
      color: activeAlertsCount > 0 ? "text-red-500" : "text-green-500",
      bgColor:
        activeAlertsCount > 0
          ? "bg-red-50 dark:bg-red-900/10"
          : "bg-green-50 dark:bg-green-900/10",
    },
    {
      title: "High Severity",
      value: highSeverityCount,
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/10",
    },
    {
      title: "Live Current",
      value: liveData ? `${Number(liveData.currentValue).toFixed(2)} A` : "--",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/10",
    },
    {
      title: "Live Voltage",
      value: liveData ? `${Number(liveData.voltageValue).toFixed(2)} V` : "--",
      icon: Gauge,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/10",
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </p>
                </div>
                <Icon className={`${card.color} h-5 w-5 opacity-70`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Banner */}
      {machineAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300">
                Active Alerts on Machine {selectedMachineId}
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-red-800 dark:text-red-200">
                {machineAlerts.map((alert) => (
                  <li key={alert.id}>
                    •{" "}
                    <span className="font-medium">
                      {alert.parameter.toUpperCase()}
                    </span>
                    : {alert.actualValue.toFixed(2)} /{" "}
                    {alert.thresholdValue.toFixed(2)} ({alert.severity})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chart Section */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Live Current Trend
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last 20 readings
              </p>
            </div>
          </div>

          <LineChart
            labels={chartLabels}
            data={chartData}
            label={`Current (Amps) - ${selectedMachineName}`}
          />
        </div>

        {/* Recent Alerts Sidebar */}
        <div className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm h-fit">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Alerts
          </h3>

          {alerts && alerts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.status === "active"
                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
                      : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span
                      className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                        alert.severity === "high"
                          ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                          : alert.severity === "medium"
                          ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                          : "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase ${
                        alert.status === "active"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {alert.parameter.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {alert.actualValue.toFixed(2)} /{" "}
                    {alert.thresholdValue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(alert.createdAt || "").toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm">No alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
