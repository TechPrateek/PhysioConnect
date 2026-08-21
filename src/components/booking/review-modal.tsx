"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitReviewAction } from "@/actions/reviews/submit";
import { GlassIsland } from "@/components/ui/glass/glass-island";

interface ReviewModalProps {
  bookingId: string;
  doctorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewModal({
  bookingId,
  doctorName,
  isOpen,
  onClose,
}: ReviewModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await submitReviewAction({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to submit review");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onClose();
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
      <GlassIsland level={3} className="relative w-full max-w-md p-6 sm:p-8 shadow-soft-lg space-y-5">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-white/40 dark:hover:bg-white/10 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-black text-foreground">Rate Your Physiotherapy Session</h3>
          <p className="text-xs text-muted-foreground">
            Share your feedback for Dr. {doctorName} to help other patients in Etawah.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Star Rating Selector */}
          <div className="flex flex-col items-center justify-center space-y-2 rounded-2xl glass-subtle p-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Overall Experience
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {rating === 5
                ? "Excellent (5 Stars)"
                : rating === 4
                ? "Good (4 Stars)"
                : rating === 3
                ? "Average (3 Stars)"
                : rating === 2
                ? "Poor (2 Stars)"
                : "Terrible (1 Star)"}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reviewComment" className="text-xs font-bold text-foreground">
              Written Feedback (Optional)
            </Label>
            <textarea
              id="reviewComment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the physiotherapist's punctuality, treatment technique, and pain relief..."
              className="w-full rounded-2xl border border-input glass-subtle p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-2xl text-xs h-10 glass-subtle font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-2xl text-xs h-10 font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Verified Review</span>
              )}
            </Button>
          </div>
        </form>
      </GlassIsland>
    </div>
  );

  return mounted && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
