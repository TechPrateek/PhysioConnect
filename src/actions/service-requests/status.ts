"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";
import { PhysioOnlineStatus, VerificationStatus } from "@prisma/client";

export interface PhysioStatusData {
  id: string;
  onlineStatus: PhysioOnlineStatus;
  lastOnlineAt: Date | null;
  verificationStatus: VerificationStatus;
  homeVisitAvailable: boolean;
  clinicVisitAvailable: boolean;
  location: {
    latitude: number;
    longitude: number;
    locationUpdatedAt: Date;
  } | null;
}

export async function getPhysioOnlineStatusAction(): Promise<
  ActionResult<PhysioStatusData>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
      include: { location: true },
    });

    if (!physio || physio.deletedAt) {
      return {
        success: false,
        error: "Physiotherapist record not found.",
      };
    }

    return {
      success: true,
      data: {
        id: physio.id,
        onlineStatus: physio.onlineStatus,
        lastOnlineAt: physio.lastOnlineAt,
        verificationStatus: physio.verificationStatus,
        homeVisitAvailable: physio.homeVisitAvailable,
        clinicVisitAvailable: physio.clinicVisitAvailable,
        location: physio.location
          ? {
              latitude: Number(physio.location.latitude),
              longitude: Number(physio.location.longitude),
              locationUpdatedAt: physio.location.locationUpdatedAt,
            }
          : null,
      },
    };
  } catch (error) {
    console.error("getPhysioOnlineStatusAction error:", error);
    return {
      success: false,
      error: "Failed to retrieve practitioner availability status.",
    };
  }
}

export async function goOnlineAction(): Promise<
  ActionResult<{ success: boolean; message: string }>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized. Physiotherapist account required.",
      };
    }

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
      include: { location: true },
    });

    if (!physio || physio.deletedAt) {
      return {
        success: false,
        error: "Physiotherapist profile not found.",
      };
    }

    if (physio.verificationStatus !== VerificationStatus.APPROVED) {
      return {
        success: false,
        error: "You must have an APPROVED practitioner account to accept on-demand requests.",
      };
    }

    if (!physio.homeVisitAvailable && !physio.clinicVisitAvailable) {
      return {
        success: false,
        error: "Please enable at least one service capability (Home Visits or Clinic Visits) in your profile.",
      };
    }

    // If location is missing, initialize with standard Etawah center coordinates (26.7769, 79.0236)
    if (!physio.location) {
      await prisma.physiotherapistLocation.create({
        data: {
          physiotherapistId: physio.id,
          latitude: 26.7769,
          longitude: 79.0236,
          locationUpdatedAt: new Date(),
        },
      });
    }

    await prisma.physiotherapist.update({
      where: { id: physio.id },
      data: {
        onlineStatus: PhysioOnlineStatus.ONLINE,
        lastOnlineAt: new Date(),
      },
    });

    revalidatePath("/dashboard/physiotherapist");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      data: {
        success: true,
        message: "You are now ONLINE and ready to receive nearby physiotherapy requests in Etawah.",
      },
    };
  } catch (error) {
    console.error("goOnlineAction error:", error);
    return {
      success: false,
      error: "Failed to go online. Please try again.",
    };
  }
}

export async function goOfflineAction(): Promise<
  ActionResult<{ success: boolean; message: string }>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio || physio.deletedAt) {
      return { success: false, error: "Physiotherapist not found." };
    }

    await prisma.physiotherapist.update({
      where: { id: physio.id },
      data: {
        onlineStatus: PhysioOnlineStatus.OFFLINE,
      },
    });

    revalidatePath("/dashboard/physiotherapist");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      data: {
        success: true,
        message: "You are now OFFLINE and will not receive new requests.",
      },
    };
  } catch (error) {
    console.error("goOfflineAction error:", error);
    return {
      success: false,
      error: "Failed to go offline.",
    };
  }
}

export async function setBusyAction(): Promise<
  ActionResult<{ success: boolean; message: string }>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio || physio.deletedAt) {
      return { success: false, error: "Physiotherapist not found." };
    }

    await prisma.physiotherapist.update({
      where: { id: physio.id },
      data: {
        onlineStatus: PhysioOnlineStatus.BUSY,
      },
    });

    revalidatePath("/dashboard/physiotherapist");

    return {
      success: true,
      data: {
        success: true,
        message: "Status changed to BUSY.",
      },
    };
  } catch (error) {
    console.error("setBusyAction error:", error);
    return {
      success: false,
      error: "Failed to update busy status.",
    };
  }
}
