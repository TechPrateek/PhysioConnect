import { z } from "zod";

export const updatePhysioProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
    experienceYears: z.coerce
      .number()
      .int()
      .min(0, "Experience must be 0 or more years")
      .max(60, "Please enter a valid experience"),
    consultationFee: z.coerce
      .number()
      .min(100, "Minimum consultation fee is ₹100")
      .max(10000, "Maximum consultation fee is ₹10,000"),
    clinicAddress: z.string().trim().optional(),
    homeVisitAvailable: z.boolean().default(true),
    clinicVisitAvailable: z.boolean().default(false),
    bio: z.string().trim().max(1500, "Bio cannot exceed 1500 characters").optional(),
    languages: z.array(z.string()).min(1, "Select at least one language"),
    specializationIds: z
      .array(z.string())
      .min(1, "Please select at least one specialization"),
  })
  .refine(
    (data) => {
      if (data.clinicVisitAvailable && (!data.clinicAddress || data.clinicAddress.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Clinic address is required when clinic visits are enabled",
      path: ["clinicAddress"],
    }
  );

export type UpdatePhysioProfileInput = z.infer<typeof updatePhysioProfileSchema>;

export const uploadDocumentSchema = z.object({
  documentType: z.enum([
    "ID_PROOF",
    "DEGREE_CERTIFICATE",
    "MEDICAL_REGISTRATION",
    "CLINIC_PROOF",
    "OTHER",
  ]),
  title: z.string().trim().min(2, "Document title is required"),
  fileUrl: z.string().min(1, "File or document data is required"),
  fileSize: z.number().int().positive().optional(),
  mimeType: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const searchPhysioSchema = z.object({
  query: z.string().optional(),
  specialization: z.string().optional(), // slug or id
  visitType: z.enum(["ALL", "HOME_VISIT", "CLINIC_VISIT"]).default("ALL"),
  maxFee: z.coerce.number().optional(),
  sortBy: z.enum(["rating", "experience", "fee_asc", "fee_desc"]).default("rating"),
});

export type SearchPhysioInput = z.infer<typeof searchPhysioSchema>;

export const slotQuerySchema = z.object({
  physiotherapistId: z.string().min(1, "Physiotherapist ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  appointmentType: z.enum(["HOME_VISIT", "CLINIC_VISIT"]).default("HOME_VISIT"),
});

export type SlotQueryInput = z.infer<typeof slotQuerySchema>;
