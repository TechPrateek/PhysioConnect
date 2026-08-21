import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../data/models/enums.dart';
import '../view_models/auth_view_model.dart';
import 'register_patient_screen.dart';
import 'register_physio_screen.dart';

class LoginScreen extends StatefulWidget {
  final UserRole initialRole;

  const LoginScreen({super.key, required this.initialRole});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  late UserRole _selectedRole;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.initialRole;
    // Preset convenient defaults for quick testing
    if (_selectedRole == UserRole.PATIENT) {
      _emailController.text = 'patient@physioconnect.in';
      _passwordController.text = 'password123';
    } else if (_selectedRole == UserRole.PHYSIOTHERAPIST) {
      _emailController.text = 'physio@physioconnect.in';
      _passwordController.text = 'password123';
    } else {
      _emailController.text = 'admin@physioconnect.in';
      _passwordController.text = 'password123';
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onRoleChanged(UserRole? role) {
    if (role != null) {
      setState(() {
        _selectedRole = role;
        if (role == UserRole.PATIENT) {
          _emailController.text = 'patient@physioconnect.in';
        } else if (role == UserRole.PHYSIOTHERAPIST) {
          _emailController.text = 'physio@physioconnect.in';
        } else {
          _emailController.text = 'admin@physioconnect.in';
        }
      });
    }
  }

  Future<void> _submitLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authVm = context.read<AuthViewModel>();
    final success = await authVm.login(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (success && mounted) {
      Navigator.popUntil(context, (route) => route.isFirst);
    } else if (mounted && authVm.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authVm.errorMessage!),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authVm = context.watch<AuthViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: Text('${_selectedRole.name.toLowerCase().capitalize()} Login'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 12),
                Text(
                  'Welcome Back 👋',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Log in to access your consultations, bookings, and health records.',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondaryLight,
                  ),
                ),
                const SizedBox(height: 24),

                // Role Selector Segment
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.backgroundLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      _RoleTab(
                        title: 'Patient',
                        isSelected: _selectedRole == UserRole.PATIENT,
                        onTap: () => _onRoleChanged(UserRole.PATIENT),
                      ),
                      _RoleTab(
                        title: 'Physio',
                        isSelected: _selectedRole == UserRole.PHYSIOTHERAPIST,
                        onTap: () => _onRoleChanged(UserRole.PHYSIOTHERAPIST),
                      ),
                      _RoleTab(
                        title: 'Admin',
                        isSelected: _selectedRole == UserRole.ADMIN,
                        onTap: () => _onRoleChanged(UserRole.ADMIN),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                CustomTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  hintText: 'Enter your email',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (val) {
                    if (val == null || val.isEmpty) return 'Email is required';
                    if (!val.contains('@')) return 'Enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _passwordController,
                  label: 'Password',
                  hintText: 'Enter your password',
                  prefixIcon: Icons.lock_outline,
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                      size: 20,
                      color: AppColors.textSecondaryLight,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  validator: (val) {
                    if (val == null || val.isEmpty) return 'Password is required';
                    if (val.length < 6) return 'Password must be at least 6 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 24),

                CustomButton(
                  text: 'Sign In',
                  isLoading: authVm.isLoading,
                  onPressed: _submitLogin,
                ),
                const SizedBox(height: 20),

                if (_selectedRole != UserRole.ADMIN) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an account? ",
                        style: TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
                      ),
                      GestureDetector(
                        onTap: () {
                          if (_selectedRole == UserRole.PATIENT) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const RegisterPatientScreen()),
                            );
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const RegisterPhysioScreen()),
                            );
                          }
                        },
                        child: Text(
                          _selectedRole == UserRole.PATIENT ? 'Register as Patient' : 'Join as Physio',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleTab extends StatelessWidget {
  final String title;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleTab({
    required this.title,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    )
                  ]
                : null,
          ),
          child: Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.textSecondaryLight,
            ),
          ),
        ),
      ),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }
}
