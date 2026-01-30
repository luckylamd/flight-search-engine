"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchPanel } from "@/components/ui/SearchPanel";
import { PriceChart } from "@/components/ui/PriceChart";
import { FlightResults } from "@/components/ui/FlightResults";
import { FilterChips } from "@/components/ui/FilterChips";
import {
  loadSettings,
  saveSettings,
  SettingsPanel,
} from "@/components/ui/SettingsPanel";
import { STRINGS } from "@/lib/i18n";
// Currency setting removed: always display USD ($)

export default function Home() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const t = STRINGS[settings.language];
  const [search, setSearch] = useState<SearchFormValues>({
    origin: "NYC",
    destination: "LON",
    departureDate: new Date().toISOString().slice(0, 10),
  });

  const [allFlights, setAllFlights] = useState<NormalizedFlight[]>([]);
  const [allHourlyPrices, setAllHourlyPrices] = useState<HourlyPricePoint[] | null>(
    null,
  );
  const [filters, setFilters] = useState<FilterState>({
    stops: null,
    priceRange: null,
    airlines: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<
    "stops" | "price" | "airlines" | null
  >(null);
  const [sortBy, setSortBy] = useState<
    "bestValue" | "cheapest" | "fastest" | "fewestStops"
  >("bestValue");
  const [showAllResults, setShowAllResults] = useState(false);

  // Apply filters to flights
  const filteredFlights = useMemo(() => {
    let result = [...allFlights];

    // Filter by stops
    if (filters.stops !== null) {
      if (filters.stops === 2) {
        result = result.filter((f) => f.stops >= 2);
      } else {
        result = result.filter((f) => f.stops === filters.stops);
      }
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter((f) => f.price >= min && f.price <= max);
    }

    // Filter by airlines
    if (filters.airlines.length > 0) {
      result = result.filter((f) => filters.airlines.includes(f.airline));
    }

    // Sort
    // Helper function to parse duration to minutes
    const toMinutes = (s: string) => {
      const h = s.match(/(\d+)h/);
      const m = s.match(/(\d+)m/);
      return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
    };

    if (sortBy === "cheapest") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "fastest") {
      result.sort((a, b) => toMinutes(a.duration) - toMinutes(b.duration));
    } else if (sortBy === "fewestStops") {
      result.sort((a, b) => a.stops - b.stops);
    } else if (sortBy === "bestValue") {
      // Best value: combines price, duration, and stops into a score
      // Lower score = better value
      // Normalize values (0-1 scale) for comparison based on all flights
      const prices = allFlights.map((f) => f.price);
      const durations = allFlights.map((f) => toMinutes(f.duration));
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      const maxStops = Math.max(...allFlights.map((f) => f.stops));
      
      const normalizePrice = (price: number) => {
        const range = maxPrice - minPrice;
        return range > 0 ? (price - minPrice) / range : 0;
      };
      
      const normalizeDuration = (duration: number) => {
        const range = maxDuration - minDuration;
        return range > 0 ? (duration - minDuration) / range : 0;
      };
      
      const normalizeStops = (stops: number) => {
        return maxStops > 0 ? stops / maxStops : 0;
      };
      
      // Calculate value score: 60% weight on price, 30% on duration, 10% on stops
      const getValueScore = (flight: (typeof result)[0]) => {
        const priceScore = normalizePrice(flight.price) * 0.6;
        const durationScore = normalizeDuration(toMinutes(flight.duration)) * 0.3;
        const stopsScore = normalizeStops(flight.stops) * 0.1;
        return priceScore + durationScore + stopsScore;
      };
      
      result.sort((a, b) => getValueScore(a) - getValueScore(b));
    }

    return result;
  }, [allFlights, filters, sortBy]);

  useEffect(() => {
    // Reset "View more" when the result set changes meaningfully
    setShowAllResults(false);
  }, [allFlights, filters, sortBy]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const visibleFlights = useMemo(() => {
    if (showAllResults) return filteredFlights;
    return filteredFlights.slice(0, 15);
  }, [filteredFlights, showAllResults]);

  // Compute hourly prices from filtered flights
  const filteredHourlyPrices = useMemo(() => {
    if (filteredFlights.length === 0) {
      return allHourlyPrices ?? [];
    }

    const buckets = new Map<number, { total: number; count: number }>();

    for (const flight of filteredFlights) {
      const d = new Date(flight.departureTime);
      const hour = Number.isNaN(d.getTime()) ? 0 : d.getUTCHours();
      const current = buckets.get(hour) ?? { total: 0, count: 0 };
      current.total += flight.price;
      current.count += 1;
      buckets.set(hour, current);
    }

    return Array.from({ length: 24 }, (_, h) => {
      const bucket = buckets.get(h);
      const avg = bucket && bucket.count > 0 ? bucket.total / bucket.count : 0;
      return {
        hour: `${String(h).padStart(2, "0")}:00`,
        price: Number.isFinite(avg) ? Math.round(avg) : 0,
      };
    });
  }, [filteredFlights, allHourlyPrices]);

  const handleSearch = (values: SearchFormValues) => {
    setSearch(values);
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      origin: values.origin,
      destination: values.destination,
      departureDate: values.departureDate,
      adults: "1",
    });

    fetch(`/api/flights?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(body?.error ?? "Request failed");
        }
        return res.json() as Promise<{
          flights: NormalizedFlight[];
          hourlyPrices: HourlyPricePoint[];
        }>;
      })
      .then((data) => {
        setAllFlights(data.flights);
        setAllHourlyPrices(data.hourlyPrices);
        // Reset filters when new search is performed
        setFilters({
          stops: null,
          priceRange: null,
          airlines: [],
        });
        setActiveFilterType(null);
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setAllFlights([]);
        setAllHourlyPrices(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleResetFilters = () => {
    setFilters({
      stops: null,
      priceRange: null,
      airlines: [],
    });
    setActiveFilterType(null);
  };

  const handleClearFilter = (filterType: "stops" | "price" | "airlines") => {
    setFilters((prev) => {
      if (filterType === "stops") return { ...prev, stops: null };
      if (filterType === "price") return { ...prev, priceRange: null };
      return { ...prev, airlines: [] };
    });
    // If the cleared filter's dropdown is open, close it
    setActiveFilterType((prev) => (prev === filterType ? null : prev));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            {t.title}
          </h1>
          <SettingsPanel value={settings} onChange={setSettings} t={t} />
        </div>
      </div>

      {/* Search Panel */}
      <SearchPanel
        defaultValues={search}
        onSearch={handleSearch}
        isLoading={isLoading}
        t={t}
      />

      {/* Error message */}
      {error ? (
        <div className="w-full max-w-6xl mx-auto mb-5 rounded-xl border-2 border-red-300 bg-red-50 px-5 py-4 text-sm text-red-800 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {/* Filter Chips Row */}
      {allFlights.length > 0 && (
        <>
          <FilterChips
            filters={filters}
            flights={allFlights}
            onFilterClick={setActiveFilterType}
            onFilterChange={setFilters}
            onClearFilter={handleClearFilter}
            onReset={handleResetFilters}
            activeFilterType={activeFilterType}
            t={t}
          />

          {/* Results header with sort */}
          <div className="w-full max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-gray-600">
              {t.showing}{" "}
              <span className="font-bold text-gray-900 text-base">
                {filteredFlights.length}
              </span>{" "}
              {t.of}{" "}
              <span className="font-bold text-gray-900 text-base">
                {allFlights.length}
              </span>{" "}
              {t.flights}
            </p>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "bestValue"
                    | "cheapest"
                    | "fastest"
                    | "fewestStops",
                )
              }
              className="h-10 px-4 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            >
              <option value="bestValue">{t.sortBest}</option>
              <option value="cheapest">{t.sortCheapest}</option>
              <option value="fastest">{t.sortFastest}</option>
              <option value="fewestStops">{t.sortFewestStops}</option>
            </select>
          </div>
        </>
      )}

      {/* Price Chart */}
      <PriceChart
        origin={search.origin}
        destination={search.destination}
        departureDate={search.departureDate}
        data={filteredHourlyPrices}
        currency="USD"
        t={t}
      />

      {/* Flight Results */}
      {allFlights.length > 0 && (
        <div className="w-full max-w-6xl mx-auto">
              <FlightResults
                flights={visibleFlights}
                isLoading={isLoading}
            t={t}
              />

          {filteredFlights.length > 15 && !showAllResults ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllResults(true)}
                className="h-10 px-6 rounded-full bg-white border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                {t.viewMore}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Loading state */}
      {isLoading && allFlights.length === 0 ? (
        <div className="w-full max-w-6xl mx-auto mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
            <span className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm font-semibold text-gray-700">
              Loading live prices from Amadeus…
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
