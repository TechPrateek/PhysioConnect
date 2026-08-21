import { z } from "zod";

export const ETAWAH_LOCALITIES = [
  "Friends Colony",
  "Civil Lines",
  "Ashok Nagar",
  "Vijay Nagar",
  "Pakka Bagh",
  "Karam Ganj",
  "Chouguji",
  "Shastri Nagar",
  "Indira Nagar",
  "Railway Colony",
  "Purvia Tola",
  "Katras",
  "Other Area in Etawah",
] as const;

export const updatePatientProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  dateOfBirth: z.string().optional(), // YYYY-MM-DD
  emergencyContact: z.string().trim().optional(),
  medicalHistory: z
    .string()
    .trim()
    .max(1000, "Medical history notes cannot exceed 1000 characters")
    .optional(),
});

export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required (e.g. Home, Work, Parents)"),
  street: z.string().trim().min(5, "Please enter detailed house/street address"),
  landmark: z.string().trim().optional(),
  area: z.string().trim().min(2, "Area or locality in Etawah is required"),
  city: z.string().trim().default("Etawah"),
  state: z.string().trim().default("Uttar Pradesh"),
  pincode: z
    .string()
    .trim()
    .regex(/^206\d{3}$/, "Please enter a valid Etawah pincode (e.g. 206001, 206002)"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
