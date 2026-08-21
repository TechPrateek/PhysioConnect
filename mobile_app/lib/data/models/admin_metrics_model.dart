class AdminMetricsModel {
  final int totalPatients;
  final int totalPhysiotherapists;
  final int pendingVerifications;
  final int activeBookings;
  final int completedBookings;
  final double totalRevenue;
  final int activeOnlinePhysios;

  AdminMetricsModel({
    required this.totalPatients,
    required this.totalPhysiotherapists,
    required this.pendingVerifications,
    required this.activeBookings,
    required this.completedBookings,
    required this.totalRevenue,
    required this.activeOnlinePhysios,
  });

  factory AdminMetricsModel.fromJson(Map<String, dynamic> json) {
    return AdminMetricsModel(
      totalPatients: json['totalPatients'] as int? ?? 0,
      totalPhysiotherapists: json['totalPhysiotherapists'] as int? ?? 0,
      pendingVerifications: json['pendingVerifications'] as int? ?? 0,
      activeBookings: json['activeBookings'] as int? ?? 0,
      completedBookings: json['completedBookings'] as int? ?? 0,
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      activeOnlinePhysios: json['activeOnlinePhysios'] as int? ?? 0,
    );
  }
}
