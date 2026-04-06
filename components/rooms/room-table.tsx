"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PencilSimpleIcon, DotsThreeVerticalIcon, ArrowUpIcon, ArrowDownIcon, TrashIcon } from "@phosphor-icons/react";
import { RoomStatusBadge } from "./room-status-badge";
import { updateRoomStatus } from "@/actions/rooms";
import { RoomStatus, RoomType } from "@/types";

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  SINGLE: "Tek Kişilik",
  DOUBLE: "Çift Kişilik",
  SUITE: "Süit",
  DELUXE: "Deluxe",
  FAMILY: "Aile",
};

const STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Müsait" },
  { value: "OCCUPIED", label: "Dolu" },
  { value: "CLEANING", label: "Temizleniyor" },
  { value: "MAINTENANCE", label: "Bakımda" },
  { value: "RESERVED", label: "Rezerve" },
];

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

type SortKey = "number" | "floor" | "pricePerNight" | "capacity";
type SortDir = "asc" | "desc";

interface SortIconProps {
  col: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}

function SortIcon({ col, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== col) return <span className="ml-1 text-muted-foreground/40">↕</span>;
  return sortDir === "asc"
    ? <ArrowUpIcon size={12} className="ml-1 inline text-primary" />
    : <ArrowDownIcon size={12} className="ml-1 inline text-primary" />;
}

interface RoomTableProps {
  rooms: RoomWithHotel[];
  userRole: string;
  onEdit: (room: RoomWithHotel) => void;
  onDelete?: (room: RoomWithHotel) => void;
}

export function RoomTable({ rooms, userRole, onEdit, onDelete }: RoomTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("number");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...rooms].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === "number" && typeof bv === "number"
      ? av - bv
      : String(av).localeCompare(String(bv), "tr");
    return sortDir === "asc" ? cmp : -cmp;
  });

  async function handleStatusChange(roomId: string, newStatus: RoomStatus) {
    await updateRoomStatus(roomId, newStatus);
  }

  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("number")}
            >
              Oda No <SortIcon col="number" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead>Tip</TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("floor")}
            >
              Kat <SortIcon col="floor" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("capacity")}
            >
              Kapasite <SortIcon col="capacity" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead
              className="cursor-pointer select-none"
              onClick={() => handleSort("pricePerNight")}
            >
              Fiyat/Gece <SortIcon col="pricePerNight" sortKey={sortKey} sortDir={sortDir} />
            </TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Otel</TableHead>
            {canEdit && <TableHead className="text-right">İşlemler</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((room, idx) => (
            <TableRow
              key={room.id}
              className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}
            >
              <TableCell className="font-semibold">{room.number}</TableCell>
              <TableCell>{ROOM_TYPE_LABELS[room.type as RoomType] ?? room.type}</TableCell>
              <TableCell>{room.floor}. Kat</TableCell>
              <TableCell>{room.capacity} Kişi</TableCell>
              <TableCell className="font-medium text-primary">
                ₺{room.pricePerNight.toLocaleString("tr-TR")}
              </TableCell>
              <TableCell>
                <RoomStatusBadge status={room.status as RoomStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {room.hotel.name}
              </TableCell>
              {canEdit && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <DotsThreeVerticalIcon size={16} />
                        <span className="sr-only">İşlemler</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(room)}>
                        <PencilSimpleIcon size={14} className="mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(room)}
                            className="text-destructive focus:text-destructive"
                          >
                            <TrashIcon size={14} className="mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Durum Değiştir
                      </DropdownMenuLabel>
                      {STATUS_OPTIONS.filter((s) => s.value !== room.status).map((s) => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => handleStatusChange(room.id, s.value)}
                        >
                          {s.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
