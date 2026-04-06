"use client";

import { useState, useMemo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, MagnifyingGlassIcon, BuildingsIcon } from "@phosphor-icons/react";
import { HotelCard } from "./hotel-card";
import { HotelDialog } from "./hotel-dialog";
import { deleteHotel, toggleHotelActive } from "@/actions/hotels";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface HotelWithCount {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  stars: number;
  isActive: boolean;
  _count: { rooms: number; staff: number };
}

interface HotelsClientProps {
  hotels: HotelWithCount[];
}

export function HotelsClient({ hotels }: HotelsClientProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editHotel, setEditHotel] = useState<HotelWithCount | null>(null);
  const [, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<HotelWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return hotels;
    const q = search.toLowerCase();
    return hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
    );
  }, [hotels, search]);

  function openAdd() {
    setEditHotel(null);
    setDialogOpen(true);
  }

  function openEdit(hotel: HotelWithCount) {
    setEditHotel(hotel);
    setDialogOpen(true);
  }

  function handleToggleActive(hotel: HotelWithCount) {
    startTransition(async () => {
      await toggleHotelActive(hotel.id);
    });
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteHotel(deleteTarget.id);
      if (!result.success) {
        console.error(result.error);
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  function handleDelete(hotel: HotelWithCount) {
    setDeleteTarget(hotel);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Otel Yönetimi</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} otel{filtered.length !== hotels.length ? ` / ${hotels.length} toplam` : " toplam"}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-1.5 sm:self-start">
          <PlusIcon size={16} />
          Yeni Otel Ekle
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon
          size={16}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Otel ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <BuildingsIcon size={28} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Otel bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Farklı bir arama terimi deneyin."
                : "Henüz hiç otel eklenmemiş."}
            </p>
          </div>
          {!search && (
            <Button onClick={openAdd} variant="outline" className="gap-1.5">
              <PlusIcon size={16} />
              İlk Oteli Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onEdit={() => openEdit(hotel)}
              onToggleActive={() => handleToggleActive(hotel)}
            />
          ))}
        </div>
      )}

      <HotelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hotel={editHotel}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`"${deleteTarget?.name}" otelini silmek istediğinize emin misiniz?`}
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
