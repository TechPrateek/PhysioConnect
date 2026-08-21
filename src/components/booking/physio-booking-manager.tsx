"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Hospital,
  Loader2,
  MapPin,
  Phone,
  Play,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookingDetailRecord,
  updateBookingStatusAction,
} from "@/actions/bookings/manage";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PhysioBookingManagerProps {
  initialBookings: BookingDetailRecord[];
}

export function PhysioBookingManager({ initialBookings }: PhysioBookingManagerProps) {
  const router = useRouter();
  const [bookings, setBookings] = React.useState<BookingDetailRecord[]>(initialBookings);
  const [filter, setFilter] = React.useState<"ALL" | "TODAY" | "UPCOMING" | "COMPLETED">("ALL");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const handleStatusChange = async (
    bookingId: string,
    status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "NO_SHOW"
  ) => {
    setUpdatingId(bookingId);

    try {
      const res = await updateBookingStatusAction({
        bookingId,
        status,
      });

      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
        router.refresh();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch (e) {
      alert("Error updating appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "COMPLETED") return b.status === "COMPLETED";
    if (filter === "UPCOMING")
      return b.status === "CONFIRMED" || b.status === "PENDING";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 text-xs font-medium">
        {(["ALL", "UPCOMING", "COMPLETED"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === tab
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab === "ALL"
              ? "All Appointments"
              : tab === "UPCOMING"
              ? "Upcoming / Active"
              : "Completed"}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground text-xs space-y-2">
          <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No appointments found</p>
          <p>New patient bookings in Etawah will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isUpdating = updatingId === b.id;

            return (
              <Card key={b.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold">{b.bookingNumber}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        {b.appointmentType === "HOME_VISIT" ? (
                          <>
                            <Home className="h-3.5 w-3.5 text-emerald-600" /> Home Visit
                          </>
                        ) : (
                          <>
                            <Hospital className="h-3.5 w-3.5 text-blue-600" /> Clinic
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          b.status === "CONFIRMED"
                            ? "success"
                            : b.status === "IN_PROGRESS"
                            ? "info"
                            : b.status === "COMPLETED"
                            ? "default"
                            : b.status === "CANCELLED" || b.status === "REJECTED"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {b.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                    {/* Patient info */}
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Patient:</span>
                      <p className="font-bold text-foreground text-sm">{b.patient.fullName}</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 text-primary" /> {b.patient.phone}
                      </p>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Scheduled Time:</span>
                      <p className="font-bold text-foreground">{formatDate(b.appointmentDate)}</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" /> {b.timeSlot}
                      </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Location:</span>
                      {b.appointmentType === "HOME_VISIT" && b.address ? (
                        <p className="text-foreground">
                          {b.address.street}, {b.address.area}, Etawah
                        </p>
                      ) : (
                        <p className="text-foreground">{b.physiotherapist.clinicAddress || "Clinic"}</p>
                      )}
                    </div>
                  </div>

                  {/* Complaint */}
                  {b.chiefComplaint && (
                    <div className="rounded-lg bg-muted/40 p-3 text-xs">
                      <span className="font-medium text-foreground">Symptoms:</span>{" "}
                      <span className="text-muted-foreground">{b.chiefComplaint}</span>
                    </div>
                  )}

                  {/* Status update controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <span className="text-xs font-bold text-primary">
                      Fee: {formatCurrency(b.amount)}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {b.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(b.id, "CONFIRMED")}
                            className="text-xs h-8"
                          >
                            {isUpdating ? "Updating..." : "Accept & Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(b.id, "REJECTED")}
                            className="text-xs h-8 text-destructive hover:bg-destructive/10"
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {b.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(b.id, "IN_PROGRESS")}
                          className="text-xs h-8 gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Start Session
                        </Button>
                      )}

                      {b.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleStatusChange(b.id, "COMPLETED")}
                          className="text-xs h-8 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Mark Session as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
