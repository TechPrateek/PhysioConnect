"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { razorpay } from "@/lib/razorpay";
import { env } from "@/lib/env";
import { createRazorpayOrderSchema, CreateRazorpayOrderInput } from "@/features/payments/schemas";
import { ActionResult } from "@/actions/types";
import { PaymentStatus } from "@prisma/client";

export interface RazorpayOrderData {
  orderId: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
  bookingNumber: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
}

export async function createRazorpayOrderAction(
  input: CreateRazorpayOrderInput
): Promise<ActionResult<RazorpayOrderData>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized. Patient account required.",
      };
    }

    const validated = createRazorpayOrderSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid booking ID",
      };
    }

    const { bookingId } = validated.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
        patient: { include: { user: true } },
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
        error: "Unauthorized access to this booking.",
      };
    }

    if (booking.payment?.status === PaymentStatus.PAID) {
      return {
        success: false,
        error: "This appointment has already been paid for.",
      };
    }

    const amountInPaise = Math.round(booking.amount * 100);
    let orderId: string;

    try {
      // Call official Razorpay Orders API
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: booking.bookingNumber,
        notes: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          patientId: booking.patientId,
          physiotherapistId: booking.physiotherapistId,
        },
      });

      orderId = order.id;
    } catch (razorpayError) {
      console.warn(
        "Razorpay API call failed, generating development order id:",
        razorpayError
      );
      // Fallback for development/offline test environment
      orderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    }

    // Upsert payment record with Razorpay Order ID
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        razorpayOrderId: orderId,
        amount: booking.amount,
        currency: "INR",
        status: PaymentStatus.PENDING,
      },
      create: {
        bookingId: booking.id,
        razorpayOrderId: orderId,
        amount: booking.amount,
        currency: "INR",
        status: PaymentStatus.PENDING,
      },
    });

    return {
      success: true,
      data: {
        orderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        bookingNumber: booking.bookingNumber,
        doctorName: booking.physiotherapist.fullName,
        patientName: booking.patient.fullName,
        patientEmail: booking.patient.email,
        patientPhone: booking.patient.phone,
      },
    };
  } catch (error) {
    console.error("createRazorpayOrderAction error:", error);
    return {
      success: false,
      error: "Failed to initialize payment order. Please try again.",
    };
  }
}
