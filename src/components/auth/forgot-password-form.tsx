"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/features/auth/schemas";
import { forgotPasswordAction } from "@/actions/auth/password-reset";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await forgotPasswordAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to process request");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        res.data?.message ||
          "If an account exists with this email, you will receive password reset instructions."
      );
      setIsLoading(false);
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {successMessage ? (
        <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-200">
            Check Your Email
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {successMessage}
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Registered Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading}
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
