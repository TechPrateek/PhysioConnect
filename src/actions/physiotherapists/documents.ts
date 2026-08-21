"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { uploadDocumentSchema, UploadDocumentInput } from "@/features/physiotherapists/schemas";
import { ActionResult } from "@/actions/types";
import { DocumentType, VerificationStatus } from "@prisma/client";

export interface DocumentRecord {
  id: string;
  documentType: DocumentType;
  title: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
}

export async function getPhysiotherapistDocumentsAction(): Promise<
  ActionResult<DocumentRecord[]>
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
    });

    if (!physio) {
      return {
        success: false,
        error: "Physiotherapist record not found.",
      };
    }

    const documents = await prisma.uploadedDocument.findMany({
      where: { physiotherapistId: physio.id },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        title: doc.title,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        verificationStatus: doc.verificationStatus,
        verifiedAt: doc.verifiedAt,
        rejectionReason: doc.rejectionReason,
        createdAt: doc.createdAt,
      })),
    };
  } catch (error) {
    console.error("getPhysiotherapistDocumentsAction error:", error);
    return {
      success: false,
      error: "Failed to load uploaded documents.",
    };
  }
}

export async function uploadDocumentAction(
  input: UploadDocumentInput
): Promise<ActionResult<{ documentId: string; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = uploadDocumentSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid document details",
      };
    }

    const { documentType, title, fileUrl, fileSize, mimeType } = validated.data;

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio) {
      return {
        success: false,
        error: "Physiotherapist record not found.",
      };
    }

    const newDoc = await prisma.$transaction(async (tx) => {
      // 1. Create document
      const doc = await tx.uploadedDocument.create({
        data: {
          physiotherapistId: physio.id,
          documentType: documentType as DocumentType,
          title,
          fileUrl,
          fileSize: fileSize || null,
          mimeType: mimeType || null,
          verificationStatus: VerificationStatus.PENDING,
        },
      });

      // 2. If practitioner was rejected previously, reset to PENDING for admin review
      if (physio.verificationStatus === VerificationStatus.REJECTED) {
        await tx.physiotherapist.update({
          where: { id: physio.id },
          data: {
            verificationStatus: VerificationStatus.PENDING,
            rejectionReason: null,
          },
        });
      }

      return doc;
    });

    revalidatePath("/dashboard/physiotherapist");
    revalidatePath("/dashboard/physiotherapist/documents");

    return {
      success: true,
      data: {
        documentId: newDoc.id,
        message: "Document uploaded successfully and queued for admin verification.",
      },
    };
  } catch (error) {
    console.error("uploadDocumentAction error:", error);
    return {
      success: false,
      error: "Failed to upload document. Please try again.",
    };
  }
}

export async function deleteDocumentAction(
  documentId: string
): Promise<ActionResult<{ success: boolean }>> {
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
    });

    if (!physio) {
      return {
        success: false,
        error: "Physiotherapist record not found.",
      };
    }

    // Verify ownership
    const doc = await prisma.uploadedDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.physiotherapistId !== physio.id) {
      return {
        success: false,
        error: "Document not found or unauthorized.",
      };
    }

    await prisma.uploadedDocument.delete({
      where: { id: documentId },
    });

    revalidatePath("/dashboard/physiotherapist/documents");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("deleteDocumentAction error:", error);
    return {
      success: false,
      error: "Failed to delete document.",
    };
  }
}
