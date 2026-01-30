export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDurationMinutes(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hs = h > 0 ? `${h} hr` : "";
  const ms = m > 0 ? `${m} min` : "";
  return `${hs} ${ms}`.trim();
}

export function diffMinutesLocal(aIso: string, bIso: string): number | null {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const diff = Math.round((b - a) / 60000);
  return Number.isFinite(diff) ? diff : null;
}

export function aircraftModelFromCode(code?: string): string | null {
  if (!code) return null;
  const map: Record<string, string> = {
    // Airbus (common)
    "319": "Airbus A319",
    "320": "Airbus A320",
    "321": "Airbus A321",
    "32N": "Airbus A320neo",
    "32Q": "Airbus A320neo",
    "332": "Airbus A330-200",
    "333": "Airbus A330-300",
    "338": "Airbus A330-800",
    "339": "Airbus A330-900",
    "359": "Airbus A350-900",
    "35K": "Airbus A350-1000",
    "388": "Airbus A380",

    // Boeing (common)
    "737": "Boeing 737",
    "738": "Boeing 737-800",
    "73H": "Boeing 737-800",
    "73G": "Boeing 737-700",
    "73W": "Boeing 737-700",
    "73M": "Boeing 737 MAX",
    "739": "Boeing 737-900",
    "752": "Boeing 757-200",
    "753": "Boeing 757-300",
    "763": "Boeing 767-300",
    "764": "Boeing 767-400",
    "772": "Boeing 777-200",
    "77L": "Boeing 777-200LR",
    "77W": "Boeing 777-300ER",
    "788": "Boeing 787-8",
    "789": "Boeing 787-9",
    "78X": "Boeing 787-10",

    // Embraer / regional
    "E70": "Embraer E170",
    "E75": "Embraer E175",
    "E90": "Embraer E190",
    "E95": "Embraer E195",
    "CR7": "Bombardier CRJ700",
    "CR9": "Bombardier CRJ900",
  };
  const key = code.toUpperCase();
  return map[key] ?? `Aircraft ${key}`;
}

export function cabinLabel(cabin?: string): string {
  if (!cabin) return "Cabin: Unknown";
  const c = cabin.toUpperCase();
  if (c === "ECONOMY") return "Cabin: Economy";
  if (c === "PREMIUM_ECONOMY") return "Cabin: Premium economy";
  if (c === "BUSINESS") return "Cabin: Business";
  if (c === "FIRST") return "Cabin: First";
  return `Cabin: ${c}`;
}

export function wifiLabel(): string {
  // Amadeus Flight Offers Search doesn't expose Wi‑Fi availability directly.
  // We still show an explicit row so users know to check the airline.
  return "Wi‑Fi details not provided (check airline)";
}

export function legroomLabel(
  fareType?: "Basic economy" | "Standard" | "Unknown",
): { primary: string; secondary?: string } {
  if (fareType === "Basic economy") {
    return {
      primary: "Legroom: Tight (basic economy, estimated)",
      secondary: "Basic economy often has more restrictive seat selection and may have less legroom.",
    };
  }
  if (fareType === "Standard") {
    return {
      primary: "Legroom: Standard (typical economy, estimated)",
      secondary: "Exact seat pitch varies by airline and aircraft.",
    };
  }
  return {
    primary: "Legroom: Unknown",
    secondary: "Detailed legroom information is not available from this data source.",
  };
}

export function getCurrencySymbol(currencyCode: string): string {
  // Currency setting removed: always show USD symbol
  void currencyCode;
  return "$";
}

export function clampNonZeroSeries(series: HourlyPricePoint[]): HourlyPricePoint[] {
  const anyPositive = series.some((p) => p.price > 0);
  return anyPositive ? series : [];
}

export function formatDuration(duration: string): string {
  // Duration format: "PT2H30M" -> "2h 30m"
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return `${hours} ${minutes}`.trim() || duration;
}

export function diffMinutes(aIso: string, bIso: string): number | null {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const diff = Math.round((b - a) / 60000);
  return Number.isFinite(diff) ? diff : null;
}

export function normalizeFareType(input?: string): "Basic economy" | "Standard" | "Unknown" {
  if (!input) return "Unknown";
  const s = input.toUpperCase();
  if (s.includes("BASIC")) return "Basic economy";
  if (s.includes("STANDARD") || s.includes("ECONOMY") || s.includes("FLEX")) return "Standard";
  return "Unknown";
}

export function getDefaultDepartureDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const SETTINGS_STORAGE_KEY = "flight_search_settings_v1";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") {
    return { language: "en" };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { language: "en" };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const language: AppLanguage =
      parsed.language === "de"
        ? "de"
        : parsed.language === "es"
          ? "es"
          : "en";
    return { language };
  } catch {
    return { language: "en" };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}