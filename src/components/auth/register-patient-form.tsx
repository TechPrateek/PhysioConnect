"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPatientSchema, RegisterPatientInput } from "@/features/auth/schemas";
import { registerPatientAction } from "@/actions/auth/register-patient";

export function RegisterPatientForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterPatientInput>({
    resolver: zodResolver(registerPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterPatientInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerPatientAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to register account");
        setIsLoading(false);
        return;
      }

      router.push(res.data?.redirectUrl || "/dashboard/patient");
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g. Rohit Sharma"
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
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="rohit@example.com"
            disabled={isLoading}
            {...register("email")}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-[11px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone Number (Etawah)</Label>
          <Input
            id="phone"
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
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

      <p className="text-[11px] text-muted-foreground">
        Password must be at least 8 characters with uppercase, lowercase, and numeric digits.
      </p>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Patient Account...
          </>
        ) : (
          "Create Patient Account"
        )}
      </Button>
    </form>
  );
}
