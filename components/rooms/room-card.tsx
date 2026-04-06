"use client";

import { BedIcon, UsersIcon, BuildingIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RoomStatusBadge } from "./room-status-badge";
import { RoomStatus, RoomType } from "@/types";

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SINGLE: "Tek Kişilik",
  DOUBLE: "Çift Kişilik",
  SUITE: "Süit",
  DELUXE: "Deluxe",
  FAMILY: "Aile",
};

interface RoomWithHotel {
  id: string;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  pricePerNight: number;
  status: string;
  amenities: string;
  hotelId: string;
  hotel: { id: string; name: string };
}

interface RoomCardProps {
  room: RoomWithHotel;
  onClick?: () => void;
}

export function RoomCard({ room, onClick }: RoomCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border border-border"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BedIcon size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{room.number}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ROOM_TYPE_LABELS[room.type as RoomType] ?? room.type}</p>
            </div>
          </div>
          <RoomStatusBadge status={room.status as RoomStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Kat</span>
          <span className="font-medium">{room.floor}. Kat</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <UsersIcon size={14} />
            Kapasite
          </span>
          <span className="font-medium">{room.capacity} Kişi</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fiyat/Gece</span>
          <span className="font-semibold text-primary">
            ₺{room.pricePerNight.toLocaleString("tr-TR")}/gece
          </span>
        </div>
        <div className="border-t pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BuildingIcon size={12} />
            <span className="truncate">{room.hotel.name}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
