export type Machine = {
  id: number;
  name: string;
  model?: string | null;
  location?: string | null;
  status?: string | null;
  createdAt?: string;
};

export type LiveReading = {
  id: string | number;
  machineId: number;
  currentValue: number;
  voltageValue?: number | null;
  temperatureValue?: number | null;
  timestamp?: string;
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
  machine?: Machine;
};

export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
