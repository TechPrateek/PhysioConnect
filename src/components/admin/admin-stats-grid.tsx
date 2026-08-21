import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  FileCheck,
  Radio,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { AdminMetricsData } from "@/actions/admin/metrics";
import { formatCurrency } from "@/lib/utils";
import { GlassIsland } from "@/components/ui/glass/glass-island";

interface AdminStatsGridProps {
  metrics: AdminMetricsData;
}

export function AdminStatsGrid({ metrics }: AdminStatsGridProps) {
  const stats = [
    {
      title: "Online Doctors (Live)",
      value: metrics.onlinePhysios,
      description: `${metrics.approvedPhysios} verified in Etawah`,
      icon: Radio,
      color: "text-emerald-600 dark:text-cyan-400",
      bgColor: "bg-emerald-500/10 dark:bg-cyan-500/15 border-emerald-500/20 dark:border-cyan-500/30",
      glow: "emerald" as const,
    },
    {
      title: "Active On-Demand Requests",
      value: metrics.activeServiceRequests,
      description: `${metrics.pendingOffers} pending doctor offers`,
      icon: Zap,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
      glow: "none" as const,
    },
    {
      title: "Total Bookings",
      value: metrics.totalBookings,
      description: `${metrics.completedBookings} completed • ${metrics.activeBookings} active`,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10 border-primary/20",
      glow: "teal" as const,
    },
    {
      title: "Platform GMV (Revenue)",
      value: formatCurrency(metrics.totalRevenue),
      description: `${formatCurrency(metrics.pendingRevenue)} pending capture`,
      icon: CreditCard,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
      glow: "none" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <GlassIsland
          key={item.title}
          level={2}
          glow={item.glow}
          interactive
          className="p-5 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {item.title}
            </span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur-md ${item.bgColor} ${item.color}`}
            >
              <item.icon className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-foreground tracking-tight">
              {item.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {item.description}
            </p>
          </div>
        </GlassIsland>
      ))}
    </div>
  );
}
