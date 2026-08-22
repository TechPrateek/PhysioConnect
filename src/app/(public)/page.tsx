import Link from "next/link";
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  HeartPulse,
  Home,
  Hospital,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section with Glass Islands */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full glass-subtle px-3.5 sm:px-4 py-1 text-[11px] sm:text-xs font-bold text-primary shadow-xs max-w-full">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Pan-India Healthcare • Pilot Live in Etawah, UP</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                Expert Physiotherapy at Your{" "}
                <span className="text-primary underline decoration-primary/30 underline-offset-8">
                  Doorstep
                </span>{" "}
                or Nearby Clinic.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Connect with verified, licensed BPT/MPT physiotherapists.
                Personalized pain relief, orthopedic rehab, and post-surgery care
                delivered with clinical excellence across India (currently active in pilot territory Etawah).
              </p>

              <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center pt-2">
                <Link href="/browse">
                  <Button
                    size="lg"
                    className="w-full text-sm font-bold sm:w-auto h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft-md gap-2 transition-transform hover:scale-[1.02]"
                  >
                    <Zap className="h-4 w-4 fill-current text-amber-300" />
                    <span>Book a Physiotherapist</span>
                  </Button>
                </Link>
                <Link href="/register?role=physiotherapist">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-sm font-bold sm:w-auto h-12 px-6 rounded-2xl glass-subtle hover:bg-white/80 dark:hover:bg-slate-800 transition-all"
                  >
                    Join as a Doctor
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-cyan-400" />
                  <span>Admin-Verified BPT/MPT</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Home & Clinic Visits</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Zero Hidden Fees</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <GlassIsland level={4} glow="teal" className="p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h3 className="font-black text-base text-foreground">
                      Instant Care in India
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      Pilot Active: Friends Colony • Civil Lines • Ashok Nagar • Vijay Nagar
                    </p>
                  </div>
                  <GlassBadge variant="success">Pilot Active</GlassBadge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center rounded-2xl glass-subtle p-4 text-center space-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Home className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Home Visit</span>
                    <span className="text-[10px] text-muted-foreground">
                      Doctor comes to you
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl glass-subtle p-4 text-center space-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-cyan-400">
                      <Hospital className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Clinic Visit</span>
                    <span className="text-[10px] text-muted-foreground">
                      Walk into local clinic
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl glass-subtle p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/10 text-primary font-black text-sm border border-primary/20 shadow-soft">
                      AS
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          Dr. Amit Sharma (MPT)
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-300 font-bold">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          4.9
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Orthopedic & Spine Specialist • 8+ yrs
                      </p>
                    </div>
                  </div>
                </div>

                <Link href="/browse" className="block w-full">
                  <Button className="w-full rounded-2xl h-11 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                    Browse Verified Doctors &rarr;
                  </Button>
                </Link>
              </GlassIsland>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Section */}
      <section id="specializations" className="border-t border-border/60 py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Clinical Expertise
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Specialized Physiotherapy Care
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Our verified doctors treat a comprehensive range of conditions with evidence-based protocols across India.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-10">
            {[
              {
                title: "Orthopedic & Joint Care",
                desc: "Relief for chronic back pain, slip disc, cervical spondylosis, and knee arthritis.",
                icon: "🦴",
              },
              {
                title: "Neurological Rehabilitation",
                desc: "Specialized therapy for stroke recovery, Parkinson's, paralysis, and spinal injuries.",
                icon: "🧠",
              },
              {
                title: "Sports & Musculoskeletal",
                desc: "Fast recovery for ligament sprains, muscle tears, frozen shoulder, and tennis elbow.",
                icon: "⚡",
              },
              {
                title: "Post-Surgery Recovery",
                desc: "Rehabilitation following total knee/hip replacements and fracture surgeries.",
                icon: "🏥",
              },
              {
                title: "Geriatric & Mobility Care",
                desc: "Gentle balance training, fall prevention, and mobility restoration for elders.",
                icon: "🚶",
              },
              {
                title: "Pediatric Physical Therapy",
                desc: "Developmental milestone support and postural correction for children.",
                icon: "👶",
              },
            ].map((item) => (
              <GlassIsland
                key={item.title}
                level={2}
                interactive
                className="p-6 space-y-3"
              >
                <div className="text-3xl">{item.icon}</div>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </GlassIsland>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-border/60 py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              Simple 3-Step Journey
            </span>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              How PhysioConnect Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Book doorstep relief in under 60 seconds with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 pt-10">
            {[
              {
                step: "01",
                title: "Request or Select Doctor",
                desc: "Choose instant on-demand matching or browse verified doctors by rating, city, and consultation fee.",
              },
              {
                step: "02",
                title: "Home Visit or Clinic Visit",
                desc: "Doctor arrives at your doorstep address or welcomes you at their verified clinic.",
              },
              {
                step: "03",
                title: "Recover & Pay Securely",
                desc: "Receive customized therapy and pay securely via UPI, Card, or NetBanking through Razorpay.",
              },
            ].map((step) => (
              <GlassIsland key={step.step} level={2} className="p-6 space-y-3 relative">
                <span className="text-4xl font-black text-primary/20">{step.step}</span>
                <h3 className="text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </GlassIsland>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
