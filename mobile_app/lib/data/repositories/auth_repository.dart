import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../models/enums.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthRepository {
  final AuthService _authService;
  UserModel? _currentUser;
  String? _token;

  AuthRepository({AuthService? authService}) : _authService = authService ?? AuthService();

  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _currentUser != null;

  Future<UserModel?> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
    final userJson = prefs.getString(AppConstants.userKey);

    if (_token != null && userJson != null) {
      try {
        _currentUser = UserModel.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
        return _currentUser;
      } catch (_) {}
    }
    return null;
  }

  Future<UserModel> login(String email, String password) async {
    final data = await _authService.login(email, password);
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String? ?? 'mock-token';

    await _saveSession(token, user);
    return user;
  }

  Future<UserModel> registerPatient({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? emergencyContact,
    String? medicalHistory,
  }) async {
    final data = await _authService.registerPatient(
      name: name,
      email: email,
      phone: phone,
      password: password,
      emergencyContact: emergencyContact,
      medicalHistory: medicalHistory,
    );
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String? ?? 'mock-token';

    await _saveSession(token, user);
    return user;
  }

  Future<UserModel> registerPhysiotherapist({
    required String name,
    required String email,
    required String phone,
    required String password,
    required int experienceYears,
    required double consultationFee,
    required bool homeVisitAvailable,
    required bool clinicVisitAvailable,
    String? clinicAddress,
    String? bio,
  }) async {
    final data = await _authService.registerPhysiotherapist(
      name: name,
      email: email,
      phone: phone,
      password: password,
      experienceYears: experienceYears,
      consultationFee: consultationFee,
      homeVisitAvailable: homeVisitAvailable,
      clinicVisitAvailable: clinicVisitAvailable,
      clinicAddress: clinicAddress,
      bio: bio,
    );
    final user = UserModel.fromJson(data['user'] as Map<String, dynamic>);
    final token = data['token'] as String? ?? 'mock-token';

    await _saveSession(token, user);
    return user;
  }

  Future<void> switchDemoRole(UserRole role) async {
    final mockUser = UserModel(
      id: 'demo-${role.name.toLowerCase()}',
      name: role == UserRole.PATIENT
          ? 'Amit Kumar (Patient)'
          : role == UserRole.PHYSIOTHERAPIST
              ? 'Dr. Rajesh Sharma, PT'
              : 'Admin Operations',
      email: '${role.name.toLowerCase()}@physioconnect.in',
      phone: '+91 98765 43210',
      role: role,
    );

    await _saveSession('demo-token-${role.name}', mockUser);
  }

  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
  }

  Future<void> _saveSession(String token, UserModel user) async {
    _token = token;
    _currentUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }
}
