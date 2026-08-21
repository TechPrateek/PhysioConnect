import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static String currency(num amount) {
    final format = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
    return format.format(amount);
  }

  static String date(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('dd MMM yyyy').format(date);
  }

  static String dateTime(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('dd MMM yyyy, hh:mm a').format(date);
  }

  static String time(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('hh:mm a').format(date);
  }

  static String distance(double? km) {
    if (km == null) return '';
    return '${km.toStringAsFixed(1)} km away';
  }

  static String rating(double rating) {
    return rating.toStringAsFixed(1);
  }
}
