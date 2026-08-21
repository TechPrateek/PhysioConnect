import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/rating_stars.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/physiotherapist_model.dart';
import 'book_appointment_screen.dart';

class PhysioDetailScreen extends StatelessWidget {
  final PhysiotherapistModel physio;

  const PhysioDetailScreen({super.key, required this.physio});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Therapist Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Profile Card
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 42,
                    backgroundColor: AppColors.primarySubtle,
                    child: Text(
                      physio.fullName.isNotEmpty ? physio.fullName[4] : 'D',
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        physio.fullName,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      if (physio.isVerified) ...[
                        const SizedBox(width: 6),
                        const Icon(Icons.verified, color: AppColors.primary, size: 20),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Physiotherapist • ${physio.experienceYears} Years Experience',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
                  ),
                  const SizedBox(height: 8),
                  StatusBadge.fromVerificationStatus(physio.verificationStatus),
                  const SizedBox(height: 12),
                  RatingStars(rating: physio.averageRating, reviewCount: physio.totalReviews, size: 16),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quick Stats Row
            Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(title: 'Experience', value: '${physio.experienceYears}+ Yrs'),
                  _StatItem(title: 'Patients', value: '${physio.totalReviews * 3}+'),
                  _StatItem(title: 'Rating', value: physio.averageRating.toStringAsFixed(1)),
                  _StatItem(title: 'Fee', value: Formatters.currency(physio.consultationFee)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // About Section
            const Text(
              'About Therapist',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            Text(
              physio.bio ?? 'Licensed physiotherapy practitioner committed to evidence-based rehabilitation.',
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight, height: 1.5),
            ),
            const SizedBox(height: 20),

            // Specializations
            if (physio.specializations.isNotEmpty) ...[
              const Text(
                'Clinical Specializations',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: physio.specializations.map((spec) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primarySubtle,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      spec.name,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
            ],

            // Visit Availability & Clinic Info
            const Text(
              'Visit Options',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),
            _VisitOptionCard(
              icon: Icons.home_work_outlined,
              title: 'Doorstep Home Visit',
              description: physio.homeVisitAvailable
                  ? 'Available for home rehabilitation visits within Etawah district.'
                  : 'Currently unavailable for home visits.',
              isAvailable: physio.homeVisitAvailable,
            ),
            const SizedBox(height: 10),
            _VisitOptionCard(
              icon: Icons.local_hospital_outlined,
              title: 'Clinic Consultation',
              description: physio.clinicVisitAvailable
                  ? (physio.clinicAddress ?? 'Clinic in Etawah')
                  : 'Currently unavailable for direct clinic walk-ins.',
              isAvailable: physio.clinicVisitAvailable,
            ),
            const SizedBox(height: 20),

            // Spoken Languages
            const Text(
              'Languages Spoken',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(
              physio.languages.join(', '),
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondaryLight),
            ),
            const SizedBox(height: 80), // Padding for sticky bottom button
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppColors.borderLight)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Consultation Fee', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                  Text(
                    Formatters.currency(physio.consultationFee),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: CustomButton(
                  text: 'Book Appointment',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => BookAppointmentScreen(physio: physio)),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String title;
  final String value;

  const _StatItem({required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
        const SizedBox(height: 2),
        Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
      ],
    );
  }
}

class _VisitOptionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final bool isAvailable;

  const _VisitOptionCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.isAvailable,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isAvailable ? AppColors.borderLight : Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, size: 24, color: isAvailable ? AppColors.primary : Colors.grey),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: isAvailable ? AppColors.textPrimaryLight : Colors.grey)),
                const SizedBox(height: 2),
                Text(description, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
              ],
            ),
          ),
          Icon(
            isAvailable ? Icons.check_circle : Icons.cancel,
            size: 18,
            color: isAvailable ? AppColors.success : Colors.grey,
          ),
        ],
      ),
    );
  }
}
