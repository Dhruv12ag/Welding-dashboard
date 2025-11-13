"use client";
import React from "react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string; // tailwind color class e.g. "bg-green-50"
};

export default function DashboardStatsCard({
  title,
  value,
  subtitle,
  color = "bg-white",
}: Props) {
  return (
    <div className={`p-4 rounded-2xl shadow-sm ${color}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}
