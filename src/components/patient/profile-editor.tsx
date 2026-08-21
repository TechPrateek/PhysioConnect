"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, HeartPulse, Loader2, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updatePatientProfileSchema,
  UpdatePatientProfileInput,
} from "@/features/patients/schemas";
import {
  PatientProfileData,
  updatePatientProfileAction,
} from "@/actions/patients/profile";

interface PatientProfileEditorProps {
  initialData: PatientProfileData;
}

export function PatientProfileEditor({ initialData }: PatientProfileEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePatientProfileInput>({
    resolver: zodResolver(updatePatientProfileSchema),
    defaultValues: {
      fullName: initialData.fullName,
      phone: initialData.phone,
      gender: (initialData.gender as any) || undefined,
      dateOfBirth: initialData.dateOfBirth || "",
      emergencyContact: initialData.emergencyContact || "",
      medicalHistory: initialData.medicalHistory || "",
    },
  });

  const onSubmit = async (data: UpdatePatientProfileInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await updatePatientProfileAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update profile");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Your profile and clinical notes have been saved.");
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

      {/* Personal Information */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name</Label>
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
            <Label htmlFor="phone">Phone Number (Etawah)</Label>
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
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              disabled={isLoading}
              {...register("gender")}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              disabled={isLoading}
              {...register("dateOfBirth")}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="emergencyContact">Emergency Contact (Name & Phone)</Label>
          <Input
            id="emergencyContact"
            type="text"
            placeholder="e.g. Ramesh Tripathi (+91 98765 43210)"
            disabled={isLoading}
            {...register("emergencyContact")}
          />
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Medical History & Rehabilitation Notes
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Provide notes about any past surgeries, joint conditions, slip disc, arthritis, or chronic pain to assist your visiting physiotherapist.
        </p>

        <div className="space-y-1.5">
          <textarea
            id="medicalHistory"
            rows={3}
            disabled={isLoading}
            {...register("medicalHistory")}
            placeholder="e.g. Mild lower back pain and stiffness for 6 months. Had right knee arthroscopy in 2024..."
            className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.medicalHistory && (
            <p className="text-[11px] text-destructive">
              {errors.medicalHistory.message}
            </p>
          )}
        </div>
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
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
