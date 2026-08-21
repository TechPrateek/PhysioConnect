import 'enums.dart';
import 'address_model.dart';
import 'patient_model.dart';
import 'physiotherapist_model.dart';

class PaymentModel {
  final String id;
  final String bookingId;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final String? razorpayPaymentId;

  PaymentModel({
    required this.id,
    required this.bookingId,
    required this.amount,
    this.currency = 'INR',
    this.status = PaymentStatus.PENDING,
    this.razorpayPaymentId,
  });

  factory PaymentModel.fromJson(Map<String, dynamic> json) {
    return PaymentModel(
      id: json['id'] as String? ?? '',
      bookingId: json['bookingId'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'INR',
      status: PaymentStatus.fromString(json['status'] as String?),
      razorpayPaymentId: json['razorpayPaymentId'] as String?,
    );
  }
}

class BookingModel {
  final String id;
  final String bookingNumber;
  final String patientId;
  final String physiotherapistId;
  final AppointmentType appointmentType;
  final String? addressId;
  final DateTime appointmentDate;
  final String timeSlot;
  final BookingStatus status;
  final String? chiefComplaint;
  final String? notes;
  final double amount;
  final String? cancellationReason;
  final DateTime createdAt;

  // Relations
  final PatientModel? patient;
  final PhysiotherapistModel? physiotherapist;
  final AddressModel? address;
  final PaymentModel? payment;

  BookingModel({
    required this.id,
    required this.bookingNumber,
    required this.patientId,
    required this.physiotherapistId,
    required this.appointmentType,
    this.addressId,
    required this.appointmentDate,
    required this.timeSlot,
    this.status = BookingStatus.PENDING,
    this.chiefComplaint,
    this.notes,
    required this.amount,
    this.cancellationReason,
    required this.createdAt,
    this.patient,
    this.physiotherapist,
    this.address,
    this.payment,
  });

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    return BookingModel(
      id: json['id'] as String? ?? '',
      bookingNumber: json['bookingNumber'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      physiotherapistId: json['physiotherapistId'] as String? ?? '',
      appointmentType: AppointmentType.fromString(json['appointmentType'] as String?),
      addressId: json['addressId'] as String?,
      appointmentDate: json['appointmentDate'] != null ? DateTime.parse(json['appointmentDate'] as String) : DateTime.now(),
      timeSlot: json['timeSlot'] as String? ?? '10:00 AM',
      status: BookingStatus.fromString(json['status'] as String?),
      chiefComplaint: json['chiefComplaint'] as String?,
      notes: json['notes'] as String?,
      amount: (json['amount'] as num?)?.toDouble() ?? 500.0,
      cancellationReason: json['cancellationReason'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
      patient: json['patient'] is Map<String, dynamic> ? PatientModel.fromJson(json['patient']) : null,
      physiotherapist: json['physiotherapist'] is Map<String, dynamic>
          ? PhysiotherapistModel.fromJson(json['physiotherapist'])
          : null,
      address: json['address'] is Map<String, dynamic> ? AddressModel.fromJson(json['address']) : null,
      payment: json['payment'] is Map<String, dynamic> ? PaymentModel.fromJson(json['payment']) : null,
    );
  }
}
