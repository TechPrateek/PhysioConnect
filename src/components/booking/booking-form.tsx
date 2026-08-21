"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Hospital,
  Loader2,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createBookingSchema, CreateBookingInput } from "@/features/bookings/schemas";
import { createBookingAction } from "@/actions/bookings/create";
import { AddressRecord } from "@/actions/patients/addresses";
import { PhysioSearchResult } from "@/actions/physiotherapists/discovery";
import { formatCurrency, formatDate } from "@/lib/utils";

interface BookingFormProps {
  physio: PhysioSearchResult;
  date: string;
  timeSlot: string;
  type: "HOME_VISIT" | "CLINIC_VISIT";
  addresses: AddressRecord[];
}

export function BookingForm({
  physio,
  date,
  timeSlot,
  type,
  addresses,
}: BookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      physiotherapistId: physio.id,
      appointmentType: type,
      appointmentDate: date,
      timeSlot,
      addressId: type === "HOME_VISIT" ? defaultAddress?.id : undefined,
      chiefComplaint: "",
      notes: "",
    },
  });

  const selectedAddressId = watch("addressId");

  const onSubmit = async (data: CreateBookingInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await createBookingAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to confirm appointment");
        setIsLoading(false);
        return;
      }

      if (res.data?.redirectUrl) {
        router.push(res.data.redirectUrl);
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred during booking. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <input type="hidden" {...register("physiotherapistId")} />
      <input type="hidden" {...register("appointmentType")} />
      <input type="hidden" {...register("appointmentDate")} />
      <input type="hidden" {...register("timeSlot")} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Booking Details & Address */}
        <div className="space-y-6 lg:col-span-7">
          {/* Appointment Schedule Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Selected Schedule</CardTitle>
              <CardDescription>
                Verified session in Etawah, Uttar Pradesh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border p-3.5 space-y-1 bg-accent/20">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Date
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {formatDate(date)}
                  </p>
                </div>

                <div className="rounded-xl border p-3.5 space-y-1 bg-accent/20">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" /> Time Slot
                  </span>
                  <p className="font-bold text-foreground text-sm">{timeSlot}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs">
                {type === "HOME_VISIT" ? (
                  <>
                    <Home className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Home Visit Mode:</strong> The physiotherapist will travel directly to your home address.
                    </span>
                  </>
                ) : (
                  <>
                    <Hospital className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Clinic Consultation:</strong> Location: {physio.clinicAddress || "Etawah Clinic"}.
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Home Visit Address Selector */}
          {type === "HOME_VISIT" && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Visit Location in Etawah</CardTitle>
                  <Link href="/dashboard/patient/addresses" className="text-xs text-primary hover:underline">
                    + Add / Manage Addresses
                  </Link>
                </div>
                <CardDescription>
                  Select the address where the physiotherapist will conduct the session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-xs space-y-3">
                    <MapPin className="mx-auto h-6 w-6 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      No saved addresses found. Please add an address to book a home visit.
                    </p>
                    <Link href="/dashboard/patient/addresses">
                      <Button size="sm" variant="outline">
                        Add New Address
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 rounded-xl border p-3.5 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-xs"
                              : "border-input bg-card hover:bg-muted/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="addressId"
                            value={addr.id}
                            checked={isSelected}
                            onChange={() => setValue("addressId", addr.id, { shouldValidate: true })}
                            className="mt-0.5 h-4 w-4 text-primary focus:ring-primary"
                          />
                          <div className="flex-1 text-xs space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{addr.label}</span>
                              {addr.isDefault && (
                                <Badge variant="success" className="text-[9px] py-0">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground">{addr.street}</p>
                            {addr.landmark && (
                              <p className="text-[11px] text-muted-foreground">
                                Landmark: {addr.landmark}
                              </p>
                            )}
                            <p className="text-[11px] text-muted-foreground font-medium">
                              {addr.area}, Etawah - {addr.pincode}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {errors.addressId && (
                  <p className="text-[11px] text-destructive">
                    {errors.addressId.message}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Symptoms & Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Symptoms & Visit Details</CardTitle>
              <CardDescription>
                Help the physiotherapist prepare the required equipment and therapy tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="chiefComplaint">
                  Chief Complaint / Pain Area <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="chiefComplaint"
                  type="text"
                  placeholder="e.g. Severe lower back pain radiating to left leg, knee stiffness"
                  disabled={isLoading}
                  {...register("chiefComplaint")}
                  className={errors.chiefComplaint ? "border-destructive" : ""}
                />
                {errors.chiefComplaint && (
                  <p className="text-[11px] text-destructive">
                    {errors.chiefComplaint.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Additional Clinical Notes or Surgery History (Optional)</Label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Any relevant past surgeries, doctor prescriptions, or mobility restrictions..."
                  disabled={isLoading}
                  {...register("notes")}
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Doctor Summary & Price Breakdown */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="sticky top-20 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Doctor snippet */}
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                  {physio.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="text-xs space-y-0.5 min-w-0">
                  <h5 className="font-bold text-foreground truncate">
                    {physio.fullName}
                  </h5>
                  <p className="text-[11px] text-muted-foreground">
                    {physio.experienceYears} Years Exp • Etawah, UP
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span>{physio.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation Fee (60 min)</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(physio.consultationFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Etawah Launch Platform Fee</span>
                  <span className="font-medium text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold">
                  <span>Total Payable</span>
                  <span className="text-primary">
                    {formatCurrency(physio.consultationFee)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-accent/20 p-3 text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>PhysioConnect Guarantee</span>
                </div>
                <p>
                  Secure Razorpay payment processing. Full refund eligible if cancelled 2+ hours prior to slot time.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full shadow-md gap-2"
                disabled={isLoading || (type === "HOME_VISIT" && addresses.length === 0)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming Slot...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Confirm & Proceed to Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
