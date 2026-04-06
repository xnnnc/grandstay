"use client";

import { useState, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OccupancyReport } from "./occupancy-report";
import { RevenueReport } from "./revenue-report";
import { GuestStatsReport } from "./guest-stats-report";
import { HousekeepingReport } from "./housekeeping-report";
import { ReservationReport } from "./reservation-report";
import {
  getOccupancyReport,
  getRevenueReport,
  getGuestStats,
  getHousekeepingReport,
  getReservationAnalysis,
} from "@/actions/reports";

interface Hotel {
  id: string;
  name: string;
}

interface Props {
  hotels: Hotel[];
  initialOccupancy: Awaited<ReturnType<typeof getOccupancyReport>>;
  initialRevenue: Awaited<ReturnType<typeof getRevenueReport>>;
  initialGuests: Awaited<ReturnType<typeof getGuestStats>>;
  initialHousekeeping: Awaited<ReturnType<typeof getHousekeepingReport>>;
  initialReservations: Awaited<ReturnType<typeof getReservationAnalysis>>;
}

export function ReportsClient({
  hotels,
  initialOccupancy,
  initialRevenue,
  initialGuests,
  initialHousekeeping,
  initialReservations,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("occupancy");
  const [hotelId, setHotelId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const [reportData, setReportData] = useState({
    occupancy: initialOccupancy,
    revenue: initialRevenue,
    guests: initialGuests,
    housekeeping: initialHousekeeping,
    reservations: initialReservations,
  });

  const resolvedHotelId = hotelId === "all" ? undefined : hotelId;

  function applyFilters() {
    startTransition(async () => {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;

      const [occ, rev, guests, hk, res] = await Promise.all([
        getOccupancyReport(resolvedHotelId, start, end),
        getRevenueReport(resolvedHotelId, start, end),
        getGuestStats(resolvedHotelId),
        getHousekeepingReport(resolvedHotelId, start, end),
        getReservationAnalysis(resolvedHotelId, start, end),
      ]);

      setReportData({
        occupancy: occ,
        revenue: rev,
        guests,
        housekeeping: hk,
        reservations: res,
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="report-start-date" className="text-xs font-medium text-muted-foreground">Tarih Aralığı - Başlangıç</label>
              <input
                id="report-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="report-end-date" className="text-xs font-medium text-muted-foreground">Bitiş</label>
              <input
                id="report-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {hotels.length > 1 && (
              <div className="flex flex-col gap-1">
                <label htmlFor="report-hotel-select" className="text-xs font-medium text-muted-foreground">Otel Seç</label>
                <Select value={hotelId} onValueChange={setHotelId}>
                  <SelectTrigger id="report-hotel-select" className="w-48">
                    <SelectValue placeholder="Tüm Oteller" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Oteller</SelectItem>
                    {hotels.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <button
              onClick={applyFilters}
              disabled={isPending}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isPending ? "Yükleniyor..." : "Filtrele"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="occupancy">Doluluk</TabsTrigger>
          <TabsTrigger value="revenue">Gelir</TabsTrigger>
          <TabsTrigger value="guests">Misafirler</TabsTrigger>
          <TabsTrigger value="housekeeping">Kat Hizmetleri</TabsTrigger>
          <TabsTrigger value="reservations">Rezervasyonlar</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy" className="mt-6">
          {reportData.occupancy.success && reportData.occupancy.data ? (
            <OccupancyReport data={reportData.occupancy.data} />
          ) : (
            <p className="text-muted-foreground text-sm">{reportData.occupancy.error ?? "Veri yüklenemedi."}</p>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          {reportData.revenue.success && reportData.revenue.data ? (
            <RevenueReport data={reportData.revenue.data} />
          ) : (
            <p className="text-muted-foreground text-sm">{reportData.revenue.error ?? "Veri yüklenemedi."}</p>
          )}
        </TabsContent>

        <TabsContent value="guests" className="mt-6">
          {reportData.guests.success && reportData.guests.data ? (
            <GuestStatsReport data={reportData.guests.data} />
          ) : (
            <p className="text-muted-foreground text-sm">{reportData.guests.error ?? "Veri yüklenemedi."}</p>
          )}
        </TabsContent>

        <TabsContent value="housekeeping" className="mt-6">
          {reportData.housekeeping.success && reportData.housekeeping.data ? (
            <HousekeepingReport data={reportData.housekeeping.data} />
          ) : (
            <p className="text-muted-foreground text-sm">{reportData.housekeeping.error ?? "Veri yüklenemedi."}</p>
          )}
        </TabsContent>

        <TabsContent value="reservations" className="mt-6">
          {reportData.reservations.success && reportData.reservations.data ? (
            <ReservationReport data={reportData.reservations.data} />
          ) : (
            <p className="text-muted-foreground text-sm">{reportData.reservations.error ?? "Veri yüklenemedi."}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
