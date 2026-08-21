"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { loginSchema, LoginInput } from "@/features/auth/schemas";
import { ActionResult } from "@/actions/types";
import { getRedirectForRole } from "@/lib/permissions";
import { UserRole } from "@/types";

export async function loginAction(
  input: LoginInput
): Promise<ActionResult<{ redirectUrl: string; user: { id: string; name: string; role: string } }>> {
  try {
    const validated = loginSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid email or password",
      };
    }

    const { email, password, rememberMe } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting: 5 failed attempts per 15 minutes
    const rateLimit = await checkRateLimit({
      key: `login:${normalizedEmail}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many login attempts. Please wait 15 minutes before trying again.",
      };
    }

    // Lookup user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.password || user.deletedAt) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Verify Argon2 password hash
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    // Create session in database and set HTTP-only cookie
    await createSession(user.id, rememberMe);

    const redirectUrl = getRedirectForRole(user.role as UserRole);

    return {
      success: true,
      data: {
        redirectUrl,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      },
    };
  } catch (error) {
    console.error("loginAction error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login. Please try again.",
    };
  }
}
