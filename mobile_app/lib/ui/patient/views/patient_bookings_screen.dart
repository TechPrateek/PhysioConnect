import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/booking_model.dart';
import '../view_models/patient_view_model.dart';
import 'booking_detail_screen.dart';

class PatientBookingsScreen extends StatelessWidget {
  const PatientBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My Appointments'),
          bottom: const TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondaryLight,
            tabs: [
              Tab(text: 'Upcoming & Active'),
              Tab(text: 'Past History'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            // Upcoming Bookings Tab
            patientVm.upcomingBookings.isEmpty
                ? const EmptyState(
                    icon: Icons.calendar_today_outlined,
                    title: 'No Active Appointments',
                    message: 'You do not have any upcoming visits scheduled.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: patientVm.upcomingBookings.length,
                    itemBuilder: (context, index) {
                      final booking = patientVm.upcomingBookings[index];
                      return _BookingCard(booking: booking);
                    },
                  ),

            // Past Bookings Tab
            patientVm.pastBookings.isEmpty
                ? const EmptyState(
                    icon: Icons.history_outlined,
                    title: 'No Past Appointments',
                    message: 'Your past completed and cancelled visits will show here.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: patientVm.pastBookings.length,
                    itemBuilder: (context, index) {
                      final booking = patientVm.pastBookings[index];
                      return _BookingCard(booking: booking);
                    },
                  ),
          ],
        ),
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  final BookingModel booking;

  const _BookingCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => BookingDetailScreen(booking: booking)),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  StatusBadge.fromBookingStatus(booking.status),
                  Text(
                    booking.bookingNumber,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primarySubtle,
                    radius: 20,
                    child: Text(
                      booking.physiotherapist?.fullName.isNotEmpty == true
                          ? booking.physiotherapist!.fullName[4]
                          : 'D',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.physiotherapist?.fullName ?? 'Physiotherapist',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                        ),
                        Text(
                          booking.appointmentType.displayName,
                          style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    Formatters.currency(booking.amount),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_month_outlined, size: 14, color: AppColors.textSecondaryLight),
                  const SizedBox(width: 6),
                  Text(Formatters.date(booking.appointmentDate), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 14),
                  const Icon(Icons.access_time, size: 14, color: AppColors.textSecondaryLight),
                  const SizedBox(width: 6),
                  Text(booking.timeSlot, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  const Spacer(),
                  const Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.textMutedLight),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
