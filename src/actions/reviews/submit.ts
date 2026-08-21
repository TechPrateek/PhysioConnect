"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { submitReviewSchema, SubmitReviewInput } from "@/features/reviews/schemas";
import { ActionResult } from "@/actions/types";
import { BookingStatus } from "@prisma/client";

export async function submitReviewAction(
  input: SubmitReviewInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "You must be signed in as a patient to review a consultation.",
      };
    }

    const validated = submitReviewSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid review data",
      };
    }

    const { bookingId, rating, comment } = validated.data;

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient profile not found.",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
        physiotherapist: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found.",
      };
    }

    if (booking.patientId !== patient.id) {
      return {
        success: false,
        error: "Unauthorized to review this appointment.",
      };
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      return {
        success: false,
        error: "Reviews can only be submitted after the physiotherapy session has been completed.",
      };
    }

    if (booking.review) {
      return {
        success: false,
        error: "You have already submitted a review for this appointment.",
      };
    }

    // Create review and recalculate practitioner aggregate ratings in transaction
    await prisma.$transaction(async (tx) => {
      await tx.review.create({
        data: {
          bookingId: booking.id,
          patientId: patient.id,
          physiotherapistId: booking.physiotherapistId,
          rating,
          comment: comment || null,
          isPublished: true,
        },
      });

      // Calculate aggregate stats for practitioner
      const allReviews = await tx.review.findMany({
        where: {
          physiotherapistId: booking.physiotherapistId,
          isPublished: true,
        },
        select: { rating: true },
      });

      const totalReviews = allReviews.length;
      const averageRating =
        totalReviews > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 5.0;

      await tx.physiotherapist.update({
        where: { id: booking.physiotherapistId },
        data: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
        },
      });

      // Send in-app notification to practitioner
      await tx.notification.create({
        data: {
          userId: booking.physiotherapist.userId,
          title: `New ${rating}★ Patient Review`,
          message: `${patient.fullName} submitted a ${rating}-star review for session ${booking.bookingNumber}.`,
          type: "REVIEW_RECEIVED",
          link: `/dashboard/physiotherapist`,
        },
      });
    });

    revalidatePath(`/dashboard/patient/bookings/${bookingId}`);
    revalidatePath(`/physiotherapists/${booking.physiotherapistId}`);
    revalidatePath("/browse");

    return {
      success: true,
      data: {
        success: true,
        message: "Thank you! Your verified review has been published.",
      },
    };
  } catch (error) {
    console.error("submitReviewAction error:", error);
    return {
      success: false,
      error: "Failed to submit review. Please try again.",
    };
  }
}
