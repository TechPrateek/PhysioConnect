import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { BookingStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Verify Webhook Signature
    if (signature && env.RAZORPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature && process.env.NODE_ENV === "production") {
        console.error("Razorpay webhook signature mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Processing event: ${eventType}`);

    if (eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
          include: { booking: true },
        });

        if (paymentRecord) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: PaymentStatus.PAID,
                razorpayPaymentId: paymentId,
              },
            }),
            prisma.booking.update({
              where: { id: paymentRecord.bookingId },
              data: {
                status: BookingStatus.CONFIRMED,
              },
            }),
          ]);
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description;

      if (orderId) {
        await prisma.payment.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            status: PaymentStatus.FAILED,
            errorMessage: errorDesc || "Payment failed at gateway",
          },
        });
      }
    } else if (eventType === "refund.processed") {
      const refundEntity = event.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;
      const refundId = refundEntity?.id;
      const refundAmount = refundEntity?.amount ? refundEntity.amount / 100 : 0;
      const refundStatus = refundEntity?.status;

      if (paymentId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayPaymentId: paymentId },
        });

        if (paymentRecord) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: PaymentStatus.REFUNDED,
                refundId,
                refundAmount,
                refundStatus,
              },
            }),
            prisma.booking.update({
              where: { id: paymentRecord.bookingId },
              data: {
                status: BookingStatus.CANCELLED,
                cancellationReason: "Refunded via Razorpay Webhook",
              },
            }),
          ]);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
