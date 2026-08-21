import * as React from "react";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
      {/* Soft teal/cyan mesh at top right */}
      <div
        className="ambient-glow-teal top-[-150px] right-[-100px] opacity-70 dark:opacity-50 animate-pulse"
        style={{ animationDuration: "10s" }}
      />

      {/* Calm emerald/sky blue mesh at center left */}
      <div
        className="ambient-glow-emerald top-[35%] left-[-150px] opacity-60 dark:opacity-40 animate-pulse"
        style={{ animationDuration: "12s" }}
      />

      {/* Soft cyan mesh at bottom right */}
      <div className="ambient-glow-teal bottom-[-200px] right-[10%] opacity-50 dark:opacity-35" />

      {/* Subtle fine grid overlay (Teal in day mode, Cyan in dark mode) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948808_1px,transparent_1px),linear-gradient(to_bottom,#0d948808_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#06b6d40f_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40f_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />
    </div>
  );
}
