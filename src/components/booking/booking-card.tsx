import Link from "next/link";
import {
  Calendar,
  Clock,
  Home,
  Hospital,
  MapPin,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassBadge } from "@/components/ui/glass/glass-badge";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { BookingDetailRecord } from "@/actions/bookings/manage";
import { formatCurrency, formatDate, formatDateTime, formatTimeSlot } from "@/lib/utils";

interface BookingCardProps {
  booking: BookingDetailRecord;
  role: "PATIENT" | "PHYSIOTHERAPIST" | "ADMIN";
}

export function BookingCard({ booking, role }: BookingCardProps) {
  const isPatient = role === "PATIENT";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <GlassBadge variant="success">Confirmed</GlassBadge>;
      case "IN_PROGRESS":
        return <GlassBadge variant="info">In Progress</GlassBadge>;
      case "COMPLETED":
        return <GlassBadge variant="success">Completed</GlassBadge>;
      case "CANCELLED":
        return <GlassBadge variant="destructive">Cancelled</GlassBadge>;
      case "REJECTED":
        return <GlassBadge variant="destructive">Rejected</GlassBadge>;
      case "NO_SHOW":
        return <GlassBadge variant="warning">No Show</GlassBadge>;
      default:
        return <GlassBadge variant="warning">Pending Payment</GlassBadge>;
    }
  };

  const detailUrl = isPatient
    ? `/dashboard/patient/bookings/${booking.id}`
    : `/dashboard/physiotherapist/bookings`;

  return (
    <GlassIsland level={2} interactive className="p-5 space-y-4 transition-all">
      {/* Header: Number & Status */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black text-foreground">
            #{booking.bookingNumber}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
            {booking.appointmentType === "HOME_VISIT" ? (
              <>
                <Home className="h-3.5 w-3.5 text-emerald-600 dark:text-cyan-400" /> Doorstep Visit
              </>
            ) : (
              <>
                <Hospital className="h-3.5 w-3.5 text-blue-600" /> Clinic Consultation
              </>
            )}
          </span>
        </div>

        <div>{getStatusBadge(booking.status)}</div>
      </div>

      {/* Counterpart info */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-foreground">
            {isPatient ? booking.physiotherapist.fullName : booking.patient.fullName}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isPatient
              ? `${booking.physiotherapist.experienceYears} Years Exp • ${booking.physiotherapist.phone}`
              : `Patient Contact: ${booking.patient.phone}`}
          </p>
          {booking.chiefComplaint && (
            <p className="text-xs text-muted-foreground line-clamp-1 pt-0.5">
              <span className="font-semibold text-foreground">Condition:</span> &ldquo;{booking.chiefComplaint}&rdquo;
            </p>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-sm font-black text-foreground">
            {formatCurrency(booking.amount)}
          </span>
          <p className="text-[10px] text-muted-foreground">
            {booking.payment?.status === "PAID" ? (
              <span className="text-emerald-600 dark:text-cyan-400 font-bold">Paid Online</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">Payment Pending</span>
            )}
          </p>
        </div>
      </div>

      {/* Date, Time & Timeline Timestamp pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl glass-subtle p-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {formatDate(booking.appointmentDate)}
          </span>
          <span className="flex items-center gap-1 font-bold text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formatTimeSlot(booking.timeSlot)}
          </span>
        </div>

        <span className="text-[11px] text-muted-foreground font-mono">
          Booked: {formatDateTime(booking.createdAt)}
        </span>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between pt-1 border-t border-border/60">
        <span className="text-[11px] text-muted-foreground font-medium">
          {booking.address ? `${booking.address.area}, Etawah` : "Clinic Consultation"}
        </span>

        <Link href={detailUrl}>
          <Button size="sm" className="text-xs h-9 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
            View Details & Timeline &rarr;
          </Button>
        </Link>
      </div>
    </GlassIsland>
  );
}
