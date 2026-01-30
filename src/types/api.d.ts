/**
 * API-related types and interfaces
 */

type AmadeusFlightOffer = {
  id: string;
  price: {
    total: string;
    grandTotal?: string;
    currency: string;
  };
  validatingAirlineCodes?: string[];
  numberOfBookableSeats?: number;
  travelerPricings?: Array<{
    fareDetailsBySegment?: Array<{
      cabin?: string; // e.g. ECONOMY, BUSINESS
      brandedFare?: string; // e.g. BASIC_ECONOMY, ECONOMY, STANDARD
      class?: string; // booking class
    }>;
  }>;
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

