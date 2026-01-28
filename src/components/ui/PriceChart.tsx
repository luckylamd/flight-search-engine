"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";

export type HourlyPricePoint = {
  hour: string;
  price: number;
};

type PriceChartProps = {
  origin: string;
  destination: string;
  departureDate: string;
  data?: HourlyPricePoint[];
  currency?: string;
};

function getCurrencySymbol(currencyCode: string): string {
  const currencyMap: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "Fr",
    CNY: "¥",
    INR: "₹",
    BRL: "R$",
    MXN: "$",
    KRW: "₩",
    SGD: "S$",
    HKD: "HK$",
    NZD: "NZ$",
    ZAR: "R",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    RON: "lei",
    TRY: "₺",
    ILS: "₪",
    AED: "د.إ",
    SAR: "﷼",
    THB: "฿",
    MYR: "RM",
    PHP: "₱",
    IDR: "Rp",
    VND: "₫",
  };

  return currencyMap[currencyCode.toUpperCase()] || currencyCode;
}

function clampNonZeroSeries(series: HourlyPricePoint[]): HourlyPricePoint[] {
  const anyPositive = series.some((p) => p.price > 0);
  return anyPositive ? series : [];
}

export function PriceChart({
  origin,
  destination,
  departureDate,
  data,
  currency = "USD",
}: PriceChartProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const chartData = useMemo(() => clampNonZeroSeries(data ?? []), [data]);

  const stats = useMemo(() => {
    const prices = chartData.map((p) => p.price).filter((p) => p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { min, max, avg: Math.round(avg) };
  }, [chartData]);

  const dateLabel = useMemo(() => {
    const d = new Date(departureDate);
    if (Number.isNaN(d.getTime())) return departureDate;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [departureDate]);

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Price trends by hour
        </h2>
        <p className="text-sm text-gray-600">
          Average prices for{" "}
          <span className="font-semibold text-gray-900">
            {origin} → {destination}
          </span>{" "}
          on <span className="font-semibold text-gray-900">{dateLabel}</span>
        </p>
      </div>

      {stats ? (
        <>
          {/* Stats cards - enhanced */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-white p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Minimum
              </p>
              <p className="text-2xl font-bold text-green-600">
                {currencySymbol}
                {stats.min}
              </p>
            </div>
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Average
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {currencySymbol}
                {stats.avg}
              </p>
            </div>
            <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-orange-50 to-white p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Maximum
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {currencySymbol}
                {stats.max}
              </p>
            </div>
          </div>

          {/* Chart - enhanced */}
          <div className="h-80 w-full" style={{ minHeight: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }}
                  interval={2}
                  axisLine={{ stroke: "#d1d5db", strokeWidth: 1.5 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 500 }}
                  axisLine={{ stroke: "#d1d5db", strokeWidth: 1.5 }}
                  tickLine={false}
                    tickFormatter={(v: number) => `${currencySymbol}${v}`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 13,
                    borderRadius: 10,
                    border: "2px solid #e5e7eb",
                    backgroundColor: "white",
                    color: "#111827",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    padding: "10px 14px",
                  }}
                  formatter={(value) => [
                    <span key="price" className="font-bold text-blue-600">
                      {currencySymbol}
                      {Number(value ?? 0)}
                    </span>,
                    "Price",
                  ]}
                  labelFormatter={(label) => (
                    <span className="font-semibold text-gray-900">
                      Hour: {String(label)}
                    </span>
                  )}
                />
                <ReferenceLine
                  y={stats.avg}
                  stroke="#3b82f6"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  opacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={false}
                  activeDot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "white" }}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-base font-semibold text-gray-500">No chart data yet</p>
            <p className="text-sm text-gray-400 mt-1">Run a search to see price trends</p>
          </div>
        </div>
      )}
    </div>
  );
}
