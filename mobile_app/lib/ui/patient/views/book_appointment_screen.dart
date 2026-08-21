import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../data/models/enums.dart';
import '../../../data/models/physiotherapist_model.dart';
import '../view_models/patient_view_model.dart';

class BookAppointmentScreen extends StatefulWidget {
  final PhysiotherapistModel physio;

  const BookAppointmentScreen({super.key, required this.physio});

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  late AppointmentType _appointmentType;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _selectedSlot = '10:00 AM';
  String? _selectedAddressId;
  final _complaintController = TextEditingController();
  final _notesController = TextEditingController();

  final List<String> _timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
    '06:30 PM',
  ];

  @override
  void initState() {
    super.initState();
    _appointmentType = widget.physio.homeVisitAvailable
        ? AppointmentType.HOME_VISIT
        : AppointmentType.CLINIC_VISIT;

    final patientVm = context.read<PatientViewModel>();
    if (patientVm.addresses.isNotEmpty) {
      _selectedAddressId = patientVm.addresses.first.id;
    }
  }

  @override
  void dispose() {
    _complaintController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitBooking() async {
    if (_appointmentType == AppointmentType.HOME_VISIT && _selectedAddressId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select or add a home visit address.'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    final patientVm = context.read<PatientViewModel>();
    final result = await patientVm.createBooking(
      physioId: widget.physio.id,
      type: _appointmentType,
      addressId: _appointmentType == AppointmentType.HOME_VISIT ? _selectedAddressId : null,
      date: _selectedDate,
      timeSlot: _selectedSlot,
      chiefComplaint: _complaintController.text.trim().isNotEmpty ? _complaintController.text.trim() : 'Routine Therapy & Assessment',
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
      amount: widget.physio.consultationFee,
    );

    if (result != null && mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(color: AppColors.successLight, shape: BoxShape.circle),
                child: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
              ),
              const SizedBox(height: 16),
              const Text(
                'Booking Confirmed!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                'Your session with ${widget.physio.fullName} is scheduled for ${Formatters.date(_selectedDate)} at $_selectedSlot.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondaryLight, height: 1.4),
              ),
              const SizedBox(height: 20),
              CustomButton(
                text: 'View My Bookings',
                onPressed: () {
                  Navigator.pop(ctx); // Close dialog
                  Navigator.pop(context); // Close booking screen
                },
              ),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();
    final addresses = patientVm.addresses;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Schedule Consultation'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Doctor Summary Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primarySubtle,
                    radius: 22,
                    child: Text(
                      widget.physio.fullName.isNotEmpty ? widget.physio.fullName[4] : 'D',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.physio.fullName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                        Text('${Formatters.currency(widget.physio.consultationFee)} / session', style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Visit Type Choice
            const Text('Appointment Type', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Row(
              children: [
                if (widget.physio.homeVisitAvailable)
                  Expanded(
                    child: _TypeChoiceChip(
                      icon: Icons.home_filled,
                      label: 'Home Visit',
                      isSelected: _appointmentType == AppointmentType.HOME_VISIT,
                      onTap: () => setState(() => _appointmentType = AppointmentType.HOME_VISIT),
                    ),
                  ),
                if (widget.physio.homeVisitAvailable && widget.physio.clinicVisitAvailable)
                  const SizedBox(width: 10),
                if (widget.physio.clinicVisitAvailable)
                  Expanded(
                    child: _TypeChoiceChip(
                      icon: Icons.local_hospital,
                      label: 'Clinic Visit',
                      isSelected: _appointmentType == AppointmentType.CLINIC_VISIT,
                      onTap: () => setState(() => _appointmentType = AppointmentType.CLINIC_VISIT),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 20),

            // Date Picker (Horizontal)
            const Text('Select Date', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            SizedBox(
              height: 70,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: 7,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final day = DateTime.now().add(Duration(days: index + 1));
                  final isSelected = DateUtils.isSameDay(day, _selectedDate);

                  return GestureDetector(
                    onTap: () => setState(() => _selectedDate = day),
                    child: Container(
                      width: 60,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: isSelected ? AppColors.primary : AppColors.borderLight),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            DateFormat('E').format(day),
                            style: TextStyle(fontSize: 11, color: isSelected ? Colors.white70 : AppColors.textSecondaryLight),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            DateFormat('dd').format(day),
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Time Slot Picker
            const Text('Available Time Slots', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _timeSlots.map((slot) {
                final isSelected = _selectedSlot == slot;
                return ChoiceChip(
                  label: Text(slot),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimaryLight,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 12,
                  ),
                  onSelected: (_) => setState(() => _selectedSlot = slot),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Address Selection (if Home Visit)
            if (_appointmentType == AppointmentType.HOME_VISIT) ...[
              const Text('Home Visit Location', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              if (addresses.isEmpty)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'No saved addresses found. Using Civil Lines, Etawah default.',
                    style: TextStyle(fontSize: 12, color: AppColors.warning),
                  ),
                )
              else
                Column(
                  children: addresses.map((addr) {
                    final isSelected = _selectedAddressId == addr.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedAddressId = addr.id),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : AppColors.borderLight,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                              color: isSelected ? AppColors.primary : AppColors.textMutedLight,
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(addr.label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                                  Text(addr.fullAddress, style: const TextStyle(fontSize: 11, color: AppColors.textSecondaryLight)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              const SizedBox(height: 16),
            ],

            // Chief Complaint input
            CustomTextField(
              controller: _complaintController,
              label: 'Chief Complaint / Condition',
              hintText: 'e.g. Acute lower back stiffness, Frozen shoulder rehabilitation',
              prefixIcon: Icons.healing_outlined,
            ),
            const SizedBox(height: 14),

            // Additional Notes
            CustomTextField(
              controller: _notesController,
              label: 'Special Notes / Instructions (Optional)',
              hintText: 'e.g. Patient requires wheelchair assistance or staircase support',
              prefixIcon: Icons.note_alt_outlined,
              maxLines: 2,
            ),
            const SizedBox(height: 24),

            // Price Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.backgroundLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.borderLight),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Session Consultation', style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                      Text(Formatters.currency(widget.physio.consultationFee), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Platform & Booking Fee', style: TextStyle(fontSize: 13, color: AppColors.textSecondaryLight)),
                      Text('₹0 (Free Demo)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success)),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 8), child: Divider()),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Amount Payable', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                      Text(
                        Formatters.currency(widget.physio.consultationFee),
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            CustomButton(
              text: 'Confirm & Book Appointment',
              isLoading: patientVm.isLoading,
              onPressed: _submitBooking,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _TypeChoiceChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _TypeChoiceChip({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primarySubtle : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.borderLight,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: isSelected ? AppColors.primary : AppColors.textSecondaryLight),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
