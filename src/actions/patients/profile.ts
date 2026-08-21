"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  updatePatientProfileSchema,
  UpdatePatientProfileInput,
} from "@/features/patients/schemas";
import { ActionResult } from "@/actions/types";

export interface PatientProfileData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string | null;
  dateOfBirth: string | null;
  emergencyContact: string | null;
  medicalHistory: string | null;
  addressesCount: number;
  bookingsCount: number;
}

export async function getPatientProfileAction(): Promise<
  ActionResult<PatientProfileData>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access. Patient account required.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
      include: {
        _count: {
          select: {
            addresses: { where: { deletedAt: null } },
            bookings: true,
          },
        },
      },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient profile not found.",
      };
    }

    return {
      success: true,
      data: {
        id: patient.id,
        userId: patient.userId,
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.toISOString().split("T")[0]
          : null,
        emergencyContact: patient.emergencyContact,
        medicalHistory: patient.medicalHistory,
        addressesCount: patient._count.addresses,
        bookingsCount: patient._count.bookings,
      },
    };
  } catch (error) {
    console.error("getPatientProfileAction error:", error);
    return {
      success: false,
      error: "Failed to load patient profile.",
    };
  }
}

export async function updatePatientProfileAction(
  input: UpdatePatientProfileInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = updatePatientProfileSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid profile data",
      };
    }

    const {
      fullName,
      phone,
      gender,
      dateOfBirth,
      emergencyContact,
      medicalHistory,
    } = validated.data;

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient profile not found.",
      };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: fullName,
          phone,
        },
      }),
      prisma.patient.update({
        where: { id: patient.id },
        data: {
          fullName,
          phone,
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          emergencyContact: emergencyContact || null,
          medicalHistory: medicalHistory || null,
        },
      }),
    ]);

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/patient/profile");

    return {
      success: true,
      data: {
        success: true,
        message: "Profile updated successfully.",
      },
    };
  } catch (error) {
    console.error("updatePatientProfileAction error:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}
