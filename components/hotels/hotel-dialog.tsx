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
import { Switch } from "@/components/ui/switch";
import { createHotel, updateHotel } from "@/actions/hotels";

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

interface HotelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel?: HotelWithCount | null;
}

interface FormState {
  name: string;
  address: string;
  city: string;
  phone: string;
  stars: string;
  isActive: boolean;
  error: string | null;
}

function buildFormState(hotel: HotelWithCount | null | undefined): FormState {
  if (hotel) {
    return {
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      phone: hotel.phone,
      stars: String(hotel.stars),
      isActive: hotel.isActive,
      error: null,
    };
  }
  return {
    name: "",
    address: "",
    city: "",
    phone: "",
    stars: "5",
    isActive: true,
    error: null,
  };
}

function HotelDialogContent({ onOpenChange, hotel }: Omit<HotelDialogProps, "open">) {
  const isEdit = !!hotel;
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => buildFormState(hotel));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setField("error", null);

    if (!form.name.trim()) {
      setField("error", "Otel adı gereklidir.");
      return;
    }
    if (!form.address.trim()) {
      setField("error", "Adres gereklidir.");
      return;
    }
    if (!form.city.trim()) {
      setField("error", "Şehir gereklidir.");
      return;
    }
    if (!form.phone.trim()) {
      setField("error", "Telefon gereklidir.");
      return;
    }

    startTransition(async () => {
      const data = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        stars: Number(form.stars),
        isActive: form.isActive,
      };

      const result = isEdit
        ? await updateHotel(hotel.id, data)
        : await createHotel(data);

      if (result.success) {
        onOpenChange(false);
      } else {
        setField("error", result.error ?? "Bir hata oluştu.");
      }
    });
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Otel Düzenle" : "Yeni Otel Ekle"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {form.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {form.error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="hotel-name">Otel Adı</Label>
          <Input
            id="hotel-name"
            placeholder="Grand Stay İstanbul"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-city">Şehir</Label>
            <Input
              id="hotel-city"
              placeholder="İstanbul"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hotel-phone">Telefon</Label>
            <Input
              id="hotel-phone"
              placeholder="+90 212 000 0000"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="hotel-address">Adres</Label>
          <Input
            id="hotel-address"
            placeholder="Bağcılar Mah. Cumhuriyet Cad. No:1"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hotel-stars">Yıldız</Label>
            <Select value={form.stars} onValueChange={(v) => setField("stars", v)}>
              <SelectTrigger id="hotel-stars">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} Yıldız
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Durum</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                id="hotel-active"
                checked={form.isActive}
                onCheckedChange={(v) => setField("isActive", v)}
              />
              <Label htmlFor="hotel-active" className="cursor-pointer font-normal">
                {form.isActive ? "Aktif" : "Pasif"}
              </Label>
            </div>
          </div>
        </div>

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

export function HotelDialog({ open, onOpenChange, hotel }: HotelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <HotelDialogContent
        key={hotel?.id ?? "new"}
        onOpenChange={onOpenChange}
        hotel={hotel}
      />
    </Dialog>
  );
}
