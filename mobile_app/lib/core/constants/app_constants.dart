class AppConstants {
  AppConstants._();

  static const String appName = 'PhysioConnect';
  static const String appTagline = 'Expert Physiotherapy Care, At Your Doorstep & Clinic';
  static const String defaultCity = 'Etawah';
  static const String defaultState = 'Uttar Pradesh';
  static const String defaultPincode = '206001';

  // Local storage keys
  static const String tokenKey = 'physio_auth_token';
  static const String userKey = 'physio_user_data';
  static const String activeRoleKey = 'physio_active_role';
  static const String isDarkModeKey = 'physio_dark_mode';

  // Booking & Request Defaults
  static const double defaultConsultationFee = 500.0;
  static const int defaultSlotDurationMinutes = 60;
  static const int requestTimeoutSeconds = 120;
}
