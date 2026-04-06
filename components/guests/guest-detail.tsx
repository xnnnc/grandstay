"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Envelope,
  IdentificationCard,
  Flag,
  ArrowLeft,
  PencilSimple,
  CalendarBlank,
  Buildings,
  Door,
  Notepad,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GuestDialog } from "./guest-dialog";
import { GuestReservationBadge } from "./guest-reservation-badge";

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

interface Invoice {
  id: string;
  total: number;
  currency: string;
}

interface Reservation {
  id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  status: string;
  totalPrice: number;
  currency: string;
  notes: string | null;
  hotel: Hotel;
  room: Room;
  invoice: Invoice | null;
}

interface ServiceRequest {
  id: string;
  type: string;
  description: string | null;
  status: string;
  createdAt: Date | string;
}

interface GuestWithDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  idNumber: string;
  nationality: string;
  notes: string | null;
  createdAt: Date | string;
  reservations: Reservation[];
  serviceRequests: ServiceRequest[];
}

interface GuestDetailProps {
  guest: GuestWithDetails;
  userRole: string;
}

const NATIONALITY_FLAGS: Record<string, string> = {
  TR: "🇹🇷 Türkiye",
  GB: "🇬🇧 İngiltere",
  DE: "🇩🇪 Almanya",
  FR: "🇫🇷 Fransa",
  US: "🇺🇸 Amerika",
  RU: "🇷🇺 Rusya",
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Tek Kişilik",
  DOUBLE: "Çift Kişilik",
  SUITE: "Süit",
  DELUXE: "Deluxe",
  FAMILY: "Aile",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  ROOM_SERVICE: "Oda Servisi",
  TRANSFER: "Transfer",
  TOUR: "Tur",
  LAUNDRY: "Çamaşır",
  OTHER: "Diğer",
};

const SERVICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Beklemede",
  IN_PROGRESS: "İşlemde",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

function maskIdNumber(id: string): string {
  if (id.length <= 6) return id;
  return id.slice(0, 3) + "****" + id.slice(-3);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(amount: number, currency = "TRY"): string {
  if (currency === "TRY") {
    return "₺" + amount.toLocaleString("tr-TR");
  }
  return amount.toLocaleString("tr-TR") + " " + currency;
}

export function GuestDetail({ guest, userRole }: GuestDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  function handleEditSuccess() {
    router.refresh();
  }

  const initials = guest.firstName[0] + guest.lastName[0];

  return (
    <div className="space-y-6">
      {/* Back + title row */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/guests")}
          className="h-8 w-8"
        >
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Misafir Detayı</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card — left col on desktop */}
        <div className="lg:col-span-1">
          <Card className="rounded-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary mb-4">
                  {initials.toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">
                  {guest.firstName} {guest.lastName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {NATIONALITY_FLAGS[guest.nationality] ?? guest.nationality}
                </p>
              </div>

              <Separator className="my-5" />

              <div className="space-y-3 text-sm">
                {guest.email && (
                  <div className="flex items-center gap-2">
                    <Envelope size={15} className="shrink-0 text-muted-foreground" />
                    <span className="truncate">{guest.email}</span>
                  </div>
                )}
                {guest.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="shrink-0 text-muted-foreground" />
                    <span>{guest.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <IdentificationCard size={15} className="shrink-0 text-muted-foreground" />
                  <span className="font-mono">{maskIdNumber(guest.idNumber)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag size={15} className="shrink-0 text-muted-foreground" />
                  <span>{NATIONALITY_FLAGS[guest.nationality] ?? guest.nationality}</span>
                </div>
                {guest.notes && (
                  <div className="flex items-start gap-2">
                    <Notepad size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">{guest.notes}</span>
                  </div>
                )}
              </div>

              <Separator className="my-5" />

              <div className="text-xs text-muted-foreground">
                Kayıt tarihi: {formatDate(guest.createdAt)}
              </div>

              <Button
                variant="outline"
                className="mt-4 w-full gap-2"
                onClick={() => setEditOpen(true)}
              >
                <PencilSimple size={14} />
                Düzenle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column — reservations + service requests */}
        <div className="space-y-6 lg:col-span-2">
          {/* Reservations */}
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarBlank size={18} className="text-primary" />
                Rezervasyon Geçmişi
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {guest.reservations.length} rezervasyon
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {guest.reservations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CalendarBlank size={36} className="mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Bu misafirin henüz rezervasyonu bulunmamaktadır.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Otel</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Oda</th>
                        <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Giriş</th>
                        <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Çıkış</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                        <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">Tutar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guest.reservations.map((res, idx) => (
                        <tr
                          key={res.id}
                          className={`border-b transition-colors hover:bg-muted/30 ${
                            idx % 2 === 0 ? "" : "bg-muted/10"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Buildings size={13} className="text-muted-foreground" />
                              <span className="font-medium">{res.hotel.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Door size={13} className="text-muted-foreground" />
                              <span>
                                {res.room.number}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({ROOM_TYPE_LABELS[res.room.type] ?? res.room.type})
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                            {formatDate(res.checkIn)}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                            {formatDate(res.checkOut)}
                          </td>
                          <td className="px-4 py-3">
                            <GuestReservationBadge status={res.status} />
                          </td>
                          <td className="hidden px-4 py-3 text-right font-semibold text-primary md:table-cell">
                            {formatPrice(res.totalPrice, res.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service requests */}
          {guest.serviceRequests.length > 0 && (
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Notepad size={18} className="text-primary" />
                  Hizmet Talepleri
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {guest.serviceRequests.length} talep
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tür</th>
                        <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Açıklama</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Durum</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guest.serviceRequests.map((sr, idx) => (
                        <tr
                          key={sr.id}
                          className={`border-b transition-colors hover:bg-muted/30 ${
                            idx % 2 === 0 ? "" : "bg-muted/10"
                          }`}
                        >
                          <td className="px-4 py-3 font-medium">
                            {SERVICE_TYPE_LABELS[sr.type] ?? sr.type}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                            {sr.description ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {SERVICE_STATUS_LABELS[sr.status] ?? sr.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(sr.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <GuestDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        guest={guest}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
