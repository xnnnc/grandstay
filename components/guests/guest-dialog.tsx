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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createGuest, updateGuest } from "@/actions/guests";

const NATIONALITY_OPTIONS = [
  { value: "TR", label: "🇹🇷 Türkiye" },
  { value: "GB", label: "🇬🇧 İngiltere" },
  { value: "DE", label: "🇩🇪 Almanya" },
  { value: "FR", label: "🇫🇷 Fransa" },
  { value: "US", label: "🇺🇸 Amerika" },
  { value: "RU", label: "🇷🇺 Rusya" },
];

interface GuestRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  idNumber: string;
  nationality: string;
  notes: string | null;
}

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: GuestRow | null;
  onSuccess?: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality: string;
  notes: string;
  error: string | null;
}

function buildFormState(guest: GuestRow | null | undefined): FormState {
  if (guest) {
    return {
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
      idNumber: guest.idNumber,
      nationality: guest.nationality,
      notes: guest.notes ?? "",
      error: null,
    };
  }
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idNumber: "",
    nationality: "TR",
    notes: "",
    error: null,
  };
}

function GuestDialogContent({
  onOpenChange,
  guest,
  onSuccess,
}: Omit<GuestDialogProps, "open">) {
  const isEdit = !!guest;
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(() => buildFormState(guest));

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setField("error", null);

    if (!form.firstName.trim()) {
      setField("error", "Ad alanı zorunludur.");
      return;
    }
    if (!form.lastName.trim()) {
      setField("error", "Soyad alanı zorunludur.");
      return;
    }
    if (!form.idNumber.trim()) {
      setField("error", "TC Kimlik No / Pasaport No zorunludur.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setField("error", "Geçerli bir email adresi girin.");
      return;
    }

    startTransition(async () => {
      const data = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        idNumber: form.idNumber.trim(),
        nationality: form.nationality,
        notes: form.notes.trim() || undefined,
      };

      const result = isEdit
        ? await updateGuest(guest.id, data)
        : await createGuest(data);

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
        <DialogTitle>{isEdit ? "Misafir Düzenle" : "Yeni Misafir Ekle"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {form.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {form.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="guest-firstname">
              Ad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guest-firstname"
              placeholder="Ahmet"
              value={form.firstName}
              onChange={(e) => setField("firstName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guest-lastname">
              Soyad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="guest-lastname"
              placeholder="Yılmaz"
              value={form.lastName}
              onChange={(e) => setField("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-idnumber">
            TC Kimlik No / Pasaport No <span className="text-red-500">*</span>
          </Label>
          <Input
            id="guest-idnumber"
            placeholder="12345678901"
            value={form.idNumber}
            onChange={(e) => setField("idNumber", e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-nationality">Uyruk</Label>
          <Select value={form.nationality} onValueChange={(v) => setField("nationality", v)}>
            <SelectTrigger id="guest-nationality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {NATIONALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-email">Email</Label>
          <Input
            id="guest-email"
            type="email"
            placeholder="ahmet@ornek.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-phone">Telefon</Label>
          <Input
            id="guest-phone"
            type="tel"
            placeholder="+90 555 123 45 67"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-notes">Notlar</Label>
          <Textarea
            id="guest-notes"
            placeholder="Misafir hakkında notlar..."
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            rows={3}
          />
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

export function GuestDialog({
  open,
  onOpenChange,
  guest,
  onSuccess,
}: GuestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <GuestDialogContent
        key={guest?.id ?? "new"}
        onOpenChange={onOpenChange}
        guest={guest}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}
