import { Suspense } from "react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">New Password</CardTitle>
            <CardDescription>
              Create a secure password for your PhysioConnect account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-center text-xs text-muted-foreground py-4">Loading form...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
