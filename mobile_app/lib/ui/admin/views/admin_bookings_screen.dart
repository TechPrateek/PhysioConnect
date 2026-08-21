import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/status_badge.dart';
import '../view_models/admin_view_model.dart';

class AdminBookingsScreen extends StatelessWidget {
  const AdminBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final adminVm = context.watch<AdminViewModel>();
    final bookings = adminVm.allBookings;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Platform Bookings Audit'),
      ),
      body: bookings.isEmpty
          ? const EmptyState(
              icon: Icons.calendar_today_outlined,
              title: 'No Platform Bookings',
              message: 'Bookings across Etawah will appear in this administrative ledger.',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                final b = bookings[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(b.bookingNumber, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                          StatusBadge.fromBookingStatus(b.status),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Patient:', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                                Text(b.patient?.fullName ?? 'Patient', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Physiotherapist:', style: TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                                Text(b.physiotherapist?.fullName ?? 'Doctor', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('${Formatters.date(b.appointmentDate)} • ${b.timeSlot}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                          Text(
                            Formatters.currency(b.amount),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
