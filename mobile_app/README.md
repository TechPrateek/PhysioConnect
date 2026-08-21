# PhysioConnect Mobile Application

Cross-platform Flutter application for **PhysioConnect**, providing dedicated experiences for:
- 🧑‍🦽 **Patients**: Search physiotherapists, book clinic & home visits, request emergency on-demand visits, manage appointments, and track recovery.
- 🩺 **Physiotherapists**: Set online/offline status, receive broadcast emergency home-visit requests, manage appointment bookings, manage clinic availability, and upload verification credentials.
- 🛡️ **Admins**: Review platform metrics, approve/reject physiotherapist KYC documents, and monitor appointments.

---

## 🏗️ Architecture

The app follows the official **MVVM (Model-View-ViewModel) + Layered Clean Architecture**:

```
mobile_app/
├── lib/
│   ├── core/                  # Shared utilities, constants, theme, widgets, HTTP client
│   │   ├── constants/         # App colors, endpoints, strings, enums
│   │   ├── network/           # API client, responses, network exceptions
│   │   ├── theme/             # Light & Dark healthcare design system
│   │   ├── utils/             # Formatters, helpers, validators
│   │   └── widgets/           # Reusable UI components
│   ├── data/
│   │   ├── models/            # Data models matching Prisma schema
│   │   ├── repositories/      # Repositories mediating data & cache
│   │   └── services/          # HTTP API & fallback mock services
│   ├── ui/
│   │   ├── auth/              # Role selection, login, registration
│   │   ├── patient/           # Patient dashboard, booking, search, requests
│   │   ├── physiotherapist/   # Physio dashboard, live requests, schedule, documents
│   │   ├── admin/             # Admin metrics, verification, bookings
│   │   └── shared/            # Common screens (notifications, settings)
│   └── main.dart              # Multi-provider setup & app entrypoint
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.16.0 or higher)
- Android Studio / Xcode / VS Code with Flutter extension

### 2. Install Dependencies
```bash
cd mobile_app
flutter pub get
```

### 3. Run the App
```bash
# Run on connected device or simulator
flutter run
```

### 4. Backend API Integration
The app by default talks to the local backend URL:
- Android Emulator: `http://10.0.2.2:3000/api`
- iOS Simulator / Web / Desktop: `http://localhost:3000/api`
- Physical Device: `http://<YOUR_LAN_IP>:3000/api`

Configurable in [`lib/core/constants/api_endpoints.dart`](lib/core/constants/api_endpoints.dart).
If the server is unreachable, the services automatically fall back to mock data so you can test all views and flows smoothly!
