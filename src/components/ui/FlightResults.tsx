"use client";

import { AirlineLogo } from "./AirlineLogo";
import { useMemo, useState } from "react";
import {
  formatTime,
  formatDurationMinutes,
  diffMinutesLocal,
  aircraftModelFromCode,
  getCurrencySymbol,
} from "@/utils";

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    {/* Times */}
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-semibold text-gray-900">
                          {formatTime(flight.departureTime)} - {formatTime(flight.arrivalTime)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-gray-500">
                          {formatDate(flight.departureTime)} - {formatDate(flight.arrivalTime)}
                        </span>
                      </div>
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
                                      {formatDate(seg.departAt)} {formatTime(seg.departAt)} ·{" "}
                                      {seg.from} — {formatDate(seg.arriveAt)}{" "}
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
