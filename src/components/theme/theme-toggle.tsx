"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 rounded-xl p-0 glass-subtle text-muted-foreground opacity-60"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-9 w-9 rounded-xl p-0 glass-subtle text-foreground hover:text-primary hover:bg-white/50 dark:hover:bg-white/10 transition-all hover:scale-105"
      aria-label="Toggle light/dark theme"
      title={isDark ? "Switch to Day Mode" : "Switch to Dark Mode (Cyan)"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-300 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-200 transition-transform -rotate-90 scale-100" />
      )}
    </Button>
  );
}
