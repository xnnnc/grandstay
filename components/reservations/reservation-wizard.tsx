"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CalendarBlank,
  Bed,
  Check,
  ArrowRight,
  ArrowLeft,
  MagnifyingGlass,
  Plus,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getGuests, createGuest } from "@/actions/guests";
import { getAvailableRooms, createReservation } from "@/actions/reservations";

interface Hotel {
  id: string;
  name: string;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  idNumber: string;
  nationality: string;
}

interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  pricePerNight: number;
  status: string;
  hotel: Hotel;
}

interface ReservationWizardProps {
  hotels: Hotel[];
  defaultHotelId?: string;
  userRole: string;
}

const STEPS = [
  { id: 1, label: "Misafir Seçimi" },
  { id: 2, label: "Tarih Seçimi" },
  { id: 3, label: "Oda Seçimi" },
  { id: 4, label: "Özet ve Onay" },
];

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Tekli",
  DOUBLE: "Çiftli",
  SUITE: "Süit",
  DELUXE: "Delüks",
  FAMILY: "Aile",
};

const CURRENCY_OPTIONS = [
  { value: "TRY", label: "TRY (?)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "TRY") {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(amount);
  }

  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amount);
}

function calcNights(checkIn: Date, checkOut: Date): number {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {STEPS.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/30 bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check size={16} weight="bold" /> : step.id}
              </div>
              <span
                className={`hidden text-xs font-medium sm:block ${
                  isActive ? "text-primary" : isCompleted ? "text-primary/70" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  step.id < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1Guest({
  selected,
  onSelect,
}: {
  selected: Guest | null;
  onSelect: (g: Guest) => void;
}) {
  const [search, setSearch] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ firstName: "", lastName: "", idNumber: "", phone: "", email: "" });
  const [creating, startCreating] = useTransition();
  const [error, setError] = useState("");

  const doSearch = useCallback(async (q: string) => {
    setLoading(true);
    const result = await getGuests(q || undefined);
    if (result.success && result.data) setGuests(result.data as Guest[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const delay = search.trim() ? 300 : 0;
    const timer = setTimeout(() => {
      void doSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search, doSearch]);

  function handleCreate() {
    setError("");
    if (!newGuest.firstName.trim() || !newGuest.lastName.trim() || !newGuest.idNumber.trim()) {
      setError("Ad, soyad ve kimlik no zorunludur.");
      return;
    }

    startCreating(async () => {
      const result = await createGuest({
        firstName: newGuest.firstName,
        lastName: newGuest.lastName,
        idNumber: newGuest.idNumber,
        phone: newGuest.phone || undefined,
        email: newGuest.email || undefined,
      });

      if (!result.success) {
        setError(result.error ?? "Misafir oluşturulamadı.");
      } else if (result.data) {
        onSelect(result.data as Guest);
        setShowNewForm(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Misafir Seçimi</h2>
        <p className="text-sm text-muted-foreground">Mevcut misafiri seçin veya yeni misafir ekleyin.</p>
      </div>

      {selected && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            {selected.firstName[0]}
            {selected.lastName[0]}
          </div>
          <div>
            <p className="font-semibold">
              {selected.firstName} {selected.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {selected.idNumber}
              {selected.phone ? ` · ${selected.phone}` : ""}
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => onSelect(selected)}>
            Değiştir
          </Button>
        </div>
      )}

      {!showNewForm ? (
        <>
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="İsim veya kimlik no ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Yükleniyor...</p>
          ) : guests.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Misafir bulunamadı.</p>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border p-1">
              {guests.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelect(g)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                    selected?.id === g.id ? "bg-primary/10 ring-1 ring-primary" : ""
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {g.firstName[0]}
                    {g.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {g.firstName} {g.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{g.idNumber}</p>
                  </div>
                  {selected?.id === g.id && <Check size={16} className="ml-auto text-primary" />}
                </button>
              ))}
            </div>
          )}

          <Button variant="outline" className="w-full gap-2" onClick={() => setShowNewForm(true)}>
            <Plus size={14} />
            Yeni Misafir Ekle
          </Button>
        </>
      ) : (
        <div className="space-y-3 rounded-xl border p-4">
          <h3 className="font-medium">Yeni Misafir</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-guest-firstname" className="text-xs font-medium text-muted-foreground">
                Ad *
              </label>
              <Input
                id="new-guest-firstname"
                value={newGuest.firstName}
                onChange={(e) => setNewGuest((prev) => ({ ...prev, firstName: e.target.value }))}
                placeholder="Ad"
              />
            </div>
            <div>
              <label htmlFor="new-guest-lastname" className="text-xs font-medium text-muted-foreground">
                Soyad *
              </label>
              <Input
                id="new-guest-lastname"
                value={newGuest.lastName}
                onChange={(e) => setNewGuest((prev) => ({ ...prev, lastName: e.target.value }))}
                placeholder="Soyad"
              />
            </div>
            <div>
              <label htmlFor="new-guest-idnumber" className="text-xs font-medium text-muted-foreground">
                TC Kimlik / Pasaport *
              </label>
              <Input
                id="new-guest-idnumber"
                value={newGuest.idNumber}
                onChange={(e) => setNewGuest((prev) => ({ ...prev, idNumber: e.target.value }))}
                placeholder="Kimlik No"
              />
            </div>
            <div>
              <label htmlFor="new-guest-phone" className="text-xs font-medium text-muted-foreground">
                Telefon
              </label>
              <Input
                id="new-guest-phone"
                value={newGuest.phone}
                onChange={(e) => setNewGuest((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+90..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowNewForm(false);
                setError("");
              }}
            >
              Vazgeç
            </Button>
            <Button className="flex-1" onClick={handleCreate} disabled={creating}>
              {creating ? "Kaydediliyor..." : "Misafir Oluştur"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2Dates({
  checkIn,
  checkOut,
  onCheckIn,
  onCheckOut,
}: {
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckIn: (d: Date) => void;
  onCheckOut: (d: Date) => void;
}) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights = checkIn && checkOut ? calcNights(checkIn, checkOut) : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Tarih Seçimi</h2>
        <p className="text-sm text-muted-foreground">Giriş ve çıkış tarihlerini seçin.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="checkin-trigger" className="text-sm font-medium">
            Giriş Tarihi
          </label>
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <Button
                id="checkin-trigger"
                variant="outline"
                className={`w-full justify-start gap-2 font-normal ${!checkIn ? "text-muted-foreground" : ""}`}
              >
                <CalendarBlank size={15} />
                {checkIn ? formatDate(checkIn) : "Tarih seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn ?? undefined}
                onSelect={(d) => {
                  if (d) {
                    onCheckIn(d);
                    setCheckInOpen(false);
                  }
                }}
                disabled={(d) => d < today}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="checkout-trigger" className="text-sm font-medium">
            Çıkış Tarihi
          </label>
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <Button
                id="checkout-trigger"
                variant="outline"
                className={`w-full justify-start gap-2 font-normal ${!checkOut ? "text-muted-foreground" : ""}`}
              >
                <CalendarBlank size={15} />
                {checkOut ? formatDate(checkOut) : "Tarih seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut ?? undefined}
                onSelect={(d) => {
                  if (d) {
                    onCheckOut(d);
                    setCheckOutOpen(false);
                  }
                }}
                disabled={(d) => {
                  const minDate = checkIn ? new Date(checkIn) : today;
                  minDate.setDate(minDate.getDate() + 1);
                  return d < minDate;
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {nights !== null && nights > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <CalendarBlank size={20} className="text-primary" />
          <div>
            <p className="font-semibold text-primary">{nights} Gece</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(checkIn!)} — {formatDate(checkOut!)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Step3Room({
  hotelId,
  checkIn,
  checkOut,
  selected,
  onSelect,
}: {
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  selected: Room | null;
  onSelect: (r: Room) => void;
}) {
  const [roomResults, setRoomResults] = useState<Record<string, { rooms: Room[]; error: string }>>({});
  const [typeFilter, setTypeFilter] = useState("");
  const requestKey = `${hotelId}:${checkIn.toISOString()}:${checkOut.toISOString()}`;
  const currentResult = roomResults[requestKey];
  const rooms = currentResult?.rooms ?? [];
  const loading = !currentResult;
  const error = currentResult?.error ?? "";

  useEffect(() => {
    if (currentResult) return;

    let cancelled = false;
    getAvailableRooms(hotelId, checkIn.toISOString(), checkOut.toISOString()).then((result) => {
      if (cancelled) return;

      setRoomResults((prev) => {
        if (prev[requestKey]) return prev;

        if (result.success && result.data) {
          return {
            ...prev,
            [requestKey]: { rooms: result.data as Room[], error: "" },
          };
        }

        return {
          ...prev,
          [requestKey]: { rooms: [], error: result.error ?? "Odalar yüklenemedi." },
        };
      });
    });

    return () => {
      cancelled = true;
    };
  }, [hotelId, checkIn, checkOut, requestKey, currentResult]);

  const filtered = typeFilter ? rooms.filter((room) => room.type === typeFilter) : rooms;
  const roomTypes = Array.from(new Set(rooms.map((room) => room.type)));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Oda Seçimi</h2>
        <p className="text-sm text-muted-foreground">Müsait odalardan birini seçin.</p>
      </div>

      {roomTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !typeFilter ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            Tümü
          </button>
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === type ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              {ROOM_TYPE_LABELS[type] ?? type}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Müsait odalar yükleniyor...</p>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bed size={40} className="mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Bu tarihler için müsait oda bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelect(room)}
              className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                selected?.id === room.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-semibold">Oda {room.number}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {ROOM_TYPE_LABELS[room.type] ?? room.type} · {room.floor}. Kat · {room.capacity} kişilik
                  </p>
                </div>
                {selected?.id === room.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check size={13} weight="bold" className="text-primary-foreground" />
                  </div>
                )}
              </div>
              <Separator className="my-3" />
              <p className="text-sm font-semibold text-primary">{formatPrice(room.pricePerNight, "TRY")} / gece</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Step4Summary({
  guest,
  room,
  checkIn,
  checkOut,
  currency,
  notes,
  onCurrencyChange,
  onNotesChange,
  onSubmit,
  submitting,
  error,
}: {
  guest: Guest;
  room: Room;
  checkIn: Date;
  checkOut: Date;
  currency: string;
  notes: string;
  onCurrencyChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
}) {
  const nights = calcNights(checkIn, checkOut);
  const totalPrice = room.pricePerNight * nights;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Özet ve Onay</h2>
        <p className="text-sm text-muted-foreground">Rezervasyon bilgilerini kontrol edin ve onaylayın.</p>
      </div>

      <div className="divide-y rounded-xl border bg-muted/20">
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
            <User size={16} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Misafir</p>
            <p className="font-semibold">
              {guest.firstName} {guest.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{guest.idNumber}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Bed size={16} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Oda</p>
            <p className="font-semibold">
              Oda {room.number} — {ROOM_TYPE_LABELS[room.type] ?? room.type}
            </p>
            <p className="text-xs text-muted-foreground">
              {room.floor}. Kat · {room.capacity} kişilik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CalendarBlank size={16} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tarihler</p>
            <p className="font-semibold">
              {formatDate(checkIn)} — {formatDate(checkOut)}
            </p>
            <p className="text-xs text-muted-foreground">{nights} gece</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CurrencyCircleDollar size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Fiyat</p>
            <p className="font-semibold">
              {formatPrice(room.pricePerNight, "TRY")} × {nights} gece = <span className="text-primary">{formatPrice(totalPrice, "TRY")}</span>
            </p>
          </div>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reservation-notes" className="text-sm font-medium">
          Notlar (opsiyonel)
        </label>
        <textarea
          id="reservation-notes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Özel istek veya notlar..."
          rows={3}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <Button className="w-full gap-2" size="lg" onClick={onSubmit} disabled={submitting}>
        {submitting ? "Rezervasyon Oluşturuluyor..." : "Rezervasyon Oluştur"}
      </Button>
    </div>
  );
}

export function ReservationWizard({ hotels, defaultHotelId, userRole }: ReservationWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [currency, setCurrency] = useState("TRY");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, startSubmitting] = useTransition();

  const isAdmin = userRole === "ADMIN";
  const hotelId = isAdmin ? defaultHotelId ?? hotels[0]?.id ?? "" : defaultHotelId ?? hotels[0]?.id ?? "";

  function canProceed(): boolean {
    if (step === 1) return !!selectedGuest;
    if (step === 2) return !!checkIn && !!checkOut;
    if (step === 3) return !!selectedRoom;
    return true;
  }

  function handleNext() {
    if (canProceed() && step < 4) setStep((prev) => prev + 1);
  }

  function handleBack() {
    if (step > 1) setStep((prev) => prev - 1);
  }

  function handleSubmit() {
    if (!selectedGuest || !checkIn || !checkOut || !selectedRoom) return;

    setSubmitError("");
    startSubmitting(async () => {
      const result = await createReservation({
        guestId: selectedGuest.id,
        roomId: selectedRoom.id,
        hotelId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        currency,
        notes: notes || undefined,
      });

      if (!result.success) {
        setSubmitError(result.error ?? "Rezervasyon oluşturulamadı.");
      } else {
        router.push("/reservations");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Stepper currentStep={step} />

      <Card className="rounded-xl">
        <CardContent className="p-6">
          {step === 1 && <Step1Guest selected={selectedGuest} onSelect={setSelectedGuest} />}

          {step === 2 && (
            <Step2Dates
              checkIn={checkIn}
              checkOut={checkOut}
              onCheckIn={(date) => {
                setCheckIn(date);
                if (checkOut && date >= checkOut) setCheckOut(null);
              }}
              onCheckOut={setCheckOut}
            />
          )}

          {step === 3 && checkIn && checkOut && (
            <Step3Room
              hotelId={hotelId}
              checkIn={checkIn}
              checkOut={checkOut}
              selected={selectedRoom}
              onSelect={setSelectedRoom}
            />
          )}

          {step === 4 && selectedGuest && checkIn && checkOut && selectedRoom && (
            <Step4Summary
              guest={selectedGuest}
              room={selectedRoom}
              checkIn={checkIn}
              checkOut={checkOut}
              currency={currency}
              notes={notes}
              onCurrencyChange={setCurrency}
              onNotesChange={setNotes}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={submitError}
            />
          )}

          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={step === 1 ? () => router.push("/reservations") : handleBack}
              className="gap-2"
              disabled={submitting}
            >
              <ArrowLeft size={15} />
              {step === 1 ? "Vazgeç" : "Geri"}
            </Button>

            {step < 4 && (
              <Button onClick={handleNext} disabled={!canProceed() || submitting} className="gap-2">
                İleri
                <ArrowRight size={15} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

