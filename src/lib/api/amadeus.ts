// @ts-expect-error - amadeus doesn't have TypeScript types
import Amadeus from "amadeus";

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_SECRET_KEY = process.env.AMADEUS_SECRET_KEY;

if (!AMADEUS_API_KEY || !AMADEUS_SECRET_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Amadeus] Missing AMADEUS_API_KEY or AMADEUS_SECRET_KEY in environment variables.",
  );
}

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: AMADEUS_API_KEY,
  clientSecret: AMADEUS_SECRET_KEY,
});

type AmadeusFlightOffer = {
  id: string;
  price: {
    total: string;
    grandTotal?: string;
    currency: string;
  };
  validatingAirlineCodes?: string[];
  numberOfBookableSeats?: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      number?: string;
      departure: { at: string; iataCode: string };
      arrival: { at: string; iataCode: string };
      aircraft?: { code?: string };
    }>;
  }>;
};

export type NormalizedSegment = {
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  flightNumber?: string;
  aircraftCode?: string;
  layoverMinutesAfter?: number; // minutes between this segment arrival and next segment departure
};

export type NormalizedFlight = {
  id: string;
  price: number;
  currency: string;
  airline: string;
  flightNumber?: string;
  stops: number;
  stopLocations?: string[]; // Airport codes for layover stops
  segments?: NormalizedSegment[];
  duration: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
};

export type HourlyPricePoint = {
  hour: string;
  price: number;
};

function formatDuration(duration: string): string {
  // Duration format: "PT2H30M" -> "2h 30m"
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim() || duration;
}

function diffMinutes(aIso: string, bIso: string): number | null {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const diff = Math.round((b - a) / 60000);
  return Number.isFinite(diff) ? diff : null;
}

export async function searchFlights(opts: {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}): Promise<{
  flights: NormalizedFlight[];
  hourlyPrices: HourlyPricePoint[];
}> {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: opts.origin,
      destinationLocationCode: opts.destination,
      departureDate: opts.departureDate,
      adults: String(opts.adults),
      max: "50",
    });

    const offers = (response.data as unknown as AmadeusFlightOffer[]) ?? [];

    const flights: NormalizedFlight[] = offers
      .map((offer): NormalizedFlight | null => {
        const itinerary = offer.itineraries[0];
        const firstSegment = itinerary?.segments[0];
        const lastSegment = itinerary?.segments[itinerary.segments.length - 1];
        if (!firstSegment || !lastSegment) return null;

        const priceNumber = Number(offer.price.grandTotal ?? offer.price.total);
        if (!Number.isFinite(priceNumber)) return null;

        const stops = Math.max(0, itinerary.segments.length - 1);
        const airline =
          offer.validatingAirlineCodes?.[0] ?? firstSegment.number?.substring(0, 2) ?? "Unknown";

        // Extract stop locations (layover airports)
        // For flights with stops, the intermediate segments represent layovers
        // The arrival airport of each segment (except the last) is a stop location
        const stopLocations: string[] = [];
        if (stops > 0 && itinerary.segments.length > 1) {
          // Get arrival airports of all segments except the last one
          for (let i = 0; i < itinerary.segments.length - 1; i++) {
            const segment = itinerary.segments[i];
            if (segment?.arrival?.iataCode) {
              stopLocations.push(segment.arrival.iataCode);
            }
          }
        }

        const segments: NormalizedSegment[] = itinerary.segments.map((seg, idx) => {
          const next = itinerary.segments[idx + 1];
          const layoverMinutesAfter =
            next && seg?.arrival?.at && next?.departure?.at
              ? diffMinutes(seg.arrival.at, next.departure.at) ?? undefined
              : undefined;
          return {
            from: seg.departure.iataCode,
            to: seg.arrival.iataCode,
            departAt: seg.departure.at,
            arriveAt: seg.arrival.at,
            flightNumber: seg.number,
            aircraftCode: seg.aircraft?.code,
            layoverMinutesAfter,
          };
        });

        return {
          id: offer.id,
          price: priceNumber,
          currency: offer.price.currency,
          airline,
          flightNumber: firstSegment.number,
          stops,
          stopLocations: stopLocations.length > 0 ? stopLocations : undefined,
          segments: segments.length > 0 ? segments : undefined,
          duration: formatDuration(itinerary.duration),
          origin: firstSegment.departure.iataCode,
          destination: lastSegment.arrival.iataCode,
          departureTime: firstSegment.departure.at,
          arrivalTime: lastSegment.arrival.at,
        };
      })
      .filter((f): f is NormalizedFlight => f !== null);

    const buckets = new Map<number, { total: number; count: number }>();

    for (const flight of flights) {
      const d = new Date(flight.departureTime);
      const hour = Number.isNaN(d.getTime()) ? 0 : d.getUTCHours();
      const current = buckets.get(hour) ?? { total: 0, count: 0 };
      current.total += flight.price;
      current.count += 1;
      buckets.set(hour, current);
    }

    const hourlyPrices: HourlyPricePoint[] = Array.from({ length: 24 }, (_, h) => {
      const bucket = buckets.get(h);
      const avg = bucket && bucket.count > 0 ? bucket.total / bucket.count : 0;
      return {
        hour: `${String(h).padStart(2, "0")}:00`,
        price: Number.isFinite(avg) ? Math.round(avg) : 0,
      };
    });

    return { flights, hourlyPrices };
  } catch (error: unknown) {
    const err = error as { code?: string; description?: string; message?: string };
    throw new Error(
      err.description ?? err.message ?? "Failed to search flights from Amadeus",
    );
  }
}
