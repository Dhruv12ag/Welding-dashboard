"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface Machine {
  id: number;
  name: string;
  model?: string | null;
  location?: string | null;
  status?: string;
}

export default function SettingsPage() {
  // Fetch machines from API
  const { data: machines } = useSWR<Machine[]>("/api/machines", fetcher);

  // Dummy threshold data
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [thresholds, setThresholds] = useState({
    maxCurrent: "",
    maxVoltage: "",
  });
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [thresholdSuccess, setThresholdSuccess] = useState(false);

  // Add Device Modal State
  const [showModal, setShowModal] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    name: "",
    model: "",
    location: "",
    maxCurrent: "",
    maxVoltage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, value: string) => {
    setThresholds((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDeviceFormChange = (key: string, value: string) => {
    setDeviceForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setThresholdError(null);
    setThresholdSuccess(false);

    if (!selectedMachineId) {
      setThresholdError("Please select a machine first");
      return;
    }

    if (!thresholds.maxCurrent && !thresholds.maxVoltage) {
      setThresholdError("Please enter at least one threshold value");
      return;
    }

    setIsSavingThreshold(true);

    try {
      const response = await fetch(`/api/machines/${selectedMachineId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxCurrent: thresholds.maxCurrent
            ? parseFloat(thresholds.maxCurrent)
            : null,
          maxVoltage: thresholds.maxVoltage
            ? parseFloat(thresholds.maxVoltage)
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update thresholds");
      }

      setThresholdSuccess(true);
      setTimeout(() => setThresholdSuccess(false), 2000);
    } catch (err) {
      setThresholdError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setIsSavingThreshold(false);
    }
  };

  const handleAddDevice = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!deviceForm.name.trim()) {
      setError("Device name is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/machines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: deviceForm.name,
          model: deviceForm.model || null,
          location: deviceForm.location || null,
          maxCurrent: deviceForm.maxCurrent
            ? parseFloat(deviceForm.maxCurrent)
            : null,
          maxVoltage: deviceForm.maxVoltage
            ? parseFloat(deviceForm.maxVoltage)
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add device");
      }

      setSuccess(true);
      setDeviceForm({
        name: "",
        model: "",
        location: "",
        maxCurrent: "",
        maxVoltage: "",
      });

      // Auto-close modal after 1.5s
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header with Add Device Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Settings</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Plus size={20} />
              Add Device
            </button>
          </div>

          {/* Machine Selection */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <label className="block text-sm mb-2 text-gray-500">
              Select Machine
            </label>

            <select
              value={selectedMachineId}
              onChange={(e) => {
                setSelectedMachineId(e.target.value);
                setThresholds({ maxCurrent: "", maxVoltage: "" });
              }}
              className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-black w-full"
            >
              <option value="">Choose machine</option>
              {machines?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Threshold Form - Only shows when machine is selected */}
          {selectedMachineId && (
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">
                  Backend Threshold Settings
                </h2>
                <p className="text-sm text-gray-500">
                  Configure maximum thresholds for the selected machine. The
                  backend will generate alerts when these limits are exceeded.
                </p>
              </div>

              {/* Error Message */}
              {thresholdError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
                  {thresholdError}
                </div>
              )}

              {/* Success Message */}
              {thresholdSuccess && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg text-sm">
                  Thresholds updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max Current */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Current (A)
                  </label>
                  <input
                    type="number"
                    value={thresholds.maxCurrent}
                    onChange={(e) => handleChange("maxCurrent", e.target.value)}
                    placeholder="e.g., 150"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                  />
                </div>

                {/* Max Voltage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Voltage (V)
                  </label>
                  <input
                    type="number"
                    value={thresholds.maxVoltage}
                    onChange={(e) => handleChange("maxVoltage", e.target.value)}
                    placeholder="e.g., 230"
                    step="0.1"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSavingThreshold}
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
              >
                {isSavingThreshold ? "Saving..." : "Save Thresholds"}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Add Device Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Device</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg text-sm">
                Device added successfully!
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Device Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Device Name *
                </label>
                <input
                  type="text"
                  value={deviceForm.name}
                  onChange={(e) =>
                    handleDeviceFormChange("name", e.target.value)
                  }
                  placeholder="e.g., Welding Machine A"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  value={deviceForm.model}
                  onChange={(e) =>
                    handleDeviceFormChange("model", e.target.value)
                  }
                  placeholder="e.g., Model XYZ"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={deviceForm.location}
                  onChange={(e) =>
                    handleDeviceFormChange("location", e.target.value)
                  }
                  placeholder="e.g., Floor 1, Station A"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                />
              </div>

              {/* Max Current */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Current (A)
                </label>
                <input
                  type="number"
                  value={deviceForm.maxCurrent}
                  onChange={(e) =>
                    handleDeviceFormChange("maxCurrent", e.target.value)
                  }
                  placeholder="e.g., 150"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                />
              </div>

              {/* Max Voltage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Voltage (V)
                </label>
                <input
                  type="number"
                  value={deviceForm.maxVoltage}
                  onChange={(e) =>
                    handleDeviceFormChange("maxVoltage", e.target.value)
                  }
                  placeholder="e.g., 230"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-900 text-black dark:text-white"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDevice}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
              >
                {isLoading ? "Adding..." : "Add Device"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
