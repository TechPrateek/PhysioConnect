import { requireAuth } from "@/lib/auth/session";
import { UserRole } from "@/types";

export default async function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side authorization check for PATIENT role
  await requireAuth(["PATIENT"]);

  return <>{children}</>;
}
