import 'package:flutter/material.dart';
import '../../../data/models/admin_metrics_model.dart';
import '../../../data/models/booking_model.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../../../data/repositories/admin_repository.dart';
import '../../../data/repositories/booking_repository.dart';

class AdminViewModel extends ChangeNotifier {
  final AdminRepository _adminRepo;
  final BookingRepository _bookingRepo;

  AdminViewModel({
    AdminRepository? adminRepo,
    BookingRepository? bookingRepo,
  })  : _adminRepo = adminRepo ?? AdminRepository(),
        _bookingRepo = bookingRepo ?? BookingRepository();

  bool _isLoading = false;
  String? _errorMessage;

  AdminMetricsModel? _metrics;
  List<PhysiotherapistModel> _pendingVerifications = [];
  List<BookingModel> _allBookings = [];

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  AdminMetricsModel? get metrics => _metrics;
  List<PhysiotherapistModel> get pendingVerifications => _pendingVerifications;
  List<BookingModel> get allBookings => _allBookings;

  Future<void> loadDashboardData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        _adminRepo.getMetrics(),
        _adminRepo.getPendingVerifications(),
        _bookingRepo.getBookings(role: 'ADMIN'),
      ]);

      _metrics = results[0] as AdminMetricsModel;
      _pendingVerifications = results[1] as List<PhysiotherapistModel>;
      _allBookings = results[2] as List<BookingModel>;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> verifyPhysio(String physioId, VerificationStatus status, {String? reason}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final ok = await _adminRepo.verifyPhysio(physioId, status, reason: reason);
      if (ok) {
        _pendingVerifications.removeWhere((p) => p.id == physioId);
        if (_metrics != null) {
          _metrics = AdminMetricsModel(
            totalPatients: _metrics!.totalPatients,
            totalPhysiotherapists: _metrics!.totalPhysiotherapists,
            pendingVerifications: (_metrics!.pendingVerifications - 1).clamp(0, 9999),
            activeBookings: _metrics!.activeBookings,
            completedBookings: _metrics!.completedBookings,
            totalRevenue: _metrics!.totalRevenue,
            activeOnlinePhysios: _metrics!.activeOnlinePhysios,
          );
        }
      }
      return ok;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
