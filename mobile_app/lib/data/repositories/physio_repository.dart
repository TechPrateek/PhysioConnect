import '../models/enums.dart';
import '../models/physiotherapist_model.dart';
import '../services/physio_service.dart';

class PhysioRepository {
  final PhysioService _service;
  List<PhysiotherapistModel> _cachedPhysios = [];

  PhysioRepository({PhysioService? service}) : _service = service ?? PhysioService();

  Future<List<PhysiotherapistModel>> getPhysiotherapists({
    String? specialization,
    bool? homeVisitOnly,
    bool forceRefresh = false,
  }) async {
    if (_cachedPhysios.isNotEmpty && !forceRefresh) {
      return _filterPhysios(_cachedPhysios, specialization, homeVisitOnly);
    }
    final rawList = await _service.getPhysiotherapists(
      specialization: specialization,
      homeVisitOnly: homeVisitOnly,
    );
    _cachedPhysios = rawList.map((j) => PhysiotherapistModel.fromJson(j)).toList();
    return _filterPhysios(_cachedPhysios, specialization, homeVisitOnly);
  }

  List<PhysiotherapistModel> _filterPhysios(
    List<PhysiotherapistModel> list,
    String? specialization,
    bool? homeVisitOnly,
  ) {
    var result = list;
    if (homeVisitOnly == true) {
      result = result.where((p) => p.homeVisitAvailable).toList();
    }
    if (specialization != null && specialization.isNotEmpty && specialization != 'All') {
      result = result.where((p) => p.specializations.any((s) => s.slug == specialization || s.name.contains(specialization))).toList();
    }
    return result;
  }

  Future<PhysiotherapistModel?> getPhysioById(String id) async {
    final raw = await _service.getPhysioById(id);
    if (raw != null) {
      return PhysiotherapistModel.fromJson(raw);
    }
    return null;
  }

  Future<bool> setOnlineStatus(PhysioOnlineStatus status) async {
    return await _service.updateOnlineStatus(status);
  }

  Future<bool> updateLocation(double lat, double lng) async {
    return await _service.updateLocation(lat, lng);
  }
}
