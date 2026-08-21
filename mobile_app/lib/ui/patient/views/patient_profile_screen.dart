import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_constants.dart';
import '../../../data/models/enums.dart';
import '../../auth/view_models/auth_view_model.dart';
import '../view_models/patient_view_model.dart';
import 'patient_addresses_screen.dart';

class PatientProfileScreen extends StatelessWidget {
  const PatientProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();
    final authVm = context.watch<AuthViewModel>();
    final patient = patientVm.patient;

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile Card
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.primarySubtle,
                    child: Text(
                      patient?.fullName.isNotEmpty == true ? patient!.fullName[0] : 'P',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    patient?.fullName ?? 'Patient Name',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    patient?.email ?? 'patient@example.com',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    patient?.phone ?? '+91 99887 76655',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Medical Profile Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.health_and_safety_outlined, color: AppColors.primary, size: 20),
                      SizedBox(width: 8),
                      Text('Medical Profile', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text('Emergency Contact:', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                  Text(patient?.emergencyContact ?? 'Not specified', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  const Text('Medical History & Notes:', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                  Text(patient?.medicalHistory ?? 'No chronic orthopedic conditions logged.', style: const TextStyle(fontSize: 13, color: AppColors.textPrimaryLight, height: 1.3)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Navigation Links
            _ProfileMenuItem(
              icon: Icons.location_on_outlined,
              title: 'Saved Addresses',
              subtitle: '${patientVm.addresses.length} addresses in Etawah',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PatientAddressesScreen()),
                );
              },
            ),
            const SizedBox(height: 10),

            _ProfileMenuItem(
              icon: Icons.support_agent_outlined,
              title: 'Helpline & Support',
              subtitle: 'Etawah Care Center: support@physioconnect.in',
              onTap: () {},
            ),
            const SizedBox(height: 24),

            // Demo Role Switcher
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.backgroundLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.swap_horiz_rounded, size: 18, color: AppColors.primary),
                      SizedBox(width: 8),
                      Text('Switch Portal View (Demo)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => authVm.switchDemoRole(UserRole.PHYSIOTHERAPIST),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.physioRole),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: const Text('Physio Portal', style: TextStyle(fontSize: 12, color: AppColors.physioRole)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => authVm.switchDemoRole(UserRole.ADMIN),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.adminRole),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: const Text('Admin Portal', style: TextStyle(fontSize: 12, color: AppColors.adminRole)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            OutlinedButton.icon(
              onPressed: () => authVm.logout(),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error),
                foregroundColor: AppColors.error,
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Sign Out'),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.borderLight),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.primarySubtle,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textMutedLight),
          ],
        ),
      ),
    );
  }
}
