import { z } from "zod";

export const createRazorpayOrderSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;

export const verifyPaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
