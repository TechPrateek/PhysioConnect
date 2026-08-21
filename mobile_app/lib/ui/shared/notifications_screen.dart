import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../data/models/notification_model.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      NotificationModel(
        id: 'notif-1',
        userId: 'u-1',
        title: 'Appointment Confirmed',
        message: 'Your home visit consultation with Dr. Rajesh Sharma, PT is confirmed for tomorrow at 10:00 AM.',
        type: 'booking',
        createdAt: DateTime.now().subtract(const Duration(minutes: 45)),
      ),
      NotificationModel(
        id: 'notif-2',
        userId: 'u-1',
        title: 'Payment Received',
        message: 'Payment of ₹600 for booking #PC-ETA-2026-1082 was processed successfully via Razorpay.',
        type: 'payment',
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      ),
      NotificationModel(
        id: 'notif-3',
        userId: 'u-1',
        title: 'Specialist Nearby',
        message: 'Dr. Ananya Verma, PT is now online in Friends Colony, Etawah for on-demand home visits.',
        type: 'system',
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: notifications.isEmpty
          ? const EmptyState(
              icon: Icons.notifications_none_outlined,
              title: 'No Notifications',
              message: 'You are all caught up!',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final n = notifications[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primarySubtle,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.notifications, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(n.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 3),
                            Text(n.message, style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight, height: 1.3)),
                            const SizedBox(height: 6),
                            Text(Formatters.time(n.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.textMutedLight)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
