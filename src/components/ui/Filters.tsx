"use client";

import { useMemo, useState, useEffect } from "react";
// Types are in @/types

export function Filters({
  flights,
  onFilterChange,
  activeFilterType,
  onClose,
}: FiltersProps) {
  const [stops, setStops] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);

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
    if (!priceRange && flights.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [flights.length, minPrice, maxPrice, priceRange]);

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange({
      stops,
      priceRange,
      airlines: selectedAirlines,
    });
  }, [stops, priceRange, selectedAirlines, onFilterChange]);

  const handleAirlineToggle = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((a) => a !== airline)
        : [...prev, airline],
    );
  };

  const handleReset = () => {
    setStops(null);
    setPriceRange([minPrice, maxPrice]);
    setSelectedAirlines([]);
  };

  if (flights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Filters</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Reset all
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 px-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stops Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Stops
          </label>
          <div className="space-y-2">
            {[
              { value: null, label: "All flights" },
              { value: 0, label: "Nonstop" },
              { value: 1, label: "1 stop" },
              { value: 2, label: "2+ stops" },
            ].map((option) => (
              <label
                key={option.value ?? "all"}
                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
                  stops === option.value
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="stops"
                  checked={stops === option.value}
                  onChange={() => setStops(option.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Price Range
          </label>
          {priceRange && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val) && val <= priceRange[1]) {
                      setPriceRange([val, priceRange[1]]);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isNaN(val) && val >= priceRange[0]) {
                      setPriceRange([priceRange[0], val]);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-xs text-gray-500">
                ${minPrice} – ${maxPrice}
              </div>
            </div>
          )}
        </div>

        {/* Airlines Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Airlines ({selectedAirlines.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {availableAirlines.map((airline) => (
              <label
                key={airline}
                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
                  selectedAirlines.includes(airline)
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedAirlines.includes(airline)}
                  onChange={() => handleAirlineToggle(airline)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{airline}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
