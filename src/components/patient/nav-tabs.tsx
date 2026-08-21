"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function PatientNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Overview",
      href: "/dashboard/patient",
      icon: LayoutDashboard,
    },
    {
      label: "My Appointments",
      href: "/dashboard/patient/bookings",
      icon: Calendar,
    },
    {
      label: "Medical Profile",
      href: "/dashboard/patient/profile",
      icon: User,
    },
    {
      label: "Saved Addresses",
      href: "/dashboard/patient/addresses",
      icon: MapPin,
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-4 pb-2">
      <div className="glass-subtle rounded-2xl p-1.5 inline-flex items-center gap-1.5 overflow-x-auto max-w-full shadow-xs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
