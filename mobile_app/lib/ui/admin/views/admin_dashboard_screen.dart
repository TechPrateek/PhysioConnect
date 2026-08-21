import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../data/models/enums.dart';
import '../../auth/view_models/auth_view_model.dart';
import '../view_models/admin_view_model.dart';
import 'admin_verification_screen.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final adminVm = context.watch<AdminViewModel>();
    final authVm = context.watch<AuthViewModel>();

    if (adminVm.isLoading && adminVm.metrics == null) {
      return const Scaffold(body: LoadingView(message: 'Loading operations dashboard...'));
    }

    final m = adminVm.metrics;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Operations (Etawah)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => adminVm.loadDashboardData(),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => authVm.logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => adminVm.loadDashboardData(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF581C87), Color(0xFF7C3AED)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.security, color: Colors.white, size: 24),
                        SizedBox(width: 8),
                        Text('ETAWAH REGIONAL HUB', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'PhysioConnect Operations',
                      style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Monitoring on-demand marketplace activity, therapist approvals, and clinical quality compliance.',
                      style: TextStyle(fontSize: 13, color: Colors.white70, height: 1.3),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // KPI Metrics Grid
              const Text('Marketplace Health & Metrics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),

              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _AdminMetricCard(
                    title: 'Gross Revenue (GMV)',
                    value: Formatters.currency(m?.totalRevenue ?? 78400.0),
                    icon: Icons.currency_rupee,
                    color: AppColors.primary,
                  ),
                  _AdminMetricCard(
                    title: 'Active Patients',
                    value: '${m?.totalPatients ?? 142}',
                    icon: Icons.personal_injury_outlined,
                    color: AppColors.secondary,
                  ),
                  _AdminMetricCard(
                    title: 'Partner Physios',
                    value: '${m?.totalPhysiotherapists ?? 18}',
                    icon: Icons.medical_services_outlined,
                    color: AppColors.success,
                  ),
                  _AdminMetricCard(
                    title: 'Online Therapists',
                    value: '${m?.activeOnlinePhysios ?? 6} active',
                    icon: Icons.radar,
                    color: AppColors.warning,
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Pending Approvals Alert Card
              if ((m?.pendingVerifications ?? 0) > 0) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.pending_actions, color: AppColors.warning, size: 28),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${m?.pendingVerifications} KYC Approvals Pending',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.warning),
                            ),
                            const SizedBox(height: 2),
                            const Text('Review practitioner degrees and registrations.', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AdminVerificationScreen()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.warning,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        child: const Text('Review', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Fast Role Switcher
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
                    const Text('Switch Role Portal (Demo Mode)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => authVm.switchDemoRole(UserRole.PATIENT),
                            style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.patientRole)),
                            child: const Text('Patient Portal', style: TextStyle(fontSize: 12, color: AppColors.patientRole)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => authVm.switchDemoRole(UserRole.PHYSIOTHERAPIST),
                            style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.physioRole)),
                            child: const Text('Physio Portal', style: TextStyle(fontSize: 12, color: AppColors.physioRole)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _AdminMetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _AdminMetricCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimaryLight)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
        ],
      ),
    );
  }
}
