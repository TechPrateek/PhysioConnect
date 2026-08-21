import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../models/enums.dart';

class BookingService {
  final ApiClient _apiClient;

  BookingService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  Future<List<Map<String, dynamic>>> getBookings({String? role}) async {
    try {
      final res = await _apiClient.get(ApiEndpoints.bookings);
      if (res['success'] == true && res['data'] is List) {
        return (res['data'] as List).map((e) => e as Map<String, dynamic>).toList();
      }
    } catch (_) {}

    // Initial mock bookings
    final now = DateTime.now();
    return [
      {
        'id': 'bk-001',
        'bookingNumber': 'PC-ETA-2026-1082',
        'patientId': 'pat-101',
        'physiotherapistId': 'physio-1',
        'appointmentType': 'HOME_VISIT',
        'addressId': 'addr-1',
        'appointmentDate': now.add(const Duration(days: 1)).toIso8601String(),
        'timeSlot': '10:00 AM',
        'status': 'CONFIRMED',
        'chiefComplaint': 'Severe lumbar pain radiating down right leg after sitting.',
        'notes': 'Please carry portable IFT / TENS machine if possible.',
        'amount': 600.0,
        'createdAt': now.subtract(const Duration(hours: 3)).toIso8601String(),
        'physiotherapist': {
          'id': 'physio-1',
          'userId': 'u-physio-1',
          'fullName': 'Dr. Rajesh Sharma, PT',
          'phone': '+91 98765 43210',
          'email': 'rajesh.sharma@physioconnect.in',
          'consultationFee': 600.0,
          'averageRating': 4.9,
          'totalReviews': 38,
          'clinicAddress': 'Sharma Neuro & Spine Rehab, Pakki Sarai, Etawah',
        },
        'patient': {
          'id': 'pat-101',
          'userId': 'mock-patient-user-id',
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
        },
        'payment': {
          'id': 'pay-001',
          'bookingId': 'bk-001',
          'amount': 600.0,
          'currency': 'INR',
          'status': 'PAID',
          'razorpayPaymentId': 'pay_razorpay_998811',
        }
      },
      {
        'id': 'bk-002',
        'bookingNumber': 'PC-ETA-2026-1075',
        'patientId': 'pat-101',
        'physiotherapistId': 'physio-2',
        'appointmentType': 'CLINIC_VISIT',
        'addressId': null,
        'appointmentDate': now.subtract(const Duration(days: 3)).toIso8601String(),
        'timeSlot': '04:00 PM',
        'status': 'COMPLETED',
        'chiefComplaint': 'Post-ankle sprain mobility assessment.',
        'notes': 'Session 1 completed successfully.',
        'amount': 500.0,
        'createdAt': now.subtract(const Duration(days: 4)).toIso8601String(),
        'physiotherapist': {
          'id': 'physio-2',
          'userId': 'u-physio-2',
          'fullName': 'Dr. Ananya Verma, PT',
          'phone': '+91 98112 23344',
          'email': 'ananya.verma@physioconnect.in',
          'consultationFee': 500.0,
          'averageRating': 4.8,
          'totalReviews': 24,
          'clinicAddress': 'Verma Physio Care, Friends Colony, Etawah',
        },
        'patient': {
          'id': 'pat-101',
          'userId': 'mock-patient-user-id',
          'fullName': 'Amit Kumar',
          'phone': '+91 99887 76655',
          'email': 'amit.kumar@gmail.com',
        },
        'payment': {
          'id': 'pay-002',
          'bookingId': 'bk-002',
          'amount': 500.0,
          'currency': 'INR',
          'status': 'PAID',
        }
      }
    ];
  }

  Future<Map<String, dynamic>> createBooking(Map<String, dynamic> bookingData) async {
    try {
      final res = await _apiClient.post(ApiEndpoints.bookings, body: bookingData);
      if (res['success'] == true && res['data'] != null) {
        return res['data'] as Map<String, dynamic>;
      }
    } catch (_) {}

    final id = 'bk-${DateTime.now().millisecondsSinceEpoch % 10000}';
    final number = 'PC-ETA-2026-$id';
    return {
      'id': id,
      'bookingNumber': number,
      'status': 'CONFIRMED',
      'createdAt': DateTime.now().toIso8601String(),
      ...bookingData,
    };
  }

  Future<bool> updateBookingStatus(String bookingId, BookingStatus status) async {
    try {
      await _apiClient.put(
        ApiEndpoints.bookingById(bookingId),
        body: {'status': status.toJson()},
      );
      return true;
    } catch (_) {
      return true;
    }
  }
}
