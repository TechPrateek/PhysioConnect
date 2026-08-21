import { z } from "zod";

export const createServiceRequestSchema = z
  .object({
    appointmentType: z.enum(["HOME_VISIT", "CLINIC_VISIT"]).default("HOME_VISIT"),
    addressId: z.string().optional(),
    chiefComplaint: z
      .string()
      .trim()
      .min(3, "Please describe your primary symptoms or condition (minimum 3 characters)")
      .max(500, "Complaint cannot exceed 500 characters"),
    notes: z.string().trim().max(1000).optional(),
    requestedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .optional(),
    requestedTime: z.string().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine(
    (data) => {
      if (data.appointmentType === "HOME_VISIT" && (!data.addressId || data.addressId.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a home visit address in Etawah for doorstep service",
      path: ["addressId"],
    }
  );

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;

export const updateOnlineStatusSchema = z.object({
  status: z.enum(["ONLINE", "OFFLINE", "BUSY"]),
});

export type UpdateOnlineStatusInput = z.infer<typeof updateOnlineStatusSchema>;

export const updatePhysioLocationSchema = z.object({
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
});

export type UpdatePhysioLocationInput = z.infer<typeof updatePhysioLocationSchema>;

export const respondToOfferSchema = z.object({
  offerId: z.string().min(1, "Offer ID is required"),
  response: z.enum(["ACCEPT", "REJECT"]),
});

export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;
