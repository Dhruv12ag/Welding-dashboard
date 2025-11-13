"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale
);

type Props = {
  labels: string[];
  data: number[];
  label?: string;
  height?: number;
};

export default function LineChart({
  labels,
  data,
  label = "",
  height = 150,
}: Props) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        fill: true,
        tension: 0.25,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" as const, intersect: false },
    },
    scales: {
      x: { display: false },
      y: { display: true, beginAtZero: false },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
