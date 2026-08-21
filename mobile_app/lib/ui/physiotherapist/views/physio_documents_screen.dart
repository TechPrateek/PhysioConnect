import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/enums.dart';
import '../view_models/physio_view_model.dart';

class PhysioDocumentsScreen extends StatelessWidget {
  const PhysioDocumentsScreen({super.key});

  void _simulateUpload(BuildContext context, String docTitle) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Upload $docTitle'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 120,
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.backgroundLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary, style: BorderStyle.solid),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.cloud_upload_outlined, size: 36, color: AppColors.primary),
                  SizedBox(height: 8),
                  Text('Select PDF or JPEG image', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('$docTitle uploaded successfully. Pending admin review.'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Upload Document'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final physioVm = context.watch<PhysioViewModel>();
    final profile = physioVm.physioProfile;
    final docs = profile?.documents ?? [];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Verification & Documents'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Header Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('KYC Verification Status', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                        const SizedBox(height: 4),
                        StatusBadge.fromVerificationStatus(profile?.verificationStatus ?? VerificationStatus.APPROVED),
                      ],
                    ),
                  ),
                  const Icon(Icons.shield_outlined, color: AppColors.primary, size: 32),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'Required Verification Credentials',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            const Text(
              'Government and medical credentials are verified by Etawah clinical operations before approving public bookings.',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight, height: 1.3),
            ),
            const SizedBox(height: 16),

            _DocRequirementCard(
              title: 'BPT / MPT Degree Certificate',
              subtitle: 'Official Bachelor or Master of Physiotherapy degree',
              isUploaded: docs.any((d) => d.documentType == DocumentType.DEGREE_CERTIFICATE),
              onUpload: () => _simulateUpload(context, 'Degree Certificate'),
            ),
            const SizedBox(height: 12),

            _DocRequirementCard(
              title: 'State Medical Council Registration',
              subtitle: 'Valid state registration council certificate or license',
              isUploaded: docs.any((d) => d.documentType == DocumentType.MEDICAL_REGISTRATION),
              onUpload: () => _simulateUpload(context, 'Council Registration'),
            ),
            const SizedBox(height: 12),

            _DocRequirementCard(
              title: 'Government Identity Proof',
              subtitle: 'Aadhaar Card, Passport, or Voter ID',
              isUploaded: true,
              onUpload: () => _simulateUpload(context, 'Identity Proof'),
            ),
            const SizedBox(height: 12),

            _DocRequirementCard(
              title: 'Clinic Ownership / Address Proof',
              subtitle: 'Electricity bill, rent agreement or clinic board',
              isUploaded: false,
              onUpload: () => _simulateUpload(context, 'Clinic Address Proof'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _DocRequirementCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isUploaded;
  final VoidCallback onUpload;

  const _DocRequirementCard({
    required this.title,
    required this.subtitle,
    required this.isUploaded,
    required this.onUpload,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isUploaded ? AppColors.borderLight : Colors.amber.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: isUploaded ? AppColors.successLight : AppColors.warningLight,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isUploaded ? Icons.verified_user : Icons.file_upload_outlined,
              color: isUploaded ? AppColors.success : AppColors.warning,
              size: 20,
            ),
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
          OutlinedButton(
            onPressed: onUpload,
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              side: BorderSide(color: isUploaded ? AppColors.primary : AppColors.warning),
            ),
            child: Text(
              isUploaded ? 'Re-upload' : 'Upload',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: isUploaded ? AppColors.primary : AppColors.warning),
            ),
          ),
        ],
      ),
    );
  }
}
