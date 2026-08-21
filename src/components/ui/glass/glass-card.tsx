"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  hoverEffect?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ hoverEffect = true, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverEffect
            ? {
                y: -3,
                boxShadow: "0 14px 30px -8px rgba(0, 0, 0, 0.08)",
                transition: { duration: 0.2 },
              }
            : undefined
        }
        className={cn("glass-card rounded-2xl p-5 md:p-6 transition-all", className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
