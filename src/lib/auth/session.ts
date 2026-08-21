import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/types";
import { getRedirectForRole } from "@/lib/permissions";

export const SESSION_COOKIE_NAME = "physioconnect_session";
const DEFAULT_SESSION_EXPIRY_DAYS = 7;
const REMEMBER_ME_EXPIRY_DAYS = 30;

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  image: string | null;
  emailVerified: boolean;
  patient?: {
    id: string;
    fullName: string;
    phone: string;
    emergencyContact: string | null;
  } | null;
  physiotherapist?: {
    id: string;
    fullName: string;
    phone: string;
    verificationStatus: string;
    experienceYears: number;
    consultationFee: number;
    homeVisitAvailable: boolean;
    clinicVisitAvailable: boolean;
  } | null;
  admin?: {
    id: string;
    fullName: string;
    department: string;
    isSuperAdmin: boolean;
  } | null;
}

export async function createSession(
  userId: string,
  rememberMe = false,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiryDays = rememberMe ? REMEMBER_ME_EXPIRY_DAYS : DEFAULT_SESSION_EXPIRY_DAYS;
  const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  // Store in database
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  // Set HTTP-only secure cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            patient: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                emergencyContact: true,
              },
            },
            physiotherapist: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                verificationStatus: true,
                experienceYears: true,
                consultationFee: true,
                homeVisitAvailable: true,
                clinicVisitAvailable: true,
              },
            },
            admin: {
              select: {
                id: true,
                fullName: true,
                department: true,
                isSuperAdmin: true,
              },
            },
          },
        },
      },
    });

    if (!session) return null;

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      await destroySession();
      return null;
    }

    // Check if user is soft-deleted
    if (session.user.deletedAt) {
      await destroySession();
      return null;
    }

    const { user } = session;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      phone: user.phone,
      image: user.image,
      emailVerified: user.emailVerified,
      patient: user.patient,
      physiotherapist: user.physiotherapist,
      admin: user.admin,
    };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    try {
      await prisma.session.delete({
        where: { token },
      });
    } catch (e) {
      // ignore if already deleted
    }
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect("/access-denied");
  }

  return user;
}
