"use client";

import { useEffect, useState } from "react";
import { Machine } from "@/lib/api";
import { CpuIcon } from "lucide-react";

type LiveReading = {
  id: string | number;
  machineId: number;
  currentValue: number;
  voltageValue?: number | null;
  temperatureValue?: number | null;
  timestamp?: string;
};

export default function MachineCard({ machine }: { machine: Machine }) {
  const [latestReading, setLatestReading] = useState<LiveReading | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReading = async () => {
      try {
        const response = await fetch(`/api/readings/${machine.id}/latest`);
        const data = await response.json();
        setLatestReading(data);
      } catch (error) {
        console.error("Error fetching latest reading:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestReading();
  }, [machine.id]);

  const status = latestReading
    ? latestReading.currentValue > 150 ||
      (latestReading.voltageValue ?? 0) > 50 ||
      (latestReading.temperatureValue ?? 0) > 90
      ? "Critical"
      : "OK"
    : "No Data";

  const statusColor =
    status === "Critical"
      ? "bg-red-200 text-red-800"
      : status === "OK"
      ? "bg-green-200 text-green-800"
      : "bg-gray-200 text-gray-700";

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-white dark:bg-black shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-3">
        <CpuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h2 className="text-lg font-semibold">{machine.name}</h2>
      </div>

      <div className="text-sm text-gray-500">
        <p>Model: {machine.model ?? "—"}</p>
        <p>Location: {machine.location ?? "—"}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Latest Readings:
        </p>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : latestReading ? (
          <div className="text-sm mt-2 space-y-1">
            <p>Current: {latestReading.currentValue} A</p>
            <p>Voltage: {latestReading.voltageValue} V</p>
            <p>Temperature: {latestReading.temperatureValue} °C</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No data available</p>
        )}
      </div>

      {/* Status */}
      <div className="mt-4">
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}
