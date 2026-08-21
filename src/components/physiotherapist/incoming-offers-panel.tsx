"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BellRing,
  CheckCircle,
  Clock,
  Compass,
  Home,
  IndianRupee,
  Loader2,
  MapPin,
  Radio,
  Sparkles,
  User,
  Volume2,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PhysioOfferItem,
  rejectOfferAction,
} from "@/actions/service-requests/manage";
import { acceptServiceRequestAction } from "@/actions/service-requests/accept";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

interface IncomingOffersPanelProps {
  initialOffers: PhysioOfferItem[];
  isOnline?: boolean;
}

// Gentle Web Audio Chime for incoming requests
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Silently ignore audio block if user hasn't interacted with document
  }
}

export function IncomingOffersPanel({
  initialOffers,
  isOnline = true,
}: IncomingOffersPanelProps) {
  const router = useRouter();
  const [offers, setOffers] = React.useState<PhysioOfferItem[]>(initialOffers);
  const [actingOfferId, setActingOfferId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const prevCountRef = React.useRef(initialOffers.length);

  React.useEffect(() => {
    setOffers(initialOffers);
    // Play chime when new offers appear
    if (initialOffers.length > prevCountRef.current) {
      playNotificationChime();
    }
    prevCountRef.current = initialOffers.length;
  }, [initialOffers]);

  // Live polling: refresh offers every 3 seconds while online
  React.useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [isOnline, router]);

  const handleAccept = async (offerId: string) => {
    setActingOfferId(offerId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await acceptServiceRequestAction(offerId);
      if (!res.success || !res.data) {
        setErrorMsg(res.error || "Failed to accept request.");
        setActingOfferId(null);
        return;
      }

      setSuccessMsg(`Request accepted! Booking #${res.data.bookingNumber} created.`);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      router.push(res.data.redirectUrl);
      router.refresh();
    } catch (e) {
      setErrorMsg("An unexpected error occurred.");
      setActingOfferId(null);
    }
  };

  const handleReject = async (offerId: string) => {
    setActingOfferId(offerId);
    setErrorMsg(null);
    try {
      const res = await rejectOfferAction(offerId);
      if (res.success) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
      } else {
        setErrorMsg(res.error || "Failed to decline offer.");
      }
      router.refresh();
    } catch (e) {
      setErrorMsg("Failed to decline offer.");
    } finally {
      setActingOfferId(null);
    }
  };

  // When no offers are pending:
  if (offers.length === 0) {
    if (!isOnline) return null;

    return (
      <GlassIsland
        level={2}
        className="p-4 flex items-center justify-between gap-3 border border-emerald-500/20 bg-emerald-500/[0.02] dark:border-cyan-500/20 dark:bg-cyan-500/[0.03]"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-full w-full rounded-full bg-emerald-500 dark:bg-cyan-400 opacity-75 animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-emerald-600 dark:bg-cyan-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">
              Live Dispatch Radar Active
            </p>
            <p className="text-[11px] text-muted-foreground">
              Listening for nearby on-demand patient requests in Etawah territory
            </p>
          </div>
        </div>

        <GlassBadge variant="success" className="text-[10px] px-2.5 py-0.5">
          Ready for Dispatch
        </GlassBadge>
      </GlassIsland>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black flex items-center gap-2 text-foreground">
          <Zap className="h-4 w-4 text-amber-500 fill-current animate-bounce" />
          Incoming On-Demand Requests ({offers.length})
        </h3>
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 animate-pulse">
          <BellRing className="h-3.5 w-3.5" />
          New Patient Request! Respond to claim
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence>
          {offers.map((offer) => {
            const isActing = actingOfferId === offer.id;

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <GlassIsland
                  level={4}
                  glow="teal"
                  className="p-5 space-y-4 relative overflow-hidden border-amber-500/60 bg-amber-500/[0.06] dark:border-cyan-500/60 dark:bg-cyan-500/[0.06] shadow-soft-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-foreground">
                          {offer.patientName}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          #{offer.requestNumber}
                        </span>
                      </div>
                      <div className="text-xs flex items-center gap-1.5 text-muted-foreground pt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{offer.area}</span>
                        <span>•</span>
                        <span className="font-bold text-foreground">
                          {offer.distanceKm} km away
                        </span>
                        <span>•</span>
                        <span className="text-primary font-bold">~{offer.estimatedMinutes} mins travel</span>
                      </div>
                    </div>

                    <GlassBadge variant="warning" className="text-[10px] shrink-0 font-extrabold">
                      {offer.appointmentType === "HOME_VISIT" ? "Doorstep Visit" : "Clinic Visit"}
                    </GlassBadge>
                  </div>

                  {/* Arrival Window & Travel Prep Buffer */}
                  <div className="rounded-2xl p-2.5 glass-subtle border border-primary/25 text-xs flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Requested Arrival:
                    </span>
                    <span className="font-bold text-foreground text-[11px]">
                      {offer.requestedTime || "Immediate (~45–60 mins window)"}
                    </span>
                  </div>

                  {offer.chiefComplaint && (
                    <div className="rounded-2xl p-3 glass-subtle border border-border/60 text-xs text-foreground/90">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">
                        Patient Chief Complaint
                      </p>
                      <p className="italic leading-relaxed font-medium">&ldquo;{offer.chiefComplaint}&rdquo;</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        Consultation Fee
                      </p>
                      <p className="text-base font-black text-foreground">
                        ₹{offer.consultationFee}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(offer.id)}
                        disabled={isActing}
                        className="text-xs h-9 px-3.5 rounded-xl text-muted-foreground hover:text-destructive font-bold"
                      >
                        Decline
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleAccept(offer.id)}
                        disabled={isActing}
                        className="text-xs h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 gap-1.5 font-black shadow-soft-md transition-transform hover:scale-[1.02]"
                      >
                        {isActing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Accept & Confirm
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </GlassIsland>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
