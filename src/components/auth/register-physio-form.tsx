"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Home, Hospital, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPhysioSchema, RegisterPhysioInput } from "@/features/auth/schemas";
import { registerPhysiotherapistAction } from "@/actions/auth/register-physio";
import { getSpecializationsAction, SpecializationItem } from "@/actions/physiotherapists/specializations";

export function RegisterPhysioForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [specializations, setSpecializations] = React.useState<SpecializationItem[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterPhysioInput>({
    resolver: zodResolver(registerPhysioSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experienceYears: 2,
      consultationFee: 500,
      clinicAddress: "",
      homeVisitAvailable: true,
      clinicVisitAvailable: false,
      bio: "",
      specializationIds: [],
      password: "",
      confirmPassword: "",
    },
  });

  const clinicVisitAvailable = watch("clinicVisitAvailable");
  const selectedSpecIds = watch("specializationIds") || [];

  React.useEffect(() => {
    async function loadSpecs() {
      const res = await getSpecializationsAction();
      if (res.success && res.data) {
        setSpecializations(res.data);
      }
    }
    loadSpecs();
  }, []);

  const toggleSpecialization = (id: string) => {
    if (selectedSpecIds.includes(id)) {
      setValue(
        "specializationIds",
        selectedSpecIds.filter((sId) => sId !== id),
        { shouldValidate: true }
      );
    } else {
      setValue("specializationIds", [...selectedSpecIds, id], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: RegisterPhysioInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerPhysiotherapistAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to register practitioner");
        setIsLoading(false);
        return;
      }

      router.push(res.data?.redirectUrl || "/dashboard/physiotherapist");
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Practitioner Credentials
        </h4>

        <div className="space-y-1.5">
          <Label htmlFor="physio-name">Full Name & Qualifications (e.g. Dr. Amit Sharma MPT)</Label>
          <Input
            id="physio-name"
            type="text"
            placeholder="Dr. Amit Sharma (BPT / MPT)"
            disabled={isLoading}
            {...register("name")}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="physio-email">Professional Email</Label>
            <Input
              id="physio-email"
              type="email"
              placeholder="dr.amit@example.com"
              disabled={isLoading}
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="physio-phone">Phone Number (Etawah)</Label>
            <Input
              id="physio-phone"
              type="tel"
              placeholder="9876543210"
              disabled={isLoading}
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Practice & Fees */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Practice & Visit Preferences (Etawah)
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="experienceYears">Experience (in Years)</Label>
            <Input
              id="experienceYears"
              type="number"
              min={0}
              disabled={isLoading}
              {...register("experienceYears")}
              className={errors.experienceYears ? "border-destructive" : ""}
            />
            {errors.experienceYears && (
              <p className="text-[11px] text-destructive">
                {errors.experienceYears.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="consultationFee">Consultation Fee (₹ per session)</Label>
            <Input
              id="consultationFee"
              type="number"
              min={100}
              step={50}
              disabled={isLoading}
              {...register("consultationFee")}
              className={errors.consultationFee ? "border-destructive" : ""}
            />
            {errors.consultationFee && (
              <p className="text-[11px] text-destructive">
                {errors.consultationFee.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
          <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 cursor-pointer">
            <input
              type="checkbox"
              {...register("homeVisitAvailable")}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <div className="font-semibold flex items-center gap-1.5 text-foreground">
                <Home className="h-3.5 w-3.5 text-primary" />
                Home Visits
              </div>
              <p className="text-muted-foreground">Travel to patient doorstep in Etawah</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 cursor-pointer">
            <input
              type="checkbox"
              {...register("clinicVisitAvailable")}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <div className="font-semibold flex items-center gap-1.5 text-foreground">
                <Hospital className="h-3.5 w-3.5 text-primary" />
                Clinic Consultations
              </div>
              <p className="text-muted-foreground">Receive patients at your clinic</p>
            </div>
          </label>
        </div>

        {clinicVisitAvailable && (
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="clinicAddress">Clinic Address (Etawah)</Label>
            <Input
              id="clinicAddress"
              type="text"
              placeholder="e.g. Shop 4, Civil Lines Road, Near Shastri Chauraha, Etawah"
              disabled={isLoading}
              {...register("clinicAddress")}
              className={errors.clinicAddress ? "border-destructive" : ""}
            />
            {errors.clinicAddress && (
              <p className="text-[11px] text-destructive">
                {errors.clinicAddress.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="bio">Professional Bio & Techniques</Label>
          <textarea
            id="bio"
            rows={2}
            placeholder="Describe your treatment expertise, certifications, and special therapeutic modalities..."
            disabled={isLoading}
            {...register("bio")}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Specializations */}
      <div className="space-y-2 border-t pt-4">
        <Label>Select Your Specializations</Label>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {specializations.map((spec) => {
            const isSelected = selectedSpecIds.includes(spec.id);
            return (
              <button
                type="button"
                key={spec.id}
                onClick={() => toggleSpecialization(spec.id)}
                className={`flex items-center justify-between rounded-lg border p-2.5 text-left text-xs transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-input bg-background hover:bg-muted/40 text-foreground"
                }`}
              >
                <span>{spec.name}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
        {errors.specializationIds && (
          <p className="text-[11px] text-destructive">
            {errors.specializationIds.message}
          </p>
        )}
      </div>

      {/* Passwords */}
      <div className="space-y-3 border-t pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Security Credentials
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="physio-password">Password</Label>
            <Input
              id="physio-password"
              type="password"
              placeholder="Min. 8 characters"
              disabled={isLoading}
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="physio-confirmPassword">Confirm Password</Label>
            <Input
              id="physio-confirmPassword"
              type="password"
              placeholder="Re-enter password"
              disabled={isLoading}
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-accent/40 p-3 text-[11px] text-muted-foreground">
        Note: New practitioner accounts default to <strong>Pending Verification</strong>. You will be able to upload your BPT/MPT degree and registration certificate in your dashboard before receiving patient bookings.
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Practitioner Profile...
          </>
        ) : (
          "Register as Physiotherapist"
        )}
      </Button>
    </form>
  );
}
