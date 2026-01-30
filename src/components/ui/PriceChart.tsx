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
import { useEffect, useMemo, useState } from "react";
import { getCurrencySymbol, clampNonZeroSeries } from "@/utils";

export function PriceChart({
  origin,
  destination,
  departureDate,
  data,
  currency = "USD",
  t,
}: PriceChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const currencySymbol = getCurrencySymbol(currency);
  const chartData = useMemo(() => clampNonZeroSeries(data ?? []), [data]);

  const stats = useMemo(() => {
    const prices = chartData.map((p) => p.price).filter((p) => p > 0);
    if (prices.length === 0) return null;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const q25Index = Math.floor(sortedPrices.length * 0.25);
    const q75Index = Math.floor(sortedPrices.length * 0.75);
    const q25 = sortedPrices[q25Index] || min;
    const q75 = sortedPrices[q75Index] || max;
    
    let priceStatus: "low" | "typical" | "high";
    let statusMessage: string;
    let statusColor: string;
    let statusBg: string;
    
    if (avg <= q25 * 1.1) {
      priceStatus = "low";
      statusMessage = "Prices are currently low";
      statusColor = "text-green-700";
      statusBg = "bg-green-50 border-green-200";
    } else if (avg >= q75 * 0.9) {
      priceStatus = "high";
      statusMessage = "Prices are currently high";
      statusColor = "text-red-700";
      statusBg = "bg-red-50 border-red-200";
    } else {
      priceStatus = "typical";
      statusMessage = "Prices are typical";
      statusColor = "text-blue-700";
      statusBg = "bg-blue-50 border-blue-200";
    }
    
    const savingsPotential = Math.round(avg - min);
    const savingsPercent = Math.round(((avg - min) / avg) * 100);
    
    return { 
      min, 
      max, 
      avg: Math.round(avg),
      q25,
      q75,
      priceStatus,
      statusMessage,
      statusColor,
      statusBg,
      savingsPotential,
      savingsPercent,
    };
  }, [chartData]);

  const dateLabel = useMemo(() => {
    const d = new Date(departureDate);
    if (Number.isNaN(d.getTime())) return departureDate;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [departureDate]);

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 640);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {t?.priceTrendsTitle ?? "Price trends by hour"}
        </h2>
        <p className="text-sm text-gray-600">
          {t?.averagePricesFor ?? "Average prices for"}{" "}
          <span className="font-semibold text-gray-900">
            {origin} → {destination}
          </span>{" "}
          {t?.onDate ?? "on"}{" "}
          <span className="font-semibold text-gray-900">{dateLabel}</span>
        </p>
      </div>

      {stats ? (
        <>
              <div className={`mb-5 rounded-xl border-2 ${stats.statusBg} p-4`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {stats.priceStatus === "low" ? (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : stats.priceStatus === "high" ? (
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${stats.statusColor} mb-1`}>
                      {stats.priceStatus === "low"
                        ? t?.pricesLow ?? stats.statusMessage
                        : stats.priceStatus === "high"
                          ? t?.pricesHigh ?? stats.statusMessage
                          : t?.pricesTypical ?? stats.statusMessage}
                </p>
                {stats.priceStatus === "high" && stats.savingsPotential > 0 && (
                  <p className="text-xs text-gray-600">
                        {t?.highSaveUpTo ?? "You could save up to"}{" "}
                        {currencySymbol}
                        {stats.savingsPotential} ({stats.savingsPercent}%){" "}
                        {t?.cheaperHoursSuffix ?? "by booking flights during cheaper hours"}
                  </p>
                )}
                {stats.priceStatus === "low" && (
                  <p className="text-xs text-gray-600">
                        {t?.goodTimeToBook ??
                          "Good time to book! Prices are below typical range for this route"}
                  </p>
                )}
                {stats.priceStatus === "typical" && (
                  <p className="text-xs text-gray-600">
                        {t?.typicalAdvice ??
                          "Prices are within typical range. Consider booking during off-peak hours for better deals"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-white p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {t?.minLabel ?? "Minimum"}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {currencySymbol}
                {stats.min}
              </p>
            </div>
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {t?.avgLabel ?? "Average"}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {currencySymbol}
                {stats.avg}
              </p>
            </div>
            <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-orange-50 to-white p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {t?.maxLabel ?? "Maximum"}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
                {currencySymbol}
                {stats.max}
              </p>
            </div>
          </div>

          <div
            className="w-full"
            style={{ height: isMobile ? 260 : 320, minHeight: isMobile ? 260 : 320 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: isMobile ? 8 : 20, left: 0, bottom: isMobile ? 36 : 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="hour"
                  tick={{
                    fontSize: isMobile ? 10 : 11,
                    fill: "#6b7280",
                    fontWeight: 500,
                  }}
                  interval={isMobile ? 5 : 2}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 44 : 30}
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
                          {t?.tooltipHour ?? "Hour"}: {String(label)}
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
                <p className="text-base font-semibold text-gray-500">
                  {t?.noChartTitle ?? "No chart data yet"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {t?.noChartSubtitle ?? "Run a search to see price trends"}
                </p>
          </div>
        </div>
      )}
    </div>
  );
}
