import { z } from "zod";

export const submitReviewSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Please select at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .trim()
    .max(1000, "Review comment cannot exceed 1000 characters")
    .optional(),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
