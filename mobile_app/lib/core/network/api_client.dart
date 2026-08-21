import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import 'network_exceptions.dart';

class ApiClient {
  final http.Client _client;

  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<dynamic> get(String url) async {
    try {
      final headers = await _getHeaders();
      final response = await _client.get(Uri.parse(url), headers: headers);
      return _processResponse(response);
    } catch (e) {
      if (e is AppException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  Future<dynamic> post(String url, {Map<String, dynamic>? body}) async {
    try {
      final headers = await _getHeaders();
      final response = await _client.post(
        Uri.parse(url),
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (e) {
      if (e is AppException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  Future<dynamic> put(String url, {Map<String, dynamic>? body}) async {
    try {
      final headers = await _getHeaders();
      final response = await _client.put(
        Uri.parse(url),
        headers: headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _processResponse(response);
    } catch (e) {
      if (e is AppException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  Future<dynamic> delete(String url) async {
    try {
      final headers = await _getHeaders();
      final response = await _client.delete(Uri.parse(url), headers: headers);
      return _processResponse(response);
    } catch (e) {
      if (e is AppException) rethrow;
      throw NetworkException(e.toString());
    }
  }

  dynamic _processResponse(http.Response response) {
    dynamic jsonBody;
    try {
      jsonBody = jsonDecode(response.body);
    } catch (_) {
      jsonBody = {'error': response.body};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonBody;
    } else if (response.statusCode == 401 || response.statusCode == 403) {
      throw UnauthorizedException(jsonBody['error'] ?? 'Unauthorized request.');
    } else if (response.statusCode == 404) {
      throw NotFoundException(jsonBody['error'] ?? 'Resource not found.');
    } else if (response.statusCode == 422) {
      throw ValidationException(jsonBody['error'] ?? 'Validation error.');
    } else {
      throw ServerException(
        jsonBody['error'] ?? 'Server returned error (${response.statusCode})',
        response.statusCode,
      );
    }
  }
}
