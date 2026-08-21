import Link from "next/link";
import { Activity, Heart, MapPin, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-foreground">
                Physio<span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed">
              Etawah&apos;s dedicated platform connecting verified, licensed
              physiotherapists with patients for certified home visits and clinic
              consultations.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Proudly serving all areas of Etawah, Uttar Pradesh</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-foreground">
                  Find a Physiotherapist
                </Link>
              </li>
              <li>
                <Link href="/register?role=physiotherapist" className="hover:text-foreground">
                  Physiotherapist Onboarding
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Trust & Security</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>100% Verified Credentials</span>
              </li>
              <li>
                <span>BPT / MPT Licensed Experts</span>
              </li>
              <li>
                <span>Secure Razorpay Payments</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} PhysioConnect (Etawah). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
