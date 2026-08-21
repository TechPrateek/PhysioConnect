import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/status_badge.dart';
import '../../../data/models/enums.dart';
import '../view_models/physio_view_model.dart';

class PhysioBookingsScreen extends StatelessWidget {
  const PhysioBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final physioVm = context.watch<PhysioViewModel>();
    final bookings = physioVm.bookings;

    final active = bookings
        .where((b) => b.status == BookingStatus.PENDING || b.status == BookingStatus.CONFIRMED || b.status == BookingStatus.IN_PROGRESS)
        .toList();
    final past = bookings
        .where((b) => b.status == BookingStatus.COMPLETED || b.status == BookingStatus.CANCELLED || b.status == BookingStatus.REJECTED)
        .toList();

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Patient Appointments'),
          bottom: const TabBar(
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: AppColors.textSecondaryLight,
            tabs: [
              Tab(text: 'Active Schedule'),
              Tab(text: 'Completed History'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            active.isEmpty
                ? const EmptyState(
                    icon: Icons.calendar_today_outlined,
                    title: 'No Active Sessions',
                    message: 'You have no scheduled consultations pending.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: active.length,
                    itemBuilder: (context, index) {
                      final b = active[index];
                      return _AppointmentItemCard(booking: b);
                    },
                  ),
            past.isEmpty
                ? const EmptyState(
                    icon: Icons.history_outlined,
                    title: 'No Completed Sessions',
                    message: 'Your completed consultations will be listed here.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: past.length,
                    itemBuilder: (context, index) {
                      final b = past[index];
                      return _AppointmentItemCard(booking: b);
                    },
                  ),
          ],
        ),
      ),
    );
  }
}

class _AppointmentItemCard extends StatelessWidget {
  final dynamic booking;

  const _AppointmentItemCard({required this.booking});

  @override
  Widget build(BuildContext context) {
    final physioVm = context.read<PhysioViewModel>();
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
          const SizedBox(height: 8),
          Text(
            'Condition: ${booking.chiefComplaint ?? 'General assessment'}',
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
          if (isConfirmed || isInProgress) ...[
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            if (isConfirmed)
              ElevatedButton(
                onPressed: () => physioVm.updateBookingStatus(booking.id, BookingStatus.IN_PROGRESS),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 38),
                ),
                child: const Text('Start Treatment Session'),
              )
            else if (isInProgress)
              ElevatedButton(
                onPressed: () => physioVm.updateBookingStatus(booking.id, BookingStatus.COMPLETED),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 38),
                ),
                child: const Text('Mark Session Completed'),
              ),
          ],
        ],
      ),
    );
  }
}
