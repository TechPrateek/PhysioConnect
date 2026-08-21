import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getRedirectForRole } from "@/lib/permissions";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectForRole(user.role));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to PhysioConnect
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2 shadow-sm">
              <Activity className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your PhysioConnect account (Etawah)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />

            <div className="text-center text-xs text-muted-foreground pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Sign up as Patient
              </Link>
              {" · "}
              <Link
                href="/register?role=physiotherapist"
                className="font-semibold text-primary hover:underline"
              >
                Join as Practitioner
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
