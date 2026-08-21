"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
  Loader2,
  MapPin,
  Radio,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PatientActiveRequestItem,
  cancelServiceRequestAction,
} from "@/actions/service-requests/manage";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

interface ActiveRequestsTrackerProps {
  requests: PatientActiveRequestItem[];
}

export function ActiveRequestsTracker({ requests }: ActiveRequestsTrackerProps) {
  const router = useRouter();
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  // Auto-poll every 3.5s while requests are in active SEARCHING / OFFERED state
  React.useEffect(() => {
    const hasActiveSearching = requests.some(
      (r) => r.status === "SEARCHING" || r.status === "OFFERED"
    );

    if (!hasActiveSearching) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3500);

    return () => clearInterval(interval);
  }, [requests, router]);

  if (requests.length === 0) {
    return null;
  }

  const handleCancel = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this on-demand request?")) return;
    setCancellingId(requestId);
    try {
      await cancelServiceRequestAction(requestId);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold flex items-center gap-2 text-foreground">
          <Radio className="h-4 w-4 text-emerald-600 dark:text-cyan-400 animate-pulse" />
          Active On-Demand Requests ({requests.length})
        </h3>
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-cyan-400 animate-ping" />
          Live Radar (Etawah)
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((req) => {
          const isSearching = req.status === "SEARCHING" || req.status === "OFFERED";
          const isAccepted = req.status === "ACCEPTED";

          return (
            <GlassIsland
              key={req.id}
              level={2}
              glow={isAccepted ? "emerald" : "teal"}
              className="p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-foreground">
                  #{req.requestNumber}
                </span>
                {isSearching && (
                  <GlassBadge variant="warning" className="gap-1 text-[10px]">
                    <Compass className="h-3 w-3 animate-spin" />
                    Searching Nearby
                  </GlassBadge>
                )}
                {isAccepted && (
                  <GlassBadge variant="success" className="gap-1 text-[10px]">
                    <CheckCircle className="h-3 w-3" />
                    Doctor Assigned 🎉
                  </GlassBadge>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-foreground">
                  {req.appointmentType === "HOME_VISIT" ? "Doorstep Home Visit" : "Clinic Visit"}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-0.5">
                  <MapPin className="h-3 w-3 text-primary" />
                  {req.area}, Etawah
                </p>
              </div>

              {req.chiefComplaint && (
                <p className="text-xs text-foreground/90 line-clamp-2 italic glass-subtle p-2.5 rounded-xl text-[11px] border border-border/40">
                  &ldquo;{req.chiefComplaint}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                {isSearching && (
                  <>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {req.offersCount > 0
                        ? `Broadcasted to ${req.offersCount} doctor(s)`
                        : "Broadcasting to online doctors..."}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(req.id)}
                      disabled={cancellingId === req.id}
                      className="h-7 px-2 text-[11px] rounded-lg text-destructive hover:bg-destructive/10 font-bold"
                    >
                      {cancellingId === req.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  </>
                )}

                {isAccepted && req.bookingId && (
                  <Link href={`/dashboard/patient/bookings/${req.bookingId}`} className="w-full">
                    <Button
                      size="sm"
                      className="w-full h-10 rounded-xl text-xs font-black gap-2 shadow-soft bg-emerald-600 hover:bg-emerald-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 transition-transform hover:scale-[1.01]"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>View Booking & Pay</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </GlassIsland>
          );
        })}
      </div>
    </div>
  );
}
