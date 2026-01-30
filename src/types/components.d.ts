/**
 * Component prop types and interfaces
 */

type SearchFormValues = {
  origin: string;
  destination: string;
  departureDate: string;
};

type FilterState = {
  stops: number | null; // null = all, 0 = nonstop, 1 = 1 stop, 2 = 2+ stops
  priceRange: [number, number] | null;
  airlines: string[];
};

type AppSettings = {
  language: AppLanguage;
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

type FilterChipsProps = {
  filters: FilterState;
  flights: NormalizedFlight[];
  onFilterClick: (filterType: "stops" | "price" | "airlines" | null) => void;
  onFilterChange: (filters: FilterState) => void;
  onClearFilter: (filterType: "stops" | "price" | "airlines") => void;
  onReset: () => void;
  activeFilterType: "stops" | "price" | "airlines" | null;
  t?: Partial<I18nStrings>;
};

type FilterDropdownsProps = {
  flights: NormalizedFlight[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeFilterType: "stops" | "price" | "airlines" | null;
  onClose: () => void;
  t?: Partial<I18nStrings>;
};

type PriceChartProps = {
  origin: string;
  destination: string;
  departureDate: string;
  data?: HourlyPricePoint[];
  currency?: string;
  t?: {
    priceTrendsTitle: string;
    averagePricesFor: string;
    onDate: string;
    pricesLow: string;
    pricesHigh: string;
    pricesTypical: string;
    goodTimeToBook: string;
    highSaveUpTo: string;
    cheaperHoursSuffix: string;
    typicalAdvice: string;
    minLabel: string;
    avgLabel: string;
    maxLabel: string;
    noChartTitle: string;
    noChartSubtitle: string;
    tooltipHour: string;
    tooltipPrice: string;
  };
};

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

type SettingsPanelProps = {
  value: AppSettings;
  onChange: (next: AppSettings) => void;
  t?: { settings: string; done: string; language: string };
};

type AirlineLogoProps = {
  airline: string;
  className?: string;
};

