import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';

class ServiceRequestService {
  final ApiClient _apiClient;

  ServiceRequestService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> createRequest(Map<String, dynamic> requestData) async {
    try {
      final res = await _apiClient.post(ApiEndpoints.serviceRequests, body: requestData);
      if (res['success'] == true && res['data'] != null) {
        return res['data'] as Map<String, dynamic>;
      }
    } catch (_) {}

    final id = 'req-${DateTime.now().millisecondsSinceEpoch % 10000}';
    return {
      'id': id,
      'requestNumber': 'PC-REQ-2026-$id',
      'status': 'SEARCHING',
      'createdAt': DateTime.now().toIso8601String(),
      'offers': [
        {
          'id': 'off-1',
          'serviceRequestId': id,
          'physiotherapistId': 'physio-1',
          'distanceKm': 2.4,
          'estimatedMinutes': 18,
          'status': 'PENDING',
          'offeredAt': DateTime.now().toIso8601String(),
          'physiotherapist': {
            'id': 'physio-1',
            'userId': 'u-physio-1',
            'fullName': 'Dr. Rajesh Sharma, PT',
            'phone': '+91 98765 43210',
            'email': 'rajesh.sharma@physioconnect.in',
            'consultationFee': 600.0,
            'averageRating': 4.9,
            'totalReviews': 38,
            'homeVisitAvailable': true,
          }
        },
        {
          'id': 'off-2',
          'serviceRequestId': id,
          'physiotherapistId': 'physio-2',
          'distanceKm': 3.8,
          'estimatedMinutes': 25,
          'status': 'PENDING',
          'offeredAt': DateTime.now().toIso8601String(),
          'physiotherapist': {
            'id': 'physio-2',
            'userId': 'u-physio-2',
            'fullName': 'Dr. Ananya Verma, PT',
            'phone': '+91 98112 23344',
            'email': 'ananya.verma@physioconnect.in',
            'consultationFee': 500.0,
            'averageRating': 4.8,
            'totalReviews': 24,
            'homeVisitAvailable': true,
          }
        }
      ],
      ...requestData,
    };
  }

  Future<List<Map<String, dynamic>>> getIncomingRequestsForPhysio(String physioId) async {
    try {
      final res = await _apiClient.get('${ApiEndpoints.serviceRequests}?physioId=$physioId');
      if (res['success'] == true && res['data'] is List) {
        return (res['data'] as List).map((e) => e as Map<String, dynamic>).toList();
      }
    } catch (_) {}

    return [
      {
        'id': 'req-8891',
        'requestNumber': 'PC-REQ-2026-8891',
        'patientId': 'pat-101',
        'appointmentType': 'HOME_VISIT',
        'chiefComplaint': 'Acute severe muscle spasm in cervical neck. Unable to turn head.',
        'notes': 'Urgent home visit requested at Civil Lines.',
        'latitude': 26.7769,
        'longitude': 79.0232,
        'status': 'SEARCHING',
        'createdAt': DateTime.now().subtract(const Duration(minutes: 5)).toIso8601String(),
        'patient': {
          'id': 'pat-101',
          'fullName': 'Amit Kumar',
          'phone': '+91 99887 76655',
          'email': 'amit.kumar@gmail.com',
        },
        'address': {
          'id': 'addr-1',
          'patientId': 'pat-101',
          'label': 'Home',
          'street': 'House No. 42, Civil Lines Road',
          'area': 'Civil Lines',
          'city': 'Etawah',
          'pincode': '206001',
        }
      }
    ];
  }
}
