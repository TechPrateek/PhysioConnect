"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
  FileText,
  Loader2,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PractitionerVerificationItem,
  reviewPractitionerAction,
} from "@/actions/admin/verification";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PractitionerVerificationQueueProps {
  initialPractitioners: PractitionerVerificationItem[];
}

export function PractitionerVerificationQueue({
  initialPractitioners,
}: PractitionerVerificationQueueProps) {
  const router = useRouter();
  const [practitioners, setPractitioners] = React.useState(initialPractitioners);
  const [filter, setFilter] = React.useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // Reject Modal State
  const [rejectingId, setRejectingId] = React.useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleReview = async (
    physiotherapistId: string,
    status: "APPROVED" | "REJECTED",
    notes?: string
  ) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await reviewPractitionerAction({
        physiotherapistId,
        status,
        verificationNotes: notes,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to update status");
        setIsSubmitting(false);
        return;
      }

      setPractitioners((prev) =>
        prev.map((p) =>
          p.id === physiotherapistId
            ? { ...p, verificationStatus: status, rejectionReason: notes || null }
            : p
        )
      );

      setRejectingId(null);
      setRejectionNotes("");
      setIsSubmitting(false);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const filtered = practitioners.filter((p) => {
    if (filter === "ALL") return true;
    return p.verificationStatus === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b pb-3 text-xs font-medium">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === tab
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab === "ALL"
              ? "All Practitioners"
              : tab === "PENDING"
              ? "Pending Review"
              : tab === "APPROVED"
              ? "Approved"
              : "Rejected"}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground text-xs space-y-2">
          <FileCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No practitioners found</p>
          <p>No verification applications match this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;

            return (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                        {p.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground">{p.fullName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {p.experienceYears} Years Clinical Experience • Etawah
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          p.verificationStatus === "APPROVED"
                            ? "success"
                            : p.verificationStatus === "REJECTED"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {p.verificationStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Contact:</span>
                      <p className="text-foreground">{p.email}</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3 text-primary" /> {p.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Specializations:</span>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {p.specializations.map((s) => (
                          <Badge key={s.id} variant="secondary" className="text-[10px]">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-muted-foreground font-semibold">Consultation Fee:</span>
                      <p className="font-bold text-foreground text-sm">
                        {formatCurrency(p.consultationFee)} / session
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.clinicAddress || "Home visits across Etawah"}
                      </p>
                    </div>
                  </div>

                  {p.rejectionReason && (
                    <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                      <span className="font-semibold">Rejection Feedback:</span> {p.rejectionReason}
                    </div>
                  )}

                  {/* Documents & Details expander */}
                  <div className="border-t pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" /> Hide Uploaded Credentials ({p.documents.length})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" /> View Uploaded Credentials ({p.documents.length})
                        </>
                      )}
                    </button>

                    {/* Admin Action Buttons */}
                    <div className="flex items-center gap-2">
                      {p.verificationStatus !== "APPROVED" && (
                        <Button
                          size="sm"
                          onClick={() => handleReview(p.id, "APPROVED")}
                          className="h-8 text-xs gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve Practitioner
                        </Button>
                      )}

                      {p.verificationStatus !== "REJECTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingId(p.id)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject with Feedback
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Documents list */}
                  {isExpanded && (
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-3 mt-2 text-xs">
                      <h5 className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        Submitted Medical & Identity Documents
                      </h5>

                      {p.documents.length === 0 ? (
                        <p className="text-muted-foreground italic">No document files uploaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {p.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="rounded-lg border bg-background p-3 flex items-start justify-between gap-2"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-semibold text-foreground truncate">{doc.title}</p>
                                <p className="text-[11px] text-muted-foreground">Type: {doc.documentType}</p>
                                <p className="text-[10px] text-muted-foreground/70">
                                  Uploaded: {formatDate(doc.createdAt)}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[9px] shrink-0">
                                {doc.verificationStatus}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Reject Practitioner Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorMessage && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="rejectionNotes">
                    Rejection Feedback (Visible to Doctor) <span className="text-destructive">*</span>
                  </Label>
                  <textarea
                    id="rejectionNotes"
                    rows={3}
                    required
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="e.g. BPT degree certificate is illegible. Please re-upload a clear scanned copy of your State Medical Council registration..."
                    className="w-full rounded-lg border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() => {
                      setRejectingId(null);
                      setRejectionNotes("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isSubmitting || !rejectionNotes.trim()}
                    onClick={() => handleReview(rejectingId, "REJECTED", rejectionNotes)}
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Rejection"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
