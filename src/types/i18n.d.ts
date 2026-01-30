/**
 * Internationalization (i18n) types and interfaces
 */

type AppLanguage = "en" | "de" | "es";

type I18nStrings = {
  // Header / general
  title: string;
  settings: string;
  done: string;
  language: string;

  // Search panel
  from: string;
  to: string;
  departure: string;
  search: string;
  searching: string;
  cityOrAirport: string;
  swapAria: string;
  tip: string;

  // Filters / results header
  stops: string;
  nonstop: string;
  stop: string;
  stopsPlural: string;
  price: string;
  airlines: string;
  clearAll: string;
  allFlights: string;
  allPrices: string;
  selected: string;
  apply: string;
  clear: string;
  showing: string;
  of: string;
  flights: string;
  viewMore: string;

  // Sort
  sortBest: string;
  sortCheapest: string;
  sortFastest: string;
  sortFewestStops: string;

  // Chart
  priceTrendsTitle: string;
  averagePricesFor: string; // "Average prices for"
  onDate: string; // "on"
  pricesLow: string;
  pricesHigh: string;
  pricesTypical: string;
  goodTimeToBook: string;
  highSaveUpTo: string; // "You could save up to"
  cheaperHoursSuffix: string; // "by booking flights during cheaper hours"
  typicalAdvice: string;
  minLabel: string;
  avgLabel: string;
  maxLabel: string;
  noChartTitle: string;
  noChartSubtitle: string;
  tooltipHour: string;
  tooltipPrice: string;

  // Results / details
  noFlightsTitle: string;
  noFlightsSubtitle: string;
  noSegmentDetails: string;
  tripDetails: string;
  travelTime: string;
  layover: string;
};

