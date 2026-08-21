import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Home,
  Hospital,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingSlotPicker } from "@/components/physiotherapist/booking-slot-picker";
import { getPhysiotherapistDetailsAction } from "@/actions/physiotherapists/discovery";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

interface PhysioDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PhysiotherapistDetailPage(props: PhysioDetailPageProps) {
  const { id } = await props.params;
  const res = await getPhysiotherapistDetailsAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const physio = res.data;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to all physiotherapists in Etawah
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Doctor Profile & Reviews */}
          <div className="space-y-6 lg:col-span-7">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl">
                    {physio.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {physio.fullName}
                      </h1>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{physio.averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground font-normal">
                          ({physio.totalReviews} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 text-foreground font-medium">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        {physio.experienceYears} Years Clinical Experience
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Etawah, Uttar Pradesh
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Admin-Verified BPT/MPT Qualifications</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {physio.bio && (
                  <div className="border-t pt-4 space-y-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      About Doctor
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {physio.bio}
                    </p>
                  </div>
                )}

                {/* Specializations */}
                <div className="border-t pt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Clinical Specializations
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {physio.specializations.map((spec) => (
                      <Badge
                        key={spec.id}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-medium"
                      >
                        {spec.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Practice & Visit Details */}
                <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border p-3.5 space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-primary" /> Home Visit Consultations
                    </span>
                    <p className="font-semibold text-foreground">
                      {physio.homeVisitAvailable
                        ? "Available across Etawah"
                        : "Not Available"}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3.5 space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Hospital className="h-3.5 w-3.5 text-primary" /> Clinic Visit
                    </span>
                    <p className="font-semibold text-foreground truncate">
                      {physio.clinicVisitAvailable
                        ? physio.clinicAddress || "Available at Clinic"
                        : "Home visits only"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Verified Patient Reviews</CardTitle>
                    <CardDescription>
                      Feedback from completed physiotherapy sessions in Etawah
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>{physio.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {physio.recentReviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
                    <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground/40 mb-2" />
                    <p>No written patient reviews yet. Be the first to book and review Dr. {physio.fullName.split(" ")[1] || physio.fullName}!</p>
                  </div>
                ) : (
                  physio.recentReviews.map((rev) => (
                    <div key={rev.id} className="border-b last:border-0 pb-4 last:pb-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{rev.patientName}</span>
                        <div className="flex items-center gap-1 text-amber-600">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/70">
                        Verified Consultation • {formatDate(rev.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Slot Picker & Booking Widget */}
          <div className="lg:col-span-5 space-y-6">
            <BookingSlotPicker
              physiotherapistId={physio.id}
              consultationFee={physio.consultationFee}
              homeVisitAvailable={physio.homeVisitAvailable}
              clinicVisitAvailable={physio.clinicVisitAvailable}
              clinicAddress={physio.clinicAddress}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
