import Link from "next/link";
import { Activity, Compass, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full px-2 sm:px-6 pt-2 sm:pt-3 pb-1">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-floating rounded-2xl sm:rounded-full px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shadow-soft-md transition-all gap-1.5 sm:gap-4">
          {/* Brand Logo Island */}
          <Link href="/" className="flex items-center gap-2 group shrink-0 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-700 text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-foreground leading-tight">
                Physio<span className="text-primary font-black">Connect</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider sm:tracking-widest text-primary/80 truncate">
                India • Pilot: Etawah
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link
              href="/browse"
              className="flex items-center gap-1.5 hover:text-primary transition-colors py-1"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Find Care</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-primary transition-colors py-1"
            >
              How It Works
            </Link>
            <Link
              href="/#specializations"
              className="hover:text-primary transition-colors py-1"
            >
              Specializations
            </Link>
            <Link
              href="/register?role=physiotherapist"
              className="hover:text-primary transition-colors py-1"
            >
              For Doctors
            </Link>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href={
                    user.role === "ADMIN"
                      ? "/dashboard/admin"
                      : user.role === "PHYSIOTHERAPIST"
                      ? "/dashboard/physiotherapist"
                      : "/dashboard/patient"
                  }
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold rounded-xl h-8 px-2 sm:px-3 hover:bg-primary/10 hover:text-primary"
                  >
                    Dashboard
                  </Button>
                </Link>
                <NotificationsDropdown />
                <UserMenu user={user} />
              </div>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold rounded-xl h-8 px-2.5 sm:px-3 hover:bg-primary/10 hover:text-primary"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button
                    size="sm"
                    className="text-xs font-bold rounded-xl h-8 px-2.5 sm:px-3.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft gap-1 sm:gap-1.5 shrink-0"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current text-amber-300" />
                    <span>Book Now</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
