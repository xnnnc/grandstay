import { CalendarBlank, Bed, Eye, Check, X, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestReservationBadge } from "@/components/guests/guest-reservation-badge";

interface Hotel {
  id: string;
  name: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
}

interface Reservation {
  id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  status: string;
  totalPrice: number;
  currency: string;
  notes: string | null;
  guest: Guest;
  room: Room;
  hotel: Hotel;
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Tekli",
  DOUBLE: "Çiftli",
  SUITE: "Süit",
  DELUXE: "Delüks",
  FAMILY: "Aile",
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(amount: number, currency: string): string {
  if (currency === "TRY") {
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(amount);
  }
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(amount);
}

function calcNights(checkIn: Date | string, checkOut: Date | string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / msPerDay);
}

interface ReservationTableProps {
  filtered: Reservation[];
  hasActiveFilters: boolean;
  isPending: boolean;
  actionId: string | null;
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onNewReservation: () => void;
}

export function ReservationTable({
  filtered,
  hasActiveFilters,
  isPending,
  actionId,
  onView,
  onConfirm,
  onCancel,
  onNewReservation,
}: ReservationTableProps) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          {filtered.length > 0
            ? `${filtered.length} rezervasyon listeleniyor`
            : "Rezervasyon bulunamadı"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarBlank size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? "Filtre kriterlerine uygun rezervasyon bulunamadı."
                : "Henüz rezervasyon kaydı bulunmamaktadır."}
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={onNewReservation}
            >
              <Plus size={14} />
              Yeni rezervasyon oluştur
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Misafir</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Oda</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Otel</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Giriş</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Çıkış</th>
                  <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground sm:table-cell">Gece</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                  <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Toplam</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const nights = calcNights(r.checkIn, r.checkOut);
                  const isActing = isPending && actionId === r.id;
                  return (
                    <tr
                      key={r.id}
                      className={`border-b transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                    >
                      {/* Guest */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                            {r.guest.firstName[0]}{r.guest.lastName[0]}
                          </div>
                          <span className="font-medium">
                            {r.guest.firstName} {r.guest.lastName}
                          </span>
                        </div>
                      </td>

                      {/* Room */}
                      <td className="hidden px-4 py-3 md:table-cell">
                        <div className="flex items-center gap-1">
                          <Bed size={13} className="text-muted-foreground" />
                          <span>{r.room.number}</span>
                          <span className="text-xs text-muted-foreground">
                            {ROOM_TYPE_LABELS[r.room.type] ?? r.room.type}
                          </span>
                        </div>
                      </td>

                      {/* Hotel */}
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {r.hotel.name}
                      </td>

                      {/* Check-in */}
                      <td className="px-4 py-3 text-sm">
                        {formatDate(r.checkIn)}
                      </td>

                      {/* Check-out */}
                      <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                        {formatDate(r.checkOut)}
                      </td>

                      {/* Nights */}
                      <td className="hidden px-4 py-3 text-center sm:table-cell">
                        <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-muted text-xs font-medium">
                          {nights}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <GuestReservationBadge status={r.status} />
                      </td>

                      {/* Total */}
                      <td className="hidden px-4 py-3 text-right font-medium md:table-cell">
                        {formatPrice(r.totalPrice, r.currency)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onView(r.id)}
                            title="Detay"
                            disabled={isActing}
                          >
                            <Eye size={14} />
                          </Button>
                          {r.status === "PENDING" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
                              onClick={() => onConfirm(r.id)}
                              title="Onayla"
                              disabled={isActing}
                            >
                              <Check size={14} />
                            </Button>
                          )}
                          {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              onClick={() => onCancel(r.id)}
                              title="İptal Et"
                              disabled={isActing}
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
