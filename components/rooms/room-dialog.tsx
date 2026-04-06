"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRoom, updateRoom } from "@/actions/rooms";
import { RoomStatus, RoomType } from "@/types";

const ROOM_TYPE_OPTIONS: { value: RoomType; label: string }[] = [
  { value: "SINGLE", label: "Tek Kişilik" },
  { value: "DOUBLE", label: "Çift Kişilik" },
  { value: "SUITE", label: "Süit" },
  { value: "DELUXE", label: "Deluxe" },
  { value: "FAMILY", label: "Aile" },
];

const ROOM_STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Müsait" },
  { value: "OCCUPIED", label: "Dolu" },
  { value: "CLEANING", label: "Temizleniyor" },
  { value: "MAINTENANCE", label: "Bakımda" },
  { value: "RESERVED", label: "Rezerve" },
];

const FLOOR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface Hotel {
  id: string;
  name: string;
}

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
  hotel: Hotel;
}

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: RoomWithHotel | null;
  hotels: Hotel[];
  defaultHotelId?: string;
  userRole: string;
  onSuccess?: () => void;
}

interface FormState {
  number: string;
  floor: string;
  type: RoomType;
  capacity: string;
  pricePerNight: string;
  status: RoomStatus;
  hotelId: string;
  error: string | null;
}

function buildFormState(
  room: RoomWithHotel | null | undefined,
  hotels: Hotel[],
  defaultHotelId: string | undefined
): FormState {
  if (room) {
    return {
      number: room.number,
      floor: String(room.floor),
      type: room.type as RoomType,
      capacity: String(room.capacity),
      pricePerNight: String(room.pricePerNight),
      status: room.status as RoomStatus,
      hotelId: room.hotelId,
      error: null,
    };
  }
  return {
    number: "",
    floor: "1",
    type: "SINGLE",
    capacity: "2",
    pricePerNight: "",
    status: "AVAILABLE",
    hotelId: defaultHotelId ?? hotels[0]?.id ?? "",
    error: null,
  };
}

function RoomDialogContent({
  onOpenChange,
  room,
  hotels,
  defaultHotelId,
  userRole,
  onSuccess,
}: Omit<RoomDialogProps, "open">) {
  const isEdit = !!room;
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() =>
    buildFormState(room, hotels, defaultHotelId)
  );

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setField("error", null);

    if (!form.number.trim()) {
      setField("error", "Oda numarası gereklidir.");
      return;
    }
    if (!form.pricePerNight || isNaN(Number(form.pricePerNight)) || Number(form.pricePerNight) <= 0) {
      setField("error", "Geçerli bir fiyat girin.");
      return;
    }
    if (!form.hotelId) {
      setField("error", "Otel seçiniz.");
      return;
    }

    startTransition(async () => {
      const data = {
        number: form.number.trim(),
        floor: Number(form.floor),
        type: form.type,
        capacity: Number(form.capacity),
        pricePerNight: Number(form.pricePerNight),
        status: form.status,
        hotelId: form.hotelId,
      };

      const result = isEdit
        ? await updateRoom(room.id, data)
        : await createRoom(data);

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        setField("error", result.error ?? "Bir hata oluştu.");
      }
    });
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Oda Düzenle" : "Yeni Oda Ekle"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {form.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {form.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="room-number">Oda No</Label>
            <Input
              id="room-number"
              placeholder="101"
              value={form.number}
              onChange={(e) => setField("number", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-floor">Kat</Label>
            <Select value={form.floor} onValueChange={(v) => setField("floor", v)}>
              <SelectTrigger id="room-floor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FLOOR_OPTIONS.map((f) => (
                  <SelectItem key={f} value={String(f)}>
                    {f}. Kat
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="room-type">Tip</Label>
            <Select value={form.type} onValueChange={(v) => setField("type", v as RoomType)}>
              <SelectTrigger id="room-type">
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
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="room-capacity">Kapasite (Kişi)</Label>
            <Input
              id="room-capacity"
              type="number"
              min={1}
              max={20}
              value={form.capacity}
              onChange={(e) => setField("capacity", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="room-price">Fiyat/Gece (₺)</Label>
          <Input
            id="room-price"
            type="number"
            min={0}
            step={0.01}
            placeholder="800"
            value={form.pricePerNight}
            onChange={(e) => setField("pricePerNight", e.target.value)}
            required
          />
        </div>

        {isEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="room-status">Durum</Label>
            <Select value={form.status} onValueChange={(v) => setField("status", v as RoomStatus)}>
              <SelectTrigger id="room-status">
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
          </div>
        )}

        {userRole === "ADMIN" && hotels.length > 1 && (
          <div className="space-y-1.5">
            <Label htmlFor="room-hotel">Otel</Label>
            <Select value={form.hotelId} onValueChange={(v) => setField("hotelId", v)}>
              <SelectTrigger id="room-hotel">
                <SelectValue placeholder="Otel seçin" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            İptal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function RoomDialog({
  open,
  onOpenChange,
  room,
  hotels,
  defaultHotelId,
  userRole,
  onSuccess,
}: RoomDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <RoomDialogContent
        key={room?.id ?? "new"}
        onOpenChange={onOpenChange}
        room={room}
        hotels={hotels}
        defaultHotelId={defaultHotelId}
        userRole={userRole}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
