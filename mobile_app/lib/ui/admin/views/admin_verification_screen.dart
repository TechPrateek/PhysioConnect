import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../view_models/admin_view_model.dart';

class AdminVerificationScreen extends StatelessWidget {
  const AdminVerificationScreen({super.key});

  void _showRejectDialog(BuildContext context, PhysiotherapistModel physio) {
    final reasonCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Reject KYC: ${physio.fullName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Please specify the reason for rejection so the therapist can correct their documents:',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: reasonCtrl,
              label: 'Rejection Reason',
              hintText: 'e.g. Council registration certificate is expired or illegible',
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (reasonCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              await context.read<AdminViewModel>().verifyPhysio(
                    physio.id,
                    VerificationStatus.REJECTED,
                    reason: reasonCtrl.text.trim(),
                  );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Physiotherapist KYC rejected.')),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('Confirm Reject'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final adminVm = context.watch<AdminViewModel>();
    final list = adminVm.pendingVerifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Therapist KYC Verifications'),
      ),
      body: list.isEmpty
          ? const EmptyState(
              icon: Icons.verified_user_outlined,
              title: 'All Caught Up!',
              message: 'No physiotherapist verification applications are pending in the queue.',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final physio = list[index];
                return _VerificationCard(
                  physio: physio,
                  onApprove: () async {
                    await adminVm.verifyPhysio(physio.id, VerificationStatus.APPROVED);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('${physio.fullName} approved and enabled for bookings!'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    }
                  },
                  onReject: () => _showRejectDialog(context, physio),
                );
              },
            ),
    );
  }
}

class _VerificationCard extends StatelessWidget {
  final PhysiotherapistModel physio;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  const _VerificationCard({
    required this.physio,
    required this.onApprove,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primarySubtle,
                radius: 24,
                child: Text(
                  physio.fullName.isNotEmpty ? physio.fullName[4] : 'D',
                  style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 16),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(physio.fullName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    Text('${physio.experienceYears} Years Exp • ${physio.phone}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                  ],
                ),
              ),
              StatusBadge.fromVerificationStatus(physio.verificationStatus),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Bio: ${physio.bio ?? 'Licensed Physiotherapist'}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 12),
          const Text('Submitted Credentials:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),

          // Documents list
          ...physio.documents.map((d) => Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.backgroundLight,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.picture_as_pdf, color: Colors.red, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(d.title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                    Text(d.documentType.displayName, style: const TextStyle(fontSize: 10, color: AppColors.textSecondaryLight)),
                  ],
                ),
              )),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: onReject,
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  child: const Text('Reject KYC', style: TextStyle(color: AppColors.error, fontSize: 13)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: onApprove,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  child: const Text('Approve Practitioner', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
