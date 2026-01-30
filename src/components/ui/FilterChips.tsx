"use client";

import { FilterDropdowns } from "./FilterDropdowns";
import { useRef } from "react";

export function FilterChips({
  filters,
  flights,
  onFilterClick,
  onFilterChange,
  onClearFilter,
  onReset,
  activeFilterType,
  t,
}: FilterChipsProps) {
  const stopsRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const airlinesRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters =
    filters.stops !== null ||
    filters.priceRange !== null ||
    filters.airlines.length > 0;

  const stopsLabel =
    filters.stops === null
      ? t?.stops ?? "Stops"
      : filters.stops === 0
        ? t?.nonstop ?? "Nonstop"
        : filters.stops === 1
          ? `1 ${t?.stop ?? "stop"}`
          : `2+ ${t?.stopsPlural ?? "stops"}`;

  const priceLabel = (() => {
    if (!filters.priceRange) return t?.price ?? "Price";
    const [, max] = filters.priceRange;
    return `Up to $${Math.round(max)}`;
  })();

  const airlinesLabel =
    filters.airlines.length > 0
      ? `${t?.airlines ?? "Airlines"} (${filters.airlines.length})`
      : t?.airlines ?? "Airlines";

  const handleFilterClick = (filterType: "stops" | "price" | "airlines") => {
    if (activeFilterType === filterType) {
      onFilterClick(null);
    } else {
      onFilterClick(filterType);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-4">
      <div className="flex flex-wrap items-center gap-2 relative">
        <div ref={stopsRef} className="relative">
          <button
            type="button"
            onClick={() => handleFilterClick("stops")}
            className={`h-9 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
              filters.stops !== null
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : activeFilterType === "stops"
                  ? "bg-blue-50 text-blue-700 border-2 border-blue-500"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            } ${filters.stops !== null ? "pl-4 pr-2" : "px-4"}`}
          >
            <span>{stopsLabel} ▾</span>
            {filters.stops !== null ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearFilter("stops");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onClearFilter("stops");
                  }
                }}
                className="h-6 w-6 rounded-full inline-flex items-center justify-center hover:bg-blue-200/70 transition-colors"
                aria-label="Clear stops filter"
              >
                ×
              </span>
            ) : null}
          </button>
          {activeFilterType === "stops" && (
            <FilterDropdowns
              flights={flights}
              filters={filters}
              onFilterChange={onFilterChange}
              activeFilterType="stops"
              onClose={() => onFilterClick(null)}
              t={t}
            />
          )}
        </div>

        <div ref={priceRef} className="relative">
          <button
            type="button"
            onClick={() => handleFilterClick("price")}
            className={`h-9 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
              filters.priceRange !== null
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : activeFilterType === "price"
                  ? "bg-blue-50 text-blue-700 border-2 border-blue-500"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            } ${filters.priceRange !== null ? "pl-4 pr-2" : "px-4"}`}
          >
            <span>{priceLabel} ▾</span>
            {filters.priceRange !== null ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearFilter("price");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onClearFilter("price");
                  }
                }}
                className="h-6 w-6 rounded-full inline-flex items-center justify-center hover:bg-blue-200/70 transition-colors"
                aria-label="Clear price filter"
              >
                ×
              </span>
            ) : null}
          </button>
          {activeFilterType === "price" && (
            <FilterDropdowns
              flights={flights}
              filters={filters}
              onFilterChange={onFilterChange}
              activeFilterType="price"
              onClose={() => onFilterClick(null)}
              t={t}
            />
          )}
        </div>

        <div ref={airlinesRef} className="relative">
          <button
            type="button"
            onClick={() => handleFilterClick("airlines")}
            className={`h-9 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
              filters.airlines.length > 0
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : activeFilterType === "airlines"
                  ? "bg-blue-50 text-blue-700 border-2 border-blue-500"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            } ${filters.airlines.length > 0 ? "pl-4 pr-2" : "px-4"}`}
          >
            <span>{airlinesLabel} ▾</span>
            {filters.airlines.length > 0 ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClearFilter("airlines");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onClearFilter("airlines");
                  }
                }}
                className="h-6 w-6 rounded-full inline-flex items-center justify-center hover:bg-blue-200/70 transition-colors"
                aria-label="Clear airlines filter"
              >
                ×
              </span>
            ) : null}
          </button>
          {activeFilterType === "airlines" && (
            <FilterDropdowns
              flights={flights}
              filters={filters}
              onFilterChange={onFilterChange}
              activeFilterType="airlines"
              onClose={() => onFilterClick(null)}
              t={t}
            />
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="h-9 px-4 rounded-full text-sm font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {t?.clearAll ?? "Clear all"}
          </button>
        )}
      </div>
    </div>
  );
}

