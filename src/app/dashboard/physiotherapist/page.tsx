import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  FileCheck,
  FileText,
  MapPin,
  ShieldCheck,
  Star,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { PhysioNavTabs } from "@/components/physiotherapist/nav-tabs";
import { getPhysiotherapistProfileAction } from "@/actions/physiotherapists/profile";
import { getPhysioOnlineStatusAction } from "@/actions/service-requests/status";
import { getPhysioIncomingOffersAction } from "@/actions/service-requests/manage";
import { OnlineStatusToggle } from "@/components/physiotherapist/online-status-toggle";
import { IncomingOffersPanel } from "@/components/physiotherapist/incoming-offers-panel";
import { formatCurrency } from "@/lib/utils";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function PhysiotherapistDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PHYSIOTHERAPIST") {
    redirect("/login");
  }

  const [profileRes, statusRes, offersRes] = await Promise.all([
    getPhysiotherapistProfileAction(),
    getPhysioOnlineStatusAction(),
    getPhysioIncomingOffersAction(),
  ]);

  const profile = profileRes.data;
  const statusData = statusRes.data;
  const incomingOffers = offersRes.data || [];

  const isApproved = profile?.verificationStatus === "APPROVED";
  const isRejected = profile?.verificationStatus === "REJECTED";

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
                    Doctor Portal
                  </h1>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
                    Practitioner Command • India
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <GlassBadge
                variant={
                  isApproved ? "success" : isRejected ? "destructive" : "warning"
                }
              >
                {isApproved
                  ? "✓ Verified Doctor"
                  : isRejected
                  ? "Verification Rejected"
                  : "Verification Pending"}
              </GlassBadge>
              <NotificationsDropdown />
              <UserMenu user={user} />
            </div>
          </div>
        </div>
      </header>

      <PhysioNavTabs />

      <main className="container mx-auto max-w-7xl px-4 pt-4 space-y-8">
        {/* Verification Alert Banner */}
        {!isApproved && (
          <GlassIsland
            level={2}
            className={`p-5 flex items-center justify-between gap-4 border ${
              isRejected
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">
                  {isRejected
                    ? "Your profile verification was rejected"
                    : "Your profile is pending admin verification"}
                </span>
                <p className="text-muted-foreground mt-0.5">
                  {isRejected
                    ? profile?.rejectionReason || "Please review and re-upload your certificates."
                    : "Please ensure your BPT/MPT degree and registration certificate are uploaded."}
                </p>
              </div>
            </div>

            <Link href="/dashboard/physiotherapist/documents">
              <Button size="sm" variant={isRejected ? "destructive" : "outline"} className="rounded-xl text-xs font-bold glass-subtle">
                Manage Documents ({profile?.documentsCount || 0})
              </Button>
            </Link>
          </GlassIsland>
        )}

        {/* 1. Real-time Marketplace Availability Switcher */}
        {statusData && <OnlineStatusToggle initialStatus={statusData} />}

        {/* 2. Incoming On-Demand Request Offers & Live Listener */}
        <IncomingOffersPanel
          initialOffers={incomingOffers}
          isOnline={statusData?.onlineStatus === "ONLINE"}
        />

        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Welcome, Dr. {profile?.fullName?.replace(/^Dr\.\s*/i, "") || user.name}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Overview of your consultations, patient ratings, and schedule in Etawah, Uttar Pradesh.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Appointments Manager
            </span>
            <div className="pt-1">
              <Link href="/dashboard/physiotherapist/bookings" className="text-primary hover:underline text-lg font-black flex items-center gap-1">
                <span>View Schedule</span>
                <span>&rarr;</span>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Manage active patient visits</p>
          </GlassIsland>

          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Consultation Fee
            </span>
            <div className="text-2xl font-black text-foreground pt-1">
              {formatCurrency(profile?.consultationFee || 500)}
            </div>
            <p className="text-xs text-muted-foreground">Per completed session</p>
          </GlassIsland>

          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Practitioner Rating
            </span>
            <div className="text-2xl font-black text-foreground flex items-center gap-1.5 pt-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span>{profile?.averageRating.toFixed(1) || "5.0"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.totalReviews || 0} verified patient reviews
            </p>
          </GlassIsland>

          <GlassIsland level={2} className="p-5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Clinical Experience
            </span>
            <div className="text-2xl font-black text-foreground pt-1">
              {profile?.experienceYears || 0} Years
            </div>
            <p className="text-xs text-muted-foreground">Etawah, Uttar Pradesh</p>
          </GlassIsland>
        </div>

        {/* Practice Highlights */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <GlassIsland level={2} className="lg:col-span-2 p-6 space-y-5">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-base font-black text-foreground">Specializations & Visit Modes</h3>
              <p className="text-xs text-muted-foreground">
                Your active clinical capabilities displayed to Etawah patients
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile?.specializations && profile.specializations.length > 0 ? (
                  profile.specializations.map((spec) => (
                    <GlassBadge key={spec.id} variant="primary" className="px-3 py-1 text-xs">
                      {spec.name}
                    </GlassBadge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No specializations selected yet.</p>
                )}
              </div>

              <div className="border-t border-border/60 pt-4 grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl glass-subtle p-3.5 space-y-1">
                  <span className="text-muted-foreground font-semibold">Home Visits:</span>
                  <p className="font-bold text-foreground">
                    {profile?.homeVisitAvailable ? "Enabled (Doorstep Visits in Etawah)" : "Disabled"}
                  </p>
                </div>
                <div className="rounded-2xl glass-subtle p-3.5 space-y-1">
                  <span className="text-muted-foreground font-semibold">Clinic Visits:</span>
                  <p className="font-bold text-foreground truncate">
                    {profile?.clinicVisitAvailable
                      ? profile.clinicAddress || "Enabled"
                      : "Disabled (Home visits only)"}
                  </p>
                </div>
              </div>
            </div>
          </GlassIsland>

          <GlassIsland level={2} className="p-6 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-base font-black text-foreground">Quick Actions</h3>
              <p className="text-xs text-muted-foreground">Manage your practitioner profile</p>
            </div>
            <div className="space-y-2.5">
              <Link href="/dashboard/physiotherapist/profile" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold h-11 rounded-2xl glass-subtle hover:bg-primary/[0.06] hover:border-primary/40 transition-all">
                  Edit Profile & Fees
                </Button>
              </Link>
              <Link href="/dashboard/physiotherapist/documents" className="block">
                <Button variant="outline" className="w-full justify-start text-xs font-semibold h-11 rounded-2xl glass-subtle hover:bg-primary/[0.06] hover:border-primary/40 transition-all">
                  Upload / Check Documents
                </Button>
              </Link>
            </div>
          </GlassIsland>
        </div>
      </main>
    </div>
  );
}
