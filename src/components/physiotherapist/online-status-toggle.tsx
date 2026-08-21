"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  Globe,
  Loader2,
  MapPin,
  Power,
  Radio,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  goOnlineAction,
  goOfflineAction,
  setBusyAction,
  PhysioStatusData,
} from "@/actions/service-requests/status";
import { updatePhysiotherapistLocationAction } from "@/actions/service-requests/location";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

interface OnlineStatusToggleProps {
  initialStatus: PhysioStatusData;
}

export function OnlineStatusToggle({ initialStatus }: OnlineStatusToggleProps) {
  const router = useRouter();
  const [statusData, setStatusData] = React.useState<PhysioStatusData>(initialStatus);
  const [isLoading, setIsLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = React.useState(false);

  const isApproved = statusData.verificationStatus === "APPROVED";
  const isOnline = statusData.onlineStatus === "ONLINE";
  const isBusy = statusData.onlineStatus === "BUSY";
  const isOffline = statusData.onlineStatus === "OFFLINE";

  const handleToggleOnline = async () => {
    setIsLoading(true);
    setMsg(null);
    try {
      if (isOnline) {
        const res = await goOfflineAction();
        if (res.success && res.data) {
          setStatusData((prev) => ({ ...prev, onlineStatus: "OFFLINE" }));
          setMsg(res.data.message);
        } else {
          setMsg(res.error || "Failed to go offline.");
        }
      } else {
        // Attempt to sync browser GPS if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await updatePhysiotherapistLocationAction({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            },
            () => {
              // Silently fallback to existing or center coordinates
            }
          );
        }

        const res = await goOnlineAction();
        if (res.success && res.data) {
          setStatusData((prev) => ({ ...prev, onlineStatus: "ONLINE" }));
          setMsg(res.data.message);
        } else {
          setMsg(res.error || "Failed to go online.");
        }
      }
      router.refresh();
    } catch (e) {
      setMsg("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncLocation = () => {
    if (!navigator.geolocation) {
      setMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsUpdatingLocation(true);
    setMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await updatePhysiotherapistLocationAction({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (res.success) {
            setMsg("GPS Location synchronized with Etawah marketplace.");
            setStatusData((prev) => ({
              ...prev,
              location: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                locationUpdatedAt: new Date(),
              },
            }));
            router.refresh();
          } else {
            setMsg(res.error || "Failed to update location.");
          }
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (err) => {
        setIsUpdatingLocation(false);
        setMsg(`GPS sync failed: ${err.message}`);
      }
    );
  };

  return (
    <GlassIsland
      level={3}
      glow={isOnline ? "emerald" : "none"}
      className={`p-6 space-y-4 border transition-all ${
        isOnline
          ? "border-emerald-500/40 bg-emerald-500/[0.04] dark:border-cyan-500/40 dark:bg-cyan-500/[0.06]"
          : isBusy
          ? "border-amber-500/40 bg-amber-500/[0.04]"
          : "border-border/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <Radio
              className={`h-4 w-4 ${
                isOnline
                  ? "text-emerald-600 dark:text-cyan-400 animate-pulse"
                  : isBusy
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground"
              }`}
            />
            Marketplace On-Demand Availability
          </h3>
          <p className="text-xs text-muted-foreground">
            Controls whether you receive instant nearby home visit requests in Etawah
          </p>
        </div>

        <div>
          {isOnline && (
            <GlassBadge variant="success" className="px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-cyan-400 animate-ping" />
              ONLINE (ACTIVE)
            </GlassBadge>
          )}
          {isBusy && (
            <GlassBadge variant="warning" className="px-3 py-1 text-xs">
              BUSY / IN SESSION
            </GlassBadge>
          )}
          {isOffline && (
            <GlassBadge variant="neutral" className="px-3 py-1 text-xs">
              OFFLINE
            </GlassBadge>
          )}
        </div>
      </div>

      {msg && (
        <div className="flex items-center gap-2 rounded-2xl border bg-card/80 p-3 text-xs text-foreground">
          <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {!isApproved ? (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Verification Pending</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Your medical degree and registration certificates are currently under admin review. Once approved, you can go ONLINE to accept on-demand home visits in Etawah.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">
              {isOnline
                ? "🟢 You are currently visible to patients in Etawah within 5 km."
                : isBusy
                ? "🟡 You are marked as busy and will not receive new requests."
                : "⚪ You are offline. Turn on to start receiving nearby patient requests."}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary" />
              {statusData.location
                ? `Live GPS Active (Etawah Territory)`
                : "Using standard Etawah center coordinates"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncLocation}
              disabled={isUpdatingLocation || isLoading}
              className="text-xs h-10 px-3.5 rounded-2xl glass-subtle gap-1.5 shrink-0 font-bold"
            >
              {isUpdatingLocation ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Compass className="h-3.5 w-3.5 text-primary" />
              )}
              <span>Sync GPS</span>
            </Button>

            <Button
              size="sm"
              variant={isOnline ? "destructive" : "default"}
              onClick={handleToggleOnline}
              disabled={isLoading || isUpdatingLocation}
              className={`text-xs h-10 px-4 rounded-2xl gap-2 w-full sm:w-auto font-black shadow-soft transition-transform hover:scale-[1.02] ${
                !isOnline
                  ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950"
                  : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </>
              ) : isOnline ? (
                <>
                  <Power className="h-3.5 w-3.5" />
                  Go Offline
                </>
              ) : (
                <>
                  <Power className="h-3.5 w-3.5" />
                  Go Online
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </GlassIsland>
  );
}
