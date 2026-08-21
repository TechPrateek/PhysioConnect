"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  HeartPulse,
  History,
  Home,
  Hospital,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RazorpayCheckoutButton } from "@/components/booking/razorpay-checkout-button";
import { ReviewModal } from "@/components/booking/review-modal";
import { BookingDetailRecord, cancelBookingAction } from "@/actions/bookings/manage";
import { formatCurrency, formatDate, formatDateTime, formatTimeSlot } from "@/lib/utils";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

interface BookingDetailsViewProps {
  booking: BookingDetailRecord;
  currentUserId: string;
}

export function BookingDetailsView({
  booking,
  currentUserId,
}: BookingDetailsViewProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const canCancel =
    booking.status !== "COMPLETED" &&
    booking.status !== "CANCELLED" &&
    booking.status !== "REJECTED";

  const canReview = booking.status === "COMPLETED" && !booking.review;

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;

    setIsCancelling(true);
    setErrorMessage(null);

    try {
      const res = await cancelBookingAction({
        bookingId: booking.id,
        cancellationReason: cancelReason,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to cancel appointment");
        setIsCancelling(false);
        return;
      }

      setShowCancelModal(false);
      setIsCancelling(false);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      setIsCancelling(false);
    }
  };

  // Determine Timeline Step
  const getTimelineStep = () => {
    switch (booking.status) {
      case "PENDING":
        return 1;
      case "CONFIRMED":
        return 2;
      case "IN_PROGRESS":
        return 4;
      case "COMPLETED":
        return 5;
      case "CANCELLED":
      case "REJECTED":
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = getTimelineStep();

  return (
    <div className="space-y-6">
      {/* 1. VISUAL APPOINTMENT STATUS TIMELINE ISLAND */}
      {currentStep !== -1 && (
        <GlassIsland level={3} glow="teal" className="p-6 sm:p-7 shadow-soft-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                  Live Treatment Status
                </span>
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  Appointment #{booking.bookingNumber}
                </h3>
              </div>
              <GlassBadge
                variant={
                  booking.status === "COMPLETED"
                    ? "success"
                    : booking.status === "IN_PROGRESS"
                    ? "info"
                    : "primary"
                }
              >
                {booking.status}
              </GlassBadge>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {[
                { step: 1, label: "Booked" },
                { step: 2, label: "Doctor Assigned" },
                { step: 3, label: "Out for Visit" },
                { step: 4, label: "In Session" },
                { step: 5, label: "Completed" },
              ].map((s) => {
                const isPassed = currentStep > s.step;
                const isCurrent = currentStep === s.step;

                return (
                  <div key={s.step} className="space-y-2 text-center">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? "bg-emerald-500 dark:bg-cyan-400 shadow-xs"
                          : isCurrent
                          ? "bg-primary animate-pulse shadow-soft"
                          : "bg-muted"
                      }`}
                    />
                    <p
                      className={`text-[10px] sm:text-[11px] font-bold tracking-tight ${
                        isPassed
                          ? "text-emerald-600 dark:text-cyan-300"
                          : isCurrent
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassIsland>
      )}

      {currentStep === -1 && (
        <GlassIsland level={2} className="p-4 border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3">
          <XCircle className="h-5 w-5 shrink-0" />
          <div className="text-xs space-y-0.5">
            <h4 className="font-bold text-sm">Appointment Cancelled</h4>
            <p className="text-muted-foreground">
              Reason: &ldquo;{booking.cancellationReason || "Cancelled by user"}&rdquo;
            </p>
          </div>
        </GlassIsland>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Details */}
        <div className="space-y-6 lg:col-span-7">
          {/* Doctor Card Island */}
          <GlassIsland level={2} className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assigned Doctor
              </span>
              <GlassBadge variant="success">✓ Verified Practitioner</GlassBadge>
            </div>

            <div className="flex items-start gap-4 pt-1">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-teal-500/10 to-primary/5 text-primary font-black text-lg border border-primary/25 shadow-soft">
                {booking.physiotherapist.fullName
                  .replace(/^Dr\.\s*/i, "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-foreground">
                  {booking.physiotherapist.fullName}
                </h4>
                <p className="text-xs text-muted-foreground font-semibold">
                  {booking.physiotherapist.experienceYears} Years Clinical Experience • BPT / MPT
                </p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 pt-0.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {booking.physiotherapist.phone}
                </p>
              </div>
            </div>
          </GlassIsland>

          {/* Schedule & Location Island */}
          <GlassIsland level={2} className="p-6 space-y-4 text-xs">
            <div className="border-b border-border/60 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Session Schedule & Location
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl glass-subtle p-3.5 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Appointment Date
                </span>
                <p className="font-black text-foreground text-sm">
                  {formatDate(booking.appointmentDate)}
                </p>
              </div>
              <div className="rounded-2xl glass-subtle p-3.5 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Arrival / Slot Window
                </span>
                <p className="font-black text-foreground text-sm">
                  {formatTimeSlot(booking.timeSlot)}
                </p>
              </div>
            </div>

            {/* Address details */}
            <div className="rounded-2xl glass-subtle p-4 space-y-1.5">
              <span className="text-muted-foreground font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {booking.appointmentType === "HOME_VISIT"
                  ? "Doorstep Home Visit Address (Etawah)"
                  : "Clinic Consultation Address"}
              </span>

              {booking.appointmentType === "HOME_VISIT" && booking.address ? (
                <div className="pt-1 space-y-0.5 text-foreground text-xs leading-relaxed">
                  <p className="font-bold">{booking.address.street}</p>
                  {booking.address.landmark && (
                    <p className="text-muted-foreground text-[11px]">
                      Landmark: {booking.address.landmark}
                    </p>
                  )}
                  <p className="text-muted-foreground font-medium">
                    {booking.address.area}, {booking.address.city}, {booking.address.state} — {booking.address.pincode}
                  </p>
                </div>
              ) : (
                <p className="pt-1 font-bold text-foreground text-xs">
                  {booking.physiotherapist.clinicAddress || "Civil Lines, Etawah"}
                </p>
              )}
            </div>

            {/* Symptoms */}
            {booking.chiefComplaint && (
              <div className="rounded-2xl glass-subtle p-4 space-y-1">
                <span className="text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
                  Reported Medical Symptoms:
                </span>
                <p className="text-foreground text-xs italic leading-relaxed pt-0.5">
                  &ldquo;{booking.chiefComplaint}&rdquo;
                </p>
              </div>
            )}
          </GlassIsland>

          {/* 🌟 3. COMPLETE APPOINTMENT TIMELINE & EXACT TIMESTAMPS HISTORY */}
          <GlassIsland level={2} className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Session History & Exact Timestamps
                </h4>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">
                Audit Trail
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Event 1: Request & Booking Initiated */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">1. Booking Created & Requested</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {formatDateTime(booking.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Appointment #{booking.bookingNumber} was initiated by {booking.patient.fullName}.
                  </p>
                </div>
              </div>

              {/* Event 2: Doctor Accepted / Confirmed */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-cyan-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">2. Doctor Assigned & Confirmed</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {booking.serviceRequest?.acceptedAt
                        ? formatDateTime(booking.serviceRequest.acceptedAt)
                        : formatDateTime(booking.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {booking.physiotherapist.fullName} accepted and locked the consultation session.
                  </p>
                </div>
              </div>

              {/* Event 3: Payment Timestamp */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">3. Payment Status</span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {booking.payment?.status === "PAID" && booking.payment.updatedAt
                        ? formatDateTime(booking.payment.updatedAt)
                        : "Pending"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {booking.payment?.status === "PAID"
                      ? `Paid ${formatCurrency(booking.amount)} via Razorpay UPI / Card.`
                      : "Awaiting patient payment at gateway."}
                  </p>
                </div>
              </div>

              {/* Event 4: Doctor Arrival & Travel Buffer Window */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">4. Expected Doctor Reach Time</span>
                    <span className="text-[11px] font-bold text-primary">
                      {formatTimeSlot(booking.timeSlot)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Includes doctor equipment sterilization, preparation, and doorstep travel time across Etawah.
                  </p>
                </div>
              </div>

              {/* Event 5: Session Completed */}
              {booking.completedAt && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-cyan-400">
                    <FileCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">5. Session Completed</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {formatDateTime(booking.completedAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Physical therapy rehabilitation session was successfully delivered.
                    </p>
                  </div>
                </div>
              )}

              {/* Event 6: Review & Rating */}
              {booking.review && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-current" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">6. Verified Review Submitted</span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {booking.review.createdAt ? formatDateTime(booking.review.createdAt) : "Submitted"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Patient rated {booking.review.rating} ★: &ldquo;{booking.review.comment}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassIsland>
        </div>

        {/* Right Column: Payment & Actions */}
        <div className="space-y-6 lg:col-span-5">
          <GlassIsland level={2} className="p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment Summary
              </h4>
              <GlassBadge
                variant={
                  booking.payment?.status === "PAID" ? "success" : "warning"
                }
              >
                {booking.payment?.status === "PAID" ? "Paid" : "Payment Pending"}
              </GlassBadge>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Consultation Fee</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(booking.amount)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground font-medium">
                <span>Home Visit Transportation</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-3 text-base font-black">
                <span className="text-foreground">Total Amount</span>
                <span className="text-primary">{formatCurrency(booking.amount)}</span>
              </div>
            </div>

            {/* Razorpay Pay Now Trigger */}
            {booking.payment?.status !== "PAID" &&
              booking.status !== "CANCELLED" &&
              booking.status !== "REJECTED" && (
                <div className="border-t border-border/60 pt-4 space-y-3">
                  <RazorpayCheckoutButton
                    bookingId={booking.id}
                    amount={booking.amount}
                    bookingNumber={booking.bookingNumber}
                  />
                  <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1 font-medium">
                    <Lock className="h-3 w-3 text-emerald-600 dark:text-cyan-400" />
                    Secured by Razorpay • UPI, Cards & NetBanking
                  </p>
                </div>
              )}

            {/* Review Card */}
            {booking.review && (
              <div className="border-t border-border/60 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Your Verified Review</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: booking.review.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                {booking.review.comment && (
                  <p className="text-xs text-muted-foreground italic glass-subtle p-3 rounded-xl">
                    &ldquo;{booking.review.comment}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-border/60 pt-4 space-y-2.5">
              {canReview && (
                <Button
                  size="sm"
                  onClick={() => setShowReviewModal(true)}
                  className="w-full text-xs h-11 rounded-2xl font-bold shadow-soft gap-2 bg-amber-600 hover:bg-amber-700 text-white transition-transform hover:scale-[1.02]"
                >
                  <Star className="h-4 w-4 fill-white" />
                  Write a Review for Dr. {booking.physiotherapist.fullName.split(" ")[1] || booking.physiotherapist.fullName}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs h-10 rounded-2xl font-bold glass-subtle border-destructive/20"
                >
                  Cancel Appointment
                </Button>
              )}
            </div>
          </GlassIsland>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          bookingId={booking.id}
          doctorName={booking.physiotherapist.fullName}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <GlassIsland level={3} className="w-full max-w-md p-6 sm:p-7 shadow-soft-lg space-y-4">
            <div>
              <h3 className="text-lg font-black text-foreground">Cancel Appointment</h3>
              <p className="text-xs text-muted-foreground">
                Are you sure you want to cancel booking #{booking.bookingNumber}?
              </p>
            </div>
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="cancelReason" className="text-xs font-bold text-foreground">
                  Reason for Cancellation
                </label>
                <textarea
                  id="cancelReason"
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please explain why you need to cancel this appointment..."
                  className="w-full rounded-2xl border border-input glass-subtle p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-2xl text-xs h-10 glass-subtle font-bold"
                >
                  Keep Booking
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={isCancelling || !cancelReason.trim()}
                  className="rounded-2xl text-xs h-10 font-black shadow-soft"
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </div>
            </form>
          </GlassIsland>
        </div>
      )}
    </div>
  );
}
