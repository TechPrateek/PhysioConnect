import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/empty_state.dart';
import '../../../data/models/address_model.dart';
import '../view_models/patient_view_model.dart';

class PatientAddressesScreen extends StatelessWidget {
  const PatientAddressesScreen({super.key});

  void _showAddAddressDialog(BuildContext context) {
    final labelCtrl = TextEditingController(text: 'Home');
    final streetCtrl = TextEditingController();
    final areaCtrl = TextEditingController(text: 'Civil Lines');
    final landmarkCtrl = TextEditingController();
    final cityCtrl = TextEditingController(text: 'Etawah');
    final pincodeCtrl = TextEditingController(text: '206001');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 20,
          right: 20,
          top: 20,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Add Home Visit Address', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              CustomTextField(controller: labelCtrl, label: 'Label', hintText: 'Home / Work / Parents'),
              const SizedBox(height: 12),
              CustomTextField(controller: streetCtrl, label: 'House No / Street', hintText: 'e.g. House 42, Civil Lines Road'),
              const SizedBox(height: 12),
              CustomTextField(controller: areaCtrl, label: 'Locality / Area', hintText: 'e.g. Friends Colony, Civil Lines'),
              const SizedBox(height: 12),
              CustomTextField(controller: landmarkCtrl, label: 'Landmark (Optional)', hintText: 'Near District Hospital'),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: CustomTextField(controller: cityCtrl, label: 'City', readOnly: true)),
                  const SizedBox(width: 12),
                  Expanded(child: CustomTextField(controller: pincodeCtrl, label: 'Pincode', keyboardType: TextInputType.number)),
                ],
              ),
              const SizedBox(height: 20),
              CustomButton(
                text: 'Save Address',
                onPressed: () {
                  if (streetCtrl.text.trim().isEmpty) return;
                  final newAddr = AddressModel(
                    id: 'addr-${DateTime.now().millisecondsSinceEpoch}',
                    patientId: 'pat-101',
                    label: labelCtrl.text.trim(),
                    street: streetCtrl.text.trim(),
                    area: areaCtrl.text.trim(),
                    landmark: landmarkCtrl.text.trim().isNotEmpty ? landmarkCtrl.text.trim() : null,
                    city: cityCtrl.text.trim(),
                    pincode: pincodeCtrl.text.trim(),
                    isDefault: false,
                  );
                  context.read<PatientViewModel>().addAddress(newAddr);
                  Navigator.pop(ctx);
                },
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final patientVm = context.watch<PatientViewModel>();
    final addresses = patientVm.addresses;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Saved Addresses'),
      ),
      body: addresses.isEmpty
          ? EmptyState(
              icon: Icons.location_off_outlined,
              title: 'No Addresses Saved',
              message: 'Add an address for easy doorstep physiotherapy visits in Etawah.',
              actionText: 'Add Address',
              onAction: () => _showAddAddressDialog(context),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: addresses.length,
              itemBuilder: (context, index) {
                final addr = addresses[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.primarySubtle,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.location_on, color: AppColors.primary, size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(addr.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                                if (addr.isDefault) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.primarySubtle,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text('DEFAULT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(addr.fullAddress, style: const TextStyle(fontSize: 12, color: AppColors.textSecondaryLight)),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddAddressDialog(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Address', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }
}
