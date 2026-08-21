"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  uploadDocumentSchema,
  UploadDocumentInput,
} from "@/features/physiotherapists/schemas";
import {
  DocumentRecord,
  uploadDocumentAction,
  deleteDocumentAction,
} from "@/actions/physiotherapists/documents";
import { formatDate } from "@/lib/utils";

interface DocumentManagerProps {
  initialDocuments: DocumentRecord[];
  verificationStatus: string;
  rejectionReason: string | null;
}

export function PhysioDocumentManager({
  initialDocuments,
  verificationStatus,
  rejectionReason,
}: DocumentManagerProps) {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<DocumentRecord[]>(initialDocuments);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showUploadForm, setShowUploadForm] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UploadDocumentInput>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      documentType: "DEGREE_CERTIFICATE",
      title: "",
      fileUrl: "",
    },
  });

  // Handle file input mock reader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to S3 / Cloud Storage / Supabase Storage
      // Here we generate a clean data URL or mock file path
      const reader = new FileReader();
      reader.onload = () => {
        setValue("fileUrl", reader.result as string, { shouldValidate: true });
        setValue("fileSize", file.size);
        setValue("mimeType", file.type);
        if (!setValue.name) {
          setValue("title", file.name.replace(/\.[^/.]+$/, ""));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onUpload = async (data: UploadDocumentInput) => {
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await uploadDocumentAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to upload document");
        setIsUploading(false);
        return;
      }

      setSuccessMessage("Document uploaded successfully and submitted for admin review.");
      reset();
      setShowUploadForm(false);
      setIsUploading(false);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred during upload.");
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await deleteDocumentAction(docId);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        router.refresh();
      } else {
        alert(res.error || "Failed to delete document");
      }
    } catch (e) {
      alert("Error deleting document");
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Banner */}
      {verificationStatus === "APPROVED" && (
        <div className="flex items-start gap-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-semibold text-sm">Practitioner Profile Verified</h4>
            <p className="text-muted-foreground">
              Your credentials and certificates have been approved by Etawah platform operations. You are fully authorized to receive patient bookings.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === "PENDING" && (
        <div className="flex items-start gap-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-semibold text-sm">Verification Under Review</h4>
            <p className="text-muted-foreground">
              Our Etawah clinical operations team is reviewing your uploaded documents (BPT/MPT degree & registration). Approval usually takes less than 24 hours.
            </p>
          </div>
        </div>
      )}

      {verificationStatus === "REJECTED" && (
        <div className="flex items-start gap-3.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <ShieldAlert className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-semibold text-sm">Verification Action Required</h4>
            <p className="text-muted-foreground">
              {rejectionReason
                ? `Admin feedback: "${rejectionReason}"`
                : "One or more documents could not be verified. Please re-upload clear copies of your degree or registration certificate."}
            </p>
          </div>
        </div>
      )}

      {/* Upload button & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Practitioner Verification Documents
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload your BPT/MPT Degree, UP Medical Council / IAP Registration, and Govt ID.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showUploadForm ? "Close Upload Form" : "Upload New Document"}</span>
        </Button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <form
          onSubmit={handleSubmit(onUpload)}
          className="space-y-4 rounded-xl border bg-card p-5 shadow-sm"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            New Document Upload
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="documentType">Document Type</Label>
              <select
                id="documentType"
                disabled={isUploading}
                {...register("documentType")}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="DEGREE_CERTIFICATE">BPT / MPT Degree Certificate</option>
                <option value="MEDICAL_REGISTRATION">Medical / IAP Registration License</option>
                <option value="ID_PROOF">Govt ID Proof (Aadhaar / Voter ID)</option>
                <option value="CLINIC_PROOF">Clinic Registration / Rent Agreement</option>
                <option value="OTHER">Other Clinical Document</option>
              </select>
              {errors.documentType && (
                <p className="text-[11px] text-destructive">{errors.documentType.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Document Title / Certificate Name</Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Master of Physiotherapy (MPT) Degree"
                disabled={isUploading}
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="filePicker">Select PDF or Image File</Label>
            <div className="flex items-center gap-3">
              <Input
                id="filePicker"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isUploading}
                className="cursor-pointer text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {errors.fileUrl && (
              <p className="text-[11px] text-destructive">
                Please select a valid document file
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUploadForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-1.5 h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground text-xs space-y-2">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No documents uploaded yet</p>
            <p>
              Upload your degree and registration certificate to start receiving home and clinic bookings in Etawah.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-foreground">
                      {doc.title}
                    </h5>
                    <p className="text-[10px] text-muted-foreground">
                      Type: {doc.documentType.replace("_", " ")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Uploaded on {formatDate(doc.createdAt)}
                    </p>

                    <div className="pt-1">
                      <Badge
                        variant={
                          doc.verificationStatus === "APPROVED"
                            ? "success"
                            : doc.verificationStatus === "REJECTED"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[9px]"
                      >
                        {doc.verificationStatus}
                      </Badge>
                    </div>

                    {doc.rejectionReason && (
                      <p className="text-[10px] text-destructive pt-1">
                        Reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Delete Document"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
