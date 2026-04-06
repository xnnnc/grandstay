"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SignIn,
  User,
  Phone,
  Envelope,
  Bed,
  CalendarCheck,
  Clock,
  Check,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { GuestReservationBadge as ReservationStatusBadge } from "@/components/guests/guest-reservation-badge";
import { checkInReservation } from "@/actions/reservations";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
}

interface Room {
  id: string;
  number: string;
  type: string;
}

interface Hotel {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  guestId: string;
  roomId: string;
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalPrice: number;
  currency: string;
  notes?: string | null;
  guest: Guest;
  room: Room;
  hotel: Hotel;
}

interface CheckInClientProps {
  reservations: Reservation[];
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Tek Kişilik",
  DOUBLE: "Çift Kişilik",
  SUITE: "Süit",
  DELUXE: "Deluxe",
  FAMILY: "Aile",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(amount: number, currency: string) {
  const symbol = currency === "TRY" ? "₺" : currency === "USD" ? "$" : "€";
  return `${symbol}${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function getNights(checkIn: Date, checkOut: Date) {
  return Math.max(
    1,
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
  );
}

export function CheckInClient({ reservations }: CheckInClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; room: string } | null>(null);

  const todayLabel = new Intl.DateTimeFormat("tr-TR", { dateStyle: "full" }).format(new Date());
  const completed = reservations.filter((r) => r.status === "CHECKED_IN").length;
  const pending = reservations.filter((r) => r.status !== "CHECKED_IN").length;

  const selected = reservations.find((r) => r.id === selectedId);

  async function handleConfirm() {
    if (!selectedId) return;
    setLoading(true);
    const result = await checkInReservation(selectedId);
    setLoading(false);
    setSelectedId(null);
    if (result.success) {
      const res = reservations.find((r) => r.id === selectedId);
      setToast({ message: "Check-in başarılı!", room: res?.room.number ?? "" });
      setTimeout(() => setToast(null), 4000);
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <SignIn className="w-6 h-6 text-teal-600" weight="bold" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Bugünün Girişleri</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">{todayLabel}</p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-zinc-500" />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            Beklenen: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{reservations.length}</span>
          </span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            Tamamlanan: <span className="font-semibold text-emerald-600">{completed}</span>
          </span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-sm text-zinc-600 dark:text-zinc-300">
            Bekleyen: <span className="font-semibold text-amber-600">{pending}</span>
          </span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
          <Check className="w-5 h-5 flex-shrink-0" weight="bold" />
          <span className="text-sm font-medium">{toast.message} Oda {toast.room} artık dolu.</span>
        </div>
      )}

      {/* Empty state */}
      {reservations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-400">
          <CalendarCheck className="w-16 h-16 opacity-30" />
          <p className="text-lg font-medium">Bugün için beklenen giriş bulunmamaktadır</p>
        </div>
      )}

      {/* Cards grid */}
      {reservations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((res) => {
            const nights = getNights(res.checkIn, res.checkOut);
            const isDone = res.status === "CHECKED_IN";
            return (
              <Card
                key={res.id}
                className={`border transition-all ${isDone ? "opacity-75 bg-zinc-50 dark:bg-zinc-800/30" : "bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md"}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {res.guest.firstName} {res.guest.lastName}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1">
                        {res.guest.phone && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Phone className="w-3.5 h-3.5" />
                            {res.guest.phone}
                          </span>
                        )}
                        {res.guest.email && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Envelope className="w-3.5 h-3.5" />
                            {res.guest.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <ReservationStatusBadge status={res.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <Bed className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="font-medium">Oda {res.room.number}</span>
                    <span className="text-zinc-400">—</span>
                    <span>{ROOM_TYPE_LABELS[res.room.type] ?? res.room.type}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <CalendarCheck className="w-4 h-4 flex-shrink-0" />
                    <span>{formatDate(res.checkIn)}</span>
                    <span className="text-zinc-300">→</span>
                    <span>{formatDate(res.checkOut)}</span>
                    <span className="ml-auto text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium">
                      {nights} gece
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Toplam</span>
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(res.totalPrice, res.currency)}
                    </span>
                  </div>

                  {isDone ? (
                    <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-4 h-4" weight="bold" />
                      <span className="text-sm font-semibold">Giriş Yapıldı</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={() => setSelectedId(res.id)}
                    >
                      <SignIn className="w-4 h-4 mr-2" />
                      Check-in Yap
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SignIn className="w-5 h-5 text-teal-600" />
              Check-in Onayı
            </DialogTitle>
            <DialogDescription>Lütfen bilgileri kontrol ediniz.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 flex items-center gap-1.5"><User className="w-4 h-4" /> Misafir</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selected.guest.firstName} {selected.guest.lastName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 flex items-center gap-1.5"><Bed className="w-4 h-4" /> Oda</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {selected.room.number} — {ROOM_TYPE_LABELS[selected.room.type] ?? selected.room.type}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 flex items-center gap-1.5"><CalendarCheck className="w-4 h-4" /> Süre</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatDate(selected.checkIn)} → {formatDate(selected.checkOut)} ({getNights(selected.checkIn, selected.checkOut)} gece)
                </span>
              </div>
              <Separator />
              <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">Onaylıyor musunuz?</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedId(null)} disabled={loading}>
              İptal
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "İşleniyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
