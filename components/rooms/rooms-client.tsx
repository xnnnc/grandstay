"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  ListIcon,
  BedIcon,
  FunnelIcon,
} from "@phosphor-icons/react";
import { RoomCard } from "./room-card";
import { RoomTable } from "./room-table";
import { RoomDialog } from "./room-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteRoom } from "@/actions/rooms";
import { RoomStatus, RoomType } from "@/types";

const ROOM_TYPE_OPTIONS: { value: RoomType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tüm Tipler" },
  { value: "SINGLE", label: "Tek Kişilik" },
  { value: "DOUBLE", label: "Çift Kişilik" },
  { value: "SUITE", label: "Süit" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "FAMILY", label: "Aile" },
];

const ROOM_STATUS_OPTIONS: { value: RoomStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tüm Durumlar" },
  { value: "AVAILABLE", label: "Müsait" },
  { value: "OCCUPIED", label: "Dolu" },
  { value: "CLEANING", label: "Temizleniyor" },
  { value: "MAINTENANCE", label: "Bakımda" },
  { value: "RESERVED", label: "Rezerve" },
];

const FLOOR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

interface RoomsClientProps {
  rooms: RoomWithHotel[];
  userRole: string;
}

export function RoomsClient({ rooms, userRole }: RoomsClientProps) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RoomType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "ALL">("ALL");
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<RoomWithHotel | null>(null);
  const canEdit = userRole === "ADMIN" || userRole === "MANAGER";

  const hotels = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    rooms.forEach((r) => map.set(r.hotelId, r.hotel));
    return Array.from(map.values());
  }, [rooms]);

  const defaultHotelId = hotels[0]?.id ?? "";

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      if (search && !room.number.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "ALL" && room.type !== typeFilter) return false;
      if (statusFilter !== "ALL" && room.status !== statusFilter) return false;
      if (floorFilter !== "ALL" && room.floor !== Number(floorFilter)) return false;
      return true;
    });
  }, [rooms, search, typeFilter, statusFilter, floorFilter]);

  function openAdd() {
    setEditRoom(null);
    setDialogOpen(true);
  }

  function openEdit(room: RoomWithHotel) {
    setEditRoom(room);
    setDialogOpen(true);
  }

  const [deleteTarget, setDeleteTarget] = useState<RoomWithHotel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteRoom(deleteTarget.id);
      if (!result.success) console.error(result.error ?? "Silme işlemi başarısız.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters =
    search !== "" || typeFilter !== "ALL" || statusFilter !== "ALL" || floorFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Oda Yönetimi</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} oda{filtered.length !== rooms.length ? ` / ${rooms.length} toplam` : " toplam"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="icon"
              className="rounded-r-none h-9 w-9"
              onClick={() => setView("grid")}
              title="Kart görünümü"
            >
              <SquaresFourIcon size={16} />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="icon"
              className="rounded-l-none h-9 w-9"
              onClick={() => setView("table")}
              title="Tablo görünümü"
            >
              <ListIcon size={16} />
            </Button>
          </div>
          {canEdit && (
            <Button onClick={openAdd} className="gap-1.5">
              <PlusIcon size={16} />
              Yeni Oda Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[160px]">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Oda numarası ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <FunnelIcon size={14} className="text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filtrele:</span>
          </div>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as RoomType | "ALL")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RoomStatus | "ALL")}>
            <SelectTrigger className="w-[148px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROOM_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tüm Katlar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tüm Katlar</SelectItem>
              {FLOOR_OPTIONS.map((f) => (
                <SelectItem key={f} value={String(f)}>
                  {f}. Kat
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9"
              onClick={() => {
                setSearch("");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
                setFloorFilter("ALL");
              }}
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <BedIcon size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Oda bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Filtreleri değiştirerek tekrar deneyin."
                : "Henüz hiç oda eklenmemiş."}
            </p>
          </div>
          {!hasFilters && canEdit && (
            <Button onClick={openAdd} variant="outline" className="gap-1.5">
              <PlusIcon size={16} />
              İlk Odayı Ekle
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onClick={canEdit ? () => openEdit(room) : undefined}
            />
          ))}
        </div>
      ) : (
        <RoomTable rooms={filtered} userRole={userRole} onEdit={openEdit} onDelete={canEdit ? (room) => setDeleteTarget(room) : undefined} />
      )}

      {/* Dialog */}
      <RoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        room={editRoom}
        hotels={hotels}
        defaultHotelId={defaultHotelId}
        userRole={userRole}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Bu odayı silmek istediğinize emin misiniz?"
        description="Oda ve ilişkili tüm veriler kalıcı olarak silinecektir."
        confirmLabel="Sil"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
