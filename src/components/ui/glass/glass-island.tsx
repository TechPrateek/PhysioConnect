"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassIslandProps extends HTMLMotionProps<"div"> {
  level?: 1 | 2 | 3 | 4;
  glow?: "teal" | "emerald" | "none";
  interactive?: boolean;
}

export const GlassIsland = React.forwardRef<HTMLDivElement, GlassIslandProps>(
  (
    {
      level = 3,
      glow = "none",
      interactive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const levelClasses = {
      1: "glass-subtle rounded-2xl",
      2: "glass-card rounded-2xl",
      3: "glass-floating rounded-3xl",
      4: "glass-hero rounded-3xl",
    };

    const glowClasses = {
      teal: "relative before:absolute before:-inset-1 before:rounded-3xl before:bg-teal-500/15 before:blur-xl before:-z-10",
      emerald: "relative before:absolute before:-inset-1 before:rounded-3xl before:bg-emerald-500/15 before:blur-xl before:-z-10",
      none: "",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        whileHover={interactive ? { y: -2, transition: { duration: 0.18 } } : undefined}
        className={cn(
          levelClasses[level],
          glowClasses[glow],
          interactive && "cursor-pointer transition-shadow",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassIsland.displayName = "GlassIsland";
