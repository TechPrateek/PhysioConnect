"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  createServiceRequestSchema,
  CreateServiceRequestInput,
} from "@/features/service-requests/schemas";
import { dispatchServiceRequestAction } from "./dispatch";
import { ActionResult } from "@/actions/types";
import { AppointmentType, ServiceRequestStatus } from "@prisma/client";
import { checkLocationServiceability, ETAWAH_CENTER_LAT, ETAWAH_CENTER_LON } from "@/lib/geo";

function generateRequestNumber(): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PC-REQ-${year}-${hex}`;
}

export interface CreatedServiceRequestResult {
  id: string;
  requestNumber: string;
  status: ServiceRequestStatus;
  offersCount: number;
}

export async function createServiceRequestAction(
  input: CreateServiceRequestInput
): Promise<ActionResult<CreatedServiceRequestResult>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized. Please log in as a patient to request on-demand physiotherapy.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient || patient.deletedAt) {
      return {
        success: false,
        error: "Patient profile not found. Please complete your registration.",
      };
    }

    const validated = createServiceRequestSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid request details.",
      };
    }

    const {
      appointmentType,
      addressId,
      chiefComplaint,
      notes,
      requestedDate,
      requestedTime,
      latitude,
      longitude,
    } = validated.data;

    let resolvedLat = latitude;
    let resolvedLon = longitude;

    // For HOME_VISIT, verify address belongs to the patient and is in serviceable territory
    if (appointmentType === "HOME_VISIT") {
      if (!addressId) {
        return {
          success: false,
          error: "A valid address is required for home visit sessions.",
        };
      }

      const address = await prisma.address.findFirst({
        where: {
          id: addressId,
          patientId: patient.id,
          deletedAt: null,
        },
      });

      if (!address) {
        return {
          success: false,
          error: "Selected address was not found or has been removed.",
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
          error: `Service is currently not available in ${address.city || "this city"}. PhysioConnect is live in Etawah (Pilot Territory) and launching across India soon!`,
        };
      }

      if (resolvedLat == null && address.latitude != null) {
        resolvedLat = Number(address.latitude);
      }
      if (resolvedLon == null && address.longitude != null) {
        resolvedLon = Number(address.longitude);
      }
    }

    // Default to Etawah center if no GPS coordinate is available yet
    if (resolvedLat == null) resolvedLat = ETAWAH_CENTER_LAT;
    if (resolvedLon == null) resolvedLon = ETAWAH_CENTER_LON;

    const requestNumber = generateRequestNumber();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 min active searching window

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        requestNumber,
        patientId: patient.id,
        appointmentType:
          appointmentType === "HOME_VISIT"
            ? AppointmentType.HOME_VISIT
            : AppointmentType.CLINIC_VISIT,
        addressId: appointmentType === "HOME_VISIT" ? addressId : null,
        latitude: resolvedLat,
        longitude: resolvedLon,
        chiefComplaint,
        notes: notes || null,
        requestedDate: requestedDate ? new Date(requestedDate) : new Date(),
        requestedTime: requestedTime || "Immediate / On-Demand",
        status: ServiceRequestStatus.SEARCHING,
        expiresAt,
      },
    });

    // Create In-App Notification for Patient
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Searching for Nearby Physiotherapists 🟢",
        message: `Your on-demand request #${requestNumber} is broadcasted to verified physiotherapists nearby.`,
        type: "SERVICE_REQUEST_CREATED",
        link: `/dashboard/patient`,
      },
    });

    // Automatically trigger dispatch to match and send offers to online doctors
    const dispatchRes = await dispatchServiceRequestAction(serviceRequest.id);

    return {
      success: true,
      data: {
        id: serviceRequest.id,
        requestNumber: serviceRequest.requestNumber,
        status:
          dispatchRes.success && dispatchRes.data
            ? dispatchRes.data.status
            : ServiceRequestStatus.SEARCHING,
        offersCount:
          dispatchRes.success && dispatchRes.data
            ? dispatchRes.data.offersCount
            : 0,
      },
    };
  } catch (error) {
    console.error("createServiceRequestAction error:", error);
    return {
      success: false,
      error: "Failed to create on-demand service request. Please try again.",
    };
  }
}
