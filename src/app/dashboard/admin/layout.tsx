import { requireAuth } from "@/lib/auth/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side authorization check for ADMIN role
  await requireAuth(["ADMIN"]);

  return <>{children}</>;
}
