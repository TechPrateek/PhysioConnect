export type UserRole = "PATIENT" | "PHYSIOTHERAPIST" | "ADMIN";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "NO_SHOW";

export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type AppointmentType = "HOME_VISIT" | "CLINIC_VISIT";

export type VerificationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type DocumentType =
  | "ID_PROOF"
  | "DEGREE_CERTIFICATE"
  | "MEDICAL_REGISTRATION"
  | "CLINIC_PROOF"
  | "OTHER";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  phone?: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
