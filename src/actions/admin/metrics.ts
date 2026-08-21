"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";
import {
  BookingStatus,
  OfferStatus,
  PaymentStatus,
  PhysioOnlineStatus,
  ServiceRequestStatus,
  VerificationStatus,
} from "@prisma/client";

export interface AdminMetricsData {
  totalPatients: number;
  totalPhysiotherapists: number;
  approvedPhysios: number;
  pendingPhysios: number;
  rejectedPhysios: number;
  onlinePhysios: number;
  activeServiceRequests: number;
  pendingOffers: number;
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export async function getAdminMetricsAction(): Promise<
  ActionResult<AdminMetricsData>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized access. Admin privileges required.",
      };
    }

    const [
      totalPatients,
      physioCounts,
      onlinePhysiosCount,
      activeServiceRequestsCount,
      pendingOffersCount,
      bookingCounts,
      completedPayments,
      pendingPayments,
      reviewsAggregate,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.physiotherapist.groupBy({
        by: ["verificationStatus"],
        _count: { id: true },
      }),
      prisma.physiotherapist.count({
        where: { onlineStatus: PhysioOnlineStatus.ONLINE },
      }),
      prisma.serviceRequest.count({
        where: {
          status: {
            in: [ServiceRequestStatus.SEARCHING, ServiceRequestStatus.OFFERED],
          },
        },
      }),
      prisma.serviceRequestOffer.count({
        where: { status: OfferStatus.PENDING },
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PAID },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.review.aggregate({
        where: { isPublished: true },
        _avg: { rating: true },
        _count: { id: true },
      }),
    ]);

    const approvedPhysios =
      physioCounts.find((p) => p.verificationStatus === VerificationStatus.APPROVED)?._count.id || 0;
    const pendingPhysios =
      physioCounts.find((p) => p.verificationStatus === VerificationStatus.PENDING)?._count.id || 0;
    const rejectedPhysios =
      physioCounts.find((p) => p.verificationStatus === VerificationStatus.REJECTED)?._count.id || 0;
    const totalPhysios = approvedPhysios + pendingPhysios + rejectedPhysios;

    const completedBookings =
      bookingCounts.find((b) => b.status === BookingStatus.COMPLETED)?._count.id || 0;
    const confirmedBookings =
      bookingCounts.find((b) => b.status === BookingStatus.CONFIRMED)?._count.id || 0;
    const inProgressBookings =
      bookingCounts.find((b) => b.status === BookingStatus.IN_PROGRESS)?._count.id || 0;
    const pendingBookings =
      bookingCounts.find((b) => b.status === BookingStatus.PENDING)?._count.id || 0;
    const cancelledBookings =
      bookingCounts.find((b) => b.status === BookingStatus.CANCELLED)?._count.id || 0;

    const totalBookings =
      completedBookings + confirmedBookings + inProgressBookings + pendingBookings + cancelledBookings;
    const activeBookings = confirmedBookings + inProgressBookings + pendingBookings;

    return {
      success: true,
      data: {
        totalPatients,
        totalPhysiotherapists: totalPhysios,
        approvedPhysios,
        pendingPhysios,
        rejectedPhysios,
        onlinePhysios: onlinePhysiosCount,
        activeServiceRequests: activeServiceRequestsCount,
        pendingOffers: pendingOffersCount,
        totalBookings,
        completedBookings,
        activeBookings,
        cancelledBookings,
        totalRevenue: completedPayments._sum.amount || 0,
        pendingRevenue: pendingPayments._sum.amount || 0,
        averageRating: Math.round((reviewsAggregate._avg.rating || 5.0) * 10) / 10,
        totalReviews: reviewsAggregate._count.id || 0,
      },
    };
  } catch (error) {
    console.error("getAdminMetricsAction error:", error);
    return {
      success: false,
      error: "Failed to fetch platform metrics.",
    };
  }
}
