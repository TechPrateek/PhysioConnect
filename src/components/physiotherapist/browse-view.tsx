"use client";

import * as React from "react";
import { SearchFilters } from "@/components/physiotherapist/search-filters";
import { PhysioCard } from "@/components/physiotherapist/physio-card";
import { SpecializationItem } from "@/actions/physiotherapists/specializations";
import {
  PhysioSearchResult,
  searchPhysiotherapistsAction,
} from "@/actions/physiotherapists/discovery";
import { SearchPhysioInput } from "@/features/physiotherapists/schemas";
import { Activity, Loader2, UserX } from "lucide-react";

interface BrowseViewProps {
  initialPhysios: PhysioSearchResult[];
  specializations: SpecializationItem[];
  initialFilters: SearchPhysioInput;
}

export function BrowseView({
  initialPhysios,
  specializations,
  initialFilters,
}: BrowseViewProps) {
  const [physios, setPhysios] = React.useState<PhysioSearchResult[]>(initialPhysios);
  const [currentFilters, setCurrentFilters] = React.useState<SearchPhysioInput>(initialFilters);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFilterChange = async (newFilters: SearchPhysioInput) => {
    setCurrentFilters(newFilters);
    setIsLoading(true);

    try {
      const res = await searchPhysiotherapistsAction(newFilters);
      if (res.success && res.data) {
        setPhysios(res.data);
      }
    } catch (err) {
      console.error("Filter search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <SearchFilters
        specializations={specializations}
        currentFilters={currentFilters}
        onFilterChange={handleFilterChange}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <strong className="text-foreground">{physios.length}</strong> verified{" "}
          {physios.length === 1 ? "physiotherapist" : "physiotherapists"} in Etawah, UP
        </span>
        {isLoading && (
          <span className="flex items-center gap-1 text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating results...
          </span>
        )}
      </div>

      {/* Results Grid */}
      {physios.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground text-xs space-y-3 bg-card">
          <UserX className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h4 className="text-sm font-semibold text-foreground">
            No physiotherapists match your current filters
          </h4>
          <p className="max-w-md mx-auto leading-relaxed">
            Try resetting your filters or expanding your search to find other verified practitioners in Etawah.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {physios.map((p) => (
            <PhysioCard key={p.id} physio={p} />
          ))}
        </div>
      )}
    </div>
  );
}
