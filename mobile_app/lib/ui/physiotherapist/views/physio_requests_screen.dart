import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../data/models/enums.dart';
import '../view_models/physio_view_model.dart';

class PhysioRequestsScreen extends StatelessWidget {
  const PhysioRequestsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final physioVm = context.watch<PhysioViewModel>();
    final requests = physioVm.incomingRequests;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Urgent Patient Requests'),
      ),
      body: requests.isEmpty
          ? const EmptyState(
              icon: Icons.radar_outlined,
              title: 'No Active Emergency Leads',
              message: 'When patients near your location in Etawah request an instant home visit, they will appear here.',
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: requests.length,
              itemBuilder: (context, index) {
                final req = requests[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.red.withValues(alpha: 0.4), width: 1.5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.red.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.errorLight,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.bolt, size: 14, color: AppColors.error),
                                SizedBox(width: 4),
                                Text(
                                  'URGENT HOME VISIT',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.error),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          Text(
                            req.requestNumber,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: AppColors.primarySubtle,
                            radius: 22,
                            child: Text(
                              req.patient?.fullName.isNotEmpty == true ? req.patient!.fullName[0] : 'P',
                              style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 16),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(req.patient?.fullName ?? 'Patient', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                Text(req.patient?.phone ?? '+91 99887 76655', style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primarySubtle,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text('2.4 km away', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Complaint:',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondaryLight),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        req.chiefComplaint ?? 'Severe acute muscle pain',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      if (req.address != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.location_on, size: 16, color: AppColors.primary),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(req.address!.fullAddress, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => physioVm.dismissIncomingRequest(req.id),
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppColors.textMutedLight),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('Pass Request', style: TextStyle(color: AppColors.textSecondaryLight)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () async {
                                await physioVm.acceptIncomingRequest(req);
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Lead accepted! Added to your schedule.'),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              child: const Text('Accept & Visit', style: TextStyle(fontWeight: FontWeight.w700)),
                            ),
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
