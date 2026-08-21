import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("postgresql://postgres:password@localhost:5432/physioconnect?schema=public"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET must be at least 16 characters")
    .default("physioconnect-super-secret-key-min-32-chars-length"),
  BETTER_AUTH_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string().min(1).default("rzp_test_mock_physio_connect"),
  RAZORPAY_KEY_SECRET: z.string().min(1).default("mock_razorpay_secret_key"),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).default("mock_webhook_secret"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1).default("rzp_test_mock_physio_connect"),
  NEXT_PUBLIC_CITY_NAME: z.string().default("Etawah"),
  NEXT_PUBLIC_STATE_NAME: z.string().default("Uttar Pradesh"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const processEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_CITY_NAME: process.env.NEXT_PUBLIC_CITY_NAME,
  NEXT_PUBLIC_STATE_NAME: process.env.NEXT_PUBLIC_STATE_NAME,
  NODE_ENV: process.env.NODE_ENV,
};

export const env = envSchema.parse(processEnv);
