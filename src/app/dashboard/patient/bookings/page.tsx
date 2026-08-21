import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { PatientNavTabs } from "@/components/patient/nav-tabs";
import { BookingCard } from "@/components/booking/booking-card";
import { getPatientBookingsAction } from "@/actions/bookings/manage";

export default async function PatientBookingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PATIENT") {
    redirect("/login");
  }

  const bookingsRes = await getPatientBookingsAction();
  const bookings = bookingsRes.data || [];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">Patient Portal</h1>
                <p className="text-[11px] text-muted-foreground">Etawah Territory</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/browse">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Book New Session</span>
              </Button>
            </Link>
            <NotificationsDropdown />
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <PatientNavTabs />

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            My Appointments
          </h2>
          <p className="text-sm text-muted-foreground">
            Track and manage your scheduled physiotherapy visits across Etawah.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground text-xs space-y-3 bg-card">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <h4 className="text-sm font-semibold text-foreground">
              No appointments found
            </h4>
            <p className="max-w-md mx-auto leading-relaxed">
              You haven&apos;t booked any physiotherapy sessions yet. Discover verified local doctors in Etawah.
            </p>
            <div className="pt-2">
              <Link href="/browse">
                <Button size="sm">Find a Physiotherapist</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} role="PATIENT" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
