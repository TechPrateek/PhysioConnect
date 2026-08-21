import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "info" | "destructive" | "neutral" | "primary";
}

export function GlassBadge({
  variant = "neutral",
  className,
  children,
  ...props
}: GlassBadgeProps) {
  const variantStyles = {
    primary:
      "bg-primary/10 text-primary dark:text-cyan-300 dark:bg-cyan-500/15 dark:border-cyan-500/30 border border-primary/20 backdrop-blur-md shadow-xs",
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-cyan-300 dark:bg-cyan-500/15 dark:border-cyan-500/30 border border-emerald-500/20 backdrop-blur-md shadow-xs",
    warning:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 backdrop-blur-md shadow-xs",
    info:
      "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 backdrop-blur-md shadow-xs",
    destructive:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 backdrop-blur-md shadow-xs",
    neutral:
      "bg-slate-500/10 text-slate-700 dark:text-slate-200 border border-slate-500/15 backdrop-blur-md shadow-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
