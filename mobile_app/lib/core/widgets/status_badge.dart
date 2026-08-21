import 'package:flutter/material.dart';
import '../../data/models/enums.dart';
import '../constants/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.text,
    required this.backgroundColor,
    required this.textColor,
    this.icon,
  });

  factory StatusBadge.fromBookingStatus(BookingStatus status) {
    switch (status) {
      case BookingStatus.PENDING:
        return const StatusBadge(
          text: 'Pending',
          backgroundColor: AppColors.warningLight,
          textColor: AppColors.warning,
          icon: Icons.hourglass_top,
        );
      case BookingStatus.CONFIRMED:
        return const StatusBadge(
          text: 'Confirmed',
          backgroundColor: AppColors.infoLight,
          textColor: AppColors.info,
          icon: Icons.check_circle_outline,
        );
      case BookingStatus.IN_PROGRESS:
        return const StatusBadge(
          text: 'In Progress',
          backgroundColor: AppColors.primarySubtle,
          textColor: AppColors.primary,
          icon: Icons.play_arrow,
        );
      case BookingStatus.COMPLETED:
        return const StatusBadge(
          text: 'Completed',
          backgroundColor: AppColors.successLight,
          textColor: AppColors.success,
          icon: Icons.task_alt,
        );
      case BookingStatus.CANCELLED:
        return const StatusBadge(
          text: 'Cancelled',
          backgroundColor: AppColors.errorLight,
          textColor: AppColors.error,
          icon: Icons.cancel_outlined,
        );
      case BookingStatus.REJECTED:
        return const StatusBadge(
          text: 'Rejected',
          backgroundColor: AppColors.errorLight,
          textColor: AppColors.error,
          icon: Icons.block,
        );
      case BookingStatus.NO_SHOW:
        return const StatusBadge(
          text: 'No Show',
          backgroundColor: Color(0xFFF1F5F9),
          textColor: Color(0xFF64748B),
          icon: Icons.person_off_outlined,
        );
    }
  }

  factory StatusBadge.fromVerificationStatus(VerificationStatus status) {
    switch (status) {
      case VerificationStatus.APPROVED:
        return const StatusBadge(
          text: 'Verified',
          backgroundColor: AppColors.successLight,
          textColor: AppColors.success,
          icon: Icons.verified,
        );
      case VerificationStatus.PENDING:
        return const StatusBadge(
          text: 'Pending Verification',
          backgroundColor: AppColors.warningLight,
          textColor: AppColors.warning,
          icon: Icons.hourglass_empty,
        );
      case VerificationStatus.REJECTED:
        return const StatusBadge(
          text: 'Verification Rejected',
          backgroundColor: AppColors.errorLight,
          textColor: AppColors.error,
          icon: Icons.error_outline,
        );
      case VerificationStatus.EXPIRED:
        return const StatusBadge(
          text: 'Expired',
          backgroundColor: Color(0xFFF1F5F9),
          textColor: Color(0xFF64748B),
          icon: Icons.timer_off_outlined,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
