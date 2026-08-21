import { prisma } from "../src/lib/prisma";
import {
  BookingStatus,
  OfferStatus,
  PaymentStatus,
  PhysioOnlineStatus,
  ServiceRequestStatus,
  VerificationStatus,
} from "@prisma/client";

async function testAdminDbMetrics() {
  console.log("==================================================================");
  console.log("🔍 Verifying PostgreSQL Database Schema & Admin Metrics Queries");
  console.log("==================================================================");

  try {
    console.log("1. Testing prisma.patient.count()...");
    const totalPatients = await prisma.patient.count();
    console.log(`✅ totalPatients = ${totalPatients}`);

    console.log("2. Testing prisma.physiotherapist.groupBy(verificationStatus)...");
    const physioCounts = await prisma.physiotherapist.groupBy({
      by: ["verificationStatus"],
      _count: { id: true },
    });
    console.log("✅ physioCounts =", JSON.stringify(physioCounts));

    console.log("3. Testing prisma.physiotherapist.count(onlineStatus)...");
    const onlinePhysiosCount = await prisma.physiotherapist.count({
      where: { onlineStatus: PhysioOnlineStatus.ONLINE },
    });
    console.log(`✅ onlinePhysiosCount = ${onlinePhysiosCount}`);

    console.log("4. Testing prisma.serviceRequest.count(SEARCHING, OFFERED)...");
    const activeServiceRequestsCount = await prisma.serviceRequest.count({
      where: {
        status: {
          in: [ServiceRequestStatus.SEARCHING, ServiceRequestStatus.OFFERED],
        },
      },
    });
    console.log(`✅ activeServiceRequestsCount = ${activeServiceRequestsCount}`);

    console.log("5. Testing prisma.serviceRequestOffer.count(PENDING)...");
    const pendingOffersCount = await prisma.serviceRequestOffer.count({
      where: { status: OfferStatus.PENDING },
    });
    console.log(`✅ pendingOffersCount = ${pendingOffersCount}`);

    console.log("6. Testing prisma.physiotherapistLocation.count()...");
    const locationsCount = await prisma.physiotherapistLocation.count();
    console.log(`✅ physiotherapistLocations = ${locationsCount}`);

    console.log("7. Testing prisma.booking.groupBy(status)...");
    const bookingCounts = await prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    console.log("✅ bookingCounts =", JSON.stringify(bookingCounts));

    console.log("8. Testing prisma.payment.aggregate(PAID)...");
    const completedPayments = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
    });
    console.log(`✅ completedPayments amount sum = ₹${completedPayments._sum.amount || 0}`);

    console.log("9. Testing prisma.review.aggregate()...");
    const reviewsAggregate = await prisma.review.aggregate({
      where: { isPublished: true },
      _avg: { rating: true },
      _count: { id: true },
    });
    console.log(`✅ reviews avg = ${reviewsAggregate._avg.rating || 0}, count = ${reviewsAggregate._count.id}`);

    console.log("10. Testing all existing users/data intact...");
    const usersCount = await prisma.user.count();
    const bookingsCount = await prisma.booking.count();
    const paymentsCount = await prisma.payment.count();
    console.log(`✅ users: ${usersCount}, bookings: ${bookingsCount}, payments: ${paymentsCount}`);

    console.log("==================================================================");
    console.log("🎉 ALL DATABASE SCHEMA & METRICS QUERIES PASSED WITH ZERO ERRORS!");
    console.log("==================================================================");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminDbMetrics();
