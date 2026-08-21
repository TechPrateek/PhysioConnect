import '../models/address_model.dart';
import '../models/patient_model.dart';
import '../services/patient_service.dart';

class PatientRepository {
  final PatientService _service;
  PatientModel? _cachedPatient;

  PatientRepository({PatientService? service}) : _service = service ?? PatientService();

  Future<PatientModel> getProfile({bool forceRefresh = false}) async {
    if (_cachedPatient != null && !forceRefresh) return _cachedPatient!;
    final data = await _service.getProfile();
    _cachedPatient = PatientModel.fromJson(data);
    return _cachedPatient!;
  }

  Future<List<AddressModel>> getAddresses() async {
    final list = await _service.getAddresses();
    return list.map((json) => AddressModel.fromJson(json)).toList();
  }

  Future<AddressModel> addAddress(AddressModel address) async {
    final res = await _service.addAddress(address.toJson());
    final newAddress = AddressModel.fromJson(res);
    if (_cachedPatient != null) {
      final updatedAddresses = List<AddressModel>.from(_cachedPatient!.addresses)..add(newAddress);
      _cachedPatient = PatientModel(
        id: _cachedPatient!.id,
        userId: _cachedPatient!.userId,
        fullName: _cachedPatient!.fullName,
        phone: _cachedPatient!.phone,
        email: _cachedPatient!.email,
        gender: _cachedPatient!.gender,
        dateOfBirth: _cachedPatient!.dateOfBirth,
        emergencyContact: _cachedPatient!.emergencyContact,
        medicalHistory: _cachedPatient!.medicalHistory,
        addresses: updatedAddresses,
      );
    }
    return newAddress;
  }
}
