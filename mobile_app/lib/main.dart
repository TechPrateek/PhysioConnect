import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/loading_view.dart';
import 'data/models/enums.dart';
import 'data/repositories/admin_repository.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/booking_repository.dart';
import 'data/repositories/patient_repository.dart';
import 'data/repositories/physio_repository.dart';
import 'data/repositories/service_request_repository.dart';
import 'ui/admin/view_models/admin_view_model.dart';
import 'ui/admin/views/admin_main_shell.dart';
import 'ui/auth/view_models/auth_view_model.dart';
import 'ui/auth/views/role_selection_screen.dart';
import 'ui/patient/view_models/patient_view_model.dart';
import 'ui/patient/views/patient_main_shell.dart';
import 'ui/physiotherapist/view_models/physio_view_model.dart';
import 'ui/physiotherapist/views/physio_main_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Instantiate Repositories
  final authRepo = AuthRepository();
  final patientRepo = PatientRepository();
  final physioRepo = PhysioRepository();
  final bookingRepo = BookingRepository();
  final requestRepo = ServiceRequestRepository();
  final adminRepo = AdminRepository();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthViewModel(authRepository: authRepo)..checkInitialAuth(),
        ),
        ChangeNotifierProvider(
          create: (_) => PatientViewModel(
            patientRepo: patientRepo,
            physioRepo: physioRepo,
            bookingRepo: bookingRepo,
            requestRepo: requestRepo,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => PhysioViewModel(
            physioRepo: physioRepo,
            bookingRepo: bookingRepo,
            requestRepo: requestRepo,
          ),
        ),
        ChangeNotifierProvider(
          create: (_) => AdminViewModel(
            adminRepo: adminRepo,
            bookingRepo: bookingRepo,
          ),
        ),
      ],
      child: const PhysioConnectApp(),
    ),
  );
}

class PhysioConnectApp extends StatelessWidget {
  const PhysioConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light,
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final authVm = context.watch<AuthViewModel>();

    if (authVm.isLoading && authVm.currentUser == null) {
      return const Scaffold(
        body: LoadingView(message: 'Initializing PhysioConnect...'),
      );
    }

    if (!authVm.isAuthenticated || authVm.currentUser == null) {
      return const RoleSelectionScreen();
    }

    switch (authVm.currentRole) {
      case UserRole.PHYSIOTHERAPIST:
        return const PhysioMainShell();
      case UserRole.ADMIN:
        return const AdminMainShell();
      case UserRole.PATIENT:
      default:
        return const PatientMainShell();
    }
  }
}
