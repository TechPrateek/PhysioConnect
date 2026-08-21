import 'package:flutter/material.dart';

class RatingStars extends StatelessWidget {
  final double rating;
  final double size;
  final Color color;
  final bool showText;
  final int? reviewCount;

  const RatingStars({
    super.key,
    required this.rating,
    this.size = 16,
    this.color = const Color(0xFFF59E0B),
    this.showText = true,
    this.reviewCount,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(Icons.star_rounded, size: size, color: color),
        const SizedBox(width: 3),
        if (showText) ...[
          Text(
            rating.toStringAsFixed(1),
            style: TextStyle(
              fontSize: size * 0.85,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF0F172A),
            ),
          ),
          if (reviewCount != null) ...[
            const SizedBox(width: 4),
            Text(
              '($reviewCount)',
              style: TextStyle(
                fontSize: size * 0.75,
                color: const Color(0xFF64748B),
              ),
            ),
          ],
        ],
      ],
    );
  }
}
