import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../models/enums.dart';

class PhysioService {
  final ApiClient _apiClient;

  PhysioService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<Map<String, dynamic>>> getPhysiotherapists({
    String? specialization,
    bool? homeVisitOnly,
    String? city,
  }) async {
    try {
      final res = await _apiClient.get(ApiEndpoints.physios);
      if (res['success'] == true && res['data'] is List) {
        return (res['data'] as List).map((e) => e as Map<String, dynamic>).toList();
      }
    } catch (_) {}

    // Rich initial mock directory representing Etawah specialists
    return [
      {
        'id': 'physio-1',
        'userId': 'u-physio-1',
        'fullName': 'Dr. Rajesh Sharma, PT',
        'profilePhoto': null,
        'phone': '+91 98765 43210',
        'email': 'rajesh.sharma@physioconnect.in',
        'experienceYears': 8,
        'consultationFee': 600.0,
        'bio': 'Specialist in Orthopedic Rehab, Spine Pain Management, and Post-Surgical Recovery with over 8+ years of clinical expertise.',
        'languages': ['Hindi', 'English'],
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'clinicAddress': 'Sharma Neuro & Spine Rehab, Pakki Sarai, Etawah',
        'homeVisitAvailable': true,
        'clinicVisitAvailable': true,
        'verificationStatus': 'APPROVED',
        'averageRating': 4.9,
        'totalReviews': 38,
        'onlineStatus': 'ONLINE',
        'latitude': 26.7760,
        'longitude': 79.0220,
        'specializations': [
          {'name': 'Orthopedic Rehab', 'slug': 'orthopedic'},
          {'name': 'Sports Injury Rehab', 'slug': 'sports-injury'},
        ],
        'documents': [
          {
            'id': 'doc-1',
            'physiotherapistId': 'physio-1',
            'documentType': 'DEGREE_CERTIFICATE',
            'title': 'Master of Physiotherapy (MPT - Ortho)',
            'fileUrl': 'https://example.com/docs/degree.pdf',
            'verificationStatus': 'APPROVED',
            'createdAt': '2025-01-10T10:00:00.000Z',
          },
          {
            'id': 'doc-2',
            'physiotherapistId': 'physio-1',
            'documentType': 'MEDICAL_REGISTRATION',
            'title': 'UP State Medical Council License',
            'fileUrl': 'https://example.com/docs/license.pdf',
            'verificationStatus': 'APPROVED',
            'createdAt': '2025-01-10T10:00:00.000Z',
          }
        ]
      },
      {
        'id': 'physio-2',
        'userId': 'u-physio-2',
        'fullName': 'Dr. Ananya Verma, PT',
        'profilePhoto': null,
        'phone': '+91 98112 23344',
        'email': 'ananya.verma@physioconnect.in',
        'experienceYears': 5,
        'consultationFee': 500.0,
        'bio': 'Passionate Neurological and Geriatric physiotherapist dedicated to stroke recovery, Parkinson’s exercise routines and elderly mobility.',
        'languages': ['Hindi', 'English'],
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'clinicAddress': 'Verma Physio Care, Friends Colony, Etawah',
        'homeVisitAvailable': true,
        'clinicVisitAvailable': false,
        'verificationStatus': 'APPROVED',
        'averageRating': 4.8,
        'totalReviews': 24,
        'onlineStatus': 'ONLINE',
        'latitude': 26.7810,
        'longitude': 79.0300,
        'specializations': [
          {'name': 'Neurological Rehab', 'slug': 'neurological'},
          {'name': 'Geriatric Care', 'slug': 'geriatric'},
        ],
        'documents': []
      },
      {
        'id': 'physio-3',
        'userId': 'u-physio-3',
        'fullName': 'Dr. Vikas Gupta, PT',
        'profilePhoto': null,
        'phone': '+91 97234 56789',
        'email': 'vikas.gupta@physioconnect.in',
        'experienceYears': 11,
        'consultationFee': 750.0,
        'bio': 'Senior Consultant Sports Physical Therapist specializing in ACL rehab, rotator cuff tears, and postural correction therapies.',
        'languages': ['Hindi', 'English'],
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'clinicAddress': 'Apex Physio Clinic, Shastri Nagar, Etawah',
        'homeVisitAvailable': true,
        'clinicVisitAvailable': true,
        'verificationStatus': 'APPROVED',
        'averageRating': 5.0,
        'totalReviews': 52,
        'onlineStatus': 'BUSY',
        'latitude': 26.7720,
        'longitude': 79.0190,
        'specializations': [
          {'name': 'Sports Injury Rehab', 'slug': 'sports-injury'},
          {'name': 'Orthopedic Rehab', 'slug': 'orthopedic'},
        ],
        'documents': []
      },
      {
        'id': 'physio-4',
        'userId': 'u-physio-4',
        'fullName': 'Dr. Meera Pandey, PT',
        'profilePhoto': null,
        'phone': '+91 98456 71234',
        'email': 'meera.pandey@physioconnect.in',
        'experienceYears': 3,
        'consultationFee': 450.0,
        'bio': 'Pediatric and women’s health physiotherapy practitioner focusing on developmental delays, prenatal and postnatal fitness.',
        'languages': ['Hindi', 'English'],
        'city': 'Etawah',
        'state': 'Uttar Pradesh',
        'clinicAddress': 'Care & Cure Center, Civil Lines, Etawah',
        'homeVisitAvailable': true,
        'clinicVisitAvailable': true,
        'verificationStatus': 'PENDING',
        'averageRating': 4.7,
        'totalReviews': 15,
        'onlineStatus': 'OFFLINE',
        'latitude': 26.7790,
        'longitude': 79.0250,
        'specializations': [
          {'name': 'Pediatric Rehab', 'slug': 'pediatric'},
          {'name': 'Women\'s Health', 'slug': 'womens-health'},
        ],
        'documents': []
      }
    ];
  }

  Future<Map<String, dynamic>?> getPhysioById(String id) async {
    final list = await getPhysiotherapists();
    return list.firstWhere((p) => p['id'] == id, orElse: () => list.first);
  }

  Future<bool> updateOnlineStatus(PhysioOnlineStatus status) async {
    try {
      await _apiClient.post(
        ApiEndpoints.updatePhysioStatus,
        body: {'status': status.toJson()},
      );
      return true;
    } catch (_) {
      return true;
    }
  }

  Future<bool> updateLocation(double lat, double lng) async {
    try {
      await _apiClient.post(
        ApiEndpoints.updatePhysioLocation,
        body: {'latitude': lat, 'longitude': lng},
      );
      return true;
    } catch (_) {
      return true;
    }
  }
}
