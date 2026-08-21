import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary palette (Teal & Emerald Healthcare theme)
  static const Color primary = Color(0xFF0D9488); // Teal 600
  static const Color primaryDark = Color(0xFF0F766E); // Teal 700
  static const Color primaryLight = Color(0xFF2DD4BF); // Teal 400
  static const Color primarySubtle = Color(0xFFCCFBF1); // Teal 100

  // Secondary palette (Cyan / Deep Slate)
  static const Color secondary = Color(0xFF0284C7); // Sky 600
  static const Color accent = Color(0xFF10B981); // Emerald 500

  // Status & Feedback Colors
  static const Color success = Color(0xFF16A34A); // Green 600
  static const Color successLight = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFDC2626); // Red 600
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF2563EB); // Blue 600
  static const Color infoLight = Color(0xFFDBEAFE);

  // Background & Surfaces (Light)
  static const Color backgroundLight = Color(0xFFF8FAFC); // Slate 50
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color borderLight = Color(0xFFE2E8F0); // Slate 200

  // Background & Surfaces (Dark)
  static const Color backgroundDark = Color(0xFF0F172A); // Slate 900
  static const Color surfaceDark = Color(0xFF1E293B); // Slate 800
  static const Color cardDark = Color(0xFF1E293B);
  static const Color borderDark = Color(0xFF334155); // Slate 700

  // Text Colors
  static const Color textPrimaryLight = Color(0xFF0F172A); // Slate 900
  static const Color textSecondaryLight = Color(0xFF64748B); // Slate 500
  static const Color textMutedLight = Color(0xFF94A3B8); // Slate 400

  static const Color textPrimaryDark = Color(0xFFF8FAFC); // Slate 50
  static const Color textSecondaryDark = Color(0xFF94A3B8); // Slate 400
  static const Color textMutedDark = Color(0xFF64748B); // Slate 500

  // Role Accent Colors
  static const Color patientRole = Color(0xFF0D9488); // Teal
  static const Color physioRole = Color(0xFF2563EB); // Royal Blue
  static const Color adminRole = Color(0xFF7C3AED); // Purple
}
