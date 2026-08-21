"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Lock, QrCode, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRazorpayOrderAction, RazorpayOrderData } from "@/actions/payments/order";
import { verifyRazorpayPaymentAction } from "@/actions/payments/verify";
import { formatCurrency } from "@/lib/utils";
import { UpiPaymentModal } from "@/components/booking/upi-payment-modal";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface RazorpayCheckoutButtonProps {
  bookingId: string;
  amount: number;
  bookingNumber: string;
}

export function RazorpayCheckoutButton({
  bookingId,
  amount,
  bookingNumber,
}: RazorpayCheckoutButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showUpiModal, setShowUpiModal] = React.useState(false);
  const [orderInfo, setOrderInfo] = React.useState<RazorpayOrderData | null>(null);

  // Dynamically load Razorpay SDK for live mode
  const loadRazorpaySdk = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create order on server
      const orderRes = await createRazorpayOrderAction({ bookingId });
      if (!orderRes.success || !orderRes.data) {
        setErrorMessage(orderRes.error || "Failed to create payment order.");
        setIsProcessing(false);
        return;
      }

      const orderData = orderRes.data;
      setOrderInfo(orderData);

      const isPlaceholderKey =
        !orderData.keyId ||
        orderData.keyId.includes("mock") ||
        orderData.keyId === "rzp_test_mock_physio_connect";

      // 2. If using sandbox/mock key, open the realistic UPI & QR Checkout Modal
      if (isPlaceholderKey) {
        setIsProcessing(false);
        setShowUpiModal(true);
        return;
      }

      // 3. For live/test Razorpay API keys, load official Razorpay SDK popup
      const sdkLoaded = await loadRazorpaySdk();

      if (!sdkLoaded || !window.Razorpay) {
        setErrorMessage("Could not load Razorpay gateway. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PhysioConnect (Etawah)",
        description: `Physiotherapy Session #${orderData.bookingNumber}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.patientName,
          email: orderData.patientEmail,
          contact: orderData.patientPhone,
        },
        theme: {
          color: "#0d9488",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await verifyRazorpayPaymentAction({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              router.refresh();
            } else {
              setErrorMessage(verifyRes.error || "Payment verification failed.");
              setIsProcessing(false);
            }
          } catch (err) {
            setErrorMessage("Error verifying payment signature.");
            setIsProcessing(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected payment error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="space-y-2.5">
        {errorMessage && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <Button
          onClick={handlePayNow}
          disabled={isProcessing}
          className="w-full h-12 rounded-2xl text-xs sm:text-sm font-black gap-2 shadow-soft-md bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-[1.01]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opening Secure UPI Gateway...</span>
            </>
          ) : (
            <>
              <QrCode className="h-4 w-4" />
              <span>Pay {formatCurrency(amount)} via UPI / QR / Card</span>
            </>
          )}
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            GPay • PhonePe • Paytm • BHIM
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-cyan-400" />
            256-Bit NPCI Secured
          </span>
        </div>
      </div>

      {orderInfo && (
        <UpiPaymentModal
          isOpen={showUpiModal}
          onClose={() => setShowUpiModal(false)}
          bookingId={bookingId}
          bookingNumber={bookingNumber}
          doctorName={orderInfo.doctorName}
          patientName={orderInfo.patientName}
          amount={amount}
          razorpayOrderId={orderInfo.orderId}
        />
      )}
    </>
  );
}
