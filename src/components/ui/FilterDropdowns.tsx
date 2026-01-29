"use client";

import { type NormalizedFlight } from "@/lib/api/amadeus";
import { useMemo, useState, useEffect, useRef } from "react";
import { type FilterState } from "./Filters";
import type { I18nStrings } from "@/lib/i18n";

type FilterDropdownsProps = {
  flights: NormalizedFlight[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeFilterType: "stops" | "price" | "airlines" | null;
  onClose: () => void;
  t?: Partial<I18nStrings>;
};

export function FilterDropdowns({
  flights,
  filters,
  onFilterChange,
  activeFilterType,
  onClose,
  t,
}: FilterDropdownsProps) {
  const [localStops, setLocalStops] = useState<number | null>(filters.stops);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number] | null>(
    filters.priceRange,
  );
  const [localAirlines, setLocalAirlines] = useState<string[]>(filters.airlines);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate min/max price from flights
  const { minPrice, maxPrice } = useMemo(() => {
    if (flights.length === 0) return { minPrice: 0, maxPrice: 1000 };
    const prices = flights.map((f) => f.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [flights]);

  // Get unique airlines
  const availableAirlines = useMemo(() => {
    const airlines = new Set(flights.map((f) => f.airline));
    return Array.from(airlines).sort();
  }, [flights]);

  // Initialize price range
  useEffect(() => {
    if (flights.length > 0 && minPrice > 0 && maxPrice > 0) {
      if (!localPriceRange) {
        setLocalPriceRange([minPrice, maxPrice]);
      }
    }
  }, [flights.length, minPrice, maxPrice]);

  // Sync local state with props
  useEffect(() => {
    setLocalStops(filters.stops);
    setLocalPriceRange(filters.priceRange);
    setLocalAirlines(filters.airlines);
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (activeFilterType) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeFilterType, onClose]);

  const applyFilters = () => {
    onFilterChange({
      stops: localStops,
      priceRange: localPriceRange,
      airlines: localAirlines,
    });
    onClose();
  };

  const handleAirlineToggle = (airline: string) => {
    setLocalAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline],
    );
  };

  if (!activeFilterType || flights.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-xl border-2 border-gray-300 shadow-xl z-50 min-w-[280px]"
    >
      {/* Stops Dropdown */}
      {activeFilterType === "stops" && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t?.stops ?? "Stops"}
          </h3>
          <div className="space-y-2">
            {[
              { value: null, label: t?.allFlights ?? "All flights" },
              { value: 0, label: t?.nonstop ?? "Nonstop" },
              { value: 1, label: `1 ${t?.stop ?? "stop"}` },
              { value: 2, label: `2+ ${t?.stopsPlural ?? "stops"}` },
            ].map((option) => (
              <label
                key={option.value ?? "all"}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  localStops === option.value
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="stops"
                  checked={localStops === option.value}
                  onChange={() => {
                    setLocalStops(option.value);
                    onFilterChange({
                      stops: option.value,
                      priceRange: localPriceRange,
                      airlines: localAirlines,
                    });
                    onClose();
                  }}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Dropdown */}
      {activeFilterType === "price" && (
        <div className="w-80">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-900">
                  {t?.price ?? "Price"}
                </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              {t?.allPrices ?? "All prices"}
            </p>

            {/* Slider */}
            {minPrice >= 0 && maxPrice > minPrice && (() => {
              const currentMax = localPriceRange ? localPriceRange[1] : maxPrice;
              const sliderValue = localPriceRange ? localPriceRange[1] : maxPrice;
              
              return (
                <div className="space-y-4">
                  <div className="relative py-2">
                    {/* Slider track background */}
                    <div className="h-2 bg-gray-200 rounded-full relative">
                      {/* Filled portion (blue line) */}
                      <div
                        className="absolute h-2 bg-blue-600 rounded-full transition-all duration-150"
                        style={{
                          width: `${((sliderValue - minPrice) / (maxPrice - minPrice)) * 100}%`,
                        }}
                      />
                    </div>
                    {/* Range input overlay */}
                    <input
                      type="range"
                      min={minPrice}
                      max={maxPrice}
                      step={1}
                      value={sliderValue}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const newRange: [number, number] = [minPrice, val];
                        setLocalPriceRange(newRange);
                        // Apply immediately
                        onFilterChange({
                          stops: localStops,
                          priceRange: newRange,
                          airlines: localAirlines,
                        });
                      }}
                      className="absolute top-0 left-0 w-full h-6 cursor-pointer opacity-0 z-10"
                      style={{
                        top: "4px",
                      }}
                    />
                    {/* Visual handle */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md pointer-events-none transition-all duration-150"
                      style={{
                        left: `calc(${((sliderValue - minPrice) / (maxPrice - minPrice)) * 100}% - 8px)`,
                      }}
                    />
                  </div>

                  {/* Price display */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">${minPrice}</span>
                    <span className="font-semibold text-gray-900">${currentMax}</span>
                  </div>
                </div>
              );
            })()}

            {/* Clear button */}
            <button
              onClick={() => {
                setLocalPriceRange(null);
                onFilterChange({
                  stops: localStops,
                  priceRange: null,
                  airlines: localAirlines,
                });
              }}
              className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
                  {t?.clear ?? "Clear"}
            </button>
          </div>
        </div>
      )}

      {/* Airlines Dropdown */}
      {activeFilterType === "airlines" && (
        <div className="p-4 max-w-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {(t?.airlines ?? "Airlines")} ({localAirlines.length} {t?.selected ?? "selected"})
          </h3>
          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {availableAirlines.map((airline) => (
              <label
                key={airline}
                className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-colors ${
                  localAirlines.includes(airline)
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={localAirlines.includes(airline)}
                  onChange={() => handleAirlineToggle(airline)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{airline}</span>
              </label>
            ))}
          </div>
          <button
            onClick={applyFilters}
            className="w-full mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {t?.apply ?? "Apply"}
          </button>
        </div>
      )}
    </div>
  );
}

