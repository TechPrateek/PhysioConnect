import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../view_models/physio_view_model.dart';
import 'physio_home_screen.dart';
import 'physio_requests_screen.dart';
import 'physio_bookings_screen.dart';
import 'physio_profile_screen.dart';

class PhysioMainShell extends StatefulWidget {
  const PhysioMainShell({super.key});

  @override
  State<PhysioMainShell> createState() => _PhysioMainShellState();
}

class _PhysioMainShellState extends State<PhysioMainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    PhysioHomeScreen(),
    PhysioRequestsScreen(),
    PhysioBookingsScreen(),
    PhysioProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PhysioViewModel>().loadDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final physioVm = context.watch<PhysioViewModel>();
    final pendingRequestsCount = physioVm.incomingRequests.length;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textMutedLight,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Overview',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: pendingRequestsCount > 0,
              label: Text('$pendingRequestsCount'),
              child: const Icon(Icons.radar_outlined),
            ),
            activeIcon: Badge(
              isLabelVisible: pendingRequestsCount > 0,
              label: Text('$pendingRequestsCount'),
              child: const Icon(Icons.radar),
            ),
            label: 'Emergency Leads',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.event_note_outlined),
            activeIcon: Icon(Icons.event_note),
            label: 'Schedule',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Practice',
          ),
        ],
      ),
    );
  }
}
