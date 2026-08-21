"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Home, Hospital, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updatePhysioProfileSchema,
  UpdatePhysioProfileInput,
} from "@/features/physiotherapists/schemas";
import {
  PhysiotherapistProfileData,
  updatePhysiotherapistProfileAction,
} from "@/actions/physiotherapists/profile";
import { SpecializationItem } from "@/actions/physiotherapists/specializations";

interface ProfileEditorProps {
  initialData: PhysiotherapistProfileData;
  availableSpecializations: SpecializationItem[];
}

export function PhysioProfileEditor({
  initialData,
  availableSpecializations,
}: ProfileEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdatePhysioProfileInput>({
    resolver: zodResolver(updatePhysioProfileSchema),
    defaultValues: {
      fullName: initialData.fullName,
      phone: initialData.phone,
      experienceYears: initialData.experienceYears,
      consultationFee: initialData.consultationFee,
      clinicAddress: initialData.clinicAddress || "",
      homeVisitAvailable: initialData.homeVisitAvailable,
      clinicVisitAvailable: initialData.clinicVisitAvailable,
      bio: initialData.bio || "",
      languages: initialData.languages.length > 0 ? initialData.languages : ["Hindi", "English"],
      specializationIds: initialData.specializations.map((s) => s.id),
    },
  });

  const clinicVisitAvailable = watch("clinicVisitAvailable");
  const selectedSpecIds = watch("specializationIds") || [];

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

  const onSubmit = async (data: UpdatePhysioProfileInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updatePhysiotherapistProfileAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update profile");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Your practitioner profile has been successfully saved.");
      setIsLoading(false);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
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

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Practitioner Details */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">
          Practitioner Details & Qualifications
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name with Qualifications</Label>
            <Input
              id="fullName"
              type="text"
              disabled={isLoading}
              {...register("fullName")}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-[11px] text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Contact Number (Etawah)</Label>
            <Input
              id="phone"
              type="tel"
              disabled={isLoading}
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-[11px] text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="experienceYears">Years of Clinical Experience</Label>
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

        <div className="space-y-1.5">
          <Label htmlFor="bio">Professional Bio & Treatment Approach</Label>
          <textarea
            id="bio"
            rows={3}
            disabled={isLoading}
            {...register("bio")}
            placeholder="Share your specialization, certifications, degrees, and rehabilitation methodologies..."
            className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.bio && (
            <p className="text-[11px] text-destructive">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Appointment Modes in Etawah */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">
          Appointment Types in Etawah
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 cursor-pointer">
            <input
              type="checkbox"
              {...register("homeVisitAvailable")}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
            <div className="text-xs">
              <div className="font-semibold flex items-center gap-1.5 text-foreground">
                <Home className="h-3.5 w-3.5 text-primary" />
                Home Visit Consultations
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
            <Label htmlFor="clinicAddress">Clinic Location (Etawah Address)</Label>
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
      </div>

      {/* Clinical Specializations */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">
          Specializations
        </h3>
        <p className="text-xs text-muted-foreground">
          Select all clinical areas relevant to your practice so patients in Etawah can discover you easily.
        </p>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 pt-2">
          {availableSpecializations.map((spec) => {
            const isSelected = selectedSpecIds.includes(spec.id);
            return (
              <button
                type="button"
                key={spec.id}
                onClick={() => toggleSpecialization(spec.id)}
                className={`flex items-center justify-between rounded-lg border p-3 text-left text-xs transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
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

      <div className="flex justify-end">
        <Button type="submit" size="lg" className="gap-2 shadow-sm" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
