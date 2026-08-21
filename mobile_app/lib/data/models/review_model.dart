class ReviewModel {
  final String id;
  final String bookingId;
  final String physiotherapistId;
  final String patientId;
  final int rating;
  final String? comment;
  final DateTime createdAt;
  final String? patientName;

  ReviewModel({
    required this.id,
    required this.bookingId,
    required this.physiotherapistId,
    required this.patientId,
    required this.rating,
    this.comment,
    required this.createdAt,
    this.patientName,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String? ?? '',
      bookingId: json['bookingId'] as String? ?? '',
      physiotherapistId: json['physiotherapistId'] as String? ?? '',
      patientId: json['patientId'] as String? ?? '',
      rating: json['rating'] as int? ?? 5,
      comment: json['comment'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : DateTime.now(),
      patientName: json['patient'] != null ? json['patient']['fullName'] as String? : null,
    );
  }
}
