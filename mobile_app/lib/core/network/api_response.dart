class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final String? error;

  ApiResponse({
    required this.success,
    this.data,
    this.message,
    this.error,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null && fromJsonT != null ? fromJsonT(json['data']) : null,
      message: json['message'] as String?,
      error: json['error'] as String?,
    );
  }

  factory ApiResponse.success(T data, [String? message]) {
    return ApiResponse(
      success: true,
      data: data,
      message: message,
    );
  }

  factory ApiResponse.failure(String error) {
    return ApiResponse(
      success: false,
      error: error,
    );
  }
}
