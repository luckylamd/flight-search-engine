type NormalizedSegment = {
  from: string;
  to: string;
  departAt: string;
  arriveAt: string;
  flightNumber?: string;
  aircraftCode?: string;
  layoverMinutesAfter?: number; // minutes between this segment arrival and next segment departure
};

type NormalizedFlight = {
  id: string;
  price: number;
  currency: string;
  airline: string;
  flightNumber?: string;
  stops: number;
  stopLocations?: string[]; // Airport codes for layover stops
  segments?: NormalizedSegment[];
  cabin?: string;
  fareType?: "Basic economy" | "Standard" | "Unknown";
  duration: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
};

type HourlyPricePoint = {
  hour: string;
  price: number;
};

