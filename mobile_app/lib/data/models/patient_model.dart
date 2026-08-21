import 'address_model.dart';

class PatientModel {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String email;
  final String? gender;
  final DateTime? dateOfBirth;
  final String? emergencyContact;
  final String? medicalHistory;
  final List<AddressModel> addresses;

  PatientModel({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    required this.email,
    this.gender,
    this.dateOfBirth,
    this.emergencyContact,
    this.medicalHistory,
    this.addresses = const [],
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) {
    return PatientModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] != null ? DateTime.tryParse(json['dateOfBirth'] as String) : null,
      emergencyContact: json['emergencyContact'] as String?,
      medicalHistory: json['medicalHistory'] as String?,
      addresses: (json['addresses'] as List<dynamic>?)
              ?.map((e) => AddressModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'gender': gender,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'emergencyContact': emergencyContact,
      'medicalHistory': medicalHistory,
    };
  }
}
