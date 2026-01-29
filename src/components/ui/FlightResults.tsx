"use client";

import { type NormalizedFlight } from "@/lib/api/amadeus";
import { AirlineLogo } from "./AirlineLogo";
import { useMemo, useState } from "react";

type FlightResultsProps = {
  flights: NormalizedFlight[];
  isLoading?: boolean;
  t?: {
    noFlightsTitle: string;
    noFlightsSubtitle: string;
    noSegmentDetails: string;
    nonstop: string;
    stop: string;
    stopsPlural: string;
    tripDetails: string;
    travelTime: string;
    layover: string;
  };
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

function formatDurationMinutes(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hs = h > 0 ? `${h} hr` : "";
  const ms = m > 0 ? `${m} min` : "";
  return `${hs} ${ms}`.trim();
}

function diffMinutesLocal(aIso: string, bIso: string): number | null {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const diff = Math.round((b - a) / 60000);
  return Number.isFinite(diff) ? diff : null;
}

function aircraftModelFromCode(code?: string): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    // Airbus (common)
    "319": "Airbus A319",
    "320": "Airbus A320",
    "321": "Airbus A321",
    "32N": "Airbus A320neo",
    "32Q": "Airbus A320neo",
    "332": "Airbus A330-200",
    "333": "Airbus A330-300",
    "338": "Airbus A330-800",
    "339": "Airbus A330-900",
    "359": "Airbus A350-900",
    "35K": "Airbus A350-1000",
    "388": "Airbus A380",

    // Boeing (common)
    "737": "Boeing 737",
    "738": "Boeing 737-800",
    "73H": "Boeing 737-800",
    "73G": "Boeing 737-700",
    "73W": "Boeing 737-700",
    "73M": "Boeing 737 MAX",
    "739": "Boeing 737-900",
    "752": "Boeing 757-200",
    "753": "Boeing 757-300",
    "763": "Boeing 767-300",
    "764": "Boeing 767-400",
    "772": "Boeing 777-200",
    "77L": "Boeing 777-200LR",
    "77W": "Boeing 777-300ER",
    "788": "Boeing 787-8",
    "789": "Boeing 787-9",
    "78X": "Boeing 787-10",

    // Embraer / regional
    "E70": "Embraer E170",
    "E75": "Embraer E175",
    "E90": "Embraer E190",
    "E95": "Embraer E195",
    "CR7": "Bombardier CRJ700",
    "CR9": "Bombardier CRJ900",
  };
  const key = code.toUpperCase();
  return map[key] ?? `Aircraft ${key}`;
}

function cabinLabel(cabin?: string): string {
  if (!cabin) return "Cabin: Unknown";
  const c = cabin.toUpperCase();
  if (c === "ECONOMY") return "Cabin: Economy";
  if (c === "PREMIUM_ECONOMY") return "Cabin: Premium economy";
  if (c === "BUSINESS") return "Cabin: Business";
  if (c === "FIRST") return "Cabin: First";
  return `Cabin: ${c}`;
}

function wifiLabel(): string {
  // Amadeus Flight Offers Search doesn't expose Wi‑Fi availability directly.
  // We still show an explicit row so users know to check the airline.
  return "Wi‑Fi details not provided (check airline)";
}

function legroomLabel(
  fareType?: "Basic economy" | "Standard" | "Unknown",
): { primary: string; secondary?: string } {
  if (fareType === "Basic economy") {
    return {
      primary: "Legroom: Tight (basic economy, estimated)",
      secondary: "Basic economy often has more restrictive seat selection and may have less legroom.",
    };
  }
  if (fareType === "Standard") {
    return {
      primary: "Legroom: Standard (typical economy, estimated)",
      secondary: "Exact seat pitch varies by airline and aircraft.",
    };
  }
  return {
    primary: "Legroom: Unknown",
    secondary: "Detailed legroom information is not available from this data source.",
  };
}

function getCurrencySymbol(currencyCode: string): string {
  // Currency setting removed: always show USD symbol
  void currencyCode;
  return "$";
}

export function FlightResults({ flights, isLoading, t }: FlightResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
        <p className="text-gray-600 font-medium">
          {t?.noFlightsTitle ?? "No flights found"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {t?.noFlightsSubtitle ?? "Try adjusting your search criteria or filters"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-3">
      {flights.map((flight) => {
        const primaryAircraft = aircraftModelFromCode(
          flight.segments && flight.segments.length > 0
            ? flight.segments[0]?.aircraftCode
            : undefined,
        );

        return (
        <div key={flight.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => toggleExpanded(flight.id)}
            className="w-full text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-expanded={expandedId === flight.id}
            aria-controls={`flight-details-${flight.id}`}
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
                        <span>{t?.nonstop ?? "Nonstop"}</span>
                      ) : (
                        `${flight.stops} ${flight.stops === 1 ? (t?.stop ?? "stop") : (t?.stopsPlural ?? "stops")}`
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
                    <span className="text-2xl sm:text-3xl font-bold text-green-600 leading-none">
                      {getCurrencySymbol(flight.currency)}
                      {Math.round(flight.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Expandable details */}
          <div
            id={`flight-details-${flight.id}`}
            className={`grid transition-[grid-template-rows] duration-200 ${expandedId === flight.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-gray-200 bg-white px-4 sm:px-5 py-4">
                {flight.segments && flight.segments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {/* Timeline / Trip details */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {t?.tripDetails ?? "Trip details"}
                        </p>
                        {primaryAircraft && (
                          <p className="text-xs font-medium text-gray-600 text-right">
                            {primaryAircraft}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        {flight.segments.map((seg, idx) => {
                          const legDuration = formatDurationMinutes(
                            diffMinutesLocal(seg.departAt, seg.arriveAt) ?? undefined,
                          );
                          const layover = formatDurationMinutes(seg.layoverMinutesAfter);
                          return (
                            <div key={`${seg.from}-${seg.to}-${idx}`}>
                              <div className="flex gap-3">
                                {/* Timeline dots/line */}
                                <div className="flex flex-col items-center">
                                  <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5" />
                                  {idx < flight.segments!.length - 1 ? (
                                    <div className="w-px flex-1 bg-gray-300 mt-1" />
                                  ) : null}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-3 mb-0.5">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {formatTime(seg.departAt)} · {seg.from} —{" "}
                                      {formatTime(seg.arriveAt)} · {seg.to}
                                    </p>
                                    <p className="text-xs text-gray-500 whitespace-nowrap">
                                      {seg.flightNumber ?? flight.flightNumber ?? ""}
                                    </p>
                                  </div>
                                  {legDuration && (
                                    <p className="text-[11px] text-gray-500">
                                      {t?.travelTime ?? "Travel time"} · {legDuration}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {layover ? (
                                <div className="ml-5 mt-2 text-xs text-gray-600">
                                  {layover} {t?.layover ?? "layover"} · {seg.to}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {t?.noSegmentDetails ?? "No segment details available for this result."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )})}
    </div>
  );
}
