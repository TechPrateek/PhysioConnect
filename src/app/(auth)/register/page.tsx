import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowLeft, HeartPulse, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterPatientForm } from "@/components/auth/register-patient-form";
import { RegisterPhysioForm } from "@/components/auth/register-physio-form";
import { getCurrentUser } from "@/lib/auth/session";
import { getRedirectForRole } from "@/lib/permissions";

interface RegisterPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function RegisterPage(props: RegisterPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect(getRedirectForRole(user.role));
  }

  const searchParams = await props.searchParams;
  const isPhysio = searchParams.role === "physiotherapist";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className={`w-full ${isPhysio ? "max-w-xl" : "max-w-md"} space-y-6 transition-all`}>
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
            <CardTitle className="text-2xl font-bold">
              {isPhysio ? "Practitioner Registration" : "Create Patient Account"}
            </CardTitle>
            <CardDescription>
              {isPhysio
                ? "Join Etawah's verified physiotherapy network"
                : "Book certified home visits and clinic appointments across Etawah"}
            </CardDescription>

            {/* Role switcher tabs */}
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 pt-2 mt-4 text-xs font-medium">
              <Link
                href="/register"
                className={`rounded-md py-2 text-center transition-all ${
                  !isPhysio
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I am a Patient
              </Link>
              <Link
                href="/register?role=physiotherapist"
                className={`rounded-md py-2 text-center transition-all ${
                  isPhysio
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                I am a Physiotherapist
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPhysio ? <RegisterPhysioForm /> : <RegisterPatientForm />}

            <div className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
