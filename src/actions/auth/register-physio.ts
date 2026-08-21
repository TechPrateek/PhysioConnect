"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { registerPhysioSchema, RegisterPhysioInput } from "@/features/auth/schemas";
import { ActionResult } from "@/actions/types";
import { UserRole, VerificationStatus, DayOfWeek } from "@prisma/client";

export async function registerPhysiotherapistAction(
  input: RegisterPhysioInput
): Promise<ActionResult<{ redirectUrl: string }>> {
  try {
    const validated = registerPhysioSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid registration data",
      };
    }

    const {
      name,
      email,
      phone,
      password,
      experienceYears,
      consultationFee,
      clinicAddress,
      homeVisitAvailable,
      clinicVisitAvailable,
      bio,
      specializationIds,
    } = validated.data;

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting: 5 registrations per hour per email/IP
    const rateLimit = await checkRateLimit({
      key: `register:physio:${normalizedEmail}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      };
    }

    // Check existing email
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

    // Create User, Physiotherapist profile, Specializations & Availability in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone,
          password: passwordHash,
          role: UserRole.PHYSIOTHERAPIST,
          emailVerified: false,
          physiotherapist: {
            create: {
              fullName: name,
              phone,
              email: normalizedEmail,
              experienceYears,
              consultationFee,
              clinicAddress: clinicAddress || null,
              homeVisitAvailable,
              clinicVisitAvailable,
              bio: bio || null,
              verificationStatus: VerificationStatus.PENDING,
              city: "Etawah",
              state: "Uttar Pradesh",
            },
          },
        },
        include: {
          physiotherapist: true,
        },
      });

      if (user.physiotherapist) {
        const pId = user.physiotherapist.id;

        // Associate Specializations
        if (specializationIds.length > 0) {
          await tx.physiotherapistSpecialization.createMany({
            data: specializationIds.map((specId) => ({
              physiotherapistId: pId,
              specializationId: specId,
            })),
            skipDuplicates: true,
          });
        }

        // Initialize default availability schedule (Mon - Sat)
        const days: DayOfWeek[] = [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];

        await tx.availability.createMany({
          data: days.map((day) => ({
            physiotherapistId: pId,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "19:00",
            slotDurationMinutes: 60,
            isActive: true,
            isHomeVisit: homeVisitAvailable,
            isClinicVisit: clinicVisitAvailable,
          })),
          skipDuplicates: true,
        });
      }

      return user;
    });

    // Create session and set HTTP-only cookie
    await createSession(newUser.id, false);

    return {
      success: true,
      data: { redirectUrl: "/dashboard/physiotherapist" },
    };
  } catch (error) {
    console.error("registerPhysiotherapistAction error:", error);
    return {
      success: false,
      error: "Something went wrong during physiotherapist registration.",
    };
  }
}
