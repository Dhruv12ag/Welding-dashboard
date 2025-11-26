"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AlertsTable from "@/components/AlertTable";
import { Alert, fetcher } from "@/lib/api";

export default function AlertsPage() {
  const [status, setStatus] = useState<"active" | "resolved" | "">("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "">("");
  const [machineId, setMachineId] = useState<string>("");

  // Build query string based on filters
  const queryParams = new URLSearchParams();
  if (status) queryParams.append("status", status);
  if (severity) queryParams.append("severity", severity);
  if (machineId) queryParams.append("machineId", machineId);
  queryParams.append("limit", "100");

  const queryString = queryParams.toString();
  const apiUrl = `/api/alerts${queryString ? `?${queryString}` : ""}`;

  // Fetch alerts with auto-refresh every 3 seconds
  const {
    data: alerts = [],
    error,
    isLoading,
  } = useSWR<Alert[]>(apiUrl, fetcher, {
    refreshInterval: 3000,
    dedupingInterval: 1000,
  });

  const activeCount = alerts.filter((a) => a.status === "active").length;
  const resolvedCount = alerts.filter((a) => a.status === "resolved").length;

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Monitor system alerts and thresholds
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </p>
                <p className="text-2xl font-bold text-red-600">{activeCount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {resolvedCount}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "active" | "resolved" | "")
                  }
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(
                      e.target.value as "low" | "medium" | "high" | ""
                    )
                  }
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Machine Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Machine
                </label>
                <select
                  value={machineId}
                  onChange={(e) => setMachineId(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Machines</option>
                  <option value="1">Machine 1</option>
                  <option value="2">Machine 2</option>
                  <option value="3">Machine 3</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex flex-col gap-2 justify-end">
                <button
                  onClick={() => {
                    setStatus("");
                    setSeverity("");
                    setMachineId("");
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading alerts...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              Failed to load alerts. Please try again.
            </div>
          )}

          {!isLoading && !error && (
            <>
              {/* Alerts Table */}
              <AlertsTable alerts={alerts} />

              {/* Pagination Info */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Showing {alerts.length} alert{alerts.length !== 1 ? "s" : ""} •
                Auto-refreshing every 3 seconds
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
