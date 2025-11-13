"use client";
import { Alert } from "@/lib/api";

type Props = {
  alerts: Alert[];
};

export default function AlertsTable({ alerts }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs text-gray-600">Time</th>
            <th className="px-4 py-2 text-left text-xs text-gray-600">
              Machine
            </th>
            <th className="px-4 py-2 text-left text-xs text-gray-600">
              Parameter
            </th>
            <th className="px-4 py-2 text-right text-xs text-gray-600">
              Value
            </th>
            <th className="px-4 py-2 text-left text-xs text-gray-600">
              Severity
            </th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(a.createdAt || Date.now()).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {a.machine?.name ?? `ID ${a.machineId}`}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800">{a.parameter}</td>
              <td className="px-4 py-3 text-sm text-right text-gray-800">
                {a.actualValue}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    a.severity === "high"
                      ? "bg-red-100 text-red-700"
                      : a.severity === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {a.severity}
                </span>
              </td>
            </tr>
          ))}
          {alerts.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-500">
                No alerts
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
