"use client";

import { useState } from "react";

const getAirlineCode = (airline: string): string => {
  const upper = airline.toUpperCase().trim();
  
  const mappings: Record<string, string> = {
    "AMERICAN AIRLINES": "AA",
    "UNITED AIRLINES": "UA",
    "DELTA AIR LINES": "DL",
    "SOUTHWEST AIRLINES": "WN",
    "JETBLUE AIRWAYS": "B6",
    "ALASKA AIRLINES": "AS",
    "SPIRIT AIRLINES": "NK",
    "FRONTIER AIRLINES": "F9",
    "ALLEGIANT AIR": "G4",
    "BRITISH AIRWAYS": "BA",
    "LUFTHANSA": "LH",
    "AIR FRANCE": "AF",
    "KLM": "KL",
    "EMIRATES": "EK",
    "QATAR AIRWAYS": "QR",
    "TURKISH AIRLINES": "TK",
    "SINGAPORE AIRLINES": "SQ",
    "CATHAY PACIFIC": "CX",
    "JAPAN AIRLINES": "JL",
    "ANA": "NH",
    "TAP AIR PORTUGAL": "TP",
    "IBERIA": "IB",
    "VIRGIN ATLANTIC": "VS",
    "AER LINGUS": "EI",
    "FINNAIR": "AY",
    "SAS": "SK",
    "SWISS": "LX",
    "AUSTRIAN AIRLINES": "OS",
    "EASYJET": "U2",
    "RYANAIR": "FR",
    "VUELING": "VY",
    "NORWEGIAN": "DY",
    "ICELANDAIR": "FI",
  };

  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) {
    return upper;
  }

  if (mappings[upper]) {
    return mappings[upper];
  }

  const codeMatch = upper.match(/\b([A-Z]{2})\b/);
  if (codeMatch) {
    return codeMatch[1];
  }

  return upper.substring(0, 2);
};

export function AirlineLogo({ airline, className = "" }: AirlineLogoProps) {
  const [imageError, setImageError] = useState(false);
  const code = getAirlineCode(airline);
  
  const logoUrl = `https://logos.skyscnr.com/images/airlines/favicon/${code}.png`;
  
  if (imageError) {
    return (
      <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center ${className}`}>
        <span className="text-xs font-bold text-blue-700">{code}</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img
        src={logoUrl}
        alt={airline}
        className="w-8 h-8 object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

