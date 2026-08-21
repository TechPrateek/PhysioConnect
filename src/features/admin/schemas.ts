import { z } from "zod";

export const reviewPractitionerSchema = z
  .object({
    physiotherapistId: z.string().min(1, "Physiotherapist ID is required"),
    status: z.enum(["APPROVED", "REJECTED"]),
    verificationNotes: z
      .string()
      .trim()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED" && (!data.verificationNotes || data.verificationNotes.trim().length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Please provide a reason for rejecting the practitioner's credentials",
      path: ["verificationNotes"],
    }
  );

export type ReviewPractitionerInput = z.infer<typeof reviewPractitionerSchema>;
