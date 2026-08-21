import '../models/service_request_model.dart';
import '../services/service_request_service.dart';

class ServiceRequestRepository {
  final ServiceRequestService _service;

  ServiceRequestRepository({ServiceRequestService? service}) : _service = service ?? ServiceRequestService();

  Future<ServiceRequestModel> createRequest(ServiceRequestModel request) async {
    final raw = await _service.createRequest({
      'patientId': request.patientId,
      'appointmentType': request.appointmentType.toJson(),
      'addressId': request.addressId,
      'latitude': request.latitude,
      'longitude': request.longitude,
      'chiefComplaint': request.chiefComplaint,
      'notes': request.notes,
    });
    return ServiceRequestModel.fromJson(raw);
  }

  Future<List<ServiceRequestModel>> getIncomingRequestsForPhysio(String physioId) async {
    final rawList = await _service.getIncomingRequestsForPhysio(physioId);
    return rawList.map((j) => ServiceRequestModel.fromJson(j)).toList();
  }
}
