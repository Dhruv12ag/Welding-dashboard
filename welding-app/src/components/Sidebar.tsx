"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CpuIcon,
  AlertTriangleIcon,
  SettingsIcon,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Devices", href: "/devices", icon: CpuIcon },
  { name: "Alerts", href: "/alerts", icon: AlertTriangleIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 flex flex-col p-4">
      <h1 className="text-2xl font-semibold mb-8">Welding Panel</h1>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = path.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 
                ${active ? "bg-gray-200 dark:bg-gray-800 font-medium" : ""}`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
