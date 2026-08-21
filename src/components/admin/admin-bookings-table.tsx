"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  Eye,
  Home,
  Hospital,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingDetailRecord } from "@/actions/bookings/manage";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminBookingsTableProps {
  initialBookings: BookingDetailRecord[];
}

export function AdminBookingsTable({ initialBookings }: AdminBookingsTableProps) {
  const [filter, setFilter] = React.useState<"ALL" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("ALL");

  const filtered = initialBookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-3 text-xs font-medium">
        {(["ALL", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((tab) => (
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
            {tab === "ALL" ? "All Appointments" : tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground text-xs">
          No bookings match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{b.bookingNumber}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      {b.appointmentType === "HOME_VISIT" ? (
                        <>
                          <Home className="h-3.5 w-3.5 text-emerald-600" /> Home Visit
                        </>
                      ) : (
                        <>
                          <Hospital className="h-3.5 w-3.5 text-blue-600" /> Clinic Visit
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
                          : b.status === "CANCELLED"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {b.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground font-semibold">Patient:</span>
                    <p className="font-bold text-foreground">{b.patient.fullName}</p>
                    <p className="text-muted-foreground text-[11px]">{b.patient.phone}</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-semibold">Physiotherapist:</span>
                    <p className="font-bold text-foreground">{b.physiotherapist.fullName}</p>
                    <p className="text-muted-foreground text-[11px]">{b.physiotherapist.phone}</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground font-semibold">Slot & Fee:</span>
                    <p className="font-medium text-foreground">
                      {formatDate(b.appointmentDate)} • {b.timeSlot}
                    </p>
                    <p className="text-primary font-bold">{formatCurrency(b.amount)}</p>
                  </div>
                </div>

                {b.cancellationReason && (
                  <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                    <span className="font-semibold">Cancellation:</span> {b.cancellationReason} (by {b.cancelledBy || "User"})
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
