"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { registerPatientSchema, RegisterPatientInput } from "@/features/auth/schemas";
import { ActionResult } from "@/actions/types";
import { UserRole } from "@prisma/client";

export async function registerPatientAction(
  input: RegisterPatientInput
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const validated = registerPatientSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid registration data",
      };
    }

    const { name, email, phone, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting: 5 registrations per hour per email/IP
    const rateLimit = await checkRateLimit({
      key: `register:patient:${normalizedEmail}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists. Please log in.",
      };
    }

    // Hash password with Argon2id
    const passwordHash = await hashPassword(password);

    // Create User and Patient in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone,
          password: passwordHash,
          role: UserRole.PATIENT,
          emailVerified: false,
          patient: {
            create: {
              fullName: name,
              phone,
              email: normalizedEmail,
            },
          },
        },
      });

      return user;
    });

    // Create session and set HTTP-only cookie
    await createSession(newUser.id, false);

    return {
      success: true,
      data: { redirectUrl: "/dashboard/patient" },
    };
  } catch (error) {
    console.error("registerPatientAction error:", error);
    return {
      success: false,
      error: "Something went wrong during registration. Please try again.",
    };
  }
}
