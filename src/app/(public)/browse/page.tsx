import { Metadata } from "next";
import { BrowseView } from "@/components/physiotherapist/browse-view";
import {
  searchPhysiotherapistsAction,
} from "@/actions/physiotherapists/discovery";
import { getSpecializationsAction } from "@/actions/physiotherapists/specializations";
import { SearchPhysioInput } from "@/features/physiotherapists/schemas";

export const metadata: Metadata = {
  title: "Browse Verified Physiotherapists in Etawah | PhysioConnect",
  description:
    "Find and book verified BPT/MPT physiotherapists in Etawah for certified home visits and clinic consultations.",
};

interface BrowsePageProps {
  searchParams: Promise<{
    query?: string;
    specialization?: string;
    visitType?: "ALL" | "HOME_VISIT" | "CLINIC_VISIT";
    maxFee?: string;
    sortBy?: "rating" | "experience" | "fee_asc" | "fee_desc";
  }>;
}

export default async function BrowsePage(props: BrowsePageProps) {
  const searchParams = await props.searchParams;

  const filters: SearchPhysioInput = {
    query: searchParams.query,
    specialization: searchParams.specialization || "all",
    visitType: searchParams.visitType || "ALL",
    maxFee: searchParams.maxFee ? parseInt(searchParams.maxFee, 10) : undefined,
    sortBy: searchParams.sortBy || "rating",
  };

  const [physiosRes, specsRes] = await Promise.all([
    searchPhysiotherapistsAction(filters),
    getSpecializationsAction(),
  ]);

  return (
    <div className="min-h-screen bg-muted/20 py-4 sm:py-10">
      <div className="container mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[11px] sm:text-xs font-semibold text-primary mb-1.5">
            <span>Etawah Territory Directory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Book Verified Physiotherapists in Etawah
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Choose certified practitioners for home visits or nearby clinic consultations in Friends Colony, Civil Lines, Ashok Nagar, and surrounding areas.
          </p>
        </div>

        <BrowseView
          initialPhysios={physiosRes.data || []}
          specializations={specsRes.data || []}
          initialFilters={filters}
        />
      </div>
    </div>
  );
}
