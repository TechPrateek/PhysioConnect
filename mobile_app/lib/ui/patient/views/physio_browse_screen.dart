import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../core/widgets/rating_stars.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../view_models/patient_view_model.dart';
import 'book_appointment_screen.dart';
import 'physio_detail_screen.dart';

class PhysioBrowseScreen extends StatefulWidget {
  const PhysioBrowseScreen({super.key});

  @override
  State<PhysioBrowseScreen> createState() => _PhysioBrowseScreenState();
}

class _PhysioBrowseScreenState extends State<PhysioBrowseScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  final List<String> _specializations = [
    'All',
    'Orthopedic',
    'Sports Injury',
    'Neurological',
    'Geriatric',
    'Pediatric',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();
    var physios = patientVm.physiotherapists;

    if (_searchQuery.isNotEmpty) {
      physios = physios.where((p) =>
          p.fullName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.bio?.toLowerCase().contains(_searchQuery.toLowerCase()) == true).toList();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Physiotherapists'),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search by doctor name or condition...',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _searchQuery = '');
                            },
                          )
                        : null,
                  ),
                ),
                const SizedBox(height: 10),
                // Filter chips
                SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _specializations.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final spec = _specializations[index];
                      final isSelected = patientVm.selectedSpecialization == spec;
                      return ChoiceChip(
                        label: Text(spec),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          fontSize: 12,
                        ),
                        onSelected: (_) => patientVm.setSpecializationFilter(spec),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    FilterChip(
                      label: const Text('Home Visits Only', style: TextStyle(fontSize: 12)),
                      selected: patientVm.homeVisitOnly,
                      selectedColor: AppColors.primarySubtle,
                      checkmarkColor: AppColors.primary,
                      onSelected: (val) => patientVm.toggleHomeVisitOnly(val),
                    ),
                    const Spacer(),
                    Text(
                      '${physios.length} found in Etawah',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // Physios List
          Expanded(
            child: physios.isEmpty
                ? const EmptyState(
                    icon: Icons.person_search_outlined,
                    title: 'No Therapists Found',
                    message: 'Try changing your search keywords or clearing filter categories.',
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: physios.length,
                    itemBuilder: (context, index) {
                      final physio = physios[index];
                      return _BrowsePhysioCard(physio: physio);
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class _BrowsePhysioCard extends StatelessWidget {
  final PhysiotherapistModel physio;

  const _BrowsePhysioCard({required this.physio});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primarySubtle,
                  child: Text(
                    physio.fullName.isNotEmpty ? physio.fullName[4] : 'D',
                    style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 18),
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
                      const SizedBox(height: 3),
                      Text(
                        '${physio.experienceYears} Years Exp • ${physio.city}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight),
                      ),
                      const SizedBox(height: 4),
                      RatingStars(rating: physio.averageRating, reviewCount: physio.totalReviews, size: 14),
                    ],
                  ),
                ),
              ],
            ),
            if (physio.bio != null) ...[
              const SizedBox(height: 10),
              Text(
                physio.bio!,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight, height: 1.3),
              ),
            ],
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 8),
            Row(
              children: [
                Text(
                  '${Formatters.currency(physio.consultationFee)} / visit',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                ),
                const Spacer(),
                OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => PhysioDetailScreen(physio: physio)),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                  child: const Text('Profile', style: TextStyle(fontSize: 12)),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => BookAppointmentScreen(physio: physio)),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  ),
                  child: const Text('Book', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
