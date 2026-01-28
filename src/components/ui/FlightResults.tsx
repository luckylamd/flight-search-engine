"use client";

import { type NormalizedFlight } from "@/lib/api/amadeus";
import { AirlineLogo } from "./AirlineLogo";

type FlightResultsProps = {
  flights: NormalizedFlight[];
  isLoading?: boolean;
};

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getCurrencySymbol(currencyCode: string): string {
  const currencyMap: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "Fr",
    CNY: "¥",
    INR: "₹",
    BRL: "R$",
    MXN: "$",
    KRW: "₩",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
    ZAR: "R",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    RON: "lei",
    TRY: "₺",
    ILS: "₪",
    AED: "د.إ",
    SAR: "﷼",
    THB: "฿",
    MYR: "RM",
    PHP: "₱",
    IDR: "Rp",
    VND: "₫",
  };

  return currencyMap[currencyCode.toUpperCase()] || currencyCode;
}

export function FlightResults({ flights, isLoading }: FlightResultsProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-xl h-28 border-2 border-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 font-medium">No flights found</p>
        <p className="text-sm text-gray-500 mt-1">
          Try adjusting your search criteria or filters
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="group bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden"
        >
          <div className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Left: Flight details */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Airline Logo */}
                <div className="flex items-start sm:items-center shrink-0">
                  <AirlineLogo airline={flight.airline} />
                </div>

                {/* Times & Airline Name */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  {/* Times */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-gray-900">
                      {formatTime(flight.departureTime)} - {formatTime(flight.arrivalTime)}
                    </span>
                  </div>

                  {/* Airline Name */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {flight.airline} {flight?.flightNumber}
                    </span>
                  </div>
                </div>

                {/* Duration & Route */}
                <div className="flex-1 flex flex-col gap-2 sm:text-center">
                  {/* Travel Time */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-gray-900">
                      {flight.duration}
                    </span>
                  </div>

                  {/* Departure and Arrival Locations */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-gray-600">
                      {flight.origin} - {flight.destination}
                    </span>
                  </div>
                </div>

                {/* Stops */}
                <div className="flex-1 flex flex-col gap-2 sm:text-center">
                  <span className="text-base font-semibold text-gray-900">
                    {flight.stops === 0 ? (
                      <span>Nonstop</span>
                    ) : (
                      `${flight.stops} Stop${flight.stops > 1 ? "s" : ""}`
                    )}
                  </span>
                  {flight.stopLocations && flight.stopLocations.length > 0 && (
                    <span className="text-sm font-medium text-gray-600">
                      {flight.stopLocations.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Price */}
              <div className="flex items-center justify-between sm:justify-end gap-4 lg:min-w-[140px] lg:pl-6 lg:border-l-2 lg:border-gray-100 pt-3 sm:pt-0 border-t lg:border-t-0 border-gray-200 lg:border-gray-100">
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-green-600 leading-none">
                      {getCurrencySymbol(flight.currency)}
                      {Math.round(flight.price)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">per person</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))
      }
    </div >
  );
}
