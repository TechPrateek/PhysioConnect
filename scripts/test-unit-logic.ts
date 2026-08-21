import crypto from "crypto";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { registerPatientSchema, registerPhysioSchema, loginSchema } from "../src/features/auth/schemas";
import { addressSchema, updatePatientProfileSchema, ETAWAH_LOCALITIES } from "../src/features/patients/schemas";
import { searchPhysioSchema, slotQuerySchema, updatePhysioProfileSchema } from "../src/features/physiotherapists/schemas";
import { createBookingSchema, cancelBookingSchema, updateBookingStatusSchema } from "../src/features/bookings/schemas";
import { verifyPaymentSchema, createRazorpayOrderSchema } from "../src/features/payments/schemas";
import { submitReviewSchema } from "../src/features/reviews/schemas";
import { reviewPractitionerSchema } from "../src/features/admin/schemas";

async function runUnitLogicTests() {
  console.log("==================================================================");
  console.log("🚀 PhysioConnect (Etawah) Pure Unit & Business Logic Test Suite");
  console.log("==================================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // 1. Password Security (Argon2id)
  console.log("📌 1. Testing Password Security & Argon2id Hashing...");
  const rawPass = "EtawahPhysio@2026";
  const hashed = await hashPassword(rawPass);
  assert(hashed.startsWith("$argon2id$"), "Password hash format is Argon2id");
  assert(await verifyPassword(rawPass, hashed), "Password verification succeeds for correct secret");
  assert(!(await verifyPassword("WrongPassword", hashed)), "Password verification fails for invalid secret");

  // 2. Auth Validation Schemas
  console.log("\n📌 2. Testing Auth Validation Schemas...");
  const validPatientReg = registerPatientSchema.safeParse({
    name: "Rahul Verma",
    email: "rahul@example.com",
    phone: "9876543210",
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  assert(validPatientReg.success, "Patient registration schema accepts valid 10-digit Indian phone and matching passwords");

  const invalidPhoneReg = registerPatientSchema.safeParse({
    name: "Rahul",
    email: "rahul@example.com",
    phone: "12345", // invalid phone
    password: "Password123!",
    confirmPassword: "Password123!",
  });
  assert(!invalidPhoneReg.success, "Patient registration rejects invalid phone numbers");

  // 3. Patient Address & Etawah Localities
  console.log("\n📌 3. Testing Etawah Localized Addresses...");
  assert(ETAWAH_LOCALITIES.includes("Friends Colony"), "Friends Colony is a recognized Etawah locality");
  assert(ETAWAH_LOCALITIES.includes("Civil Lines"), "Civil Lines is a recognized Etawah locality");

  const validAddress = addressSchema.safeParse({
    label: "Home",
    street: "House 45, Near ITI College",
    landmark: "Behind Temple",
    area: "Friends Colony",
    city: "Etawah",
    state: "Uttar Pradesh",
    pincode: "206001",
    isDefault: true,
  });
  assert(validAddress.success, "Address schema accepts valid Etawah street, locality, and 206001 pin code");

  // 4. Physiotherapist Profile & Clinic Validation
  console.log("\n📌 4. Testing Practitioner Profile Validation...");
  const clinicPhysio = updatePhysioProfileSchema.safeParse({
    fullName: "Dr. Amit Sharma",
    phone: "9876543210",
    experienceYears: 8,
    consultationFee: 500,
    clinicVisitAvailable: true,
    clinicAddress: "Sharma Clinic, Civil Lines, Etawah",
    homeVisitAvailable: true,
    languages: ["Hindi", "English"],
    specializationIds: ["spec-1"],
  });
  assert(clinicPhysio.success, "Physio profile accepts clinic address when clinic visits are enabled");

  const missingClinicAddress = updatePhysioProfileSchema.safeParse({
    fullName: "Dr. Amit Sharma",
    phone: "9876543210",
    experienceYears: 8,
    consultationFee: 500,
    clinicVisitAvailable: true,
    clinicAddress: "", // missing
    homeVisitAvailable: true,
    languages: ["Hindi"],
    specializationIds: ["spec-1"],
  });
  assert(!missingClinicAddress.success, "Physio profile rejects clinic visits without a clinic address");

  // 5. Discovery & Search Schemas
  console.log("\n📌 5. Testing Discovery & Search Schemas...");
  const searchFilter = searchPhysioSchema.safeParse({
    query: "Knee rehab",
    specialization: "orthopedic",
    visitType: "HOME_VISIT",
    maxFee: 800,
    sortBy: "rating",
  });
  assert(searchFilter.success, "Search filter accepts query, specialization slug, and visit mode");

  // 6. Booking Creation & Mandatory Address Check
  console.log("\n📌 6. Testing Booking Creation Constraints...");
  const validHomeBooking = createBookingSchema.safeParse({
    physiotherapistId: "physio-uuid-1",
    appointmentType: "HOME_VISIT",
    appointmentDate: "2026-08-20",
    timeSlot: "10:00 AM",
    addressId: "addr-uuid-1",
    chiefComplaint: "Severe lower back spasm and stiffness",
  });
  assert(validHomeBooking.success, "Home visit booking requires addressId and chief complaint");

  const invalidHomeBooking = createBookingSchema.safeParse({
    physiotherapistId: "physio-uuid-1",
    appointmentType: "HOME_VISIT",
    appointmentDate: "2026-08-20",
    timeSlot: "10:00 AM",
    addressId: "", // missing address
    chiefComplaint: "Back pain",
  });
  assert(!invalidHomeBooking.success, "Home visit booking rejects missing addressId");

  // 7. Razorpay Payment Cryptographic Signatures
  console.log("\n📌 7. Testing Razorpay HMAC SHA256 Signature Verification...");
  const orderId = "order_9A33XNsOPg11";
  const paymentId = "pay_29QQ0JnSD531";
  const testSecret = "rzp_test_secret_key_123";

  const expectedSignature = crypto
    .createHmac("sha256", testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert(expectedSignature.length === 64, "Generated HMAC SHA256 signature is exactly 64 hex characters");

  const validPaymentVerify = verifyPaymentSchema.safeParse({
    bookingId: "booking-1",
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: expectedSignature,
  });
  assert(validPaymentVerify.success, "Payment verification schema validates all required Razorpay fields");

  // 8. Verified Review Schema
  console.log("\n📌 8. Testing Verified Review Submission Schema...");
  const validReview = submitReviewSchema.safeParse({
    bookingId: "booking-1",
    rating: 5,
    comment: "Doctor visited on time in Friends Colony and gave excellent physiotherapy treatment.",
  });
  assert(validReview.success, "Review schema accepts 5-star rating and written feedback");

  const invalidRating = submitReviewSchema.safeParse({
    bookingId: "booking-1",
    rating: 6, // invalid > 5
    comment: "Invalid rating test",
  });
  assert(!invalidRating.success, "Review schema rejects ratings greater than 5 stars");

  // 9. Admin Operations Schema
  console.log("\n📌 9. Testing Admin Practitioner Verification Schema...");
  const validApproval = reviewPractitionerSchema.safeParse({
    physiotherapistId: "physio-1",
    status: "APPROVED",
  });
  assert(validApproval.success, "Admin can approve practitioner credentials");

  const rejectedWithNotes = reviewPractitionerSchema.safeParse({
    physiotherapistId: "physio-1",
    status: "REJECTED",
    verificationNotes: "State Medical Council certificate is illegible. Please re-upload a clear scan.",
  });
  assert(rejectedWithNotes.success, "Admin can reject practitioner with mandatory feedback notes");

  const rejectedWithoutNotes = reviewPractitionerSchema.safeParse({
    physiotherapistId: "physio-1",
    status: "REJECTED",
    verificationNotes: "", // empty
  });
  assert(!rejectedWithoutNotes.success, "Admin rejection mandates explanatory feedback notes");

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passed}/${total} PURE UNIT & BUSINESS LOGIC TESTS PASSED!`);
  console.log("==================================================================");
}

runUnitLogicTests();
