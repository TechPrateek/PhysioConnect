import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Home,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { PatientNavTabs } from "@/components/patient/nav-tabs";
import { getPatientProfileAction } from "@/actions/patients/profile";
import { getPatientAddressesAction } from "@/actions/patients/addresses";
import { getPatientActiveRequestsAction } from "@/actions/service-requests/manage";
import { getPatientBookingsAction } from "@/actions/bookings/manage";
import { OnDemandBookingModal } from "@/components/patient/on-demand-request-modal";
import { ActiveRequestsTracker } from "@/components/patient/active-requests-tracker";
import { formatDate, formatTimeSlot, formatCurrency } from "@/lib/utils";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassCard } from "@/components/ui/glass/glass-card";
import { GlassBadge } from "@/components/ui/glass/glass-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function PatientDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PATIENT") {
    redirect("/login");
  }

  const [profileRes, addressesRes, activeRequestsRes, bookingsRes] = await Promise.all([
    getPatientProfileAction(),
    getPatientAddressesAction(),
    getPatientActiveRequestsAction(),
    getPatientBookingsAction(),
  ]);

  const profile = profileRes.data;
  const addresses = addressesRes.data || [];
  const activeRequests = activeRequestsRes.data || [];
  const allBookings = bookingsRes.data || [];

  const upcomingBookings = allBookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "IN_PROGRESS" || b.status === "PENDING"
  );
  const completedBookings = allBookings.filter((b) => b.status === "COMPLETED");

  const nextUpcoming = upcomingBookings[0] || null;

  // Time-aware greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen pb-16">
      {/* Floating Glass Header Island */}
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
                    PhysioConnect
                  </h1>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
                    Patient Healthcare Portal
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <ThemeToggle />
              <div className="hidden sm:block">
                <OnDemandBookingModal addresses={addresses} />
              </div>
              <NotificationsDropdown />
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      <PatientNavTabs />

      <main className="container mx-auto max-w-7xl px-4 pt-4 space-y-8">
        {/* Personal Greeting */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {greeting}, {profile?.fullName?.split(" ")[0] || user.name.split(" ")[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Your personal physiotherapy & rehabilitation command center in Etawah.
          </p>
        </div>

        {/* 1. Hero Glass Island — Healthcare Command Center */}
        <GlassIsland level={4} glow="teal" className="p-6 sm:p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              Instant Care • Friends Colony & Civil Lines, Etawah
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-3xl font-black tracking-tight text-foreground">
                Need expert care at your doorstep?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect with verified BPT/MPT physiotherapists for on-demand home visits and clinic consultations across Etawah within minutes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <OnDemandBookingModal addresses={addresses} />
              <Link href="/browse">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold h-9 px-4 glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 transition-all border-border"
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary" />
                  Schedule Advance Visit
                </Button>
              </Link>
            </div>
          </div>
        </GlassIsland>

        {/* 2. Active Real-Time On-Demand Requests Radar Island */}
        {activeRequests.length > 0 && (
          <GlassIsland level={3} glow="emerald" className="p-5">
            <ActiveRequestsTracker requests={activeRequests} />
          </GlassIsland>
        )}

        {/* 3. Upcoming Appointment Spotlight (if any) */}
        {nextUpcoming && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Upcoming Appointment
            </h3>
            <GlassIsland level={3} interactive className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 border border-primary/20 text-primary shadow-soft">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-foreground">
                        {nextUpcoming.physiotherapist.fullName}
                      </span>
                      <GlassBadge variant="success">
                        {nextUpcoming.status}
                      </GlassBadge>
                    </div>
                    <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground">
                        {formatDate(nextUpcoming.appointmentDate)} • {formatTimeSlot(nextUpcoming.timeSlot)}
                      </span>
                      <span>•</span>
                      <span>
                        {nextUpcoming.appointmentType === "HOME_VISIT"
                          ? `Home Visit (${nextUpcoming.address?.area || "Etawah"})`
                          : "Clinic Visit"}
                      </span>
                    </p>
                  </div>
                </div>

                <Link href={`/dashboard/patient/bookings/${nextUpcoming.id}`}>
                  <Button size="sm" className="rounded-xl text-xs font-bold gap-1.5 shadow-soft bg-primary text-primary-foreground hover:bg-primary/90">
                    <span>View Appointment</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </GlassIsland>
          </div>
        )}

        {/* 4. Your Care Metrics Islands */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming Visits
            </span>
            <p className="text-3xl font-black text-foreground">
              {upcomingBookings.length}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              {upcomingBookings.length > 0
                ? "Scheduled sessions awaiting completion"
                : "No sessions currently scheduled"}
            </p>
          </GlassIsland>

          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Completed Recoveries
            </span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {completedBookings.length}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Lifetime physiotherapy sessions in Etawah
            </p>
          </GlassIsland>

          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Saved Etawah Addresses
            </span>
            <p className="text-3xl font-black text-foreground">
              {addresses.length}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              {addresses.length > 0
                ? `Default: ${addresses[0].area}, Etawah`
                : "Add your home address for doorstep visits"}
            </p>
          </GlassIsland>
        </div>

        {/* 5. Recent Care History & Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassIsland level={2} className="lg:col-span-2 p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground">Recent Care History</h3>
                <p className="text-xs text-muted-foreground">
                  Your past and active physiotherapy consultations in Etawah
                </p>
              </div>
              <Link href="/dashboard/patient/bookings" className="text-xs font-bold text-primary hover:underline">
                View all &rarr;
              </Link>
            </div>

            {allBookings.length === 0 ? (
              <div className="glass-subtle rounded-2xl p-8 text-center text-muted-foreground text-xs space-y-3 border border-dashed">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground text-sm">No bookings yet</p>
                  <p className="max-w-xs mx-auto text-muted-foreground">
                    When you request or book a physiotherapist, your appointments will appear here.
                  </p>
                </div>
                <div className="pt-2">
                  <OnDemandBookingModal addresses={addresses} />
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {allBookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-primary/[0.03] -mx-2 px-3 rounded-xl transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">
                          {b.physiotherapist.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({b.appointmentType === "HOME_VISIT" ? "Home Visit" : "Clinic"})
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(b.appointmentDate)} • {formatTimeSlot(b.timeSlot)} • ₹{b.amount}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <GlassBadge
                        variant={
                          b.status === "COMPLETED"
                            ? "success"
                            : b.status === "CANCELLED"
                            ? "destructive"
                            : "primary"
                        }
                      >
                        {b.status}
                      </GlassBadge>
                      <Link href={`/dashboard/patient/bookings/${b.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5 rounded-lg">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassIsland>

          {/* Quick Shortcuts */}
          <GlassIsland level={2} className="p-6 space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-base font-extrabold text-foreground">Quick Actions</h3>
              <p className="text-xs text-muted-foreground">Location & profile shortcuts</p>
            </div>
            <div className="space-y-2.5">
              <Link href="/dashboard/patient/addresses" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold gap-2.5 h-11 rounded-xl glass-subtle hover:bg-primary/[0.06] hover:border-primary/40 transition-all">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Manage Etawah Addresses ({addresses.length})</span>
                </Button>
              </Link>
              <Link href="/dashboard/patient/profile" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold gap-2.5 h-11 rounded-xl glass-subtle hover:bg-primary/[0.06] hover:border-primary/40 transition-all">
                  <User className="h-4 w-4 text-primary" />
                  <span>Clinical Profile & Medical History</span>
                </Button>
              </Link>
              <Link href="/browse" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold gap-2.5 h-11 rounded-xl glass-subtle hover:bg-primary/[0.06] hover:border-primary/40 transition-all">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  <span>Browse Directory of Doctors</span>
                </Button>
              </Link>
            </div>
          </GlassIsland>
        </div>
      </main>
    </div>
  );
}
