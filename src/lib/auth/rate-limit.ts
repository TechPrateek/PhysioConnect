import { prisma } from "@/lib/prisma";

interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number; // in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitConfig): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expiresAt < now) {
      // Create or reset bucket
      await prisma.rateLimit.upsert({
        where: { key },
        update: {
          count: 1,
          lastRequest: BigInt(now.getTime()),
          expiresAt: resetAt,
        },
        create: {
          key,
          count: 1,
          lastRequest: BigInt(now.getTime()),
          expiresAt: resetAt,
        },
      });

      return {
        success: true,
        remaining: limit - 1,
        resetAt,
      };
    }

    if (existing.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetAt: existing.expiresAt,
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
        lastRequest: BigInt(now.getTime()),
      },
    });

    return {
      success: true,
      remaining: Math.max(0, limit - updated.count),
      resetAt: existing.expiresAt,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // Fail-open in case of transient DB error during rate limit check
    return {
      success: true,
      remaining: 1,
      resetAt,
    };
  }
}
