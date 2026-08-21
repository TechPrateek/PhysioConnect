class ApiEndpoints {
  ApiEndpoints._();

  // Base URL configuration (Default points to localhost / dev server)
  static String baseUrl = 'http://localhost:3000/api';

  // Auth Endpoints
  static String login = '$baseUrl/auth/login';
  static String registerPatient = '$baseUrl/auth/register-patient';
  static String registerPhysio = '$baseUrl/auth/register-physio';
  static String logout = '$baseUrl/auth/logout';
  static String userProfile = '$baseUrl/auth/me';

  // Physiotherapist Endpoints
  static String physios = '$baseUrl/physiotherapists';
  static String physioById(String id) => '$baseUrl/physiotherapists/$id';
  static String updatePhysioStatus = '$baseUrl/physiotherapists/status';
  static String updatePhysioLocation = '$baseUrl/physiotherapists/location';
  static String uploadDocuments = '$baseUrl/physiotherapists/documents';
  static String physioAvailability = '$baseUrl/physiotherapists/availability';

  // Patient Endpoints
  static String patientProfile = '$baseUrl/patients/profile';
  static String patientAddresses = '$baseUrl/patients/addresses';
  static String patientAddressById(String id) => '$baseUrl/patients/addresses/$id';

  // Bookings
  static String bookings = '$baseUrl/bookings';
  static String bookingById(String id) => '$baseUrl/bookings/$id';
  static String cancelBooking(String id) => '$baseUrl/bookings/$id/cancel';
  static String completeBooking(String id) => '$baseUrl/bookings/$id/complete';

  // Service Requests (On-Demand)
  static String serviceRequests = '$baseUrl/service-requests';
  static String serviceRequestById(String id) => '$baseUrl/service-requests/$id';
  static String respondOffer(String requestId) => '$baseUrl/service-requests/$requestId/respond';
  static String cancelServiceRequest(String id) => '$baseUrl/service-requests/$id/cancel';

  // Admin Endpoints
  static String adminMetrics = '$baseUrl/admin/metrics';
  static String adminVerifications = '$baseUrl/admin/verification';
  static String adminVerifyPhysio(String id) => '$baseUrl/admin/verification/$id';
}
