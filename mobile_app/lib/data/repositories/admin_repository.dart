import '../models/admin_metrics_model.dart';
import '../models/enums.dart';
import '../models/physiotherapist_model.dart';
import '../services/admin_service.dart';

class AdminRepository {
  final AdminService _service;

  AdminRepository({AdminService? service}) : _service = service ?? AdminService();

  Future<AdminMetricsModel> getMetrics() async {
    final raw = await _service.getMetrics();
    return AdminMetricsModel.fromJson(raw);
  }

  Future<List<PhysiotherapistModel>> getPendingVerifications() async {
    final list = await _service.getPendingVerifications();
    return list.map((j) => PhysiotherapistModel.fromJson(j)).toList();
  }

  Future<bool> verifyPhysio(String physioId, VerificationStatus status, {String? reason}) async {
    return await _service.verifyPhysiotherapist(physioId, status, reason: reason);
  }
}
