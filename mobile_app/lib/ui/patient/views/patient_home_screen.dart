import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/rating_stars.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../../shared/notifications_screen.dart';
import '../view_models/patient_view_model.dart';
import 'book_appointment_screen.dart';
import 'on_demand_request_screen.dart';
import 'physio_detail_screen.dart';

class PatientHomeScreen extends StatelessWidget {
  const PatientHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();

    if (patientVm.isLoading && patientVm.patient == null) {
      return const Scaffold(body: LoadingView(message: 'Loading healthcare dashboard...'));
    }

    final patient = patientVm.patient;
    final upcoming = patientVm.upcomingBookings;
    final topPhysios = patientVm.physiotherapists.take(3).toList();

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 20,
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: AppColors.primarySubtle,
              child: Text(
                (patient?.fullName.isNotEmpty == true) ? patient!.fullName[0] : 'P',
                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hello, ${patient?.fullName.split(' ').first ?? 'Patient'}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const Row(
                    children: [
                      Icon(Icons.location_on, size: 12, color: AppColors.primary),
                      SizedBox(width: 2),
                      Text('Etawah, Uttar Pradesh', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => patientVm.loadDashboardData(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Urgent On-Demand Hero Card
              _EmergencyHeroCard(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const OnDemandRequestScreen()),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Active / Upcoming Appointment Card (if any)
              if (upcoming.isNotEmpty) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Upcoming Appointment',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    Text(
                      '${upcoming.length} active',
                      style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                _UpcomingBookingCard(booking: upcoming.first),
                const SizedBox(height: 24),
              ],

              // Specialization Categories
              const Text(
                'Explore Treatments',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              _SpecializationGrid(),
              const SizedBox(height: 24),

              // Top Specialists
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Top Rated Therapists in Etawah',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('View All', style: TextStyle(color: AppColors.primary, fontSize: 13)),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              ...topPhysios.map((physio) => _PhysioCard(physio: physio)),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmergencyHeroCard extends StatelessWidget {
  final VoidCallback onTap;

  const _EmergencyHeroCard({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F766E), Color(0xFF0D9488), Color(0xFF14B8A6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bolt, size: 14, color: Colors.amberAccent),
                    SizedBox(width: 4),
                    Text(
                      'INSTANT HOME VISIT',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              const Icon(Icons.emergency_outlined, color: Colors.white70, size: 22),
            ],
          ),
          const SizedBox(height: 12),
          const Text(
            'Need Urgent Physiotherapy at Home?',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Broadcast your request to certified therapists within 5km for immediate doorstep rehab.',
            style: TextStyle(fontSize: 13, color: Colors.white70, height: 1.3),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: onTap,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppColors.primaryDark,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              icon: const Icon(Icons.radar, size: 18),
              label: const Text('Request Nearest Physio Now', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ),
        ],
      ),
    );
  }
}

class _SpecializationGrid extends StatelessWidget {
  final List<Map<String, dynamic>> specs = const [
    {'title': 'Orthopedic', 'icon': Icons.accessibility_new_rounded, 'slug': 'orthopedic'},
    {'title': 'Sports Injury', 'icon': Icons.sports_tennis_rounded, 'slug': 'sports-injury'},
    {'title': 'Neuro Rehab', 'icon': Icons.psychology_rounded, 'slug': 'neurological'},
    {'title': 'Elderly Care', 'icon': Icons.elderly_rounded, 'slug': 'geriatric'},
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      children: specs.map((s) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primarySubtle,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(s['icon'] as IconData, size: 20, color: AppColors.primary),
                ),
                const SizedBox(height: 6),
                Text(
                  s['title'] as String,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _UpcomingBookingCard extends StatelessWidget {
  final dynamic booking;

  const _UpcomingBookingCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              StatusBadge.fromBookingStatus(booking.status),
              Text(
                Formatters.currency(booking.amount),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            booking.physiotherapist?.fullName ?? 'Physiotherapist',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 4),
          Text(
            booking.chiefComplaint ?? 'General Consultation',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
          ),
          const SizedBox(height: 10),
          const Divider(),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.calendar_today, size: 14, color: AppColors.textSecondaryLight),
              const SizedBox(width: 6),
              Text(Formatters.date(booking.appointmentDate), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              const SizedBox(width: 16),
              const Icon(Icons.access_time, size: 14, color: AppColors.textSecondaryLight),
              const SizedBox(width: 6),
              Text(booking.timeSlot, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
        ],
      ),
    );
  }
}

class _PhysioCard extends StatelessWidget {
  final PhysiotherapistModel physio;

  const _PhysioCard({required this.physio});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: AppColors.primarySubtle,
                child: Text(
                  physio.fullName.isNotEmpty ? physio.fullName[4] : 'D',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            physio.fullName,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                          ),
                        ),
                        if (physio.isVerified)
                          const Icon(Icons.verified, size: 16, color: AppColors.primary),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${physio.experienceYears} Years Exp • ${physio.city}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                    ),
                    const SizedBox(height: 4),
                    RatingStars(
                      rating: physio.averageRating,
                      reviewCount: physio.totalReviews,
                      size: 14,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              if (physio.homeVisitAvailable)
                Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primarySubtle,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('Home Visit', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
              if (physio.clinicVisitAvailable)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.infoLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('Clinic Visit', style: TextStyle(fontSize: 11, color: AppColors.info, fontWeight: FontWeight.w600)),
                ),
              const Spacer(),
              Text(
                '${Formatters.currency(physio.consultationFee)} / session',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimaryLight),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => PhysioDetailScreen(physio: physio)),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('View Profile', style: TextStyle(fontSize: 13)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => BookAppointmentScreen(physio: physio)),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Book Visit', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
