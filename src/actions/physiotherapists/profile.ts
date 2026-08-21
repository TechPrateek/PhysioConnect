"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { updatePhysioProfileSchema, UpdatePhysioProfileInput } from "@/features/physiotherapists/schemas";
import { ActionResult } from "@/actions/types";

export interface PhysiotherapistProfileData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  experienceYears: number;
  consultationFee: number;
  bio: string | null;
  languages: string[];
  clinicAddress: string | null;
  homeVisitAvailable: boolean;
  clinicVisitAvailable: boolean;
  verificationStatus: string;
  rejectionReason: string | null;
  averageRating: number;
  totalReviews: number;
  city: string;
  state: string;
  specializations: { id: string; name: string; slug: string }[];
  documentsCount: number;
}

export async function getPhysiotherapistProfileAction(): Promise<
  ActionResult<PhysiotherapistProfileData>
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
      include: {
        specializations: {
          include: {
            specialization: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!physio) {
      return {
        success: false,
        error: "Physiotherapist profile not found.",
      };
    }

    return {
      success: true,
      data: {
        id: physio.id,
        userId: physio.userId,
        fullName: physio.fullName,
        email: physio.email,
        phone: physio.phone,
        experienceYears: physio.experienceYears,
        consultationFee: physio.consultationFee,
        bio: physio.bio,
        languages: physio.languages,
        clinicAddress: physio.clinicAddress,
        homeVisitAvailable: physio.homeVisitAvailable,
        clinicVisitAvailable: physio.clinicVisitAvailable,
        verificationStatus: physio.verificationStatus,
        rejectionReason: physio.rejectionReason,
        averageRating: physio.averageRating,
        totalReviews: physio.totalReviews,
        city: physio.city,
        state: physio.state,
        specializations: physio.specializations.map((s) => ({
          id: s.specialization.id,
          name: s.specialization.name,
          slug: s.specialization.slug,
        })),
        documentsCount: physio._count.documents,
      },
    };
  } catch (error) {
    console.error("getPhysiotherapistProfileAction error:", error);
    return {
      success: false,
      error: "Failed to load practitioner profile.",
    };
  }
}

export async function updatePhysiotherapistProfileAction(
  input: UpdatePhysioProfileInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = updatePhysioProfileSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid profile data",
      };
    }

    const {
      fullName,
      phone,
      experienceYears,
      consultationFee,
      clinicAddress,
      homeVisitAvailable,
      clinicVisitAvailable,
      bio,
      languages,
      specializationIds,
    } = validated.data;

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio) {
      return {
        success: false,
        error: "Practitioner profile not found.",
      };
    }

    const pId = physio.id;

    // Transaction to update user name/phone, physio record, and specializations
    await prisma.$transaction(async (tx) => {
      // 1. Update user
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: fullName,
          phone,
        },
      });

      // 2. Update physiotherapist
      await tx.physiotherapist.update({
        where: { id: pId },
        data: {
          fullName,
          phone,
          experienceYears,
          consultationFee,
          clinicAddress: clinicAddress || null,
          homeVisitAvailable,
          clinicVisitAvailable,
          bio: bio || null,
          languages,
        },
      });

      // 3. Sync specializations
      await tx.physiotherapistSpecialization.deleteMany({
        where: { physiotherapistId: pId },
      });

      if (specializationIds.length > 0) {
        await tx.physiotherapistSpecialization.createMany({
          data: specializationIds.map((sId) => ({
            physiotherapistId: pId,
            specializationId: sId,
          })),
        });
      }

      // 4. Update availability flags
      await tx.availability.updateMany({
        where: { physiotherapistId: pId },
        data: {
          isHomeVisit: homeVisitAvailable,
          isClinicVisit: clinicVisitAvailable,
        },
      });
    });

    revalidatePath("/dashboard/physiotherapist");
    revalidatePath("/dashboard/physiotherapist/profile");

    return {
      success: true,
      data: {
        success: true,
        message: "Profile updated successfully.",
      },
    };
  } catch (error) {
    console.error("updatePhysiotherapistProfileAction error:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}
