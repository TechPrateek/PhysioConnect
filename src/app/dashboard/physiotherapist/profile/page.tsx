import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { PhysioNavTabs } from "@/components/physiotherapist/nav-tabs";
import { PhysioProfileEditor } from "@/components/physiotherapist/profile-editor";
import { getPhysiotherapistProfileAction } from "@/actions/physiotherapists/profile";
import { getSpecializationsAction } from "@/actions/physiotherapists/specializations";

export default async function PhysiotherapistProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PHYSIOTHERAPIST") {
    redirect("/login");
  }

  const [profileRes, specsRes] = await Promise.all([
    getPhysiotherapistProfileAction(),
    getSpecializationsAction(),
  ]);

  if (!profileRes.success || !profileRes.data) {
    return (
      <div className="container mx-auto p-8 text-center text-sm text-destructive">
        {profileRes.error || "Failed to load profile"}
      </div>
    );
  }

  const isApproved = profileRes.data.verificationStatus === "APPROVED";

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
                <h1 className="text-base font-bold">Practitioner Portal</h1>
                <p className="text-[11px] text-muted-foreground">Etawah Territory</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isApproved ? "success" : "warning"}>
              {isApproved ? "Verified Practitioner" : "Verification Pending"}
            </Badge>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      <PhysioNavTabs />

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Profile & Consultation Settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your professional qualifications, consultation fee, clinic location, and active specializations in Etawah.
          </p>
        </div>

        <PhysioProfileEditor
          initialData={profileRes.data}
          availableSpecializations={specsRes.data || []}
        />
      </main>
    </div>
  );
}
