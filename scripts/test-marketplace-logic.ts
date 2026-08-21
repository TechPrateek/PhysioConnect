import {
  createServiceRequestSchema,
  updateOnlineStatusSchema,
  updatePhysioLocationSchema,
  respondToOfferSchema,
} from "../src/features/service-requests/schemas";
import { calculateHaversineDistanceKm } from "../src/lib/geo";

async function runMarketplaceTests() {
  console.log("==================================================================");
  console.log("🚀 PhysioConnect (Etawah) Marketplace Foundation Test Suite");
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

  // 1. Service Request Validation Schemas
  console.log("📌 1. Testing Service Request Zod Schemas...");
  const validHomeRequest = createServiceRequestSchema.safeParse({
    appointmentType: "HOME_VISIT",
    addressId: "addr-12345",
    chiefComplaint: "Acute lumbar disc herniation with sciatica down left leg",
    notes: "Patient is on 1st floor",
  });
  assert(validHomeRequest.success, "Home visit request succeeds with valid addressId and complaint");

  const invalidHomeRequestNoAddress = createServiceRequestSchema.safeParse({
    appointmentType: "HOME_VISIT",
    addressId: "", // Missing
    chiefComplaint: "Severe lower back spasm",
  });
  assert(!invalidHomeRequestNoAddress.success, "Home visit request strictly requires addressId in Etawah");

  const validClinicRequest = createServiceRequestSchema.safeParse({
    appointmentType: "CLINIC_VISIT",
    chiefComplaint: "Post-operative knee replacement mobilization",
  });
  assert(validClinicRequest.success, "Clinic visit request succeeds without addressId");

  const invalidShortComplaint = createServiceRequestSchema.safeParse({
    appointmentType: "CLINIC_VISIT",
    chiefComplaint: "Hi", // Too short
  });
  assert(!invalidShortComplaint.success, "Rejects complaints shorter than 3 characters");

  // 2. Online Status Schemas
  console.log("\n📌 2. Testing Online Status Schemas...");
  assert(updateOnlineStatusSchema.safeParse({ status: "ONLINE" }).success, "Accepts ONLINE status");
  assert(updateOnlineStatusSchema.safeParse({ status: "OFFLINE" }).success, "Accepts OFFLINE status");
  assert(updateOnlineStatusSchema.safeParse({ status: "BUSY" }).success, "Accepts BUSY status");
  assert(!updateOnlineStatusSchema.safeParse({ status: "UNKNOWN" }).success, "Rejects invalid online status");

  // 3. Location Schemas
  console.log("\n📌 3. Testing GPS Coordinates Schema...");
  const validLocation = updatePhysioLocationSchema.safeParse({
    latitude: 26.7769,
    longitude: 79.0236,
  });
  assert(validLocation.success, "Accepts valid Etawah GPS coordinates (26.7769, 79.0236)");

  const invalidLat = updatePhysioLocationSchema.safeParse({
    latitude: 105.0, // Out of bounds
    longitude: 79.0236,
  });
  assert(!invalidLat.success, "Rejects out-of-bounds latitude");

  // 4. Haversine Distance Engine
  console.log("\n📌 4. Testing Haversine Distance Engine...");
  // Civil Lines (26.7769, 79.0236) to Friends Colony (26.7850, 79.0350)
  const distKm = calculateHaversineDistanceKm(26.7769, 79.0236, 26.7850, 79.0350);
  assert(distKm > 1.0 && distKm < 2.0, `Calculated distance (~${distKm} km) is within expected Etawah neighborhood distance`);

  // Same coordinates should yield 0.00 km
  const zeroDist = calculateHaversineDistanceKm(26.7769, 79.0236, 26.7769, 79.0236);
  assert(zeroDist === 0, "Identical coordinates yield 0.00 km distance");

  // 5. Candidate Ranking Logic
  console.log("\n📌 5. Testing Candidate Ranking Sort Logic...");
  const candidates = [
    { name: "Dr. Far", distanceKm: 4.5, rating: 5.0, exp: 10 },
    { name: "Dr. Close", distanceKm: 1.2, rating: 4.8, exp: 5 },
    { name: "Dr. Medium", distanceKm: 2.5, rating: 4.9, exp: 8 },
  ];

  candidates.sort((a, b) => {
    if (Math.abs(a.distanceKm - b.distanceKm) > 1.0) {
      return a.distanceKm - b.distanceKm;
    }
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.exp - a.exp;
  });

  assert(candidates[0].name === "Dr. Close", "Doctor with closest distance ranked first");
  assert(candidates[1].name === "Dr. Medium", "Doctor with medium distance ranked second");
  assert(candidates[2].name === "Dr. Far", "Doctor with furthest distance ranked third");

  // 6. Offer Response Schema
  console.log("\n📌 6. Testing Offer Response Schema...");
  assert(respondToOfferSchema.safeParse({ offerId: "off-1", response: "ACCEPT" }).success, "Validates ACCEPT offer response");
  assert(respondToOfferSchema.safeParse({ offerId: "off-1", response: "REJECT" }).success, "Validates REJECT offer response");
  assert(!respondToOfferSchema.safeParse({ offerId: "", response: "ACCEPT" }).success, "Rejects empty offerId");

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passed}/${total} MARKETPLACE FOUNDATION TESTS PASSED!`);
  console.log("==================================================================");
}

runMarketplaceTests();
