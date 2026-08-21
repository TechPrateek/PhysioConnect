import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/booking_model.dart';
import '../../../data/models/enums.dart';
import '../view_models/patient_view_model.dart';

class BookingDetailScreen extends StatelessWidget {
  final BookingModel booking;

  const BookingDetailScreen({super.key, required this.booking});

  void _showCancelDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Appointment?'),
        content: const Text('Are you sure you want to cancel this scheduled consultation? The therapist will be notified.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Keep Booking'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<PatientViewModel>().cancelBooking(booking.id);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Appointment cancelled successfully.')),
                );
                Navigator.pop(context);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('Confirm Cancel'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canCancel = booking.status == BookingStatus.PENDING || booking.status == BookingStatus.CONFIRMED;

    return Scaffold(
      appBar: AppBar(
        title: Text(booking.bookingNumber),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  StatusBadge.fromBookingStatus(booking.status),
                  const Spacer(),
                  Text(
                    Formatters.currency(booking.amount),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Doctor Card
            const Text('Therapist Details', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primarySubtle,
                    radius: 24,
                    child: Text(
                      booking.physiotherapist?.fullName.isNotEmpty == true
                          ? booking.physiotherapist!.fullName[4]
                          : 'D',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 16),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(booking.physiotherapist?.fullName ?? 'Physiotherapist', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text(booking.physiotherapist?.phone ?? '+91 98765 43210', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.phone, color: AppColors.primary),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Calling ${booking.physiotherapist?.fullName}...')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Schedule & Location Info
            const Text('Schedule & Location', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 18, color: AppColors.primary),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Appointment Date', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                          Text(Formatters.date(booking.appointmentDate), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider()),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 18, color: AppColors.primary),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Time Slot', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                          Text(booking.timeSlot, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 10), child: Divider()),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        booking.appointmentType == AppointmentType.HOME_VISIT ? Icons.home : Icons.local_hospital,
                        size: 18,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(booking.appointmentType.displayName, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                            Text(
                              booking.appointmentType == AppointmentType.HOME_VISIT
                                  ? (booking.address?.fullAddress ?? 'Civil Lines, Etawah, UP')
                                  : (booking.physiotherapist?.clinicAddress ?? 'Clinic in Etawah'),
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Clinical Notes & Chief Complaint
            const Text('Clinical Information', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
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
                  const Text('Chief Complaint:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight)),
                  const SizedBox(height: 4),
                  Text(booking.chiefComplaint ?? 'General assessment and consultation.', style: const TextStyle(fontSize: 14)),
                  if (booking.notes != null) ...[
                    const SizedBox(height: 10),
                    const Text('Special Instructions:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight)),
                    const SizedBox(height: 4),
                    Text(booking.notes!, style: const TextStyle(fontSize: 14)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            if (canCancel) ...[
              CustomButton(
                text: 'Cancel Appointment',
                isOutlined: true,
                backgroundColor: AppColors.error,
                onPressed: () => _showCancelDialog(context),
              ),
              const SizedBox(height: 20),
            ],
          ],
        ),
      ),
    );
  }
}
