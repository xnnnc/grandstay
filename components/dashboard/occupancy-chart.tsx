"use client";

import type { OccupancyDataPoint } from "@/actions/dashboard";
import { ChartLine } from "@phosphor-icons/react";
import dynamic from "next/dynamic";

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
}

function CircularGauge({ rate, label }: { rate: number; label?: string }) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (rate / 100) * circumference;

  const color =
    rate >= 75
      ? "text-emerald-500"
      : rate >= 40
        ? "text-amber-500"
        : "text-red-500";

  const trackColor = "stroke-muted";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        <svg width={radius * 2} height={radius * 2} className="-rotate-90">
          {/* Track */}
          <circle
            className={trackColor}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress */}
          <circle
            className={`${color} transition-all duration-700 ease-out`}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>%{rate}</span>
          <span className="text-xs text-muted-foreground">doluluk</span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      )}
    </div>
  );
}

function DailyBar({
  day,
  rate,
  isToday,
}: {
  day: string;
  rate: number;
  isToday: boolean;
}) {
  const color =
    rate >= 75
      ? "bg-emerald-500"
      : rate >= 40
        ? "bg-amber-500"
        : "bg-red-400";

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <span className="text-[10px] text-muted-foreground font-medium">
        %{rate}
      </span>
      <div className="relative w-full flex justify-center">
        <div className="w-5 h-24 rounded-full bg-muted overflow-hidden flex flex-col-reverse">
          <div
            className={`w-full rounded-full transition-all duration-500 ${color}`}
            style={{ height: `${Math.max(rate, 4)}%` }}
          />
        </div>
      </div>
      <span
        className={`text-[11px] font-medium ${
          isToday
            ? "text-primary font-bold"
            : "text-muted-foreground"
        }`}
      >
        {day}
      </span>
    </div>
  );
}

function OccupancyChartInner({ data }: OccupancyChartProps) {
  const isEmpty = !data || data.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-muted-foreground">
        <ChartLine
          size={32}
          weight="thin"
          className="opacity-30 text-primary/40"
        />
        <p className="text-sm">Henüz doluluk verisi bulunmuyor</p>
      </div>
    );
  }

  const currentRate = data[data.length - 1]?.rate ?? 0;
  const prevRate = data.length > 1 ? data[data.length - 2]?.rate ?? 0 : 0;
  const rateDiff = currentRate - prevRate;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top: Circular gauge + stats */}
      <div className="flex items-center gap-6">
        <CircularGauge rate={currentRate} />

        <div className="flex flex-col gap-3 flex-1">
          {rateDiff !== 0 && (
            <div
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${
                rateDiff > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              <span>
                {rateDiff > 0 ? "+" : ""}
                {rateDiff}%
              </span>
              <span className="text-muted-foreground">düne göre</span>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">Dolu</span>
              <span className="text-sm font-semibold ml-auto">
                {data[data.length - 1]?.occupied ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-300 dark:bg-teal-400" />
              <span className="text-sm text-muted-foreground">Müsait</span>
              <span className="text-sm font-semibold ml-auto">
                {data[data.length - 1]?.available ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Daily bars */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-3">
          Son 7 Gün
        </p>
        <div className="flex items-end gap-1">
          {data.map((point, i) => (
            <DailyBar
              key={point.date}
              day={point.date}
              rate={point.rate}
              isToday={i === data.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const OccupancyChart = dynamic(
  () => Promise.resolve(OccupancyChartInner),
  { ssr: false }
);
