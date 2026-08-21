import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { PhysioNavTabs } from "@/components/physiotherapist/nav-tabs";
import { PhysioDocumentManager } from "@/components/physiotherapist/document-manager";
import { getPhysiotherapistProfileAction } from "@/actions/physiotherapists/profile";
import { getPhysiotherapistDocumentsAction } from "@/actions/physiotherapists/documents";

export default async function PhysiotherapistDocumentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PHYSIOTHERAPIST") {
    redirect("/login");
  }

  const [profileRes, docsRes] = await Promise.all([
    getPhysiotherapistProfileAction(),
    getPhysiotherapistDocumentsAction(),
  ]);

  const profile = profileRes.data;
  const isApproved = profile?.verificationStatus === "APPROVED";

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
            Practitioner Verification
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your credentials and view document verification status from the Etawah operations desk.
          </p>
        </div>

        <PhysioDocumentManager
          initialDocuments={docsRes.data || []}
          verificationStatus={profile?.verificationStatus || "PENDING"}
          rejectionReason={profile?.rejectionReason || null}
        />
      </main>
    </div>
  );
}
