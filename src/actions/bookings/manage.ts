"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  cancelBookingSchema,
  CancelBookingInput,
  updateBookingStatusSchema,
  UpdateBookingStatusInput,
} from "@/features/bookings/schemas";
import { ActionResult } from "@/actions/types";
import { BookingStatus, PaymentStatus } from "@prisma/client";

export interface BookingDetailRecord {
  id: string;
  bookingNumber: string;
  patientId: string;
  physiotherapistId: string;
  appointmentType: "HOME_VISIT" | "CLINIC_VISIT";
  appointmentDate: Date;
  timeSlot: string;
  status: BookingStatus;
  chiefComplaint: string | null;
  notes: string | null;
  amount: number;
  cancellationReason: string | null;
  cancelledBy: string | null;
  completedAt: Date | null;
  createdAt: Date;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };
  physiotherapist: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    clinicAddress: string | null;
    experienceYears: number;
  };
  address: {
    id: string;
    label: string;
    street: string;
    landmark: string | null;
    area: string;
    city: string;
    state: string;
    pincode: string;
  } | null;
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  } | null;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt?: Date;
  } | null;
  serviceRequest?: {
    id: string;
    requestNumber: string;
    status: string;
    requestedTime: string | null;
    acceptedAt: Date | null;
    createdAt: Date;
  } | null;
}

export async function getBookingDetailsAction(
  bookingId: string
): Promise<ActionResult<BookingDetailRecord>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized.",
      };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            userId: true,
          },
        },
        physiotherapist: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            clinicAddress: true,
            experienceYears: true,
            userId: true,
          },
        },
        address: true,
        payment: true,
        review: true,
        serviceRequest: {
          select: {
            id: true,
            requestNumber: true,
            status: true,
            requestedTime: true,
            acceptedAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found.",
      };
    }

    // Ensure only the patient, the physiotherapist, or an admin can view details
    const isPatient = booking.patient.userId === user.id;
    const isPhysio = booking.physiotherapist.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isPatient && !isPhysio && !isAdmin) {
      return {
        success: false,
        error: "Access denied to this booking.",
      };
    }

    return {
      success: true,
      data: {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        patientId: booking.patientId,
        physiotherapistId: booking.physiotherapistId,
        appointmentType: booking.appointmentType,
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
        chiefComplaint: booking.chiefComplaint,
        notes: booking.notes,
        amount: booking.amount,
        cancellationReason: booking.cancellationReason,
        cancelledBy: booking.cancelledBy,
        completedAt: booking.completedAt,
        createdAt: booking.createdAt,
        patient: {
          id: booking.patient.id,
          fullName: booking.patient.fullName,
          phone: booking.patient.phone,
          email: booking.patient.email,
        },
        physiotherapist: {
          id: booking.physiotherapist.id,
          fullName: booking.physiotherapist.fullName,
          phone: booking.physiotherapist.phone,
          email: booking.physiotherapist.email,
          clinicAddress: booking.physiotherapist.clinicAddress,
          experienceYears: booking.physiotherapist.experienceYears,
        },
        address: booking.address,
        payment: booking.payment
          ? {
              id: booking.payment.id,
              amount: booking.payment.amount,
              currency: booking.payment.currency,
              status: booking.payment.status,
              razorpayOrderId: booking.payment.razorpayOrderId,
              razorpayPaymentId: booking.payment.razorpayPaymentId,
              createdAt: booking.payment.createdAt,
              updatedAt: booking.payment.updatedAt,
            }
          : null,
        review: booking.review
          ? {
              id: booking.review.id,
              rating: booking.review.rating,
              comment: booking.review.comment,
              createdAt: booking.review.createdAt,
            }
          : null,
        serviceRequest: booking.serviceRequest,
      },
    };
  } catch (error) {
    console.error("getBookingDetailsAction error:", error);
    return {
      success: false,
      error: "Failed to load appointment details.",
    };
  }
}

export async function getPatientBookingsAction(): Promise<
  ActionResult<BookingDetailRecord[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return { success: true, data: [] };
    }

    const bookings = await prisma.booking.findMany({
      where: { patientId: patient.id },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
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
    console.error("getPatientBookingsAction error:", error);
    return {
      success: false,
      error: "Failed to load patient appointments.",
    };
  }
}

export async function getPhysiotherapistBookingsAction(): Promise<
  ActionResult<BookingDetailRecord[]>
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

    if (!physio) {
      return { success: true, data: [] };
    }

    const bookings = await prisma.booking.findMany({
      where: { physiotherapistId: physio.id },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
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
    console.error("getPhysiotherapistBookingsAction error:", error);
    return {
      success: false,
      error: "Failed to load practitioner appointments.",
    };
  }
}

export async function cancelBookingAction(
  input: CancelBookingInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized." };
    }

    const validated = cancelBookingSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid cancellation request",
      };
    }

    const { bookingId, cancellationReason } = validated.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        patient: true,
        physiotherapist: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    const isPatient = booking.patient.userId === user.id;
    const isPhysio = booking.physiotherapist.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isPatient && !isPhysio && !isAdmin) {
      return { success: false, error: "Unauthorized to cancel this booking." };
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return {
        success: false,
        error: "Completed appointments cannot be cancelled.",
      };
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return {
        success: false,
        error: "This booking is already cancelled.",
      };
    }

    const cancelledByName = isPatient
      ? `Patient (${user.name})`
      : isPhysio
      ? `Physiotherapist (${user.name})`
      : "Admin";

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationReason,
          cancelledBy: cancelledByName,
        },
      }),
      // Notify other party
      prisma.notification.create({
        data: {
          userId: isPatient ? booking.physiotherapist.userId : booking.patient.userId,
          title: "Appointment Cancelled",
          message: `Appointment ${booking.bookingNumber} was cancelled by ${cancelledByName}. Reason: ${cancellationReason}`,
          type: "BOOKING_CANCELLED",
          link: isPatient
            ? `/dashboard/physiotherapist/bookings`
            : `/dashboard/patient/bookings/${booking.id}`,
        },
      }),
    ]);

    revalidatePath(`/dashboard/patient/bookings/${bookingId}`);
    revalidatePath("/dashboard/patient/bookings");
    revalidatePath("/dashboard/physiotherapist/bookings");

    return {
      success: true,
      data: {
        success: true,
        message: "Appointment has been cancelled.",
      },
    };
  } catch (error) {
    console.error("cancelBookingAction error:", error);
    return {
      success: false,
      error: "Failed to cancel appointment.",
    };
  }
}

export async function updateBookingStatusAction(
  input: UpdateBookingStatusInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "PHYSIOTHERAPIST" && user.role !== "ADMIN")) {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = updateBookingStatusSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid status update data",
      };
    }

    const { bookingId, status, notes } = validated.data;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        physiotherapist: true,
        patient: true,
      },
    });

    if (!booking) {
      return { success: false, error: "Booking not found." };
    }

    if (user.role === "PHYSIOTHERAPIST" && booking.physiotherapist.userId !== user.id) {
      return { success: false, error: "Unauthorized to update this booking." };
    }

    const updateData: any = {
      status: status as BookingStatus,
    };

    if (notes) {
      updateData.notes = notes;
    }

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
      }),
      prisma.notification.create({
        data: {
          userId: booking.patient.userId,
          title: `Appointment Status: ${status}`,
          message: `Your appointment ${booking.bookingNumber} with Dr. ${booking.physiotherapist.fullName} is now marked as ${status}.`,
          type: `BOOKING_${status}`,
          link: `/dashboard/patient/bookings/${booking.id}`,
        },
      }),
    ]);

    revalidatePath(`/dashboard/patient/bookings/${bookingId}`);
    revalidatePath("/dashboard/patient/bookings");
    revalidatePath("/dashboard/physiotherapist/bookings");

    return {
      success: true,
      data: {
        success: true,
        message: `Appointment status updated to ${status}.`,
      },
    };
  } catch (error) {
    console.error("updateBookingStatusAction error:", error);
    return {
      success: false,
      error: "Failed to update appointment status.",
    };
  }
}
