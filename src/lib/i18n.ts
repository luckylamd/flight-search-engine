export type AppLanguage = "en" | "de" | "es";

export type I18nStrings = {
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

export const STRINGS: Record<AppLanguage, I18nStrings> = {
  en: {
    title: "Flight Search Engine",
    settings: "Settings",
    done: "Done",
    language: "Language",

    from: "From",
    to: "To",
    departure: "Departure",
    search: "Search",
    searching: "Searching...",
    cityOrAirport: "City or airport",
    swapAria: "Swap origin and destination",
    tip: "Tip: Use IATA codes like JFK or LHR for best results",

    stops: "Stops",
    nonstop: "Nonstop",
    stop: "stop",
    stopsPlural: "stops",
    price: "Price",
    airlines: "Airlines",
    clearAll: "Clear all",
    allFlights: "All flights",
    allPrices: "All prices",
    selected: "selected",
    apply: "Apply",
    clear: "Clear",
    showing: "Showing",
    of: "of",
    flights: "flights",
    viewMore: "View more",

    sortBest: "Sort: Best value",
    sortCheapest: "Sort: Cheapest",
    sortFastest: "Sort: Fastest",
    sortFewestStops: "Sort: Fewest stops",

    priceTrendsTitle: "Price trends by hour",
    averagePricesFor: "Average prices for",
    onDate: "on",
    pricesLow: "Prices are currently low",
    pricesHigh: "Prices are currently high",
    pricesTypical: "Prices are typical",
    goodTimeToBook: "Good time to book! Prices are below typical range for this route",
    highSaveUpTo: "You could save up to",
    cheaperHoursSuffix: "by booking flights during cheaper hours",
    typicalAdvice: "Prices are within typical range. Consider booking during off-peak hours for better deals",
    minLabel: "Minimum",
    avgLabel: "Average",
    maxLabel: "Maximum",
    noChartTitle: "No chart data yet",
    noChartSubtitle: "Run a search to see price trends",
    tooltipHour: "Hour",
    tooltipPrice: "Price",

    noFlightsTitle: "No flights found",
    noFlightsSubtitle: "Try adjusting your search criteria or filters",
    noSegmentDetails: "No segment details available for this result.",
    tripDetails: "Trip details",
    travelTime: "Travel time",
    layover: "layover",
  },
  de: {
    title: "Flugsuche",
    settings: "Einstellungen",
    done: "Fertig",
    language: "Sprache",

    from: "Von",
    to: "Nach",
    departure: "Abflug",
    search: "Suchen",
    searching: "Suche…",
    cityOrAirport: "Stadt oder Flughafen",
    swapAria: "Start und Ziel tauschen",
    tip: "Tipp: Verwende IATA-Codes wie JFK oder LHR für bessere Ergebnisse",

    stops: "Stopps",
    nonstop: "Direkt",
    stop: "Stopp",
    stopsPlural: "Stopps",
    price: "Preis",
    airlines: "Airlines",
    clearAll: "Alles löschen",
    allFlights: "Alle Flüge",
    allPrices: "Alle Preise",
    selected: "ausgewählt",
    apply: "Anwenden",
    clear: "Löschen",
    showing: "Anzeige",
    of: "von",
    flights: "Flügen",
    viewMore: "Mehr anzeigen",

    sortBest: "Sortieren: Bestes Preis‑Leistungs‑Verhältnis",
    sortCheapest: "Sortieren: Günstigster Preis",
    sortFastest: "Sortieren: Schnellste",
    sortFewestStops: "Sortieren: Wenigste Stopps",

    priceTrendsTitle: "Preistrends nach Stunde",
    averagePricesFor: "Durchschnittspreise für",
    onDate: "am",
    pricesLow: "Preise sind derzeit niedrig",
    pricesHigh: "Preise sind derzeit hoch",
    pricesTypical: "Preise sind typisch",
    goodTimeToBook: "Guter Zeitpunkt! Preise liegen unter dem üblichen Bereich für diese Strecke",
    highSaveUpTo: "Du könntest bis zu sparen",
    cheaperHoursSuffix: "wenn du in günstigeren Stunden buchst",
    typicalAdvice: "Preise sind im üblichen Bereich. Off-Peak-Stunden können günstiger sein",
    minLabel: "Minimum",
    avgLabel: "Durchschnitt",
    maxLabel: "Maximum",
    noChartTitle: "Noch keine Diagrammdaten",
    noChartSubtitle: "Starte eine Suche, um Preistrends zu sehen",
    tooltipHour: "Stunde",
    tooltipPrice: "Preis",

    noFlightsTitle: "Keine Flüge gefunden",
    noFlightsSubtitle: "Versuche, Suche oder Filter anzupassen",
    noSegmentDetails: "Keine Segmentdetails für dieses Ergebnis verfügbar.",
    tripDetails: "Reisedetails",
    travelTime: "Reisezeit",
    layover: "Umstieg",
  },
  es: {
    title: "Búsqueda de vuelos",
    settings: "Ajustes",
    done: "Listo",
    language: "Idioma",

    from: "Desde",
    to: "Hacia",
    departure: "Salida",
    search: "Buscar",
    searching: "Buscando…",
    cityOrAirport: "Ciudad o aeropuerto",
    swapAria: "Intercambiar origen y destino",
    tip: "Consejo: usa códigos IATA como JFK o LHR para mejores resultados",

    stops: "Escalas",
    nonstop: "Directo",
    stop: "escala",
    stopsPlural: "escalas",
    price: "Precio",
    airlines: "Aerolíneas",
    clearAll: "Borrar todo",
    allFlights: "Todos los vuelos",
    allPrices: "Todos los precios",
    selected: "seleccionadas",
    apply: "Aplicar",
    clear: "Borrar",
    showing: "Mostrando",
    of: "de",
    flights: "vuelos",
    viewMore: "Ver más",

    sortBest: "Ordenar: Mejor valor",
    sortCheapest: "Ordenar: Más barato",
    sortFastest: "Ordenar: Más rápido",
    sortFewestStops: "Ordenar: Menos escalas",

    priceTrendsTitle: "Tendencias de precio por hora",
    averagePricesFor: "Precios promedio para",
    onDate: "el",
    pricesLow: "Los precios están bajos",
    pricesHigh: "Los precios están altos",
    pricesTypical: "Los precios son normales",
    goodTimeToBook: "¡Buen momento para reservar! Los precios están por debajo de lo habitual",
    highSaveUpTo: "Podrías ahorrar hasta",
    cheaperHoursSuffix: "reservando en horas más baratas",
    typicalAdvice: "Precios dentro de lo habitual. Considera horas de menor demanda para mejores ofertas",
    minLabel: "Mínimo",
    avgLabel: "Promedio",
    maxLabel: "Máximo",
    noChartTitle: "Aún no hay datos",
    noChartSubtitle: "Haz una búsqueda para ver tendencias",
    tooltipHour: "Hora",
    tooltipPrice: "Precio",

    noFlightsTitle: "No se encontraron vuelos",
    noFlightsSubtitle: "Prueba ajustando tu búsqueda o filtros",
    noSegmentDetails: "No hay detalles de segmentos para este resultado.",
    tripDetails: "Detalles del viaje",
    travelTime: "Tiempo de viaje",
    layover: "escala",
  },
};


