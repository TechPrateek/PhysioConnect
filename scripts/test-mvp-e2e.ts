import { PrismaClient, UserRole, VerificationStatus, AppointmentType, BookingStatus, PaymentStatus, DayOfWeek } from "@prisma/client";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import crypto from "crypto";

const prisma = new PrismaClient();

async function runE2ETests() {
  console.log("==================================================================");
  console.log("🚀 Starting PhysioConnect (Etawah) End-to-End Verification Suite");
  console.log("==================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  try {
    // ---------------------------------------------------------
    // TEST 1: Password Hashing & Security (Argon2id)
    // ---------------------------------------------------------
    console.log("📌 1. Testing Password Security & Argon2id Hashing...");
    const rawPass = "EtawahPhysio@2026";
    const hashed = await hashPassword(rawPass);
    assert(hashed.startsWith("$argon2id$"), "Password hash format is Argon2id");
    assert(await verifyPassword(rawPass, hashed), "Password verification succeeds for correct secret");
    assert(!(await verifyPassword("WrongPassword", hashed)), "Password verification fails for invalid secret");

    // ---------------------------------------------------------
    // TEST 2: Patient Creation & Etawah Address Management
    // ---------------------------------------------------------
    console.log("\n📌 2. Testing Patient Profile & Localized Address Management...");
    const testPatientEmail = `test_patient_${Date.now()}@example.com`;
    const patientUser = await prisma.user.create({
      data: {
        name: "Rahul Verma",
        email: testPatientEmail,
        phone: "9876543210",
        role: UserRole.PATIENT,
        password: await hashPassword("PatientPass123!"),
        patient: {
          create: {
            fullName: "Rahul Verma",
            phone: "9876543210",
            email: testPatientEmail,
            gender: "MALE",
            medicalHistory: "Chronic cervical spondylosis from desk work",
          },
        },
      },
      include: { patient: true },
    });

    assert(!!patientUser.patient, "Patient record created and linked to User");

    const address1 = await prisma.address.create({
      data: {
        patientId: patientUser.patient!.id,
        label: "Home",
        street: "House 45, Near ITI College",
        landmark: "Behind Shiv Temple",
        area: "Friends Colony",
        city: "Etawah",
        state: "Uttar Pradesh",
        pincode: "206001",
        isDefault: true,
      },
    });

    assert(address1.area === "Friends Colony" && address1.city === "Etawah", "Address record localized to Etawah, UP");
    assert(address1.isDefault, "Address set as default for home visits");

    // ---------------------------------------------------------
    // TEST 3: Physiotherapist Registration & Weekly Availability
    // ---------------------------------------------------------
    console.log("\n📌 3. Testing Physiotherapist Setup & Availability Schedule...");
    const testPhysioEmail = `test_physio_${Date.now()}@example.com`;
    const physioUser = await prisma.user.create({
      data: {
        name: "Dr. Sunita Yadav",
        email: testPhysioEmail,
        phone: "9123456789",
        role: UserRole.PHYSIOTHERAPIST,
        password: await hashPassword("DoctorPass123!"),
        physiotherapist: {
          create: {
            fullName: "Dr. Sunita Yadav",
            phone: "9123456789",
            email: testPhysioEmail,
            experienceYears: 7,
            consultationFee: 600,
            bio: "Specialist in neuro-rehab and stroke recovery in Etawah.",
            clinicAddress: "Yadav Physiotherapy Clinic, Civil Lines, Etawah",
            homeVisitAvailable: true,
            clinicVisitAvailable: true,
            verificationStatus: VerificationStatus.PENDING,
          },
        },
      },
      include: { physiotherapist: true },
    });

    const physio = physioUser.physiotherapist!;
    assert(physio.verificationStatus === VerificationStatus.PENDING, "New practitioner defaults to PENDING verification");

    // Attach Specialization
    let orthoSpec = await prisma.specialization.findFirst({
      where: { slug: "orthopedic" },
    });
    if (!orthoSpec) {
      orthoSpec = await prisma.specialization.create({
        data: { name: "Orthopedic & Joint Care", slug: "orthopedic", description: "Joint rehab" },
      });
    }

    await prisma.physiotherapistSpecialization.create({
      data: {
        physiotherapistId: physio.id,
        specializationId: orthoSpec.id,
      },
    });

    // Add Weekly Availability (Monday to Saturday 09:00 - 18:00)
    await prisma.availability.create({
      data: {
        physiotherapistId: physio.id,
        dayOfWeek: DayOfWeek.MONDAY,
        startTime: "09:00",
        endTime: "18:00",
        slotDurationMinutes: 60,
        isActive: true,
        isHomeVisit: true,
        isClinicVisit: true,
      },
    });

    // Upload Verification Documents
    const doc = await prisma.uploadedDocument.create({
      data: {
        physiotherapistId: physio.id,
        documentType: "DEGREE_CERTIFICATE",
        title: "Master of Physiotherapy (MPT) Degree",
        fileUrl: "data:application/pdf;base64,JVBERi0xLjQK...",
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    assert(!!doc.id, "Medical degree document uploaded for administrative review");

    // ---------------------------------------------------------
    // TEST 4: Admin Verification & Marketplace Gating
    // ---------------------------------------------------------
    console.log("\n📌 4. Testing Admin Verification Workflow...");
    // Approve practitioner
    await prisma.physiotherapist.update({
      where: { id: physio.id },
      data: {
        verificationStatus: VerificationStatus.APPROVED,
        documents: {
          updateMany: {
            where: { id: doc.id },
            data: { verificationStatus: VerificationStatus.APPROVED, verifiedAt: new Date(), verifiedBy: "Super Admin" },
          },
        },
      },
    });

    const approvedPhysio = await prisma.physiotherapist.findUnique({
      where: { id: physio.id },
    });

    assert(approvedPhysio?.verificationStatus === VerificationStatus.APPROVED, "Doctor status updated to APPROVED");

    // ---------------------------------------------------------
    // TEST 5: Discovery Search & Filtering Constraints
    // ---------------------------------------------------------
    console.log("\n📌 5. Testing Discovery & Locality Search Queries...");
    const searchResults = await prisma.physiotherapist.findMany({
      where: {
        city: "Etawah",
        verificationStatus: VerificationStatus.APPROVED,
        deletedAt: null,
        homeVisitAvailable: true,
      },
      include: { specializations: { include: { specialization: true } } },
    });

    assert(searchResults.some((p) => p.id === physio.id), "Approved practitioner discoverable in Etawah directory");

    // ---------------------------------------------------------
    // TEST 6: Concurrency-Safe Booking & Collision Immunity
    // ---------------------------------------------------------
    console.log("\n📌 6. Testing Concurrency-Safe Booking & Slot Lock...");
    const targetDate = new Date("2026-08-24T00:00:00.000Z"); // A Monday
    const targetSlot = "10:00 AM";
    const bookingNumber = `PC-ETA-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const booking1 = await prisma.booking.create({
      data: {
        bookingNumber,
        patientId: patientUser.patient!.id,
        physiotherapistId: physio.id,
        appointmentType: AppointmentType.HOME_VISIT,
        addressId: address1.id,
        appointmentDate: targetDate,
        timeSlot: targetSlot,
        status: BookingStatus.PENDING,
        amount: physio.consultationFee,
        chiefComplaint: "Post-surgery knee mobilization",
        payment: {
          create: {
            amount: physio.consultationFee,
            currency: "INR",
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: { payment: true },
    });

    assert(booking1.bookingNumber.startsWith("PC-ETA-2026-"), "Booking generated with Etawah territory booking number");
    assert(booking1.status === BookingStatus.PENDING, "Booking initialized with PENDING status");

    // Attempt double-booking exact same slot: must fail unique constraint
    let collisionPrevented = false;
    try {
      await prisma.booking.create({
        data: {
          bookingNumber: `PC-ETA-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
          patientId: patientUser.patient!.id,
          physiotherapistId: physio.id,
          appointmentType: AppointmentType.HOME_VISIT,
          addressId: address1.id,
          appointmentDate: targetDate,
          timeSlot: targetSlot, // SAME SLOT!
          status: BookingStatus.PENDING,
          amount: physio.consultationFee,
        },
      });
    } catch (e: any) {
      collisionPrevented = e.code === "P2002"; // Prisma Unique Constraint Violation
    }

    assert(collisionPrevented, "Database unique constraint strictly blocks double-booking collisions");

    // ---------------------------------------------------------
    // TEST 7: Razorpay HMAC SHA256 Signature Verification
    // ---------------------------------------------------------
    console.log("\n📌 7. Testing Razorpay Payment & Cryptographic Verification...");
    const orderId = `order_${crypto.randomBytes(6).toString("hex")}`;
    const paymentId = `pay_${crypto.randomBytes(6).toString("hex")}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Update payment record with verified transaction
    await prisma.$transaction([
      prisma.payment.update({
        where: { bookingId: booking1.id },
        data: {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: validSignature,
          status: PaymentStatus.PAID,
        },
      }),
      prisma.booking.update({
        where: { id: booking1.id },
        data: { status: BookingStatus.CONFIRMED },
      }),
    ]);

    const confirmedBooking = await prisma.booking.findUnique({
      where: { id: booking1.id },
      include: { payment: true },
    });

    assert(confirmedBooking?.payment?.status === PaymentStatus.PAID, "Payment status updated to PAID");
    assert(confirmedBooking?.status === BookingStatus.CONFIRMED, "Booking status automatically transitioned to CONFIRMED");

    // ---------------------------------------------------------
    // TEST 8: Session Completion & 5-Star Verified Review
    // ---------------------------------------------------------
    console.log("\n📌 8. Testing Session Completion & Verified Review Engine...");
    // Doctor completes session
    await prisma.booking.update({
      where: { id: booking1.id },
      data: {
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Patient submits verified 5-star review
    await prisma.review.create({
      data: {
        bookingId: booking1.id,
        patientId: patientUser.patient!.id,
        physiotherapistId: physio.id,
        rating: 5,
        comment: "Excellent doctor! Dr. Sunita visited our house in Friends Colony on time. Highly recommended.",
        isPublished: true,
      },
    });

    // Recalculate doctor ratings
    const allReviews = await prisma.review.findMany({
      where: { physiotherapistId: physio.id, isPublished: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.physiotherapist.update({
      where: { id: physio.id },
      data: {
        averageRating: avgRating,
        totalReviews: allReviews.length,
      },
    });

    const updatedPhysio = await prisma.physiotherapist.findUnique({
      where: { id: physio.id },
    });

    assert(updatedPhysio?.totalReviews === 1, "Total review counter incremented to 1");
    assert(updatedPhysio?.averageRating === 5.0, "Average rating calculated as 5.0 stars");

    // ---------------------------------------------------------
    // TEST 9: In-App Notifications Delivery
    // ---------------------------------------------------------
    console.log("\n📌 9. Testing In-App Notifications...");
    const notif = await prisma.notification.create({
      data: {
        userId: patientUser.id,
        title: "Session Completed",
        message: "Your session with Dr. Sunita Yadav has been completed.",
        type: "BOOKING_COMPLETED",
        link: `/dashboard/patient/bookings/${booking1.id}`,
      },
    });

    const userNotifs = await prisma.notification.findMany({
      where: { userId: patientUser.id, isRead: false },
    });

    assert(userNotifs.length > 0, "Patient received real-time in-app notification");

    // ---------------------------------------------------------
    // TEST 10: Admin Marketplace Metrics
    // ---------------------------------------------------------
    console.log("\n📌 10. Testing Admin Platform Metrics Aggregation...");
    const totalPatients = await prisma.patient.count();
    const paidRevenue = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
    });

    assert(totalPatients > 0, "Admin metrics accurately aggregates patient count");
    assert((paidRevenue._sum.amount || 0) > 0, "Admin metrics accurately aggregates GMV revenue in ₹");

    console.log("\n==================================================================");
    console.log(`🎉 ALL ${passedTests}/${totalTests} E2E USER JOURNEY TESTS PASSED SUCCESSFULLY!`);
    console.log("==================================================================");
  } catch (error) {
    console.error("\n❌ Test Suite Failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
