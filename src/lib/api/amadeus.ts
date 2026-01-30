// @ts-expect-error - amadeus doesn't have TypeScript types
import Amadeus from "amadeus";
import { formatDuration, diffMinutes, normalizeFareType } from "@/utils";

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_SECRET_KEY = process.env.AMADEUS_SECRET_KEY;

if (!AMADEUS_API_KEY || !AMADEUS_SECRET_KEY) {
  console.error(
    "[Amadeus] Missing AMADEUS_API_KEY or AMADEUS_SECRET_KEY in environment variables.",
  );
}

const amadeus = new Amadeus({
  clientId: AMADEUS_API_KEY,
  clientSecret: AMADEUS_SECRET_KEY,
});

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

        const cabin =
          offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? undefined;
        const brandedFare =
          offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.brandedFare ?? undefined;
        const fareType = normalizeFareType(brandedFare);

        return {
          id: offer.id,
          price: priceNumber,
          currency: offer.price.currency,
          airline,
          flightNumber: firstSegment.number,
          stops,
          stopLocations: stopLocations.length > 0 ? stopLocations : undefined,
          segments: segments.length > 0 ? segments : undefined,
          cabin,
          fareType,
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

export async function getFlightAvailability(opts: {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}): Promise<{
  availability: unknown; // Availability response structure varies
}> {
  try {
    // Note: This endpoint uses POST and requires a specific request structure
    // Returns available seats in different fare classes
    const response = await amadeus.shopping.availability.flightAvailabilities.post({
      data: {
        type: "flight-availabilities-search",
        originDestinationRequests: [
          {
            id: "1",
            originLocationCode: opts.origin,
            destinationLocationCode: opts.destination,
            departureDateTime: {
              date: opts.departureDate,
            },
          },
        ],
        travelers: Array.from({ length: opts.adults }, (_, i) => ({
          id: String(i + 1),
          travelerType: "ADULT",
        })),
        sources: ["GDS"],
      },
    });

    const availabilityData = (response.data as unknown) ?? {};

    return { availability: availabilityData };
  } catch (error: unknown) {
    const err = error as { code?: string; description?: string; message?: string };
    throw new Error(
      err.description ?? err.message ?? "Failed to get flight availability from Amadeus",
    );
  }
}

/**
 * Get cheapest flight dates from an origin to a destination
 * Returns dates with prices for a given route
 */
export async function getFlightDates(opts: {
  origin: string;
  destination: string;
}): Promise<{
  dates: Array<{
    date: string;
    price: number;
    currency: string;
  }>;
}> {
  try {
    const response = await amadeus.shopping.flightDates.get({
      origin: opts.origin,
      destination: opts.destination,
    });

    const data = (response.data as unknown as {
      data?: Array<{
        type: string;
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        price: {
          total: string;
          currency: string;
        };
      }>;
    }) ?? {};

    const dates =
      data.data?.map((item) => ({
        date: item.departureDate,
        price: Number(item.price.total) || 0,
        currency: item.price.currency,
      })) ?? [];

    return { dates };
  } catch (error: unknown) {
    const err = error as { code?: string; description?: string; message?: string };
    throw new Error(
      err.description ?? err.message ?? "Failed to get flight dates from Amadeus",
    );
  }
}

/**
 * Get cheapest flight destinations from an origin
 * Returns destinations with prices
 */
export async function getFlightDestinations(opts: {
  origin: string;
}): Promise<{
  destinations: Array<{
    destination: string;
    price: number;
    currency: string;
    departureDate: string;
  }>;
}> {
  try {
    const response = await amadeus.shopping.flightDestinations.get({
      origin: opts.origin,
    });

    const data = (response.data as unknown as {
      data?: Array<{
        type: string;
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        price: {
          total: string;
          currency: string;
        };
      }>;
    }) ?? {};

    const destinations =
      data.data?.map((item) => ({
        destination: item.destination,
        price: Number(item.price.total) || 0,
        currency: item.price.currency,
        departureDate: item.departureDate,
      })) ?? [];

    return { destinations };
  } catch (error: unknown) {
    const err = error as { code?: string; description?: string; message?: string };
    throw new Error(
      err.description ?? err.message ?? "Failed to get flight destinations from Amadeus",
    );
  }
}

/**
 * Get pricing information for flight offers
 * Confirms prices and retrieves taxes, fees, and ancillary information
 */
export async function getFlightPricing(opts: {
  flightOffers: AmadeusFlightOffer[];
}): Promise<{
  flightOffers: AmadeusFlightOffer[];
  pricing: {
    flightOffers: AmadeusFlightOffer[];
    bookingRequirements?: {
      emailAddressRequired?: boolean;
      mobilePhoneNumberRequired?: boolean;
      travelerRequirements?: Array<{
        travelerId: string;
        genderRequired?: boolean;
        documentRequired?: boolean;
        documentIssuanceCityRequired?: boolean;
        dateOfBirthRequired?: boolean;
        redressRequiredIfAny?: boolean;
        airFranceDiscountRequired?: boolean;
        spanishResidentDiscountRequired?: boolean;
      }>;
    };
  };
}> {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post({
      data: {
        type: "flight-offers-pricing",
        flightOffers: opts.flightOffers,
      },
    });

    const pricingData = (response.data as unknown as {
      data?: {
        type: string;
        flightOffers: AmadeusFlightOffer[];
        bookingRequirements?: {
          emailAddressRequired?: boolean;
          mobilePhoneNumberRequired?: boolean;
          travelerRequirements?: Array<{
            travelerId: string;
            genderRequired?: boolean;
            documentRequired?: boolean;
            documentIssuanceCityRequired?: boolean;
            dateOfBirthRequired?: boolean;
            redressRequiredIfAny?: boolean;
            airFranceDiscountRequired?: boolean;
            spanishResidentDiscountRequired?: boolean;
          }>;
        };
      };
    }) ?? {};

    return {
      flightOffers: pricingData.data?.flightOffers ?? [],
      pricing: {
        flightOffers: pricingData.data?.flightOffers ?? [],
        bookingRequirements: pricingData.data?.bookingRequirements,
      },
    };
  } catch (error: unknown) {
    const err = error as { code?: string; description?: string; message?: string };
    throw new Error(
      err.description ?? err.message ?? "Failed to get flight pricing from Amadeus",
    );
  }
}

/**
 * Get seat maps for flight offers
 * Returns seat layout and availability information
 */
export async function getSeatMaps(opts: {
  flightOffers: AmadeusFlightOffer[];
}): Promise<{
  seatMaps: Array<{
    flightOfferId: string;
    seatMap: unknown; // Seat map structure varies by airline
  }>;
}> {
  try {
    const response = await amadeus.shopping.seatmaps.post({
      data: {
        type: "seatmap",
        flightOffers: opts.flightOffers,
      },
    });

    const seatMapData = (response.data as unknown as {
      data?: Array<{
        type: string;
        flightOfferId: string;
        seatmap: unknown;
      }>;
    }) ?? {};

    const seatMaps =
      seatMapData.data?.map((item) => ({
        flightOfferId: item.flightOfferId,
        seatMap: item.seatmap,
      })) ?? [];

    return { seatMaps };
  } catch (error: unknown) {
    const err = error as { code?: string; description?: string; message?: string };
    throw new Error(
      err.description ?? err.message ?? "Failed to get seat maps from Amadeus",
    );
  }
}
