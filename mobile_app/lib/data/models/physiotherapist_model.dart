import 'enums.dart';

class SpecializationModel {
  final String id;
  final String name;
  final String slug;
  final String? icon;

  SpecializationModel({
    required this.id,
    required this.name,
    required this.slug,
    this.icon,
  });

  factory SpecializationModel.fromJson(Map<String, dynamic> json) {
    return SpecializationModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      icon: json['icon'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'slug': slug, 'icon': icon};
}

class UploadedDocumentModel {
  final String id;
  final String physiotherapistId;
  final DocumentType documentType;
  final String title;
  final String fileUrl;
  final VerificationStatus verificationStatus;
  final String? rejectionReason;
  final DateTime createdAt;

  UploadedDocumentModel({
    required this.id,
    required this.physiotherapistId,
    required this.documentType,
    required this.title,
    required this.fileUrl,
    required this.verificationStatus,
    this.rejectionReason,
    required this.createdAt,
  });

  factory UploadedDocumentModel.fromJson(Map<String, dynamic> json) {
    return UploadedDocumentModel(
      id: json['id'] as String? ?? '',
      physiotherapistId: json['physiotherapistId'] as String? ?? '',
      documentType: DocumentType.fromString(json['documentType'] as String?),
      title: json['title'] as String? ?? '',
      fileUrl: json['fileUrl'] as String? ?? '',
      verificationStatus: VerificationStatus.fromString(json['verificationStatus'] as String?),
      rejectionReason: json['rejectionReason'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
    );
  }
}

class PhysiotherapistModel {
  final String id;
  final String userId;
  final String fullName;
  final String? profilePhoto;
  final String phone;
  final String email;
  final int experienceYears;
  final double consultationFee;
  final String? bio;
  final List<String> languages;
  final String city;
  final String state;
  final String? clinicAddress;
  final bool homeVisitAvailable;
  final bool clinicVisitAvailable;
  final VerificationStatus verificationStatus;
  final String? rejectionReason;
  final double averageRating;
  final int totalReviews;
  final PhysioOnlineStatus onlineStatus;
  final double? latitude;
  final double? longitude;
  final List<SpecializationModel> specializations;
  final List<UploadedDocumentModel> documents;

  PhysiotherapistModel({
    required this.id,
    required this.userId,
    required this.fullName,
    this.profilePhoto,
    required this.phone,
    required this.email,
    this.experienceYears = 0,
    this.consultationFee = 500.0,
    this.bio,
    this.languages = const ['Hindi', 'English'],
    this.city = 'Etawah',
    this.state = 'Uttar Pradesh',
    this.clinicAddress,
    this.homeVisitAvailable = true,
    this.clinicVisitAvailable = false,
    this.verificationStatus = VerificationStatus.PENDING,
    this.rejectionReason,
    this.averageRating = 5.0,
    this.totalReviews = 0,
    this.onlineStatus = PhysioOnlineStatus.OFFLINE,
    this.latitude,
    this.longitude,
    this.specializations = const [],
    this.documents = const [],
  });

  bool get isVerified => verificationStatus == VerificationStatus.APPROVED;
  bool get isOnline => onlineStatus == PhysioOnlineStatus.ONLINE;

  factory PhysiotherapistModel.fromJson(Map<String, dynamic> json) {
    List<SpecializationModel> specs = [];
    if (json['specializations'] is List) {
      specs = (json['specializations'] as List).map((s) {
        if (s is Map<String, dynamic> && s.containsKey('specialization')) {
          return SpecializationModel.fromJson(s['specialization'] as Map<String, dynamic>);
        }
        return SpecializationModel.fromJson(s as Map<String, dynamic>);
      }).toList();
    }

    List<UploadedDocumentModel> docs = [];
    if (json['documents'] is List) {
      docs = (json['documents'] as List)
          .map((d) => UploadedDocumentModel.fromJson(d as Map<String, dynamic>))
          .toList();
    }

    double? lat;
    double? lng;
    if (json['location'] is Map) {
      lat = double.tryParse(json['location']['latitude'].toString());
      lng = double.tryParse(json['location']['longitude'].toString());
    } else {
      lat = json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null;
      lng = json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null;
    }

    return PhysiotherapistModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      profilePhoto: json['profilePhoto'] as String?,
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      experienceYears: json['experienceYears'] as int? ?? 0,
      consultationFee: (json['consultationFee'] as num?)?.toDouble() ?? 500.0,
      bio: json['bio'] as String?,
      languages: (json['languages'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? ['Hindi', 'English'],
      city: json['city'] as String? ?? 'Etawah',
      state: json['state'] as String? ?? 'Uttar Pradesh',
      clinicAddress: json['clinicAddress'] as String?,
      homeVisitAvailable: json['homeVisitAvailable'] as bool? ?? true,
      clinicVisitAvailable: json['clinicVisitAvailable'] as bool? ?? false,
      verificationStatus: VerificationStatus.fromString(json['verificationStatus'] as String?),
      rejectionReason: json['rejectionReason'] as String?,
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 5.0,
      totalReviews: json['totalReviews'] as int? ?? 0,
      onlineStatus: PhysioOnlineStatus.fromString(json['onlineStatus'] as String?),
      latitude: lat,
      longitude: lng,
      specializations: specs,
      documents: docs,
    );
  }
}
