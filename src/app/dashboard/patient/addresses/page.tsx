import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { PatientNavTabs } from "@/components/patient/nav-tabs";
import { PatientAddressManager } from "@/components/patient/address-manager";
import { getPatientAddressesAction } from "@/actions/patients/addresses";

export default async function PatientAddressesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PATIENT") {
    redirect("/login");
  }

  const addressesRes = await getPatientAddressesAction();

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
            <Link href="/#specializations">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Book New Session</span>
              </Button>
            </Link>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <PatientNavTabs />

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Saved Addresses in Etawah
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your residential addresses for seamless home visit bookings across Etawah.
          </p>
        </div>

        <PatientAddressManager
          initialAddresses={addressesRes.data || []}
        />
      </main>
    </div>
  );
}
