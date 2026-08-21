import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { BookingDetailsView } from "@/components/booking/booking-details-view";
import { getBookingDetailsAction } from "@/actions/bookings/manage";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientBookingDetailPage(props: BookingDetailPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await props.params;
  const res = await getBookingDetailsAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

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
          <UserMenu user={user} />
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Link
          href="/dashboard/patient/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all appointments
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Appointment #{res.data.bookingNumber}
            </h2>
            <p className="text-xs text-muted-foreground">
              Booked on {new Date(res.data.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        <BookingDetailsView booking={res.data} currentUserId={user.id} />
      </main>
    </div>
  );
}
