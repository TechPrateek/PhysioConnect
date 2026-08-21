enum UserRole {
  PATIENT,
  PHYSIOTHERAPIST,
  ADMIN;

  static UserRole fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'PHYSIOTHERAPIST':
        return UserRole.PHYSIOTHERAPIST;
      case 'ADMIN':
        return UserRole.ADMIN;
      case 'PATIENT':
      default:
        return UserRole.PATIENT;
    }
  }

  String toJson() => name;
}

enum BookingStatus {
  PENDING,
  CONFIRMED,
  IN_PROGRESS,
  COMPLETED,
  CANCELLED,
  REJECTED,
  NO_SHOW;

  static BookingStatus fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'CONFIRMED':
        return BookingStatus.CONFIRMED;
      case 'IN_PROGRESS':
        return BookingStatus.IN_PROGRESS;
      case 'COMPLETED':
        return BookingStatus.COMPLETED;
      case 'CANCELLED':
        return BookingStatus.CANCELLED;
      case 'REJECTED':
        return BookingStatus.REJECTED;
      case 'NO_SHOW':
        return BookingStatus.NO_SHOW;
      case 'PENDING':
      default:
        return BookingStatus.PENDING;
    }
  }

  String toJson() => name;
}

enum PaymentStatus {
  PENDING,
  AUTHORIZED,
  PAID,
  FAILED,
  REFUNDED,
  PARTIALLY_REFUNDED;

  static PaymentStatus fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'AUTHORIZED':
        return PaymentStatus.AUTHORIZED;
      case 'PAID':
        return PaymentStatus.PAID;
      case 'FAILED':
        return PaymentStatus.FAILED;
      case 'REFUNDED':
        return PaymentStatus.REFUNDED;
      case 'PARTIALLY_REFUNDED':
        return PaymentStatus.PARTIALLY_REFUNDED;
      case 'PENDING':
      default:
        return PaymentStatus.PENDING;
    }
  }

  String toJson() => name;
}

enum AppointmentType {
  HOME_VISIT,
  CLINIC_VISIT;

  static AppointmentType fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'CLINIC_VISIT':
        return AppointmentType.CLINIC_VISIT;
      case 'HOME_VISIT':
      default:
        return AppointmentType.HOME_VISIT;
    }
  }

  String get displayName => this == AppointmentType.HOME_VISIT ? 'Home Visit' : 'Clinic Visit';
  String toJson() => name;
}

enum VerificationStatus {
  PENDING,
  APPROVED,
  REJECTED,
  EXPIRED;

  static VerificationStatus fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'APPROVED':
        return VerificationStatus.APPROVED;
      case 'REJECTED':
        return VerificationStatus.REJECTED;
      case 'EXPIRED':
        return VerificationStatus.EXPIRED;
      case 'PENDING':
      default:
        return VerificationStatus.PENDING;
    }
  }

  String toJson() => name;
}

enum PhysioOnlineStatus {
  OFFLINE,
  ONLINE,
  BUSY;

  static PhysioOnlineStatus fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'ONLINE':
        return PhysioOnlineStatus.ONLINE;
      case 'BUSY':
        return PhysioOnlineStatus.BUSY;
      case 'OFFLINE':
      default:
        return PhysioOnlineStatus.OFFLINE;
    }
  }

  String toJson() => name;
}

enum ServiceRequestStatus {
  SEARCHING,
  OFFERED,
  ACCEPTED,
  EXPIRED,
  CANCELLED;

  static ServiceRequestStatus fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'OFFERED':
        return ServiceRequestStatus.OFFERED;
      case 'ACCEPTED':
        return ServiceRequestStatus.ACCEPTED;
      case 'EXPIRED':
        return ServiceRequestStatus.EXPIRED;
      case 'CANCELLED':
        return ServiceRequestStatus.CANCELLED;
      case 'SEARCHING':
      default:
        return ServiceRequestStatus.SEARCHING;
    }
  }

  String toJson() => name;
}

enum OfferStatus {
  PENDING,
  ACCEPTED,
  REJECTED,
  EXPIRED,
  CANCELLED;

  static OfferStatus fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'ACCEPTED':
        return OfferStatus.ACCEPTED;
      case 'REJECTED':
        return OfferStatus.REJECTED;
      case 'EXPIRED':
        return OfferStatus.EXPIRED;
      case 'CANCELLED':
        return OfferStatus.CANCELLED;
      case 'PENDING':
      default:
        return OfferStatus.PENDING;
    }
  }

  String toJson() => name;
}

enum DocumentType {
  ID_PROOF,
  DEGREE_CERTIFICATE,
  MEDICAL_REGISTRATION,
  CLINIC_PROOF,
  OTHER;

  static DocumentType fromString(String? value) {
    switch (value?.toUpperCase()) {
      case 'DEGREE_CERTIFICATE':
        return DocumentType.DEGREE_CERTIFICATE;
      case 'MEDICAL_REGISTRATION':
        return DocumentType.MEDICAL_REGISTRATION;
      case 'CLINIC_PROOF':
        return DocumentType.CLINIC_PROOF;
      case 'OTHER':
        return DocumentType.OTHER;
      case 'ID_PROOF':
      default:
        return DocumentType.ID_PROOF;
    }
  }

  String get displayName {
    switch (this) {
      case DocumentType.ID_PROOF:
        return 'ID Proof (Aadhar/Passport)';
      case DocumentType.DEGREE_CERTIFICATE:
        return 'Degree Certificate (BPT/MPT)';
      case DocumentType.MEDICAL_REGISTRATION:
        return 'Council Registration';
      case DocumentType.CLINIC_PROOF:
        return 'Clinic Address Proof';
      case DocumentType.OTHER:
        return 'Other Document';
    }
  }

  String toJson() => name;
}
