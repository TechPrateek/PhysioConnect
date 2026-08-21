import 'package:flutter/material.dart';
import '../../../data/models/booking_model.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../../../data/models/service_request_model.dart';
import '../../../data/repositories/booking_repository.dart';
import '../../../data/repositories/physio_repository.dart';
import '../../../data/repositories/service_request_repository.dart';

class PhysioViewModel extends ChangeNotifier {
  final PhysioRepository _physioRepo;
  final BookingRepository _bookingRepo;
  final ServiceRequestRepository _requestRepo;

  PhysioViewModel({
    PhysioRepository? physioRepo,
    BookingRepository? bookingRepo,
    ServiceRequestRepository? requestRepo,
  })  : _physioRepo = physioRepo ?? PhysioRepository(),
        _bookingRepo = bookingRepo ?? BookingRepository(),
        _requestRepo = requestRepo ?? ServiceRequestRepository();

  bool _isLoading = false;
  String? _errorMessage;

  PhysiotherapistModel? _physioProfile;
  List<BookingModel> _bookings = [];
  List<ServiceRequestModel> _incomingRequests = [];
  PhysioOnlineStatus _onlineStatus = PhysioOnlineStatus.ONLINE;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  PhysiotherapistModel? get physioProfile => _physioProfile;
  List<BookingModel> get bookings => _bookings;
  List<ServiceRequestModel> get incomingRequests => _incomingRequests;
  PhysioOnlineStatus get onlineStatus => _onlineStatus;

  List<BookingModel> get todaysBookings => _bookings;

  double get totalEarnings => _bookings
      .where((b) => b.status == BookingStatus.COMPLETED)
      .fold(0.0, (sum, b) => sum + b.amount);

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _physioRepo.getPhysioById('physio-1'),
        _bookingRepo.getBookings(role: 'PHYSIOTHERAPIST'),
        _requestRepo.getIncomingRequestsForPhysio('physio-1'),
      ]);

      _physioProfile = results[0] as PhysiotherapistModel?;
      _bookings = results[1] as List<BookingModel>;
      _incomingRequests = results[2] as List<ServiceRequestModel>;
      if (_physioProfile != null) {
        _onlineStatus = _physioProfile!.onlineStatus;
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleOnlineStatus() async {
    final nextStatus = _onlineStatus == PhysioOnlineStatus.ONLINE
        ? PhysioOnlineStatus.OFFLINE
        : PhysioOnlineStatus.ONLINE;
    _onlineStatus = nextStatus;
    notifyListeners();

    await _physioRepo.setOnlineStatus(nextStatus);
  }

  Future<void> updateBookingStatus(String bookingId, BookingStatus status) async {
    await _bookingRepo.updateStatus(bookingId, status);
    final index = _bookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      final old = _bookings[index];
      _bookings[index] = BookingModel(
        id: old.id,
        bookingNumber: old.bookingNumber,
        patientId: old.patientId,
        physiotherapistId: old.physiotherapistId,
        appointmentType: old.appointmentType,
        addressId: old.addressId,
        appointmentDate: old.appointmentDate,
        timeSlot: old.timeSlot,
        status: status,
        chiefComplaint: old.chiefComplaint,
        notes: old.notes,
        amount: old.amount,
        createdAt: old.createdAt,
        patient: old.patient,
        physiotherapist: old.physiotherapist,
        address: old.address,
        payment: old.payment,
      );
      notifyListeners();
    }
  }

  Future<void> acceptIncomingRequest(ServiceRequestModel request) async {
    _incomingRequests.removeWhere((r) => r.id == request.id);
    // Convert to a booking
    final newBooking = BookingModel(
      id: 'bk-new-${DateTime.now().millisecondsSinceEpoch % 1000}',
      bookingNumber: 'PC-ETA-2026-${request.id}',
      patientId: request.patientId,
      physiotherapistId: _physioProfile?.id ?? 'physio-1',
      appointmentType: AppointmentType.HOME_VISIT,
      addressId: request.addressId,
      appointmentDate: DateTime.now(),
      timeSlot: 'Immediate (On-Demand)',
      status: BookingStatus.CONFIRMED,
      chiefComplaint: request.chiefComplaint,
      notes: request.notes,
      amount: _physioProfile?.consultationFee ?? 600.0,
      createdAt: DateTime.now(),
      patient: request.patient,
      address: request.address,
    );
    _bookings.insert(0, newBooking);
    notifyListeners();
  }

  void dismissIncomingRequest(String requestId) {
    _incomingRequests.removeWhere((r) => r.id == requestId);
    notifyListeners();
  }
}
