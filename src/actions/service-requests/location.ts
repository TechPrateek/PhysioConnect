"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  updatePhysioLocationSchema,
  UpdatePhysioLocationInput,
} from "@/features/service-requests/schemas";
import { ActionResult } from "@/actions/types";

export async function updatePhysiotherapistLocationAction(
  input: UpdatePhysioLocationInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized access. Physiotherapist account required.",
      };
    }

    const validated = updatePhysioLocationSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid geographic coordinates",
      };
    }

    const { latitude, longitude } = validated.data;

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio || physio.deletedAt) {
      return {
        success: false,
        error: "Physiotherapist record not found.",
      };
    }

    await prisma.physiotherapistLocation.upsert({
      where: { physiotherapistId: physio.id },
      update: {
        latitude,
        longitude,
        locationUpdatedAt: new Date(),
      },
      create: {
        physiotherapistId: physio.id,
        latitude,
        longitude,
        locationUpdatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: {
        success: true,
        message: "Location updated successfully.",
      },
    };
  } catch (error) {
    console.error("updatePhysiotherapistLocationAction error:", error);
    return {
      success: false,
      error: "Failed to update live practitioner location.",
    };
  }
}
