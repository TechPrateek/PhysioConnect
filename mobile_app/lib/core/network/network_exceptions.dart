class AppException implements Exception {
  final String message;
  final int? statusCode;

  AppException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class NetworkException extends AppException {
  NetworkException([super.message = 'Network connection failed. Please check your internet.']);
}

class UnauthorizedException extends AppException {
  UnauthorizedException([super.message = 'Session expired. Please log in again.', super.statusCode = 401]);
}

class NotFoundException extends AppException {
  NotFoundException([super.message = 'Requested resource not found.', super.statusCode = 404]);
}

class ServerException extends AppException {
  ServerException([super.message = 'Internal server error occurred.', super.statusCode = 500]);
}

class ValidationException extends AppException {
  ValidationException(super.message, [super.statusCode = 422]);
}
