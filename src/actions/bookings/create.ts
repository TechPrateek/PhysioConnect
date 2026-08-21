"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createBookingSchema, CreateBookingInput } from "@/features/bookings/schemas";
import { ActionResult } from "@/actions/types";
import {
  AppointmentType,
  BookingStatus,
  PaymentStatus,
  VerificationStatus,
} from "@prisma/client";
import { checkLocationServiceability } from "@/lib/geo";

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PC-ETA-${year}-${randomSuffix}`;
}

export async function createBookingAction(
  input: CreateBookingInput
): Promise<ActionResult<{ bookingId: string; redirectUrl: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "You must be signed in as a patient to book an appointment.",
      };
    }

    const validated = createBookingSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid booking details",
      };
    }

    const {
      physiotherapistId,
      appointmentType,
      appointmentDate,
      timeSlot,
      addressId,
      chiefComplaint,
      notes,
    } = validated.data;

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient record not found. Please complete your patient profile.",
      };
    }

    // Verify practitioner
    const physio = await prisma.physiotherapist.findUnique({
      where: { id: physiotherapistId },
      include: { user: true },
    });

    if (!physio || physio.deletedAt || physio.verificationStatus !== VerificationStatus.APPROVED) {
      return {
        success: false,
        error: "This physiotherapist is not currently available for bookings.",
      };
    }

    // Verify visit mode support
    if (appointmentType === "HOME_VISIT" && !physio.homeVisitAvailable) {
      return {
        success: false,
        error: "This doctor does not offer home visits.",
      };
    }

    if (appointmentType === "CLINIC_VISIT" && !physio.clinicVisitAvailable) {
      return {
        success: false,
        error: "This doctor does not offer clinic visits.",
      };
    }

    // Verify address if home visit
    if (appointmentType === "HOME_VISIT") {
      if (!addressId) {
        return {
          success: false,
          error: "Home visit address is mandatory.",
        };
      }

      const address = await prisma.address.findUnique({
        where: { id: addressId },
      });

      if (!address || address.patientId !== patient.id || address.deletedAt) {
        return {
          success: false,
          error: "Selected address is invalid or not found.",
        };
      }

      // Check Location Serviceability (Currently Active in Pilot Territory: Etawah)
      const serviceCheck = checkLocationServiceability({
        city: address.city,
        pincode: address.pincode,
        latitude: address.latitude ? Number(address.latitude) : undefined,
        longitude: address.longitude ? Number(address.longitude) : undefined,
      });

      if (!serviceCheck.isServiceable) {
        return {
          success: false,
          error: `Home visit service is currently not available in ${address.city || "this city"}. PhysioConnect is live in Etawah (Pilot Territory) and launching across India soon!`,
        };
      }
    }

    const targetDate = new Date(`${appointmentDate}T00:00:00.000Z`);

    // Concurrency slot check
    const existingSlotBooking = await prisma.booking.findFirst({
      where: {
        physiotherapistId: physio.id,
        appointmentDate: targetDate,
        timeSlot: timeSlot.trim(),
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED],
        },
      },
    });

    if (existingSlotBooking) {
      return {
        success: false,
        error: "This time slot has just been reserved by another patient. Please choose another slot.",
      };
    }

    const bookingNumber = generateBookingNumber();

    // Create booking, payment tracker, and notifications in transaction
    const newBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          patientId: patient.id,
          physiotherapistId: physio.id,
          appointmentType: appointmentType as AppointmentType,
          addressId: appointmentType === "HOME_VISIT" ? addressId : null,
          appointmentDate: targetDate,
          timeSlot: timeSlot.trim(),
          status: BookingStatus.PENDING,
          amount: physio.consultationFee,
          chiefComplaint,
          notes: notes || null,
          payment: {
            create: {
              amount: physio.consultationFee,
              currency: "INR",
              status: PaymentStatus.PENDING,
            },
          },
        },
      });

      // Notification for patient
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Appointment Initiated",
          message: `Your appointment ${bookingNumber} with Dr. ${physio.fullName} for ${timeSlot} on ${appointmentDate} has been created.`,
          type: "BOOKING_CREATED",
          link: `/dashboard/patient/bookings/${booking.id}`,
        },
      });

      // Notification for physiotherapist
      await tx.notification.create({
        data: {
          userId: physio.userId,
          title: "New Appointment Request",
          message: `New ${appointmentType === "HOME_VISIT" ? "Home Visit" : "Clinic"} booking from ${patient.fullName} for ${timeSlot} on ${appointmentDate}.`,
          type: "NEW_BOOKING_RECEIVED",
          link: `/dashboard/physiotherapist/bookings`,
        },
      });

      return booking;
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/patient/bookings");
    revalidatePath("/dashboard/physiotherapist/bookings");

    return {
      success: true,
      data: {
        bookingId: newBooking.id,
        redirectUrl: `/dashboard/patient/bookings/${newBooking.id}`,
      },
    };
  } catch (error: any) {
    console.error("createBookingAction error:", error);
    // Catch unique constraint violations for concurrency collision
    if (error.code === "P2002") {
      return {
        success: false,
        error: "This time slot was just booked. Please pick an alternative time.",
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while booking. Please try again.",
    };
  }
}
