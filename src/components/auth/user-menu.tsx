"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/actions/auth/logout";
import { AuthenticatedUser } from "@/lib/auth/session";
import { getRedirectForRole } from "@/lib/permissions";
import { GlassIsland } from "@/components/ui/glass/glass-island";

export function UserMenu({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const dashboardUrl = getRedirectForRole(user.role);

  return (
    <div className="relative" ref={menuRef}>
      {/* 1. PC / Laptop Mode (md:): Full Pill with Name, Badge and Logout Icon Button (UNTOUCHED) */}
      <div className="hidden md:flex items-center gap-2">
        <Link href={dashboardUrl}>
          <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl glass-subtle">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[120px] truncate font-medium">{user.name}</span>
            <Badge
              variant={
                user.role === "ADMIN"
                  ? "destructive"
                  : user.role === "PHYSIOTHERAPIST"
                  ? "info"
                  : "default"
              }
              className="text-[9px] px-1.5 py-0"
            >
              {user.role}
            </Badge>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sign Out"
          className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* 2. Mobile Mode (< md): Profile Icon Only */}
      <div className="flex md:hidden items-center">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-700 text-white font-black text-xs shadow-soft transition-transform active:scale-95 border-2 border-white/60 dark:border-cyan-500/40"
          aria-label="User profile menu"
        >
          {user.name.charAt(0).toUpperCase()}
        </button>
      </div>

      {/* Mobile Interactive Dropdown Menu upon clicking Profile Icon */}
      {isOpen && (
        <div className="md:hidden absolute right-0 mt-2 w-56 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <GlassIsland level={4} glow="teal" className="p-3 shadow-soft-lg border border-border/80 space-y-2">
            {/* User Info Header */}
            <div className="border-b border-border/60 pb-2.5 px-1 space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-black text-foreground truncate">{user.name}</p>
                <Badge
                  variant={
                    user.role === "ADMIN"
                      ? "destructive"
                      : user.role === "PHYSIOTHERAPIST"
                      ? "info"
                      : "default"
                  }
                  className="text-[9px] px-1.5 py-0 font-bold"
                >
                  {user.role}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Menu Navigation Links */}
            <div className="space-y-1 text-xs font-semibold">
              <Link
                href={dashboardUrl}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span>Dashboard</span>
              </Link>

              {user.role === "PATIENT" && (
                <>
                  <Link
                    href="/dashboard/patient/bookings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    href="/dashboard/patient/addresses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>My Addresses</span>
                  </Link>
                </>
              )}

              {user.role === "PHYSIOTHERAPIST" && (
                <Link
                  href="/dashboard/physiotherapist/bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Appointments</span>
                </Link>
              )}
            </div>

            {/* Logout Action */}
            <div className="border-t border-border/60 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                disabled={isLoggingOut}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-bold transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
              </button>
            </div>
          </GlassIsland>
        </div>
      )}
    </div>
  );
}
