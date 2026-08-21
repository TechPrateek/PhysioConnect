"use client";

import * as React from "react";
import { Filter, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpecializationItem } from "@/actions/physiotherapists/specializations";
import { SearchPhysioInput } from "@/features/physiotherapists/schemas";
import { GlassIsland } from "@/components/ui/glass/glass-island";

interface SearchFiltersProps {
  specializations: SpecializationItem[];
  currentFilters: SearchPhysioInput;
  onFilterChange: (filters: SearchPhysioInput) => void;
}

export function SearchFilters({
  specializations,
  currentFilters,
  onFilterChange,
}: SearchFiltersProps) {
  const [query, setQuery] = React.useState(currentFilters.query || "");
  const [selectedSpec, setSelectedSpec] = React.useState(currentFilters.specialization || "all");
  const [visitType, setVisitType] = React.useState<"ALL" | "HOME_VISIT" | "CLINIC_VISIT">(
    currentFilters.visitType || "ALL"
  );
  const [sortBy, setSortBy] = React.useState<"rating" | "experience" | "fee_asc" | "fee_desc">(
    currentFilters.sortBy || "rating"
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      query,
      specialization: selectedSpec,
      visitType,
      sortBy,
    });
  };

  const handleSpecChange = (spec: string) => {
    setSelectedSpec(spec);
    onFilterChange({
      query,
      specialization: spec,
      visitType,
      sortBy,
    });
  };

  const handleVisitTypeChange = (type: "ALL" | "HOME_VISIT" | "CLINIC_VISIT") => {
    setVisitType(type);
    onFilterChange({
      query,
      specialization: selectedSpec,
      visitType: type,
      sortBy,
    });
  };

  const handleSortChange = (sort: "rating" | "experience" | "fee_asc" | "fee_desc") => {
    setSortBy(sort);
    onFilterChange({
      query,
      specialization: selectedSpec,
      visitType,
      sortBy: sort,
    });
  };

  const handleReset = () => {
    setQuery("");
    setSelectedSpec("all");
    setVisitType("ALL");
    setSortBy("rating");
    onFilterChange({
      query: "",
      specialization: "all",
      visitType: "ALL",
      sortBy: "rating",
    });
  };

  const hasActiveFilters =
    query.trim().length > 0 ||
    selectedSpec !== "all" ||
    visitType !== "ALL" ||
    sortBy !== "rating";

  return (
    <GlassIsland level={2} className="p-5 sm:p-7 space-y-4 shadow-soft-md">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search doctor by name, complaint (e.g. back pain, knee rehab, cervical, stroke)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-xs h-11 rounded-2xl glass-subtle border-border focus-visible:ring-primary font-medium"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="px-6 h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-soft hover:scale-[1.02] transition-transform"
        >
          Search
        </Button>
      </form>

      {/* Filter Row: Visit Type & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Visit Type Buttons */}
        <div className="flex items-center rounded-2xl glass-subtle p-1 text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => handleVisitTypeChange("ALL")}
            className={`rounded-xl px-3.5 py-1.5 transition-all ${
              visitType === "ALL"
                ? "bg-primary text-primary-foreground shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            All Visits
          </button>
          <button
            type="button"
            onClick={() => handleVisitTypeChange("HOME_VISIT")}
            className={`rounded-xl px-3.5 py-1.5 transition-all ${
              visitType === "HOME_VISIT"
                ? "bg-primary text-primary-foreground shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            Home Visits Only
          </button>
          <button
            type="button"
            onClick={() => handleVisitTypeChange("CLINIC_VISIT")}
            className={`rounded-xl px-3.5 py-1.5 transition-all ${
              visitType === "CLINIC_VISIT"
                ? "bg-primary text-primary-foreground shadow-soft font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
            }`}
          >
            Clinic Consultations
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 font-semibold">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="h-9 rounded-xl border border-input glass-subtle px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="rating">Top Rated (★)</option>
            <option value="experience">Most Experienced</option>
            <option value="fee_asc">Fee: Low to High</option>
            <option value="fee_desc">Fee: High to Low</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-3 text-xs font-bold text-muted-foreground hover:text-foreground gap-1 rounded-xl"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Specialization Tags Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 border-t border-border/60">
        <button
          type="button"
          onClick={() => handleSpecChange("all")}
          className={`shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
            selectedSpec === "all"
              ? "bg-primary text-primary-foreground shadow-soft font-bold"
              : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-white/40"
          }`}
        >
          All Specializations
        </button>

        {specializations.map((spec) => {
          const isSelected = selectedSpec === spec.slug || selectedSpec === spec.id;
          return (
            <button
              type="button"
              key={spec.id}
              onClick={() => handleSpecChange(spec.slug)}
              className={`shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-soft font-bold"
                  : "glass-subtle text-muted-foreground hover:text-foreground hover:bg-white/40"
              }`}
            >
              {spec.name}
            </button>
          );
        })}
      </div>
    </GlassIsland>
  );
}
