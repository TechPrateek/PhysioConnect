"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";
import {
  OfferStatus,
  ServiceRequestStatus,
  AppointmentType,
} from "@prisma/client";

export interface PhysioOfferItem {
  id: string; // offer ID
  serviceRequestId: string;
  requestNumber: string;
  patientName: string;
  appointmentType: AppointmentType;
  area: string;
  distanceKm: number;
  estimatedMinutes: number;
  chiefComplaint: string | null;
  requestedTime: string | null;
  consultationFee: number;
  offeredAt: Date;
  expiresAt: Date | null;
}

export async function getPhysioIncomingOffersAction(): Promise<
  ActionResult<PhysioOfferItem[]>
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

    if (!physio || physio.deletedAt) {
      return { success: false, error: "Physiotherapist not found." };
    }

    const offers = await prisma.serviceRequestOffer.findMany({
      where: {
        physiotherapistId: physio.id,
        status: OfferStatus.PENDING,
        serviceRequest: {
          status: {
            in: [ServiceRequestStatus.SEARCHING, ServiceRequestStatus.OFFERED],
          },
        },
      },
      include: {
        serviceRequest: {
          include: {
            patient: true,
            address: true,
          },
        },
      },
      orderBy: { offeredAt: "desc" },
    });

    const items: PhysioOfferItem[] = offers.map((o) => ({
      id: o.id,
      serviceRequestId: o.serviceRequestId,
      requestNumber: o.serviceRequest.requestNumber,
      patientName: o.serviceRequest.patient.fullName,
      appointmentType: o.serviceRequest.appointmentType,
      area: o.serviceRequest.address?.area || "Etawah",
      distanceKm: o.distanceKm ? Number(o.distanceKm) : 0,
      estimatedMinutes: o.estimatedMinutes || 15,
      chiefComplaint: o.serviceRequest.chiefComplaint,
      requestedTime: o.serviceRequest.requestedTime,
      consultationFee: physio.consultationFee,
      offeredAt: o.offeredAt,
      expiresAt: o.expiresAt,
    }));

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("getPhysioIncomingOffersAction error:", error);
    return {
      success: false,
      error: "Failed to load incoming requests.",
    };
  }
}

export async function rejectOfferAction(
  offerId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PHYSIOTHERAPIST") {
      return { success: false, error: "Unauthorized." };
    }

    const physio = await prisma.physiotherapist.findUnique({
      where: { userId: user.id },
    });

    if (!physio) {
      return { success: false, error: "Physiotherapist not found." };
    }

    const offer = await prisma.serviceRequestOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer || offer.physiotherapistId !== physio.id) {
      return { success: false, error: "Offer not found." };
    }

    await prisma.serviceRequestOffer.update({
      where: { id: offerId },
      data: {
        status: OfferStatus.REJECTED,
        respondedAt: new Date(),
      },
    });

    revalidatePath("/dashboard/physiotherapist");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("rejectOfferAction error:", error);
    return {
      success: false,
      error: "Failed to decline request offer.",
    };
  }
}

export interface PatientActiveRequestItem {
  id: string;
  requestNumber: string;
  appointmentType: AppointmentType;
  area: string;
  status: ServiceRequestStatus;
  chiefComplaint: string | null;
  createdAt: Date;
  offersCount: number;
  bookingId?: string;
}

export async function getPatientActiveRequestsAction(): Promise<
  ActionResult<PatientActiveRequestItem[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return { success: false, error: "Unauthorized." };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return { success: false, error: "Patient not found." };
    }

    const requests = await prisma.serviceRequest.findMany({
      where: {
        patientId: patient.id,
        status: {
          in: [
            ServiceRequestStatus.SEARCHING,
            ServiceRequestStatus.OFFERED,
            ServiceRequestStatus.ACCEPTED,
          ],
        },
      },
      include: {
        address: true,
        offers: true,
        booking: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const items: PatientActiveRequestItem[] = requests.map((r) => ({
      id: r.id,
      requestNumber: r.requestNumber,
      appointmentType: r.appointmentType,
      area: r.address?.area || "Etawah",
      status: r.status,
      chiefComplaint: r.chiefComplaint,
      createdAt: r.createdAt,
      offersCount: r.offers.length,
      bookingId: r.booking?.id,
    }));

    return {
      success: true,
      data: items,
    };
  } catch (error) {
    console.error("getPatientActiveRequestsAction error:", error);
    return {
      success: false,
      error: "Failed to load active requests.",
    };
  }
}

export async function cancelServiceRequestAction(
  requestId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return { success: false, error: "Unauthorized." };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return { success: false, error: "Patient not found." };
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.patientId !== patient.id) {
      return { success: false, error: "Service request not found." };
    }

    if (request.status === ServiceRequestStatus.ACCEPTED) {
      return {
        success: false,
        error: "Cannot cancel a request that has already been accepted by a doctor.",
      };
    }

    await prisma.$transaction([
      prisma.serviceRequest.update({
        where: { id: requestId },
        data: {
          status: ServiceRequestStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      }),
      prisma.serviceRequestOffer.updateMany({
        where: {
          serviceRequestId: requestId,
          status: OfferStatus.PENDING,
        },
        data: {
          status: OfferStatus.CANCELLED,
          respondedAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/dashboard/patient");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("cancelServiceRequestAction error:", error);
    return {
      success: false,
      error: "Failed to cancel service request.",
    };
  }
}
