import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/enums.dart';
import '../../auth/view_models/auth_view_model.dart';
import '../view_models/physio_view_model.dart';
import 'physio_documents_screen.dart';

class PhysioProfileScreen extends StatelessWidget {
  const PhysioProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final physioVm = context.watch<PhysioViewModel>();
    final authVm = context.watch<AuthViewModel>();
    final profile = physioVm.physioProfile;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Practice & Profile'),
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
                      profile?.fullName.isNotEmpty == true ? profile!.fullName[4] : 'D',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    profile?.fullName ?? 'Dr. Specialist',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    profile?.email ?? 'physio@physioconnect.in',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${profile?.experienceYears ?? 8} Years Experience • Etawah',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Practice Settings Card
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
                  const Text('Practice Configuration', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Base Consultation Fee:', style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                      Text(Formatters.currency(profile?.consultationFee ?? 600.0), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Divider()),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Home Visits Status:', style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                      Text(
                        profile?.homeVisitAvailable == true ? 'Active (Etawah)' : 'Inactive',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success),
                      ),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Divider()),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Clinic Setup Address:', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                      const SizedBox(height: 2),
                      Text(profile?.clinicAddress ?? 'Pakki Sarai, Etawah', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Menu Items
            _PhysioMenuItem(
              icon: Icons.shield_outlined,
              title: 'KYC & License Documents',
              subtitle: 'Verify degrees and state council registrations',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const PhysioDocumentsScreen()),
                );
              },
            ),
            const SizedBox(height: 10),

            _PhysioMenuItem(
              icon: Icons.notifications_none_outlined,
              title: 'Emergency Lead Alerts',
              subtitle: 'Audio & Push notifications for on-demand calls',
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
                          onPressed: () => authVm.switchDemoRole(UserRole.PATIENT),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.patientRole),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                          ),
                          child: const Text('Patient Portal', style: TextStyle(fontSize: 12, color: AppColors.patientRole)),
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

class _PhysioMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _PhysioMenuItem({
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
