"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

export type SearchFormValues = {
  origin: string;
  destination: string;
  departureDate: string;
};

type SearchPanelProps = {
  defaultValues?: SearchFormValues;
  onSearch?: (values: SearchFormValues) => void;
  isLoading?: boolean;
  t?: {
    from: string;
    to: string;
    departure: string;
    search: string;
    searching: string;
    cityOrAirport: string;
    swapAria: string;
    tip: string;
  };
};

const getDefaultDepartureDate = () =>
  new Date().toISOString().slice(0, 10);

export function SearchPanel({
  defaultValues = {
    origin: "NYC",
    destination: "LON",
    departureDate: getDefaultDepartureDate(),
  },
  onSearch,
  isLoading = false,
  t,
}: SearchPanelProps) {
  const [form, setForm] = useState<SearchFormValues>(defaultValues);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "origin" || name === "destination") {
        return { ...prev, [name]: value.toUpperCase() };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(form);
  };

  const handleSwap = () => {
    setForm((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-6">
      {/* Premium search container */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Origin Field */}
          <div className="flex-1 relative group">
            <div
              className={`h-16 lg:h-20 px-4 lg:px-5 rounded-xl border-2 flex flex-col justify-center transition-all duration-200 ${
                focusedField === "origin"
                  ? "bg-white border-blue-500 shadow-md"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <label
                htmlFor="origin"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >
                {t?.from ?? "From"}
              </label>
              <input
                id="origin"
                name="origin"
                value={form.origin}
                onChange={handleChange}
                onFocus={() => setFocusedField("origin")}
                onBlur={() => setFocusedField(null)}
                    placeholder={t?.cityOrAirport ?? "City or airport"}
                className="w-full text-lg lg:text-xl font-bold text-gray-900 bg-transparent border-0 p-0 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            className="hidden lg:flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200 disabled:opacity-60 shrink-0 self-center shadow-sm hover:shadow-md"
            aria-label={t?.swapAria ?? "Swap origin and destination"}
            disabled={isLoading}
          >
            ⇄
          </button>

          {/* Destination Field */}
          <div className="flex-1 relative group">
            <div
              className={`h-16 lg:h-20 px-4 lg:px-5 rounded-xl border-2 flex flex-col justify-center transition-all duration-200 ${
                focusedField === "destination"
                  ? "bg-white border-blue-500 shadow-md"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <label
                htmlFor="destination"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >
                {t?.to ?? "To"}
              </label>
              <input
                id="destination"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                onFocus={() => setFocusedField("destination")}
                onBlur={() => setFocusedField(null)}
                    placeholder={t?.cityOrAirport ?? "City or airport"}
                className="w-full text-lg lg:text-xl font-bold text-gray-900 bg-transparent border-0 p-0 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Date Field */}
          <div className="flex-1 relative group">
            <div
              className={`h-16 lg:h-20 px-4 lg:px-5 rounded-xl border-2 flex flex-col justify-center transition-all duration-200 ${
                focusedField === "departureDate"
                  ? "bg-white border-blue-500 shadow-md"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <label
                htmlFor="departureDate"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
              >
                {t?.departure ?? "Departure"}
              </label>
              <input
                id="departureDate"
                name="departureDate"
                type="date"
                value={form.departureDate}
                onChange={handleChange}
                onFocus={() => setFocusedField("departureDate")}
                onBlur={() => setFocusedField(null)}
                className="w-full text-lg lg:text-xl font-bold text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 disabled:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full lg:w-auto h-16 lg:h-20 px-8 lg:px-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg lg:text-xl font-bold hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-60 disabled:hover:from-blue-600 disabled:hover:to-blue-700 disabled:shadow-lg disabled:active:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  {t?.searching ?? "Searching..."}
                </span>
              ) : (
                t?.search ?? "Search"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Tip text */}
      <p className="mt-3 text-xs text-gray-500 text-center">
        {t?.tip ?? "Tip: Use IATA codes like JFK or LHR for best results"}
      </p>
    </div>
  );
}
