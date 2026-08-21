"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  HelpCircle,
  IndianRupee,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { verifyRazorpayPaymentAction } from "@/actions/payments/verify";
import { formatCurrency } from "@/lib/utils";
import { GlassIsland } from "@/components/ui/glass/glass-island";
import { GlassBadge } from "@/components/ui/glass/glass-badge";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  bookingNumber: string;
  doctorName: string;
  patientName: string;
  amount: number;
  razorpayOrderId: string;
}

const UPI_APPS = [
  {
    id: "gpay",
    name: "Google Pay",
    short: "GPay",
    bg: "bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/25",
    iconColor: "text-[#4285F4]",
    subtext: "Fast UPI intent",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    short: "PhonePe",
    bg: "bg-[#5f259f]/10 text-[#5f259f] dark:text-[#a855f7] border-[#5f259f]/25",
    iconColor: "text-[#5f259f] dark:text-[#a855f7]",
    subtext: "Instant UPI auto-pay",
  },
  {
    id: "paytm",
    name: "Paytm UPI",
    short: "Paytm",
    bg: "bg-[#00baf2]/10 text-[#00baf2] border-[#00baf2]/25",
    iconColor: "text-[#00baf2]",
    subtext: "Wallet & UPI",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    short: "BHIM",
    bg: "bg-[#00897b]/10 text-[#00897b] dark:text-[#2dd4bf] border-[#00897b]/25",
    iconColor: "text-[#00897b] dark:text-[#2dd4bf]",
    subtext: "NPCI Direct",
  },
  {
    id: "cred",
    name: "CRED UPI",
    short: "CRED",
    bg: "bg-slate-900/10 text-slate-900 dark:text-slate-100 border-slate-700/25",
    iconColor: "text-slate-900 dark:text-slate-100",
    subtext: "Members Pay",
  },
];

export function UpiPaymentModal({
  isOpen,
  onClose,
  bookingId,
  bookingNumber,
  doctorName,
  patientName,
  amount,
  razorpayOrderId,
}: UpiPaymentModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"UPI" | "CARD">("UPI");
  const [upiIdInput, setUpiIdInput] = React.useState("");
  const [selectedApp, setSelectedApp] = React.useState<string>("gpay");
  const [copiedUpi, setCopiedUpi] = React.useState(false);

  // Simulation Stages
  const [processingState, setProcessingState] = React.useState<
    "IDLE" | "REQUESTING_UPI" | "AWAITING_APPROVAL" | "SUCCESS" | "ERROR"
  >("IDLE");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [countdown, setCountdown] = React.useState(890); // ~14m 50s

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setProcessingState("IDLE");
      setErrorMessage(null);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTimer = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText("physioconnect.etawah@icici");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSimulatePayment = async (appName?: string) => {
    setErrorMessage(null);
    setProcessingState("REQUESTING_UPI");

    try {
      // Step 1: Connecting to UPI Intent
      await new Promise((r) => setTimeout(r, 900));
      setProcessingState("AWAITING_APPROVAL");

      // Step 2: Simulating User approving in PhonePe/GPay
      await new Promise((r) => setTimeout(r, 1400));

      const mockPaymentId = `pay_${Date.now().toString().slice(-8)}`;
      const mockSig = `mock_sig_${Date.now()}`;

      // Step 3: Verify on Backend
      const verifyRes = await verifyRazorpayPaymentAction({
        bookingId,
        razorpayOrderId: razorpayOrderId || `order_sim_${Date.now()}`,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: mockSig,
      });

      if (verifyRes.success) {
        setProcessingState("SUCCESS");
        await new Promise((r) => setTimeout(r, 1000));
        onClose();
        router.refresh();
      } else {
        setErrorMessage(verifyRes.error || "Payment verification failed.");
        setProcessingState("ERROR");
      }
    } catch (err) {
      setErrorMessage("An error occurred during payment processing.");
      setProcessingState("ERROR");
    }
  };

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={processingState === "IDLE" ? onClose : undefined}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
        />

        {/* Dynamic Glass Payment Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl glass-floating rounded-3xl p-6 sm:p-7 shadow-soft-lg max-h-[92vh] overflow-y-auto"
        >
          {/* Close button */}
          {processingState === "IDLE" && (
            <button
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Top Merchant Branding Bar */}
          <div className="flex items-center justify-between border-b border-border/60 pb-4 pr-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-700 text-primary-foreground font-black text-sm shadow-soft">
                PC
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight">
                  PhysioConnect Checkout
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Booking #{bookingNumber} • Dr. {doctorName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Total Payable
              </span>
              <span className="text-lg sm:text-xl font-black text-foreground">
                {formatCurrency(amount)}
              </span>
            </div>
          </div>

          {/* PROCESSING STATE OVERLAY */}
          {processingState !== "IDLE" && processingState !== "ERROR" && (
            <div className="py-12 text-center space-y-5">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
                {processingState === "SUCCESS" ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-soft-lg"
                  >
                    <Check className="h-10 w-10 stroke-[3]" />
                  </motion.div>
                ) : (
                  <>
                    <div className="absolute h-full w-full rounded-full bg-primary/20 animate-ping" />
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-soft">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-foreground">
                  {processingState === "REQUESTING_UPI" && "Connecting to UPI Gateway..."}
                  {processingState === "AWAITING_APPROVAL" && "Awaiting Authorization from your UPI App..."}
                  {processingState === "SUCCESS" && "Payment Confirmed Successfully! 🎉"}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  {processingState === "REQUESTING_UPI" && "Establishing 256-bit encrypted handshake with NPCI servers."}
                  {processingState === "AWAITING_APPROVAL" && "Simulating automatic bank debit approval for ₹" + amount + " to PhysioConnect."}
                  {processingState === "SUCCESS" && "Appointment locked and doctor dispatched in Etawah territory."}
                </p>
              </div>

              {processingState !== "SUCCESS" && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Do not close or refresh this window</span>
                </div>
              )}
            </div>
          )}

          {/* MAIN PAYMENT FORM */}
          {processingState === "IDLE" && (
            <div className="space-y-5 pt-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 rounded-2xl glass-subtle p-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("UPI")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "UPI"
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>UPI / QR Code (Fastest)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("CARD")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "CARD"
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Cards & NetBanking</span>
                </button>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* TAB 1: UPI APPS & SCAN QR */}
              {activeTab === "UPI" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Interactive QR Code Box */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center rounded-3xl glass-card p-4 text-center space-y-2.5 border border-primary/20 shadow-soft">
                    <div className="flex items-center justify-between w-full text-[10px] font-bold text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-cyan-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-cyan-400 animate-ping" />
                        Live UPI QR
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formattedTimer}
                      </span>
                    </div>

                    {/* Stylized QR Visual */}
                    <div
                      onClick={() => handleSimulatePayment("QR Scan")}
                      className="relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-2xl bg-white p-2 shadow-soft hover:scale-[1.02] transition-transform group"
                      title="Click QR to simulate instant scan & pay"
                    >
                      <svg
                        className="h-full w-full text-slate-900"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        {/* Realistic Mock QR Pattern */}
                        <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                        <rect x="11" y="11" width="16" height="16" fill="#ffffff" />
                        <rect x="15" y="15" width="8" height="8" fill="#0f172a" />

                        <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                        <rect x="73" y="11" width="16" height="16" fill="#ffffff" />
                        <rect x="77" y="15" width="8" height="8" fill="#0f172a" />

                        <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="4" />
                        <rect x="11" y="73" width="16" height="16" fill="#ffffff" />
                        <rect x="15" y="77" width="8" height="8" fill="#0f172a" />

                        {/* QR Matrix Dots */}
                        <circle cx="45" cy="15" r="3" fill="#0f172a" />
                        <circle cx="55" cy="15" r="3" fill="#0f172a" />
                        <circle cx="45" cy="25" r="3" fill="#0f172a" />
                        <circle cx="55" cy="25" r="3" fill="#0f172a" />
                        <circle cx="40" cy="45" r="3" fill="#0f172a" />
                        <circle cx="50" cy="45" r="4" fill="#0d9488" />
                        <circle cx="60" cy="45" r="3" fill="#0f172a" />
                        <circle cx="75" cy="45" r="3" fill="#0f172a" />
                        <circle cx="85" cy="45" r="3" fill="#0f172a" />
                        <circle cx="45" cy="65" r="3" fill="#0f172a" />
                        <circle cx="55" cy="65" r="3" fill="#0f172a" />
                        <circle cx="65" cy="75" r="3" fill="#0f172a" />
                        <circle cx="80" cy="75" r="3" fill="#0f172a" />
                        <circle cx="75" cy="85" r="3" fill="#0f172a" />
                        <circle cx="85" cy="85" r="3" fill="#0f172a" />
                        <circle cx="45" cy="85" r="3" fill="#0f172a" />
                        <circle cx="55" cy="85" r="3" fill="#0f172a" />
                      </svg>

                      {/* Center UPI Pill */}
                      <div className="absolute rounded-lg bg-emerald-600 text-[9px] font-black text-white px-2 py-0.5 shadow-sm">
                        UPI
                      </div>

                      {/* Scan Overlay on Hover */}
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[11px] font-black text-primary bg-white/90">
                        ⚡ Click to Scan
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Scan with any UPI app on your phone
                    </p>
                  </div>

                  {/* Right Column: UPI Apps 1-Click Selectors */}
                  <div className="md:col-span-7 space-y-3">
                    <span className="text-[11px] font-bold text-foreground block uppercase tracking-wider">
                      Pay Directly with UPI App:
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      {UPI_APPS.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handleSimulatePayment(app.name)}
                          className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] glass-subtle hover:border-primary/50 group`}
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs ${app.bg}`}
                          >
                            {app.short.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {app.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground truncate">
                              {app.subtext}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Or Manual UPI ID */}
                    <div className="pt-2 border-t border-border/60 space-y-2">
                      <Label className="text-[11px] font-bold text-foreground">
                        Or enter UPI ID / VPA
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. yourname@okaxis, 9876543210@paytm"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          className="h-10 text-xs rounded-xl glass-subtle"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSimulatePayment("UPI ID")}
                          className="rounded-xl px-4 text-xs font-bold shrink-0 h-10 shadow-soft"
                        >
                          Verify & Pay
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CARDS & NETBANKING */}
              {activeTab === "CARD" && (
                <div className="space-y-4 pt-1">
                  <div className="rounded-2xl glass-card p-4 space-y-3 border border-border/60">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span>Debit / Credit Card</span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span>Visa</span> • <span>Mastercard</span> • <span>RuPay</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <Input
                        defaultValue="4111 2222 3333 4242"
                        placeholder="Card Number"
                        className="h-10 text-xs rounded-xl glass-subtle font-mono"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          defaultValue="12/28"
                          placeholder="MM/YY"
                          className="h-10 text-xs rounded-xl glass-subtle"
                        />
                        <Input
                          defaultValue="892"
                          type="password"
                          placeholder="CVV"
                          className="h-10 text-xs rounded-xl glass-subtle"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSimulatePayment("Card")}
                    className="w-full h-11 rounded-2xl text-xs font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                  >
                    Pay {formatCurrency(amount)} via Card
                  </Button>
                </div>
              )}

              {/* Bottom Security Seals */}
              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[10px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-cyan-400" />
                  256-Bit Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  NPCI UPI Verified
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  {copiedUpi ? "Copied UPI ID!" : "Copy VPA"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return mounted && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
