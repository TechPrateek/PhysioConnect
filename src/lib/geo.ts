export const DEFAULT_SEARCH_RADIUS_KM = 5.0;
export const MAX_SEARCH_RADIUS_KM = 15.0;

// Pilot Territory: Etawah District
export const ETAWAH_CENTER_LAT = 26.7769;
export const ETAWAH_CENTER_LON = 79.0236;
export const ETAWAH_MAX_RADIUS_KM = 35.0; // Covers entire Etawah district

export const ETAWAH_PINCODES = [
  "206001",
  "206002",
  "206003",
  "206124",
  "206126",
  "206130",
  "206242",
  "206245",
  "206253",
  "206255",
];

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371.0; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 2 decimal places
}

export interface ServiceabilityCheckResult {
  isServiceable: boolean;
  city: string;
  reason?: string;
}

/**
 * Validates whether a location/address is in the currently active pilot territory (Etawah).
 */
export function checkLocationServiceability(params: {
  city?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): ServiceabilityCheckResult {
  const city = params.city?.trim().toLowerCase() || "";
  const pincode = params.pincode?.trim() || "";

  // 1. City Name Match
  if (city.includes("etawah") || city.includes("इटावा")) {
    return {
      isServiceable: true,
      city: "Etawah",
    };
  }

  // 2. Pincode Match
  if (pincode && ETAWAH_PINCODES.some((p) => pincode.startsWith(p.slice(0, 4)))) {
    return {
      isServiceable: true,
      city: "Etawah",
    };
  }

  // 3. GPS Coordinate Distance from Etawah Center
  if (params.latitude != null && params.longitude != null) {
    const dist = calculateHaversineDistanceKm(
      params.latitude,
      params.longitude,
      ETAWAH_CENTER_LAT,
      ETAWAH_CENTER_LON
    );
    if (dist <= ETAWAH_MAX_RADIUS_KM) {
      return {
        isServiceable: true,
        city: "Etawah",
      };
    }
  }

  // If none matched, location is outside the active pilot territory
  return {
    isServiceable: false,
    city: params.city?.trim() || "Your City",
    reason:
      "PhysioConnect is currently live for pilot service in Etawah (UP). Services in other cities across India are launching soon!",
  };
}
