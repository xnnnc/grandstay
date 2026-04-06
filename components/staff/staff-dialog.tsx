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
import { createStaff, updateStaff } from "@/actions/staff";
import { UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "ADMIN", label: "Yönetici" },
  { value: "MANAGER", label: "Müdür" },
  { value: "RECEPTIONIST", label: "Resepsiyonist" },
  { value: "HOUSEKEEPING", label: "Kat Hizmetleri" },
  { value: "CONCIERGE", label: "Concierge" },
];

interface Hotel {
  id: string;
  name: string;
  city: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  hotel: { id: string; name: string; city: string } | null;
}

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffMember | null;
  hotels: Hotel[];
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  hotelId: string;
  isActive: boolean;
  error: string | null;
}

function buildFormState(staff: StaffMember | null | undefined, hotels: Hotel[]): FormState {
  if (staff) {
    return {
      name: staff.name,
      email: staff.email,
      password: "",
      role: staff.role as UserRole,
      hotelId: staff.hotel?.id ?? "NONE",
      isActive: staff.isActive,
      error: null,
    };
  }
  return {
    name: "",
    email: "",
    password: "",
    role: "RECEPTIONIST",
    hotelId: hotels[0]?.id ?? "NONE",
    isActive: true,
    error: null,
  };
}

function StaffDialogContent({ onOpenChange, staff, hotels }: Omit<StaffDialogProps, "open">) {
  const isEdit = !!staff;
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => buildFormState(staff, hotels));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setField("error", null);

    if (!form.name.trim()) {
      setField("error", "Ad Soyad gereklidir.");
      return;
    }
    if (!form.email.trim()) {
      setField("error", "E-posta gereklidir.");
      return;
    }
    if (!isEdit && !form.password.trim()) {
      setField("error", "Şifre gereklidir.");
      return;
    }
    if (form.password && form.password.length < 6) {
      setField("error", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    startTransition(async () => {
      const data = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim() || undefined,
        role: form.role,
        hotelId: form.hotelId === "NONE" ? undefined : form.hotelId,
        isActive: form.isActive,
      };

      const result = isEdit
        ? await updateStaff(staff.id, data)
        : await createStaff({ ...data, password: data.password ?? "" });

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
        <DialogTitle>{isEdit ? "Personel Düzenle" : "Yeni Personel Ekle"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {form.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {form.error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="staff-name">Ad Soyad</Label>
          <Input
            id="staff-name"
            placeholder="Ahmet Yılmaz"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-email">E-posta</Label>
          <Input
            id="staff-email"
            type="email"
            placeholder="ahmet@grandstay.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-password">
            Şifre {isEdit && <span className="text-xs text-muted-foreground">(boş bırakırsanız değişmez)</span>}
          </Label>
          <Input
            id="staff-password"
            type="password"
            placeholder={isEdit ? "Yeni şifre (opsiyonel)" : "En az 6 karakter"}
            value={form.password}
            onChange={(e) => setField("password", e.target.value)}
            required={!isEdit}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-role">Rol</Label>
            <Select value={form.role} onValueChange={(v) => setField("role", v as UserRole)}>
              <SelectTrigger id="staff-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-hotel">Otel</Label>
            <Select value={form.hotelId} onValueChange={(v) => setField("hotelId", v)}>
              <SelectTrigger id="staff-hotel">
                <SelectValue placeholder="Otel seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Otel Yok</SelectItem>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Durum</Label>
          <div className="flex items-center gap-2">
            <Switch
              id="staff-active"
              checked={form.isActive}
              onCheckedChange={(v) => setField("isActive", v)}
            />
            <Label htmlFor="staff-active" className="cursor-pointer font-normal">
              {form.isActive ? "Aktif" : "Pasif"}
            </Label>
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

export function StaffDialog({ open, onOpenChange, staff, hotels }: StaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <StaffDialogContent
        key={staff?.id ?? "new"}
        onOpenChange={onOpenChange}
        staff={staff}
        hotels={hotels}
      />
    </Dialog>
  );
}
