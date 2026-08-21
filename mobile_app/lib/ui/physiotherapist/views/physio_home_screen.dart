import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/loading_view.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/enums.dart';
import '../view_models/physio_view_model.dart';
import 'physio_documents_screen.dart';
import 'physio_requests_screen.dart';

class PhysioHomeScreen extends StatelessWidget {
  const PhysioHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final physioVm = context.watch<PhysioViewModel>();

    if (physioVm.isLoading && physioVm.physioProfile == null) {
      return const Scaffold(body: LoadingView(message: 'Loading therapist workspace...'));
    }

    final profile = physioVm.physioProfile;
    final isOnline = physioVm.onlineStatus == PhysioOnlineStatus.ONLINE;
    final incomingCount = physioVm.incomingRequests.length;
    final bookings = physioVm.todaysBookings;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 20,
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: AppColors.primarySubtle,
              child: Text(
                profile?.fullName.isNotEmpty == true ? profile!.fullName[4] : 'D',
                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    profile?.fullName ?? 'Dr. Specialist',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isOnline ? AppColors.success : Colors.grey,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isOnline ? 'Online for Home Visits' : 'Offline',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isOnline ? AppColors.success : AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          // Quick Online Toggle
          Switch(
            value: isOnline,
            activeColor: AppColors.primary,
            onChanged: (_) => physioVm.toggleOnlineStatus(),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => physioVm.loadDashboardData(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // KYC Document status notice if pending
              if (profile != null && !profile.isVerified) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppColors.warning),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Verification Pending', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.warning)),
                            const SizedBox(height: 2),
                            const Text('Upload your BPT/MPT degree and registration to receive patient bookings.', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const PhysioDocumentsScreen()),
                          );
                        },
                        child: const Text('Upload', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.warning)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Metrics Cards Row
              Row(
                children: [
                  Expanded(
                    child: _MetricTile(
                      icon: Icons.currency_rupee,
                      title: 'Earnings',
                      value: Formatters.currency(physioVm.totalEarnings),
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MetricTile(
                      icon: Icons.check_circle_outline,
                      title: 'Completed',
                      value: '${bookings.where((b) => b.status == BookingStatus.COMPLETED).length}',
                      color: AppColors.success,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _MetricTile(
                      icon: Icons.star_rounded,
                      title: 'Rating',
                      value: '${profile?.averageRating.toStringAsFixed(1) ?? 5.0}',
                      color: AppColors.warning,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Emergency Broadcast Notification Alert (if any)
              if (incomingCount > 0) ...[
                InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const PhysioRequestsScreen()),
                    );
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFDC2626), Color(0xFFEA580C)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.bolt, color: Colors.white, size: 28),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '$incomingCount Urgent Home Visit Request',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Colors.white),
                              ),
                              const SizedBox(height: 2),
                              const Text('Patient nearby in Civil Lines needs immediate visit.', style: TextStyle(fontSize: 12, color: Colors.white70)),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 16),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Scheduled Consultations Queue
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Consultation Schedule', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  Text('${bookings.length} total', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight, fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 12),

              if (bookings.isEmpty)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: const Center(
                    child: Text('No appointments booked for today yet.', style: TextStyle(color: AppColors.textSecondaryLight)),
                  ),
                )
              else
                ...bookings.map((b) => _PhysioAppointmentCard(booking: b)),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _MetricTile({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimaryLight)),
          const SizedBox(height: 2),
          Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
        ],
      ),
    );
  }
}

class _PhysioAppointmentCard extends StatelessWidget {
  final dynamic booking;

  const _PhysioAppointmentCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    final physioVm = context.read<PhysioViewModel>();
    final isPending = booking.status == BookingStatus.PENDING;
    final isConfirmed = booking.status == BookingStatus.CONFIRMED;
    final isInProgress = booking.status == BookingStatus.IN_PROGRESS;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.borderLight),
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
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              CircleAvatar(
                backgroundColor: AppColors.primarySubtle,
                radius: 20,
                child: Text(
                  booking.patient?.fullName.isNotEmpty == true ? booking.patient!.fullName[0] : 'P',
                  style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(booking.patient?.fullName ?? 'Patient', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    Text('${booking.appointmentType.displayName} • ${booking.timeSlot}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.phone, color: AppColors.primary),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Calling ${booking.patient?.fullName}...')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Complaint: ${booking.chiefComplaint ?? 'General assessment'}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
          ),
          if (booking.address != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: AppColors.primary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    booking.address!.fullAddress,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 8),

          // Action Buttons depending on status
          if (isPending) ...[
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => physioVm.updateBookingStatus(booking.id, BookingStatus.REJECTED),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.error)),
                    child: const Text('Decline', style: TextStyle(color: AppColors.error, fontSize: 12)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => physioVm.updateBookingStatus(booking.id, BookingStatus.CONFIRMED),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                    child: const Text('Accept', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ] else if (isConfirmed) ...[
            CustomButton(
              text: 'Start Consultation Session',
              height: 40,
              onPressed: () => physioVm.updateBookingStatus(booking.id, BookingStatus.IN_PROGRESS),
            ),
          ] else if (isInProgress) ...[
            CustomButton(
              text: 'Mark Session Completed',
              height: 40,
              backgroundColor: AppColors.success,
              onPressed: () => physioVm.updateBookingStatus(booking.id, BookingStatus.COMPLETED),
            ),
          ],
        ],
      ),
    );
  }
}
