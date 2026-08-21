import 'enums.dart';
import 'address_model.dart';
import 'patient_model.dart';
import 'physiotherapist_model.dart';

class ServiceRequestOfferModel {
  final String id;
  final String serviceRequestId;
  final String physiotherapistId;
  final double? distanceKm;
  final int? estimatedMinutes;
  final OfferStatus status;
  final DateTime offeredAt;
  final PhysiotherapistModel? physiotherapist;

  ServiceRequestOfferModel({
    required this.id,
    required this.serviceRequestId,
    required this.physiotherapistId,
    this.distanceKm,
    this.estimatedMinutes,
    this.status = OfferStatus.PENDING,
    required this.offeredAt,
    this.physiotherapist,
  });

  factory ServiceRequestOfferModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestOfferModel(
      id: json['id'] as String? ?? '',
      serviceRequestId: json['serviceRequestId'] as String? ?? '',
      physiotherapistId: json['physiotherapistId'] as String? ?? '',
      distanceKm: json['distanceKm'] != null ? double.tryParse(json['distanceKm'].toString()) : null,
      estimatedMinutes: json['estimatedMinutes'] as int?,
      status: OfferStatus.fromString(json['status'] as String?),
      offeredAt: json['offeredAt'] != null ? DateTime.parse(json['offeredAt'] as String) : DateTime.now(),
      physiotherapist: json['physiotherapist'] is Map<String, dynamic>
          ? PhysiotherapistModel.fromJson(json['physiotherapist'])
          : null,
    );
  }
}

class ServiceRequestModel {
  final String id;
  final String requestNumber;
  final String patientId;
  final AppointmentType appointmentType;
  final String? addressId;
  final double? latitude;
  final double? longitude;
  final String? chiefComplaint;
  final String? notes;
  final DateTime? requestedDate;
  final String? requestedTime;
  final ServiceRequestStatus status;
  final DateTime createdAt;

  // Relations
  final PatientModel? patient;
  final AddressModel? address;
  final List<ServiceRequestOfferModel> offers;

  ServiceRequestModel({
    required this.id,
    required this.requestNumber,
    required this.patientId,
    required this.appointmentType,
    this.addressId,
    this.latitude,
    this.longitude,
    this.chiefComplaint,
    this.notes,
    this.requestedDate,
    this.requestedTime,
    this.status = ServiceRequestStatus.SEARCHING,
    required this.createdAt,
    this.patient,
    this.address,
    this.offers = const [],
  });

  factory ServiceRequestModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestModel(
      id: json['id'] as String? ?? '',
      requestNumber: json['requestNumber'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      appointmentType: AppointmentType.fromString(json['appointmentType'] as String?),
      addressId: json['addressId'] as String?,
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      chiefComplaint: json['chiefComplaint'] as String?,
      notes: json['notes'] as String?,
      requestedDate: json['requestedDate'] != null ? DateTime.tryParse(json['requestedDate'] as String) : null,
      requestedTime: json['requestedTime'] as String?,
      status: ServiceRequestStatus.fromString(json['status'] as String?),
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
      patient: json['patient'] is Map<String, dynamic> ? PatientModel.fromJson(json['patient']) : null,
      address: json['address'] is Map<String, dynamic> ? AddressModel.fromJson(json['address']) : null,
      offers: (json['offers'] as List<dynamic>?)
              ?.map((e) => ServiceRequestOfferModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
