"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, LoginInput } from "@/features/auth/schemas";
import { loginAction } from "@/actions/auth/login";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleQuickFill = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setErrorMessage(null);
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      const destination = callbackUrl || res.data?.redirectUrl || "/";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1-Click Demo Accounts Quick-Fill Panel */}
      <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-2">
        <div className="flex items-center justify-between font-semibold text-foreground">
          <span className="flex items-center gap-1.5 text-primary">
            <KeyRound className="h-3.5 w-3.5" />
            Quick Demo Accounts (Click to Fill)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => handleQuickFill("admin@physioconnect.in", "Admin@Etawah2026")}
            className="flex flex-col items-center justify-center p-2 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/50 text-[11px] transition-all text-center"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-600 mb-0.5" />
            <span className="font-bold text-foreground">Admin</span>
            <span className="text-[9px] text-muted-foreground truncate w-full">admin@...</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("dr.amit.sharma@physioconnect.in", "Physio@Etawah2026")}
            className="flex flex-col items-center justify-center p-2 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/50 text-[11px] transition-all text-center"
          >
            <Stethoscope className="h-3.5 w-3.5 text-emerald-600 mb-0.5" />
            <span className="font-bold text-foreground">Doctor</span>
            <span className="text-[9px] text-muted-foreground truncate w-full">dr.amit@...</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill("patient.rohit@physioconnect.in", "Patient@Etawah2026")}
            className="flex flex-col items-center justify-center p-2 rounded-lg border bg-background hover:bg-primary/5 hover:border-primary/50 text-[11px] transition-all text-center"
          >
            <User className="h-3.5 w-3.5 text-blue-600 mb-0.5" />
            <span className="font-bold text-foreground">Patient</span>
            <span className="text-[9px] text-muted-foreground truncate w-full">patient.rohit@...</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="e.g. rohit@example.com"
              disabled={isLoading}
              {...register("email")}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("password")}
            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.password && (
            <p className="text-[11px] text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rememberMe"
            {...register("rememberMe")}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer">
            Remember this device for 30 days
          </label>
        </div>

        <Button type="submit" className="w-full shadow-sm" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
