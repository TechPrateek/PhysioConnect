import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../view_models/auth_view_model.dart';

class RegisterPatientScreen extends StatefulWidget {
  const RegisterPatientScreen({super.key});

  @override
  State<RegisterPatientScreen> createState() => _RegisterPatientScreenState();
}

class _RegisterPatientScreenState extends State<RegisterPatientScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emergencyController = TextEditingController();
  final _medicalHistoryController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _emergencyController.dispose();
    _medicalHistoryController.dispose();
    super.dispose();
  }

  Future<void> _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final authVm = context.read<AuthViewModel>();
    final success = await authVm.registerPatient(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text.trim(),
      emergencyContact: _emergencyController.text.trim().isNotEmpty ? _emergencyController.text.trim() : null,
      medicalHistory: _medicalHistoryController.text.trim().isNotEmpty ? _medicalHistoryController.text.trim() : null,
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
        title: const Text('Create Patient Account'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Join PhysioConnect',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Book licensed physiotherapists at home or clinic in minutes.',
                  style: TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
                ),
                const SizedBox(height: 24),

                CustomTextField(
                  controller: _nameController,
                  label: 'Full Name',
                  hintText: 'e.g. Amit Kumar',
                  prefixIcon: Icons.person_outline,
                  validator: (val) => (val == null || val.isEmpty) ? 'Name is required' : null,
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _emailController,
                  label: 'Email Address',
                  hintText: 'e.g. amit.kumar@example.com',
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
                  controller: _phoneController,
                  label: 'Phone Number',
                  hintText: 'e.g. +91 98765 43210',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (val) => (val == null || val.isEmpty) ? 'Phone is required' : null,
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _passwordController,
                  label: 'Create Password',
                  hintText: 'At least 6 characters',
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
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _emergencyController,
                  label: 'Emergency Contact (Optional)',
                  hintText: 'e.g. +91 98111 22233 (Spouse / Parent)',
                  prefixIcon: Icons.contact_phone_outlined,
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _medicalHistoryController,
                  label: 'Existing Medical Notes (Optional)',
                  hintText: 'Any known spinal, knee, or chronic orthopedic conditions',
                  prefixIcon: Icons.history_edu_outlined,
                  maxLines: 2,
                ),
                const SizedBox(height: 28),

                CustomButton(
                  text: 'Register as Patient',
                  isLoading: authVm.isLoading,
                  onPressed: _submitRegister,
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
