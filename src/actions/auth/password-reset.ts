"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { createVerificationToken, verifyToken } from "@/lib/auth/tokens";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/features/auth/schemas";
import { ActionResult } from "@/actions/types";

export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<ActionResult<{ message: string }>> {
  try {
    const validated = forgotPasswordSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid email address",
      };
    }

    const { email } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: 3 requests per hour
    const rateLimit = await checkRateLimit({
      key: `forgot-pw:${normalizedEmail}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return {
        success: false,
        error: "Too many password reset attempts. Please check back later.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user && !user.deletedAt) {
      const token = await createVerificationToken(normalizedEmail, "password-reset");
      console.log(`[PhysioConnect Auth] Password Reset Token for ${normalizedEmail}: ${token}`);
      // In production, send email with reset link: `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`
    }

    // Return generic success message to prevent user enumeration
    return {
      success: true,
      data: {
        message:
          "If an account exists with this email, you will receive instructions to reset your password shortly.",
      },
    };
  } catch (error) {
    console.error("forgotPasswordAction error:", error);
    return {
      success: false,
      error: "Unable to process password reset request. Please try again.",
    };
  }
}

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const validated = resetPasswordSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input data",
      };
    }

    const { email, token, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify token
    const isValidToken = await verifyToken(normalizedEmail, token, "password-reset");
    if (!isValidToken) {
      return {
        success: false,
        error: "Invalid or expired password reset token. Please request a new one.",
      };
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update password in database
    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: passwordHash },
    });

    // Invalidate all existing sessions for security
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });
    }

    return {
      success: true,
      data: {
        success: true,
        message: "Your password has been successfully reset. You can now sign in with your new password.",
      },
    };
  } catch (error) {
    console.error("resetPasswordAction error:", error);
    return {
      success: false,
      error: "Failed to reset password. Please try again.",
    };
  }
}
