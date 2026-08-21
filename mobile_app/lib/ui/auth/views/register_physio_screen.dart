import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../view_models/auth_view_model.dart';

class RegisterPhysioScreen extends StatefulWidget {
  const RegisterPhysioScreen({super.key});

  @override
  State<RegisterPhysioScreen> createState() => _RegisterPhysioScreenState();
}

class _RegisterPhysioScreenState extends State<RegisterPhysioScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _experienceController = TextEditingController(text: '3');
  final _feeController = TextEditingController(text: '500');
  final _clinicAddressController = TextEditingController();
  final _bioController = TextEditingController();

  bool _homeVisitAvailable = true;
  bool _clinicVisitAvailable = true;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _experienceController.dispose();
    _feeController.dispose();
    _clinicAddressController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final authVm = context.read<AuthViewModel>();
    final success = await authVm.registerPhysio(
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text.trim(),
      experienceYears: int.tryParse(_experienceController.text) ?? 0,
      consultationFee: double.tryParse(_feeController.text) ?? 500.0,
      homeVisitAvailable: _homeVisitAvailable,
      clinicVisitAvailable: _clinicVisitAvailable,
      clinicAddress: _clinicAddressController.text.trim().isNotEmpty ? _clinicAddressController.text.trim() : null,
      bio: _bioController.text.trim().isNotEmpty ? _bioController.text.trim() : null,
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
        title: const Text('Join as Physiotherapist'),
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
                  'Partner with PhysioConnect',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimaryLight,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Grow your clinical practice, receive direct patients in Etawah, and manage your own schedule.',
                  style: TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
                ),
                const SizedBox(height: 24),

                CustomTextField(
                  controller: _nameController,
                  label: 'Full Name with Title',
                  hintText: 'e.g. Dr. Rajesh Sharma, PT',
                  prefixIcon: Icons.medical_services_outlined,
                  validator: (val) => (val == null || val.isEmpty) ? 'Name is required' : null,
                ),
                const SizedBox(height: 16),

                CustomTextField(
                  controller: _emailController,
                  label: 'Official Email',
                  hintText: 'e.g. rajesh.sharma@example.com',
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
                  label: 'Password',
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

                Row(
                  children: [
                    Expanded(
                      child: CustomTextField(
                        controller: _experienceController,
                        label: 'Years of Exp.',
                        hintText: '3',
                        keyboardType: TextInputType.number,
                        prefixIcon: Icons.work_outline,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: CustomTextField(
                        controller: _feeController,
                        label: 'Base Fee (₹)',
                        hintText: '500',
                        keyboardType: TextInputType.number,
                        prefixIcon: Icons.currency_rupee,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Availability Settings Toggles
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.backgroundLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    children: [
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Home Visits Available', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Travel to patient doorstep for rehab sessions', style: TextStyle(fontSize: 12)),
                        value: _homeVisitAvailable,
                        activeColor: AppColors.primary,
                        onChanged: (val) => setState(() => _homeVisitAvailable = val),
                      ),
                      const Divider(),
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Clinic Visits Available', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Receive patients at your clinic setup', style: TextStyle(fontSize: 12)),
                        value: _clinicVisitAvailable,
                        activeColor: AppColors.primary,
                        onChanged: (val) => setState(() => _clinicVisitAvailable = val),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                if (_clinicVisitAvailable) ...[
                  CustomTextField(
                    controller: _clinicAddressController,
                    label: 'Clinic Address',
                    hintText: 'e.g. Pakki Sarai, Near Railway Station, Etawah',
                    prefixIcon: Icons.local_hospital_outlined,
                  ),
                  const SizedBox(height: 16),
                ],

                CustomTextField(
                  controller: _bioController,
                  label: 'Professional Bio',
                  hintText: 'Brief summary of clinical expertise, techniques, and treatment philosophy',
                  prefixIcon: Icons.badge_outlined,
                  maxLines: 2,
                ),
                const SizedBox(height: 28),

                CustomButton(
                  text: 'Submit Application',
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
