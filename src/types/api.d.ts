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
      cabin?: string;
      brandedFare?: string;
      class?: string;
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

