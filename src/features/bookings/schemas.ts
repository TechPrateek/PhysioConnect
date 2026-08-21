import { z } from "zod";

export const createBookingSchema = z
  .object({
    physiotherapistId: z.string().min(1, "Physiotherapist is required"),
    appointmentType: z.enum(["HOME_VISIT", "CLINIC_VISIT"]),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    timeSlot: z.string().min(1, "Time slot is required"),
    addressId: z.string().optional(),
    chiefComplaint: z
      .string()
      .trim()
      .min(3, "Please describe your primary symptoms or reason for visit (min. 3 characters)")
      .max(500, "Complaint cannot exceed 500 characters"),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.appointmentType === "HOME_VISIT" && (!data.addressId || data.addressId.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a home visit address in Etawah",
      path: ["addressId"],
    }
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  cancellationReason: z
    .string()
    .trim()
    .min(5, "Please provide a cancellation reason (min. 5 characters)")
    .max(500),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
  ]),
  notes: z.string().optional(),
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
