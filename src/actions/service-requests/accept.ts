"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";
import {
  BookingStatus,
  OfferStatus,
  PaymentStatus,
  ServiceRequestStatus,
} from "@prisma/client";

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PC-ETA-${year}-${hex}`;
}

export interface AcceptServiceRequestResult {
  bookingId: string;
  bookingNumber: string;
  serviceRequestId: string;
  redirectUrl: string;
}

export async function acceptServiceRequestAction(
  offerId: string
): Promise<ActionResult<AcceptServiceRequestResult>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return {
        success: false,
        error: "Unauthorized. Only verified physiotherapists can accept service requests.",
      };
    }

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio || physio.deletedAt) {
      return {
        success: false,
        error: "Physiotherapist profile not found.",
      };
    }

    // Interactive Transaction with strict concurrency isolation
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch offer with service request lock
      const offer = await tx.serviceRequestOffer.findUnique({
        where: { id: offerId },
        include: {
          serviceRequest: {
            include: {
              patient: { include: { user: true } },
              address: true,
              booking: true,
            },
          },
        },
      });

      if (!offer) {
        throw new Error("OFFER_NOT_FOUND");
      }

      // 2. Verify ownership
      if (offer.physiotherapistId !== physio.id) {
        throw new Error("UNAUTHORIZED_OFFER");
      }

      // 3. Verify offer is still PENDING
      if (offer.status !== OfferStatus.PENDING) {
        throw new Error("OFFER_NOT_PENDING");
      }

      // 4. Verify request is still unfulfilled (SEARCHING or OFFERED)
      const serviceRequest = offer.serviceRequest;
      if (
        serviceRequest.status !== ServiceRequestStatus.SEARCHING &&
        serviceRequest.status !== ServiceRequestStatus.OFFERED
      ) {
        throw new Error("ALREADY_CLAIMED");
      }

      if (serviceRequest.booking) {
        throw new Error("ALREADY_CLAIMED");
      }

      // 5. Claim the ServiceRequest
      await tx.serviceRequest.update({
        where: { id: serviceRequest.id },
        data: {
          status: ServiceRequestStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      // 6. Mark this Offer as ACCEPTED
      await tx.serviceRequestOffer.update({
        where: { id: offer.id },
        data: {
          status: OfferStatus.ACCEPTED,
          respondedAt: new Date(),
        },
      });

      // 7. Expire all other competing offers for this request
      await tx.serviceRequestOffer.updateMany({
        where: {
          serviceRequestId: serviceRequest.id,
          id: { not: offer.id },
          status: OfferStatus.PENDING,
        },
        data: {
          status: OfferStatus.EXPIRED,
          respondedAt: new Date(),
        },
      });

      // 8. Generate Booking & Payment Records
      const bookingNumber = generateBookingNumber();
      const appointmentDate = serviceRequest.requestedDate || new Date();
      const timeSlot = serviceRequest.requestedTime || "Immediate (On-Demand)";

      const booking = await tx.booking.create({
        data: {
          bookingNumber,
          patientId: serviceRequest.patientId,
          physiotherapistId: physio.id,
          appointmentType: serviceRequest.appointmentType,
          addressId: serviceRequest.addressId,
          appointmentDate,
          timeSlot,
          status: BookingStatus.CONFIRMED,
          amount: physio.consultationFee,
          chiefComplaint: serviceRequest.chiefComplaint,
          notes: serviceRequest.notes,
          serviceRequestId: serviceRequest.id,
          payment: {
            create: {
              amount: physio.consultationFee,
              currency: "INR",
              status: PaymentStatus.PENDING,
            },
          },
        },
      });

      // 9. Send In-App Notifications to both parties
      // To Patient:
      await tx.notification.create({
        data: {
          userId: serviceRequest.patient.userId,
          title: "Physiotherapist Assigned! 🩺",
          message: `${physio.fullName} has accepted your on-demand request! Booking #${bookingNumber} is confirmed.`,
          type: "REQUEST_ACCEPTED",
          link: `/dashboard/patient/bookings/${booking.id}`,
        },
      });

      // To Doctor:
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Booking Confirmed ✅",
          message: `You accepted on-demand request #${serviceRequest.requestNumber} for ${serviceRequest.patient.fullName}.`,
          type: "BOOKING_CONFIRMED",
          link: `/dashboard/physiotherapist/bookings`,
        },
      });

      return {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        serviceRequestId: serviceRequest.id,
        redirectUrl: `/dashboard/physiotherapist/bookings`,
      };
    });

    revalidatePath("/dashboard/physiotherapist");
    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/admin");

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("acceptServiceRequestAction error:", error);

    if (
      error.message === "ALREADY_CLAIMED" ||
      error.message === "OFFER_NOT_PENDING"
    ) {
      return {
        success: false,
        error: "This request has already been accepted by another physiotherapist.",
      };
    }

    if (error.message === "OFFER_NOT_FOUND" || error.message === "UNAUTHORIZED_OFFER") {
      return {
        success: false,
        error: "Invalid or unauthorized offer.",
      };
    }

    return {
      success: false,
      error: "Failed to accept request. Please try again.",
    };
  }
}
