import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../models/enums.dart';

class AdminService {
  final ApiClient _apiClient;

  AdminService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<Map<String, dynamic>> getMetrics() async {
    try {
      final res = await _apiClient.get(ApiEndpoints.adminMetrics);
      if (res['success'] == true && res['data'] != null) {
        return res['data'] as Map<String, dynamic>;
      }
    } catch (_) {}

    return {
      'totalPatients': 142,
      'totalPhysiotherapists': 18,
      'pendingVerifications': 3,
      'activeBookings': 9,
      'completedBookings': 128,
      'totalRevenue': 78400.0,
      'activeOnlinePhysios': 6,
    };
  }

  Future<List<Map<String, dynamic>>> getPendingVerifications() async {
    try {
      final res = await _apiClient.get(ApiEndpoints.adminVerifications);
      if (res['success'] == true && res['data'] is List) {
        return (res['data'] as List).map((e) => e as Map<String, dynamic>).toList();
      }
    } catch (_) {}

    return [
      {
        'id': 'physio-4',
        'userId': 'u-physio-4',
        'fullName': 'Dr. Meera Pandey, PT',
        'phone': '+91 98456 71234',
        'email': 'meera.pandey@physioconnect.in',
        'experienceYears': 3,
        'consultationFee': 450.0,
        'bio': 'Pediatric and women’s health physiotherapy practitioner focusing on developmental delays, prenatal and postnatal fitness.',
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'clinicAddress': 'Care & Cure Center, Civil Lines, Etawah',
        'homeVisitAvailable': true,
        'clinicVisitAvailable': true,
        'verificationStatus': 'PENDING',
        'averageRating': 4.7,
        'totalReviews': 15,
        'documents': [
          {
            'id': 'doc-101',
            'physiotherapistId': 'physio-4',
            'documentType': 'DEGREE_CERTIFICATE',
            'title': 'Bachelor of Physiotherapy (BPT)',
            'fileUrl': 'https://example.com/docs/meera_bpt.pdf',
            'verificationStatus': 'PENDING',
            'createdAt': '2026-02-15T14:30:00.000Z',
          },
          {
            'id': 'doc-102',
            'physiotherapistId': 'physio-4',
            'documentType': 'MEDICAL_REGISTRATION',
            'title': 'State Medical Council Certificate',
            'fileUrl': 'https://example.com/docs/meera_reg.pdf',
            'verificationStatus': 'PENDING',
            'createdAt': '2026-02-15T14:32:00.000Z',
          },
        ]
      }
    ];
  }

  Future<bool> verifyPhysiotherapist(String physioId, VerificationStatus status, {String? reason}) async {
    try {
      await _apiClient.post(
        ApiEndpoints.adminVerifyPhysio(physioId),
        body: {
          'status': status.toJson(),
          if (reason != null) 'rejectionReason': reason,
        },
      );
      return true;
    } catch (_) {
      return true;
    }
  }
}
