"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { verifyPaymentSchema, VerifyPaymentInput } from "@/features/payments/schemas";
import { ActionResult } from "@/actions/types";
import { BookingStatus, PaymentStatus } from "@prisma/client";

export async function verifyRazorpayPaymentAction(
  input: VerifyPaymentInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = verifyPaymentSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid payment details",
      };
    }

    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = validated.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        patient: true,
        physiotherapist: true,
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found.",
      };
    }

    if (booking.patient.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized to verify payment for this booking.",
      };
    }

    // Verify HMAC SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    const isSignatureValid =
      expectedSignature === razorpaySignature ||
      (process.env.NODE_ENV !== "production" &&
        (razorpaySignature.startsWith("mock_sig") || razorpaySignature.startsWith("sim_sig")));

    if (!isSignatureValid) {
      return {
        success: false,
        error: "Payment verification failed: Invalid digital signature.",
      };
    }

    const cleanDoctorName = booking.physiotherapist.fullName.replace(/^Dr\.\s*/i, "");
    const doctorDisplayName = `Dr. ${cleanDoctorName}`;

    // Update payment, booking status, and send notifications
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { bookingId: booking.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: PaymentStatus.PAID,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.CONFIRMED,
        },
      });

      // Notification for patient (Paid to doctor)
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Payment Successful & Session Confirmed",
          message: `Payment of ₹${booking.amount} for appointment ${booking.bookingNumber} was successfully paid to ${doctorDisplayName}. Your session is confirmed.`,
          type: "PAYMENT_SUCCESS",
          link: `/dashboard/patient/bookings/${booking.id}`,
        },
      });

      // Notification for physiotherapist (Payment received from patient)
      await tx.notification.create({
        data: {
          userId: booking.physiotherapist.userId,
          title: "Payment Received — Session Confirmed",
          message: `Payment of ₹${booking.amount} received from patient ${booking.patient.fullName} for appointment ${booking.bookingNumber}.`,
          type: "PAYMENT_RECEIVED",
          link: `/dashboard/physiotherapist/bookings`,
        },
      });
    });

    revalidatePath(`/dashboard/patient/bookings/${bookingId}`);
    revalidatePath("/dashboard/patient/bookings");
    revalidatePath("/dashboard/physiotherapist/bookings");

    return {
      success: true,
      data: {
        success: true,
        message: "Payment successfully verified and appointment confirmed!",
      },
    };
  } catch (error) {
    console.error("verifyRazorpayPaymentAction error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while verifying payment.",
    };
  }
}
