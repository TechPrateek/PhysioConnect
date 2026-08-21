"use server";

import { prisma } from "@/lib/prisma";
import { findMatchingPhysiotherapists } from "./matching";
import { ActionResult } from "@/actions/types";
import { OfferStatus, ServiceRequestStatus } from "@prisma/client";

export async function dispatchServiceRequestAction(
  serviceRequestId: string
): Promise<ActionResult<{ offersCount: number; status: ServiceRequestStatus }>> {
  try {
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        address: true,
        patient: { include: { user: true } },
        offers: true,
      },
    });

    if (!serviceRequest) {
      return {
        success: false,
        error: "Service request not found.",
      };
    }

    if (
      serviceRequest.status === ServiceRequestStatus.ACCEPTED ||
      serviceRequest.status === ServiceRequestStatus.CANCELLED
    ) {
      return {
        success: false,
        error: `Cannot dispatch request with status ${serviceRequest.status}.`,
      };
    }

    // Determine coordinate snapshot
    const reqLat =
      serviceRequest.latitude != null
        ? Number(serviceRequest.latitude)
        : serviceRequest.address?.latitude != null
        ? Number(serviceRequest.address.latitude)
        : 26.7769; // Etawah center

    const reqLon =
      serviceRequest.longitude != null
        ? Number(serviceRequest.longitude)
        : serviceRequest.address?.longitude != null
        ? Number(serviceRequest.address.longitude)
        : 79.0236;

    // Find ranked matching physiotherapists
    const candidates = await findMatchingPhysiotherapists(
      reqLat,
      reqLon,
      serviceRequest.appointmentType,
      serviceRequestId
    );

    if (candidates.length === 0) {
      return {
        success: true,
        data: {
          offersCount: 0,
          status: ServiceRequestStatus.SEARCHING,
        },
      };
    }

    const offerExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    let createdOffers = 0;

    for (const candidate of candidates) {
      // Check if offer already exists for this physio
      const existingOffer = serviceRequest.offers.find(
        (o) => o.physiotherapistId === candidate.id
      );

      if (existingOffer) {
        continue;
      }

      const offer = await prisma.serviceRequestOffer.create({
        data: {
          serviceRequestId: serviceRequest.id,
          physiotherapistId: candidate.id,
          distanceKm: candidate.distanceKm,
          estimatedMinutes: candidate.estimatedMinutes,
          status: OfferStatus.PENDING,
          expiresAt: offerExpiresAt,
        },
      });

      // Notify the physiotherapist
      const physioRecord = await prisma.physiotherapist.findUnique({
        where: { id: candidate.id },
        select: { userId: true },
      });

      if (physioRecord) {
        await prisma.notification.create({
          data: {
            userId: physioRecord.userId,
            title: "New On-Demand Request Nearby! ⚡",
            message: `New ${
              serviceRequest.appointmentType === "HOME_VISIT"
                ? "Home Visit"
                : "Clinic Visit"
            } request from ${serviceRequest.patient.fullName} (${candidate.distanceKm} km away in Etawah).`,
            type: "NEW_SERVICE_OFFER",
            link: `/dashboard/physiotherapist`,
          },
        });
      }

      createdOffers++;
    }

    const newStatus =
      createdOffers > 0 || serviceRequest.offers.length > 0
        ? ServiceRequestStatus.OFFERED
        : ServiceRequestStatus.SEARCHING;

    await prisma.serviceRequest.update({
      where: { id: serviceRequest.id },
      data: { status: newStatus },
    });

    return {
      success: true,
      data: {
        offersCount: createdOffers,
        status: newStatus,
      },
    };
  } catch (error) {
    console.error("dispatchServiceRequestAction error:", error);
    return {
      success: false,
      error: "Failed to dispatch service request to nearby doctors.",
    };
  }
}
