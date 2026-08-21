import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerPatientSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;

export const registerPhysioSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
    experienceYears: z.coerce
      .number()
      .int()
      .min(0, "Experience must be 0 or more years")
      .max(60, "Please enter valid experience"),
    consultationFee: z.coerce
      .number()
      .min(100, "Minimum consultation fee is ₹100")
      .max(10000, "Maximum consultation fee is ₹10,000"),
    clinicAddress: z.string().trim().optional(),
    homeVisitAvailable: z.boolean().default(true),
    clinicVisitAvailable: z.boolean().default(false),
    bio: z.string().trim().max(1000).optional(),
    specializationIds: z
      .array(z.string())
      .min(1, "Please select at least one specialization"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

export type RegisterPhysioInput = z.infer<typeof registerPhysioSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email(),
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
