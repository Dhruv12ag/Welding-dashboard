"use client";
import { Alert } from "@/lib/api";

type Props = {
  alerts: Alert[];
};

export default function AlertsTable({ alerts }: Props) {
  const formatTime = (date?: string | null) => {
    if (!date) return "--";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (durationSeconds?: number | null) => {
    if (!durationSeconds) return "--";

    if (durationSeconds < 60) return `${Math.round(durationSeconds)}s`;
    if (durationSeconds < 3600) {
      const mins = Math.floor(durationSeconds / 60);
      const secs = Math.round(durationSeconds % 60);
      return `${mins}m ${secs}s`;
    }

    const hours = Math.floor(durationSeconds / 3600);
    const mins = Math.floor((durationSeconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status?: string) => {
    if (status === "resolved") {
      return "bg-green-100 text-green-700";
    }
    return "bg-red-100 text-red-700 animate-pulse";
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full bg-white dark:bg-black">
        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
              Machine
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
              Parameter
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">
              Actual / Threshold
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
              Severity
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">
              Duration
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((a) => (
            <tr
              key={a.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {formatTime(a.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                {a.machine?.name ?? `Machine ${a.machineId}`}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 rounded font-medium capitalize">
                  {a.parameter}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-800 dark:text-gray-200 font-mono">
                {a.actualValue.toFixed(2)} / {a.thresholdValue.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${getSeverityColor(
                    a.severity
                  )}`}
                >
                  {a.severity}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide ${getStatusBadge(
                    a.status
                  )}`}
                >
                  {a.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                {a.status === "resolved" ? (
                  <span className="font-mono text-xs bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    {formatDuration(a.durationSeconds)}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    Active
                  </span>
                )}
              </td>
            </tr>
          ))}
          {alerts.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="p-8 text-center text-gray-500 dark:text-gray-400"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span>No alerts found</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
