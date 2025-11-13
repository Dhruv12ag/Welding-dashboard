"use client";

import useSWR from "swr";
import { fetcher, Alert, Machine, LiveReading } from "@/lib/api";
import dynamic from "next/dynamic";

import DashboardStatsCard from "@/components/DashboardStatsCard";
import AlertsTable from "@/components/AlertTable";

const LineChart = dynamic(() => import("@/components/LineChart"), {
  ssr: false,
});

export default function DashboardPage() {
  const { data: alerts } = useSWR<Alert[]>("/api/alerts", fetcher, {
    refreshInterval: 3000,
  });

  const cards = [
    { title: "Total Machines", value: 5 },
    { title: "Active Alerts", value: alerts?.length ?? 0 },
    { title: "Avg Current", value: "123 A" },
    { title: "Avg Voltage", value: "42 V" },
  ];

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <DashboardStatsCard {...c} key={c.title} />
        ))}
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium mb-2">Live Current</h3>
          <LineChart
            labels={["1", "2", "3"]}
            data={[120, 130, 140]}
            label="Current (A)"
          />
        </div>

        <AlertsTable alerts={alerts ?? []} />
      </div>
    </div>
  );
}
