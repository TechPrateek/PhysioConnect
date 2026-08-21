import { requireAuth } from "@/lib/auth/session";

export default async function PhysiotherapistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side authorization check for PHYSIOTHERAPIST role
  await requireAuth(["PHYSIOTHERAPIST"]);

  return <>{children}</>;
}
