"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Calendar, FileCheck, LayoutDashboard, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhysioNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Dashboard Overview",
      href: "/dashboard/physiotherapist",
      icon: LayoutDashboard,
    },
    {
      label: "Appointments & Requests",
      href: "/dashboard/physiotherapist/bookings",
      icon: Calendar,
    },
    {
      label: "Profile & Consultation Fees",
      href: "/dashboard/physiotherapist/profile",
      icon: UserCheck,
    },
    {
      label: "Documents & Verification",
      href: "/dashboard/physiotherapist/documents",
      icon: FileCheck,
    },
  ];

  return (
    <div className="flex border-b border-border bg-background px-4 sm:px-6">
      <div className="flex space-x-6 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 border-b-2 py-2.5 text-xs font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
