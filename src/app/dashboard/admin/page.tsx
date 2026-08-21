import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, ShieldAlert, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { PractitionerVerificationQueue } from "@/components/admin/practitioner-verification-queue";
import { AdminBookingsTable } from "@/components/admin/admin-bookings-table";
import { getAdminMetricsAction } from "@/actions/admin/metrics";
import { getPractitionersVerificationQueueAction } from "@/actions/admin/verification";
import { getAdminBookingsAction } from "@/actions/admin/bookings";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const [metricsRes, queueRes, bookingsRes] = await Promise.all([
    getAdminMetricsAction(),
    getPractitionersVerificationQueueAction(),
    getAdminBookingsAction(),
  ]);

  const metrics = metricsRes.data || {
    totalPatients: 0,
    totalPhysiotherapists: 0,
    approvedPhysios: 0,
    pendingPhysios: 0,
    rejectedPhysios: 0,
    onlinePhysios: 0,
    activeServiceRequests: 0,
    pendingOffers: 0,
    totalBookings: 0,
    completedBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    averageRating: 5.0,
    totalReviews: 0,
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Floating Glass Header */}
      <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-1">
        <div className="container mx-auto max-w-7xl">
          <div className="glass-floating rounded-2xl px-5 py-3 flex items-center justify-between shadow-soft-md">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-700 text-primary-foreground font-bold shadow-soft transition-transform group-hover:scale-105">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-sm font-extrabold tracking-tight text-foreground">
                    Admin Command
                  </h1>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
                    Marketplace Control • India
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <GlassBadge variant="primary" className="px-3 py-1 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
              </GlassBadge>
              <NotificationsDropdown />
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="container mx-auto max-w-7xl px-4 pt-6 space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Platform Overview & Operations
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitor verified practitioner onboarding, review uploaded credentials, and track patient appointments in Etawah.
          </p>
        </div>

        {/* 1. Key Metrics Grid */}
        <AdminStatsGrid metrics={metrics} />

        {/* 2. Practitioner Verification Queue */}
        <GlassIsland level={2} className="p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-black text-foreground">
                Practitioner Verification Queue
              </h3>
              <p className="text-xs text-muted-foreground">
                Verify degrees, medical registration numbers, and identity documents before approving doctors.
              </p>
            </div>
            {metrics.pendingPhysios > 0 && (
              <GlassBadge variant="warning">
                {metrics.pendingPhysios} Pending Review
              </GlassBadge>
            )}
          </div>

          <PractitionerVerificationQueue
            initialPractitioners={queueRes.data || []}
          />
        </GlassIsland>

        {/* 3. Booking Oversight */}
        <GlassIsland level={2} className="p-6 sm:p-7 space-y-5">
          <div className="border-b border-border/60 pb-3">
            <h3 className="text-base font-black text-foreground">
              Marketplace Bookings Oversight
            </h3>
            <p className="text-xs text-muted-foreground">
              Complete history of scheduled, ongoing, completed, and cancelled physiotherapy sessions.
            </p>
          </div>

          <AdminBookingsTable initialBookings={bookingsRes.data || []} />
        </GlassIsland>
      </main>
    </div>
  );
}
