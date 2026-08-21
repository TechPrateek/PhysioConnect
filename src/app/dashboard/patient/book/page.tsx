import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { BookingForm } from "@/components/booking/booking-form";
import { getPhysiotherapistDetailsAction } from "@/actions/physiotherapists/discovery";
import { getPatientAddressesAction } from "@/actions/patients/addresses";

interface PatientBookPageProps {
  searchParams: Promise<{
    physioId?: string;
    date?: string;
    timeSlot?: string;
    type?: "HOME_VISIT" | "CLINIC_VISIT";
  }>;
}

export default async function PatientBookPage(props: PatientBookPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PATIENT") {
    redirect("/login?callbackUrl=/dashboard/patient/book");
  }

  const searchParams = await props.searchParams;
  const { physioId, date, timeSlot, type = "HOME_VISIT" } = searchParams;

  if (!physioId || !date || !timeSlot) {
    redirect("/browse");
  }

  const [physioRes, addressesRes] = await Promise.all([
    getPhysiotherapistDetailsAction(physioId),
    getPatientAddressesAction(),
  ]);

  if (!physioRes.success || !physioRes.data) {
    redirect("/browse");
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
          href={`/physiotherapists/${physioId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Doctor Profile
        </Link>

        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Complete Your Appointment Booking
          </h2>
          <p className="text-sm text-muted-foreground">
            Review your session schedule, enter symptoms, and confirm your Etawah address.
          </p>
        </div>

        <BookingForm
          physio={physioRes.data}
          date={date}
          timeSlot={timeSlot}
          type={type}
          addresses={addressesRes.data || []}
        />
      </main>
    </div>
  );
}
