"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";
import { BookingStatus } from "@prisma/client";
import { BookingDetailRecord } from "@/actions/bookings/manage";

export async function getAdminBookingsAction(
  statusFilter?: BookingStatus
): Promise<ActionResult<BookingDetailRecord[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const whereClause: any = {};
    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: [{ createdAt: "desc" }],
      include: {
        patient: true,
        physiotherapist: true,
        address: true,
        payment: true,
        review: true,
      },
    });

    return {
      success: true,
      data: bookings.map((b) => ({
        id: b.id,
        bookingNumber: b.bookingNumber,
        patientId: b.patientId,
        physiotherapistId: b.physiotherapistId,
        appointmentType: b.appointmentType,
        appointmentDate: b.appointmentDate,
        timeSlot: b.timeSlot,
        status: b.status,
        chiefComplaint: b.chiefComplaint,
        notes: b.notes,
        amount: b.amount,
        cancellationReason: b.cancellationReason,
        cancelledBy: b.cancelledBy,
        completedAt: b.completedAt,
        createdAt: b.createdAt,
        patient: {
          id: b.patient.id,
          fullName: b.patient.fullName,
          phone: b.patient.phone,
          email: b.patient.email,
        },
        physiotherapist: {
          id: b.physiotherapist.id,
          fullName: b.physiotherapist.fullName,
          phone: b.physiotherapist.phone,
          email: b.physiotherapist.email,
          clinicAddress: b.physiotherapist.clinicAddress,
          experienceYears: b.physiotherapist.experienceYears,
        },
        address: b.address,
        payment: b.payment,
        review: b.review
          ? {
              id: b.review.id,
              rating: b.review.rating,
              comment: b.review.comment,
            }
          : null,
      })),
    };
  } catch (error) {
    console.error("getAdminBookingsAction error:", error);
    return {
      success: false,
      error: "Failed to load admin bookings.",
    };
  }
}
