"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  HeartPulse,
  Home,
  Loader2,
  MapPin,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createServiceRequestAction } from "@/actions/service-requests/create";
import { AddressRecord } from "@/actions/patients/addresses";
import { GlassBadge } from "@/components/ui/glass/glass-badge";
import { checkLocationServiceability } from "@/lib/geo";

interface OnDemandBookingModalProps {
  addresses: AddressRecord[];
}

const COMMON_COMPLAINTS = [
  { id: "back", label: "Lower back pain", icon: "🩹", desc: "Sciatica, slip disc, spasm" },
  { id: "neck", label: "Neck & Cervical pain", icon: "🤕", desc: "Stiffness, spondylosis" },
  { id: "knee", label: "Knee pain & Arthritis", icon: "🦵", desc: "Joint stiffness, mobility" },
  { id: "sports", label: "Sports injury", icon: "⚡", desc: "Sprain, ligament strain" },
  { id: "surgery", label: "Post-surgery recovery", icon: "🏥", desc: "Knee/hip replacement rehab" },
  { id: "other", label: "Other condition", icon: "🩺", desc: "General physiotherapy rehab" },
];

const ARRIVAL_WINDOWS = [
  {
    id: "immediate",
    label: "Immediate (~45–60 mins)",
    desc: "Allows doctor equipment prep & travel",
    icon: "⚡",
  },
  {
    id: "in_2hr",
    label: "In 1–2 Hours",
    desc: "Preferred session for later today",
    icon: "🕒",
  },
  {
    id: "evening",
    label: "Today Evening (5:00 PM – 7:00 PM)",
    desc: "Post-work doorstep visit",
    icon: "🌅",
  },
  {
    id: "night",
    label: "Tonight (7:00 PM – 9:00 PM)",
    desc: "Evening pain relief session",
    icon: "🌙",
  },
];

export function OnDemandBookingModal({ addresses }: OnDemandBookingModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<"CHOOSE_FLOW" | "FORM_STEP" | "MATCHING">("CHOOSE_FLOW");

  const [appointmentType, setAppointmentType] = React.useState<"HOME_VISIT" | "CLINIC_VISIT">("HOME_VISIT");
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [selectedComplaintCategory, setSelectedComplaintCategory] = React.useState<string>("back");
  const [selectedWindowId, setSelectedWindowId] = React.useState<string>("immediate");
  const [customComplaintText, setCustomComplaintText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [createdRequestNumber, setCreatedRequestNumber] = React.useState<string | null>(null);

  // Animated Matching Stages
  const [matchingStage, setMatchingStage] = React.useState<number>(1);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  React.useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    if (step === "MATCHING") {
      setMatchingStage(1);
      timer1 = setTimeout(() => setMatchingStage(2), 1200);
      timer2 = setTimeout(() => setMatchingStage(3), 2400);
      timer3 = setTimeout(() => setMatchingStage(4), 3600);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [step]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep("CHOOSE_FLOW");
      setCustomComplaintText("");
      setErrorMsg(null);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedAddressServiceability = selectedAddress
    ? checkLocationServiceability({
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
      })
    : { isServiceable: true, city: "Etawah" };

  const handleCreateOnDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (appointmentType === "HOME_VISIT") {
      if (!selectedAddressId) {
        setErrorMsg("Please select an address for your home visit.");
        return;
      }
      if (!selectedAddressServiceability.isServiceable) {
        setErrorMsg(
          `Service is currently not available in ${selectedAddress?.city || "your location"}. PhysioConnect is live in Etawah (Pilot Territory) and launching across India soon!`
        );
        return;
      }
    }

    const complaintCategoryObj = COMMON_COMPLAINTS.find((c) => c.id === selectedComplaintCategory);
    const finalComplaint = customComplaintText.trim()
      ? `${complaintCategoryObj?.label || ""}: ${customComplaintText.trim()}`
      : complaintCategoryObj?.label || "General Physiotherapy Care";

    const chosenWindow = ARRIVAL_WINDOWS.find((w) => w.id === selectedWindowId);
    const requestedTime = chosenWindow ? chosenWindow.label : "Immediate (~45–60 mins)";

    setIsSubmitting(true);
    try {
      const res = await createServiceRequestAction({
        appointmentType,
        addressId: appointmentType === "HOME_VISIT" ? selectedAddressId : undefined,
        chiefComplaint: finalComplaint,
        requestedTime,
      });

      if (!res.success || !res.data) {
        setErrorMsg(res.error || "Failed to create on-demand request.");
        setIsSubmitting(false);
        return;
      }

      setCreatedRequestNumber(res.data.requestNumber);
      setStep("MATCHING");
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleOpenChange(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Morphing Dynamic Glass Island Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg glass-floating rounded-3xl p-6 sm:p-8 shadow-soft-lg space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => handleOpenChange(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* FLOW CHOICE SCREEN */}
            {step === "CHOOSE_FLOW" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 pt-1"
              >
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                    Pan-India Physiotherapy Network
                  </span>
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    How would you like to book?
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Choose between immediate on-demand matching or booking an advance slot with a specific practitioner.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* Option 1: On-Demand Instant Matching */}
                  <button
                    type="button"
                    onClick={() => setStep("FORM_STEP")}
                    className="flex items-start gap-4 rounded-2xl glass-card hover:border-primary/60 p-5 text-left transition-all group relative overflow-hidden"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-700 text-primary-foreground shadow-soft">
                      <Zap className="h-5 w-5 fill-current text-amber-300" />
                    </div>
                    <div className="space-y-1 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-foreground">Book Now (On-Demand)</span>
                        <GlassBadge variant="success">Fastest</GlassBadge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Broadcast your request to verified online physiotherapists nearby (Active in Pilot Territory: Etawah).
                      </p>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>

                  {/* Option 2: Scheduled Advance Booking */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push("/browse");
                    }}
                    className="flex items-start gap-4 rounded-2xl glass-subtle hover:border-foreground/30 p-5 text-left transition-all group relative"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 pr-6">
                      <span className="font-extrabold text-sm text-foreground">Scheduled Appointment</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Browse full directory, compare practitioner degrees and verified reviews, and pick an advance date & time slot.
                      </p>
                    </div>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-muted-foreground border-t border-border/60">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-cyan-400" />
                    100% Verified Practitioners
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Home className="h-3.5 w-3.5 text-primary" />
                    Doorstep Home Visits
                  </span>
                </div>
              </motion.div>
            )}

            {/* GUIDED ON-DEMAND FORM */}
            {step === "FORM_STEP" && (
              <motion.form
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleCreateOnDemand}
                className="space-y-5 pt-1"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                    Fast Matching • Pilot: Etawah
                  </span>
                  <h3 className="text-xl font-black tracking-tight text-foreground">
                    Request Physiotherapist
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    We will match you with the closest verified doctor in the active territory.
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* 1. Visit Mode Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    1. Choose Service Mode
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAppointmentType("HOME_VISIT")}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        appointmentType === "HOME_VISIT"
                          ? "glass-hero border-primary text-primary"
                          : "glass-subtle hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Home className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Home Visit</p>
                        <p className="text-[10px] text-muted-foreground">At your doorstep</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAppointmentType("CLINIC_VISIT")}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                        appointmentType === "CLINIC_VISIT"
                          ? "glass-hero border-primary text-primary"
                          : "glass-subtle hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Clinic Visit</p>
                        <p className="text-[10px] text-muted-foreground">Walk-in consultation</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Address Selector for Home Visits */}
                {appointmentType === "HOME_VISIT" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        2. Visit Address
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          router.push("/dashboard/patient/addresses");
                        }}
                        className="text-[11px] font-bold text-primary hover:underline"
                      >
                        + Manage Addresses
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="glass-subtle rounded-2xl border border-dashed p-4 text-center text-xs text-muted-foreground space-y-2">
                        <p>No saved address found.</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setOpen(false);
                            router.push("/dashboard/patient/addresses");
                          }}
                          className="text-xs h-8 rounded-xl"
                        >
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {addresses.map((addr) => {
                          const serviceCheck = checkLocationServiceability({
                            city: addr.city,
                            pincode: addr.pincode,
                          });

                          return (
                            <label
                              key={addr.id}
                              className={`flex items-start gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                                selectedAddressId === addr.id
                                  ? serviceCheck.isServiceable
                                    ? "glass-hero border-primary"
                                    : "border-amber-500/50 bg-amber-500/10"
                                  : "glass-subtle hover:border-foreground/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name="addressSelection"
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-0.5 h-4 w-4 text-primary accent-primary"
                              />
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-foreground truncate">
                                    {addr.label} • {addr.area}
                                  </span>
                                  {serviceCheck.isServiceable ? (
                                    <GlassBadge variant="success" className="text-[9px] px-2 py-0">
                                      Active Territory
                                    </GlassBadge>
                                  ) : (
                                    <GlassBadge variant="warning" className="text-[9px] px-2 py-0">
                                      Coming Soon
                                    </GlassBadge>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {addr.street}, {addr.city} ({addr.pincode})
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Unserviceable Warning Banner if non-Etawah address selected */}
                    {selectedAddress && !selectedAddressServiceability.isServiceable && (
                      <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Service Not Available Yet in {selectedAddress.city}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PhysioConnect doorstep visits are currently operational only in <strong>Etawah, UP (Pilot Launch)</strong>. We are expanding to {selectedAddress.city} soon!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Quick Complaint Selection Chips */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {appointmentType === "HOME_VISIT" ? "3." : "2."} What do you need help with?
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_COMPLAINTS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedComplaintCategory(c.id)}
                        className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                          selectedComplaintCategory === c.id
                            ? "glass-hero border-primary text-primary font-bold shadow-soft"
                            : "glass-subtle hover:border-foreground/30 text-foreground"
                        }`}
                      >
                        <span className="text-base mb-1">{c.icon}</span>
                        <span className="text-xs font-bold leading-tight">{c.label}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Optional Additional Detail Input */}
                  <textarea
                    rows={2}
                    placeholder="Optional: Any specific pain points, mobility difficulty, or notes for the doctor..."
                    value={customComplaintText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCustomComplaintText(e.target.value)
                    }
                    className="flex w-full rounded-2xl border border-input bg-card/60 backdrop-blur-md p-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none mt-2"
                    disabled={isSubmitting}
                  />
                </div>

                {/* 4. Preferred Doctor Arrival Window */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      {appointmentType === "HOME_VISIT" ? "4." : "3."} Doctor Arrival & Travel Window
                    </Label>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Includes doctor travel & equipment prep
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ARRIVAL_WINDOWS.map((win) => (
                      <button
                        key={win.id}
                        type="button"
                        onClick={() => setSelectedWindowId(win.id)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border text-left transition-all ${
                          selectedWindowId === win.id
                            ? "glass-hero border-primary text-primary font-bold shadow-soft"
                            : "glass-subtle hover:border-foreground/30 text-foreground"
                        }`}
                      >
                        <span className="text-base mt-0.5">{win.icon}</span>
                        <div>
                          <p className="text-xs font-bold leading-tight">{win.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{win.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStep("CHOOSE_FLOW")}
                    disabled={isSubmitting}
                    className="w-1/3 text-xs h-11 rounded-2xl glass-subtle font-bold"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isSubmitting ||
                      (appointmentType === "HOME_VISIT" &&
                        (addresses.length === 0 || !selectedAddressServiceability.isServiceable))
                    }
                    className="w-2/3 text-xs h-11 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-bold shadow-soft"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : appointmentType === "HOME_VISIT" &&
                      !selectedAddressServiceability.isServiceable ? (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        Service Unavailable in {selectedAddress?.city || "City"}
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-current text-amber-300" />
                        Find Available Doctors
                      </>
                    )}
                  </Button>
                </div>
              </motion.form>
            )}

            {/* REASSURING MATCHING SCREEN */}
            {step === "MATCHING" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 py-6 text-center"
              >
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <div className="absolute h-full w-full rounded-full bg-emerald-500/20 dark:bg-cyan-500/25 animate-ping" />
                  <div className="absolute h-20 w-20 rounded-full bg-emerald-500/30 dark:bg-cyan-500/35 animate-pulse-ring" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-soft-lg">
                    <Compass
                      className="h-8 w-8 animate-spin"
                      style={{ animationDuration: "7s" }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-foreground">
                    Finding the Right Physiotherapist
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Request <span className="font-mono font-bold text-foreground">#{createdRequestNumber}</span> is broadcasted to verified doctors nearby.
                  </p>
                </div>

                {/* Progress Reassurance Checklist */}
                <div className="glass-subtle rounded-2xl p-4 text-left space-y-3 max-w-sm mx-auto text-xs">
                  <div className="flex items-center gap-3">
                    {matchingStage >= 1 ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 dark:bg-cyan-400 text-white dark:text-slate-950 shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/40 shrink-0" />
                    )}
                    <span className={matchingStage >= 1 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      Checking nearby verified professionals in territory
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {matchingStage >= 2 ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 dark:bg-cyan-400 text-white dark:text-slate-950 shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/40 shrink-0" />
                    )}
                    <span className={matchingStage >= 2 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      Verifying live availability & travel time
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {matchingStage >= 3 ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 dark:bg-cyan-400 text-white dark:text-slate-950 shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/40 shrink-0 animate-pulse" />
                    )}
                    <span className={matchingStage >= 3 ? "text-foreground font-semibold" : "text-muted-foreground"}>
                      Dispatching request within 5 km radius
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setOpen(false);
                      router.refresh();
                    }}
                    className="w-full text-xs h-11 rounded-2xl font-bold shadow-soft"
                  >
                    View Active Requests on Dashboard
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button
        size="sm"
        onClick={() => handleOpenChange(true)}
        className="gap-2 shadow-soft bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-transform hover:scale-[1.02]"
      >
        <Zap className="h-4 w-4 fill-current text-amber-300" />
        <span>Book a Physiotherapist</span>
      </Button>

      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
