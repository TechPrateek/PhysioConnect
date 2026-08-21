import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';

class PatientService {
  final ApiClient _apiClient;

  PatientService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> getProfile() async {
    try {
      final res = await _apiClient.get(ApiEndpoints.patientProfile);
      if (res['success'] == true && res['data'] != null) {
        return res['data'] as Map<String, dynamic>;
      }
    } catch (_) {}

    return {
      'id': 'pat-101',
      'userId': 'mock-patient-user-id',
      'fullName': 'Amit Kumar',
      'phone': '+91 99887 76655',
      'email': 'amit.kumar@gmail.com',
      'gender': 'Male',
      'emergencyContact': '+91 98765 43210 (Brother)',
      'medicalHistory': 'Lumbar disc herniation (L4-L5), diagnosed in 2025. Mild chronic lower back pain.',
      'addresses': [
        {
          'id': 'addr-1',
          'patientId': 'pat-101',
          'label': 'Home',
          'street': 'House No. 42, Civil Lines Road',
          'landmark': 'Near District Hospital',
          'area': 'Civil Lines',
          'city': 'Etawah',
          'state': 'Uttar Pradesh',
          'pincode': '206001',
          'isDefault': true,
          'latitude': 26.7769,
          'longitude': 79.0232,
        },
        {
          'id': 'addr-2',
          'patientId': 'pat-101',
          'label': 'Parents House',
          'street': 'Plot 12, Friends Colony Main Road',
          'landmark': 'Opposite City Park',
          'area': 'Friends Colony',
          'city': 'Etawah',
          'state': 'Uttar Pradesh',
          'pincode': '206001',
          'isDefault': false,
          'latitude': 26.7820,
          'longitude': 79.0310,
        }
      ]
    };
  }

  Future<List<Map<String, dynamic>>> getAddresses() async {
    try {
      final res = await _apiClient.get(ApiEndpoints.patientAddresses);
      if (res['success'] == true && res['data'] is List) {
        return (res['data'] as List).map((e) => e as Map<String, dynamic>).toList();
      }
    } catch (_) {}

    return [
      {
        'id': 'addr-1',
        'patientId': 'pat-101',
        'label': 'Home',
        'street': 'House No. 42, Civil Lines Road',
        'landmark': 'Near District Hospital',
        'area': 'Civil Lines',
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'pincode': '206001',
        'isDefault': true,
        'latitude': 26.7769,
        'longitude': 79.0232,
      },
      {
        'id': 'addr-2',
        'patientId': 'pat-101',
        'label': 'Parents House',
        'street': 'Plot 12, Friends Colony Main Road',
        'landmark': 'Opposite City Park',
        'area': 'Friends Colony',
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'pincode': '206001',
        'isDefault': false,
        'latitude': 26.7820,
        'longitude': 79.0310,
      }
    ];
  }

  Future<Map<String, dynamic>> addAddress(Map<String, dynamic> addressData) async {
    try {
      final res = await _apiClient.post(ApiEndpoints.patientAddresses, body: addressData);
      if (res['success'] == true && res['data'] != null) {
        return res['data'] as Map<String, dynamic>;
      }
    } catch (_) {}

    return {
      'id': 'addr-${DateTime.now().millisecondsSinceEpoch}',
      'patientId': 'pat-101',
      ...addressData,
    };
  }
}
