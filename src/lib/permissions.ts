import { UserRole } from "@/types";

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  PATIENT: "/dashboard/patient",
  PHYSIOTHERAPIST: "/dashboard/physiotherapist",
  ADMIN: "/dashboard/admin",
};

export function getRedirectForRole(role: UserRole): string {
  return ROLE_REDIRECT_MAP[role] || "/";
}

export function isAuthorizedRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
