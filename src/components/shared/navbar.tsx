import Link from "next/link";
import { Activity, Calendar, Compass, Sparkles, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { UserMenu } from "@/components/auth/user-menu";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 pb-1">
      <div className="container mx-auto max-w-6xl">
        <div className="glass-floating rounded-2xl sm:rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-soft-md transition-all">
          {/* Brand Logo Island */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-700 text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-foreground">
                Physio<span className="text-primary font-black">Connect</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary/80">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
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
                    className="text-xs font-bold rounded-xl h-8 px-3 hover:bg-primary/10 hover:text-primary"
                  >
                    Dashboard
                  </Button>
                </Link>
                <NotificationsDropdown />
                <UserMenu user={user} />
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold rounded-xl h-8 px-3 hover:bg-primary/10 hover:text-primary"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button
                    size="sm"
                    className="text-xs font-bold rounded-xl h-8 px-3.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft gap-1.5"
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
