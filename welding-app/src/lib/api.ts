export type Machine = {
  id: number;
  name: string;
  model?: string | null;
  location?: string | null;
  status?: string | null;
  createdAt?: string;
};

export type Alert = {
  id: string | number;
  machineId: number;
  parameter: string;
  actualValue: number;
  thresholdValue: number;
  severity: string;
  status?: string;
  createdAt?: string;
  resolvedAt?: string | null;
  durationSeconds?: number | null;
  durationMs?: string | null;
  machine?: Machine;
};

export type AlertFilter = {
  status?: "active" | "resolved";
  machineId?: number;
  severity?: "low" | "medium" | "high";
  limit?: number;
  offset?: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetcher(url: string) {
  // If URL is absolute, use as-is; otherwise prepend API_BASE_URL
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchAlerts(filters: AlertFilter = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.machineId) params.append("machineId", String(filters.machineId));
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.offset) params.append("offset", String(filters.offset));

  const url = `/api/alerts${params.toString() ? `?${params.toString()}` : ""}`;
  return fetcher(url);
}

export async function fetchMachines() {
  return fetcher("/api/machines");
}
