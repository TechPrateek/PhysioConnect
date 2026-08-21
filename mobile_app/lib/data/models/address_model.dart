class AddressModel {
  final String id;
  final String patientId;
  final String label;
  final String street;
  final String? landmark;
  final String area;
  final String city;
  final String state;
  final String pincode;
  final bool isDefault;
  final double? latitude;
  final double? longitude;

  AddressModel({
    required this.id,
    required this.patientId,
    required this.label,
    required this.street,
    this.landmark,
    required this.area,
    this.city = 'Etawah',
    this.state = 'Uttar Pradesh',
    this.pincode = '206001',
    this.isDefault = false,
    this.latitude,
    this.longitude,
  });

  String get fullAddress {
    final parts = [street, landmark, area, city, pincode].where((p) => p != null && p.isNotEmpty).toList();
    return parts.join(', ');
  }

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      id: json['id'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      label: json['label'] as String? ?? 'Home',
      street: json['street'] as String? ?? '',
      landmark: json['landmark'] as String?,
      area: json['area'] as String? ?? '',
      city: json['city'] as String? ?? 'Etawah',
      state: json['state'] as String? ?? 'Uttar Pradesh',
      pincode: json['pincode'] as String? ?? '206001',
      isDefault: json['isDefault'] as bool? ?? false,
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'patientId': patientId,
      'label': label,
      'street': street,
      'landmark': landmark,
      'area': area,
      'city': city,
      'state': state,
      'pincode': pincode,
      'isDefault': isDefault,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
}
