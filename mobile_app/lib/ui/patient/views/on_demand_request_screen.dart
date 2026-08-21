import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/rating_stars.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/service_request_model.dart';
import '../view_models/patient_view_model.dart';

class OnDemandRequestScreen extends StatefulWidget {
  const OnDemandRequestScreen({super.key});

  @override
  State<OnDemandRequestScreen> createState() => _OnDemandRequestScreenState();
}

class _OnDemandRequestScreenState extends State<OnDemandRequestScreen> with SingleTickerProviderStateMixin {
  final _complaintController = TextEditingController(text: 'Acute lower back spasm, unable to move comfortably');
  final _notesController = TextEditingController(text: 'Please visit as soon as possible.');
  bool _isSearching = false;
  ServiceRequestModel? _activeRequest;
  late AnimationController _radarController;

  @override
  void initState() {
    super.initState();
    _radarController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _complaintController.dispose();
    _notesController.dispose();
    _radarController.dispose();
    super.dispose();
  }

  Future<void> _startBroadcast() async {
    final patientVm = context.read<PatientViewModel>();
    setState(() => _isSearching = true);

    final req = await patientVm.createOnDemandRequest(
      chiefComplaint: _complaintController.text.trim(),
      notes: _notesController.text.trim(),
      addressId: patientVm.addresses.isNotEmpty ? patientVm.addresses.first.id : null,
    );

    if (mounted) {
      setState(() {
        _activeRequest = req;
      });
    }
  }

  void _acceptOffer(ServiceRequestOfferModel offer) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: AppColors.success),
            SizedBox(width: 8),
            Text('Therapist Dispatched!'),
          ],
        ),
        content: Text(
          '${offer.physiotherapist?.fullName ?? 'Therapist'} has accepted your emergency request and is en route to your location (ETA: ${offer.estimatedMinutes ?? 15} mins).',
          style: const TextStyle(fontSize: 14, height: 1.4),
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx); // Close dialog
              Navigator.pop(context); // Close screen
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Back to Home'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Instant Home Visit Request'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (!_isSearching) ...[
              // Info Banner
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primarySubtle,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primaryLight),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.bolt, color: AppColors.primaryDark, size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Rapid On-Demand Dispatch', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                          SizedBox(height: 2),
                          Text('Broadcasts your request to all nearby online therapists in Etawah for fastest response.', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              CustomTextField(
                controller: _complaintController,
                label: 'Chief Complaint / Urgency',
                hintText: 'e.g. Sudden severe back pain, acute muscle cramp, post-fall assistance',
                prefixIcon: Icons.emergency_outlined,
                maxLines: 2,
              ),
              const SizedBox(height: 16),

              CustomTextField(
                controller: _notesController,
                label: 'Additional Information',
                hintText: 'Landmark or gate instructions',
                prefixIcon: Icons.notes_outlined,
              ),
              const SizedBox(height: 16),

              // Location preview
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.borderLight),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.location_on, color: AppColors.primary),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Dispatch Location', style: TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                          Text('Civil Lines, Etawah, Uttar Pradesh', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              CustomButton(
                text: 'Broadcast Request to Nearby Physios',
                isLoading: patientVm.isLoading,
                onPressed: _startBroadcast,
              ),
            ] else ...[
              // Radar & Offers Stream
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 10),
                    AnimatedBuilder(
                      animation: _radarController,
                      builder: (context, child) {
                        return Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primary.withValues(alpha: 0.1 * (1 - _radarController.value)),
                            border: Border.all(
                              color: AppColors.primary.withValues(alpha: 1 - _radarController.value),
                              width: 2 + (4 * _radarController.value),
                            ),
                          ),
                          child: Center(
                            child: Container(
                              width: 60,
                              height: 60,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.primary,
                              ),
                              child: const Icon(Icons.radar, color: Colors.white, size: 30),
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Matching with Nearby Therapists...',
                      style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Received responses from verified doctors ready to visit',
                      style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                'Available Therapists Responded',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),

              if (_activeRequest?.offers.isNotEmpty == true)
                ..._activeRequest!.offers.map((offer) {
                  final p = offer.physiotherapist;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primaryLight),
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
                          children: [
                            CircleAvatar(
                              backgroundColor: AppColors.primarySubtle,
                              child: Text(
                                p?.fullName.isNotEmpty == true ? p!.fullName[4] : 'D',
                                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(p?.fullName ?? 'Dr. Specialist', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                                  Text('${offer.distanceKm ?? 2.5} km away • ETA ${offer.estimatedMinutes ?? 18} mins', style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                            Text(
                              Formatters.currency(p?.consultationFee ?? 600.0),
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            RatingStars(rating: p?.averageRating ?? 4.9, size: 13),
                            const Spacer(),
                            ElevatedButton(
                              onPressed: () => _acceptOffer(offer),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              child: const Text('Accept & Dispatch', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => setState(() => _isSearching = false),
                child: const Text('Cancel Search'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
