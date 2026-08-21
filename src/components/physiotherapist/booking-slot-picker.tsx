"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Home,
  Hospital,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAvailableSlotsAction,
  TimeSlotOption,
} from "@/actions/physiotherapists/discovery";
import { formatCurrency } from "@/lib/utils";

interface BookingSlotPickerProps {
  physiotherapistId: string;
  consultationFee: number;
  homeVisitAvailable: boolean;
  clinicVisitAvailable: boolean;
  clinicAddress: string | null;
}

export function BookingSlotPicker({
  physiotherapistId,
  consultationFee,
  homeVisitAvailable,
  clinicVisitAvailable,
  clinicAddress,
}: BookingSlotPickerProps) {
  const router = useRouter();

  // Generate next 14 days
  const availableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split("T")[0];
      const dayName =
        i === 0
          ? "Today"
          : i === 1
          ? "Tomorrow"
          : d.toLocaleDateString("en-IN", { weekday: "short" });
      const displayDate = d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      dates.push({ isoDate, dayName, displayDate });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<string>(
    availableDates[0]?.isoDate || ""
  );
  const [appointmentType, setAppointmentType] = React.useState<"HOME_VISIT" | "CLINIC_VISIT">(
    homeVisitAvailable ? "HOME_VISIT" : "CLINIC_VISIT"
  );
  const [slots, setSlots] = React.useState<TimeSlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);
  const [emptyMessage, setEmptyMessage] = React.useState<string | null>(null);

  // Fetch slots whenever date or visit type changes
  React.useEffect(() => {
    async function loadSlots() {
      if (!selectedDate) return;
      setIsLoadingSlots(true);
      setSelectedSlot(null);
      setEmptyMessage(null);

      try {
        const res = await getAvailableSlotsAction({
          physiotherapistId,
          date: selectedDate,
          appointmentType,
        });

        if (res.success && res.data) {
          setSlots(res.data.slots);
          if (res.data.message) {
            setEmptyMessage(res.data.message);
          }
        } else {
          setEmptyMessage(res.error || "Could not retrieve available slots.");
        }
      } catch (err) {
        setEmptyMessage("Failed to load doctor schedule.");
      } finally {
        setIsLoadingSlots(false);
      }
    }

    loadSlots();
  }, [physiotherapistId, selectedDate, appointmentType]);

  const handleProceed = () => {
    if (!selectedSlot) return;
    const url = `/dashboard/patient/book?physioId=${physiotherapistId}&date=${selectedDate}&timeSlot=${encodeURIComponent(
      selectedSlot
    )}&type=${appointmentType}`;
    router.push(url);
  };

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5 sm:p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-foreground">
          Select Appointment Date & Time Slot
        </h3>
        <p className="text-xs text-muted-foreground">
          Real-time slot availability for verified care in Etawah.
        </p>
      </div>

      {/* 1. Visit Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step 1: Choose Visit Mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          {homeVisitAvailable && (
            <button
              type="button"
              onClick={() => setAppointmentType("HOME_VISIT")}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                appointmentType === "HOME_VISIT"
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-input bg-background hover:bg-muted/40"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  appointmentType === "HOME_VISIT"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <Home className="h-4 w-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-foreground">Home Visit</p>
                <p className="text-[11px] text-muted-foreground">Doctor visits your Etawah address</p>
              </div>
            </button>
          )}

          {clinicVisitAvailable && (
            <button
              type="button"
              onClick={() => setAppointmentType("CLINIC_VISIT")}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                appointmentType === "CLINIC_VISIT"
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-input bg-background hover:bg-muted/40"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  appointmentType === "CLINIC_VISIT"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <Hospital className="h-4 w-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-foreground">Clinic Visit</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {clinicAddress || "Etawah Clinic"}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* 2. Date Selector (Next 14 Days) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Step 2: Select Date</span>
          <span className="text-[11px] text-primary font-normal">Next 14 days open</span>
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableDates.map((item) => {
            const isSelected = selectedDate === item.isoDate;
            return (
              <button
                type="button"
                key={item.isoDate}
                onClick={() => setSelectedDate(item.isoDate)}
                className={`flex flex-col items-center justify-center shrink-0 w-20 py-2.5 rounded-xl border text-xs transition-all ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "border-input bg-background text-foreground hover:bg-muted/40"
                }`}
              >
                <span className="text-[10px] opacity-80">{item.dayName}</span>
                <span className="text-xs font-bold mt-0.5">{item.displayDate}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Available Slot Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Step 3: Select 1-Hour Time Slot</span>
          <span className="text-[11px] text-muted-foreground">Standard 60 min session</span>
        </label>

        {isLoadingSlots ? (
          <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            Checking real-time doctor availability...
          </div>
        ) : emptyMessage ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : slots.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
            No open appointment slots found for this date. Please choose another date above.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {slots.map((s) => {
              const isSelected = selectedSlot === s.timeSlot;
              return (
                <button
                  type="button"
                  key={s.timeSlot}
                  disabled={!s.isAvailable}
                  onClick={() => s.isAvailable && setSelectedSlot(s.timeSlot)}
                  className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-all ${
                    !s.isAvailable
                      ? "border-dashed border-muted bg-muted/40 text-muted-foreground opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "border-input bg-background text-foreground hover:border-primary/50 hover:bg-accent/40"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 opacity-70" />
                    {s.timeSlot}
                  </span>
                  {!s.isAvailable ? (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  ) : isSelected ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary and Proceed Button */}
      <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Consultation Fee:</span>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(consultationFee)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {selectedSlot
              ? `Slot: ${selectedSlot} (${appointmentType === "HOME_VISIT" ? "Home Visit" : "Clinic"})`
              : "Select a time slot to continue"}
          </p>
        </div>

        <Button
          size="lg"
          disabled={!selectedSlot}
          onClick={handleProceed}
          className="shadow-sm gap-2"
        >
          <span>Continue to Booking</span>
        </Button>
      </div>
    </div>
  );
}
