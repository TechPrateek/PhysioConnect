import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 24;

export async function createVerificationToken(
  identifier: string,
  type = "email-verification"
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  const key = `${type}:${identifier}`;

  // Delete previous tokens for this identifier
  await prisma.verification.deleteMany({
    where: { identifier: key },
  });

  await prisma.verification.create({
    data: {
      identifier: key,
      value: token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyToken(
  identifier: string,
  token: string,
  type = "email-verification"
): Promise<boolean> {
  const key = `${type}:${identifier}`;
  const record = await prisma.verification.findUnique({
    where: {
      identifier_value: {
        identifier: key,
        value: token,
      },
    },
  });

  if (!record || record.expiresAt < new Date()) {
    return false;
  }

  // Clean up token after successful verification
  await prisma.verification.delete({
    where: {
      identifier_value: {
        identifier: key,
        value: token,
      },
    },
  });

  return true;
}
