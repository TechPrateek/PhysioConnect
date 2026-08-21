import 'package:flutter/material.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/auth_repository.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthRepository _authRepository;

  bool _isLoading = false;
  String? _errorMessage;
  UserModel? _currentUser;

  AuthViewModel({AuthRepository? authRepository})
      : _authRepository = authRepository ?? AuthRepository();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  UserModel? get currentUser => _currentUser ?? _authRepository.currentUser;
  bool get isAuthenticated => _currentUser != null || _authRepository.isAuthenticated;
  UserRole get currentRole => currentUser?.role ?? UserRole.PATIENT;

  Future<void> checkInitialAuth() async {
    _isLoading = true;
    notifyListeners();
    try {
      _currentUser = await _authRepository.checkAuthStatus();
    } catch (_) {
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.login(email, password);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> registerPatient({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? emergencyContact,
    String? medicalHistory,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.registerPatient(
        name: name,
        email: email,
        phone: phone,
        password: password,
        emergencyContact: emergencyContact,
        medicalHistory: medicalHistory,
      );
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> registerPhysio({
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
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _currentUser = await _authRepository.registerPhysiotherapist(
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
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> switchDemoRole(UserRole role) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _authRepository.switchDemoRole(role);
      _currentUser = _authRepository.currentUser;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    try {
      await _authRepository.logout();
      _currentUser = null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
