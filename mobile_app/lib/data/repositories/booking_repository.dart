import '../models/booking_model.dart';
import '../models/enums.dart';
import '../services/booking_service.dart';

class BookingRepository {
  final BookingService _service;
  List<BookingModel> _cachedBookings = [];

  BookingRepository({BookingService? service}) : _service = service ?? BookingService();

  Future<List<BookingModel>> getBookings({String? role, bool forceRefresh = false}) async {
    if (_cachedBookings.isNotEmpty && !forceRefresh) {
      return _cachedBookings;
    }
    final list = await _service.getBookings(role: role);
    _cachedBookings = list.map((json) => BookingModel.fromJson(json)).toList();
    return _cachedBookings;
  }

  Future<BookingModel> createBooking(BookingModel booking) async {
    final raw = await _service.createBooking({
      'patientId': booking.patientId,
      'physiotherapistId': booking.physiotherapistId,
      'appointmentType': booking.appointmentType.toJson(),
      'addressId': booking.addressId,
      'appointmentDate': booking.appointmentDate.toIso8601String(),
      'timeSlot': booking.timeSlot,
      'chiefComplaint': booking.chiefComplaint,
      'notes': booking.notes,
      'amount': booking.amount,
    });

    final newBooking = BookingModel.fromJson(raw);
    _cachedBookings.insert(0, newBooking);
    return newBooking;
  }

  Future<bool> updateStatus(String bookingId, BookingStatus newStatus) async {
    final ok = await _service.updateBookingStatus(bookingId, newStatus);
    if (ok) {
      final index = _cachedBookings.indexWhere((b) => b.id == bookingId);
      if (index != -1) {
        final old = _cachedBookings[index];
        _cachedBookings[index] = BookingModel(
          id: old.id,
          bookingNumber: old.bookingNumber,
          patientId: old.patientId,
          physiotherapistId: old.physiotherapistId,
          appointmentType: old.appointmentType,
          addressId: old.addressId,
          appointmentDate: old.appointmentDate,
          timeSlot: old.timeSlot,
          status: newStatus,
          chiefComplaint: old.chiefComplaint,
          notes: old.notes,
          amount: old.amount,
          cancellationReason: old.cancellationReason,
          createdAt: old.createdAt,
          patient: old.patient,
          physiotherapist: old.physiotherapist,
          address: old.address,
          payment: old.payment,
        );
      }
    }
    return ok;
  }
}
