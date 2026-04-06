"use client";

import { BuildingIcon, StarIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HotelSummary } from "@/actions/dashboard";

interface HotelsSummaryProps {
  hotels: HotelSummary[];
}

function OccupancyBar({ rate }: { rate: number }) {
  const color =
    rate >= 80 ? "bg-red-500" : rate >= 50 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">%{rate}</span>
    </div>
  );
}

export function HotelsSummaryGrid({ hotels }: HotelsSummaryProps) {
  return (
    <Card className="rounded-xl border border-border/60 dashboard-card hover:border-primary/10">
      <CardHeader className="pb-1 border-b border-border/40">
        <div className="group flex items-center gap-2">
          <BuildingIcon size={18} className="text-primary transition-transform duration-200 group-hover:scale-105" weight="duotone" />
          <div>
            <h3 className="text-sm font-semibold">Tüm Oteller</h3>
            <p className="text-xs text-muted-foreground">
              {hotels.length} aktif şube
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {hotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BuildingIcon size={28} weight="thin" className="mb-2 opacity-40" />
            <p className="text-sm">Kayıtlı otel bulunamadı</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {hotels.map((hotel) => (
              <li
                key={hotel.id}
                className="group/hotel px-4 py-3 hover:bg-muted/30 transition-all duration-200 border-l-2 border-l-transparent hover:border-l-primary/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">
                        {hotel.name}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {hotel.city}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 mb-2">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <StarIcon
                          key={i}
                          size={10}
                          weight="fill"
                          className="text-amber-400 transition-all duration-200 group-hover/hotel:drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]"
                        />
                      ))}
                    </div>
                    <OccupancyBar rate={hotel.occupancyRate} />
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {hotel.occupiedRooms}/{hotel.totalRooms} oda
                    </p>
                    {hotel.pendingReservations > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      >
                        {hotel.pendingReservations} bekleyen
                      </Badge>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
