"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  reviewPractitionerSchema,
  ReviewPractitionerInput,
} from "@/features/admin/schemas";
import { ActionResult } from "@/actions/types";
import { VerificationStatus, DocumentType } from "@prisma/client";

export interface PractitionerVerificationItem {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  experienceYears: number;
  consultationFee: number;
  clinicAddress: string | null;
  bio: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  createdAt: Date;
  specializations: { id: string; name: string }[];
  documents: {
    id: string;
    documentType: DocumentType;
    title: string;
    fileUrl: string;
    verificationStatus: VerificationStatus;
    createdAt: Date;
  }[];
}

export async function getPractitionersVerificationQueueAction(
  filterStatus?: VerificationStatus
): Promise<ActionResult<PractitionerVerificationItem[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const whereClause: any = {
      deletedAt: null,
    };

    if (filterStatus) {
      whereClause.verificationStatus = filterStatus;
    }

    const physios = await prisma.physiotherapist.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }],
      include: {
        specializations: {
          include: { specialization: true },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return {
      success: true,
      data: physios.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        phone: p.phone,
        email: p.email,
        experienceYears: p.experienceYears,
        consultationFee: p.consultationFee,
        clinicAddress: p.clinicAddress,
        bio: p.bio,
        verificationStatus: p.verificationStatus,
        rejectionReason: p.rejectionReason,
        createdAt: p.createdAt,
        specializations: p.specializations.map((s) => ({
          id: s.specialization.id,
          name: s.specialization.name,
        })),
        documents: p.documents.map((d) => ({
          id: d.id,
          documentType: d.documentType,
          title: d.title,
          fileUrl: d.fileUrl,
          verificationStatus: d.verificationStatus,
          createdAt: d.createdAt,
        })),
      })),
    };
  } catch (error) {
    console.error("getPractitionersVerificationQueueAction error:", error);
    return {
      success: false,
      error: "Failed to load practitioner verification queue.",
    };
  }
}

export async function reviewPractitionerAction(
  input: ReviewPractitionerInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized access. Admin privileges required.",
      };
    }

    const validated = reviewPractitionerSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid review data",
      };
    }

    const { physiotherapistId, status, verificationNotes } = validated.data;

    const physio = await prisma.physiotherapist.findUnique({
      where: { id: physiotherapistId },
    });

    if (!physio) {
      return {
        success: false,
        error: "Physiotherapist record not found.",
      };
    }

    // Update practitioner status and all associated documents in transaction
    await prisma.$transaction([
      prisma.physiotherapist.update({
        where: { id: physiotherapistId },
        data: {
          verificationStatus: status as VerificationStatus,
          rejectionReason: status === "REJECTED" ? verificationNotes || null : null,
        },
      }),
      prisma.uploadedDocument.updateMany({
        where: { physiotherapistId },
        data: {
          verificationStatus: status as VerificationStatus,
          rejectionReason: status === "REJECTED" ? verificationNotes : null,
          verifiedAt: status === "APPROVED" ? new Date() : null,
          verifiedBy: user.name,
        },
      }),
      prisma.notification.create({
        data: {
          userId: physio.userId,
          title: `Account Verification: ${status}`,
          message:
            status === "APPROVED"
              ? "Congratulations! Your BPT/MPT credentials have been approved by Admin. Your profile is now live for Etawah patients."
              : `Your verification submission requires attention. Admin feedback: ${verificationNotes}`,
          type: `VERIFICATION_${status}`,
          link: `/dashboard/physiotherapist/documents`,
        },
      }),
    ]);

    revalidatePath("/dashboard/admin");
    revalidatePath("/browse");
    revalidatePath(`/physiotherapists/${physiotherapistId}`);

    return {
      success: true,
      data: {
        success: true,
        message: `Practitioner ${status === "APPROVED" ? "approved" : "rejected"} successfully.`,
      },
    };
  } catch (error) {
    console.error("reviewPractitionerAction error:", error);
    return {
      success: false,
      error: "Failed to update practitioner verification status.",
    };
  }
}
