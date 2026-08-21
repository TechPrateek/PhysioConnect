import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Home,
  Hospital,
  MapPin,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhysioSearchResult } from "@/actions/physiotherapists/discovery";
import { formatCurrency } from "@/lib/utils";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

interface PhysioCardProps {
  physio: PhysioSearchResult;
}

export function PhysioCard({ physio }: PhysioCardProps) {
  const initials = physio.fullName
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <GlassIsland
      level={2}
      interactive
      className="flex flex-col justify-between overflow-hidden group border border-white/60 dark:border-cyan-500/20"
    >
      <div className="p-6 space-y-4">
        {/* Top Doctor Profile Bar */}
        <div className="flex items-start gap-3.5">
          <div className="relative">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-teal-500/10 to-primary/5 border border-primary/25 text-primary font-black text-base shadow-soft transition-transform group-hover:scale-105">
              {initials}
            </div>
            <div
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 dark:bg-cyan-400 text-white dark:text-slate-950 border-2 border-white dark:border-slate-900 shadow-xs"
              title="Verified Practitioner"
            >
              <CheckCircle2 className="h-3 w-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                {physio.fullName}
              </h4>
              <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 backdrop-blur-md">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{physio.averageRating.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground">({physio.totalReviews})</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold">
                <Award className="h-3.5 w-3.5 text-primary" />
                {physio.experienceYears} Years Exp
              </span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-cyan-300 font-bold text-[11px]">
                ✓ Verified BPT/MPT
              </span>
            </div>
          </div>
        </div>

        {/* Bio Snippet */}
        {physio.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {physio.bio}
          </p>
        )}

        {/* Specialization Tags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {physio.specializations.slice(0, 3).map((spec) => (
            <span
              key={spec.id}
              className="text-[10px] px-2.5 py-0.5 rounded-lg font-bold bg-primary/5 text-primary border border-primary/15 backdrop-blur-md"
            >
              {spec.name}
            </span>
          ))}
          {physio.specializations.length > 3 && (
            <span className="text-[10px] text-muted-foreground self-center font-semibold">
              +{physio.specializations.length - 3} more
            </span>
          )}
        </div>

        {/* Service Capabilities & Fee */}
        <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-2 text-xs">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Consultation Fee
            </p>
            <p className="text-base font-black text-foreground">
              {formatCurrency(physio.consultationFee)}
              <span className="text-[11px] font-normal text-muted-foreground"> / session</span>
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Etawah Availability
            </p>
            <div className="flex items-center justify-end gap-2 text-[11px]">
              {physio.homeVisitAvailable && (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-cyan-300 font-bold">
                  <Home className="h-3 w-3" /> Home Visit
                </span>
              )}
              {physio.clinicVisitAvailable && (
                <span className="flex items-center gap-1 text-primary font-bold">
                  <Hospital className="h-3 w-3" /> Clinic
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 bg-white/40 dark:bg-white/[0.02] p-4 backdrop-blur-sm">
        <Link href={`/physiotherapists/${physio.id}`} className="w-full block">
          <Button
            size="sm"
            className="w-full rounded-xl text-xs font-bold gap-1.5 shadow-soft bg-primary text-primary-foreground hover:bg-primary/90 transition-all group-hover:scale-[1.01]"
          >
            <span>View Profile & Book</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </GlassIsland>
  );
}
