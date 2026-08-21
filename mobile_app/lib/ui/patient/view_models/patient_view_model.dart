import 'package:flutter/material.dart';
import '../../../data/models/address_model.dart';
import '../../../data/models/booking_model.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/patient_model.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../../../data/models/service_request_model.dart';
import '../../../data/repositories/booking_repository.dart';
import '../../../data/repositories/patient_repository.dart';
import '../../../data/repositories/physio_repository.dart';
import '../../../data/repositories/service_request_repository.dart';

class PatientViewModel extends ChangeNotifier {
  final PatientRepository _patientRepo;
  final PhysioRepository _physioRepo;
  final BookingRepository _bookingRepo;
  final ServiceRequestRepository _requestRepo;

  PatientViewModel({
    PatientRepository? patientRepo,
    PhysioRepository? physioRepo,
    BookingRepository? bookingRepo,
    ServiceRequestRepository? requestRepo,
  })  : _patientRepo = patientRepo ?? PatientRepository(),
        _physioRepo = physioRepo ?? PhysioRepository(),
        _bookingRepo = bookingRepo ?? BookingRepository(),
        _requestRepo = requestRepo ?? ServiceRequestRepository();

  bool _isLoading = false;
  String? _errorMessage;

  PatientModel? _patient;
  List<PhysiotherapistModel> _physiotherapists = [];
  List<BookingModel> _bookings = [];
  List<AddressModel> _addresses = [];
  ServiceRequestModel? _activeServiceRequest;

  // Selected filters
  String _selectedSpecialization = 'All';
  bool _homeVisitOnly = false;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  PatientModel? get patient => _patient;
  List<PhysiotherapistModel> get physiotherapists => _physiotherapists;
  List<BookingModel> get bookings => _bookings;
  List<AddressModel> get addresses => _addresses;
  ServiceRequestModel? get activeServiceRequest => _activeServiceRequest;
  String get selectedSpecialization => _selectedSpecialization;
  bool get homeVisitOnly => _homeVisitOnly;

  List<BookingModel> get upcomingBookings => _bookings
      .where((b) => b.status == BookingStatus.PENDING || b.status == BookingStatus.CONFIRMED || b.status == BookingStatus.IN_PROGRESS)
      .toList();

  List<BookingModel> get pastBookings => _bookings
      .where((b) => b.status == BookingStatus.COMPLETED || b.status == BookingStatus.CANCELLED || b.status == BookingStatus.REJECTED)
      .toList();

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _patientRepo.getProfile(),
        _physioRepo.getPhysiotherapists(),
        _bookingRepo.getBookings(role: 'PATIENT'),
        _patientRepo.getAddresses(),
      ]);

      _patient = results[0] as PatientModel;
      _physiotherapists = results[1] as List<PhysiotherapistModel>;
      _bookings = results[2] as List<BookingModel>;
      _addresses = results[3] as List<AddressModel>;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> setSpecializationFilter(String spec) async {
    _selectedSpecialization = spec;
    _isLoading = true;
    notifyListeners();
    try {
      _physiotherapists = await _physioRepo.getPhysiotherapists(
        specialization: spec,
        homeVisitOnly: _homeVisitOnly,
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleHomeVisitOnly(bool value) async {
    _homeVisitOnly = value;
    _isLoading = true;
    notifyListeners();
    try {
      _physiotherapists = await _physioRepo.getPhysiotherapists(
        specialization: _selectedSpecialization,
        homeVisitOnly: _homeVisitOnly,
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<BookingModel?> createBooking({
    required String physioId,
    required AppointmentType type,
    String? addressId,
    required DateTime date,
    required String timeSlot,
    String? chiefComplaint,
    String? notes,
    required double amount,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final newBooking = BookingModel(
        id: '',
        bookingNumber: '',
        patientId: _patient?.id ?? 'pat-101',
        physiotherapistId: physioId,
        appointmentType: type,
        addressId: addressId,
        appointmentDate: date,
        timeSlot: timeSlot,
        chiefComplaint: chiefComplaint,
        notes: notes,
        amount: amount,
        createdAt: DateTime.now(),
      );

      final result = await _bookingRepo.createBooking(newBooking);
      _bookings.insert(0, result);
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<ServiceRequestModel?> createOnDemandRequest({
    required String chiefComplaint,
    String? notes,
    String? addressId,
  }) async {
    _isLoading = true;
    notifyListeners();
    try {
      final req = ServiceRequestModel(
        id: '',
        requestNumber: '',
        patientId: _patient?.id ?? 'pat-101',
        appointmentType: AppointmentType.HOME_VISIT,
        addressId: addressId,
        chiefComplaint: chiefComplaint,
        notes: notes,
        createdAt: DateTime.now(),
      );
      final res = await _requestRepo.createRequest(req);
      _activeServiceRequest = res;
      return res;
    } catch (e) {
      _errorMessage = e.toString();
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addAddress(AddressModel address) async {
    try {
      final newAddr = await _patientRepo.addAddress(address);
      _addresses.add(newAddr);
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
    }
  }

  Future<void> cancelBooking(String bookingId) async {
    await _bookingRepo.updateStatus(bookingId, BookingStatus.CANCELLED);
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
        status: BookingStatus.CANCELLED,
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
}
