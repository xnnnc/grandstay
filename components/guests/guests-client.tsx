"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Trash,
  Eye,
  Phone,
  Envelope,
  IdentificationCard,
  Flag,
  Bed,
  CalendarCheck,
  Moon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestDialog } from "./guest-dialog";
import { GuestReservationBadge } from "./guest-reservation-badge";
import { deleteGuest } from "@/actions/guests";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface Hotel {
  id: string;
  name: string;
}

interface Room {
  id: string;
  number: string;
  type: string;
}

interface Reservation {
  id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  status: string;
  hotel: Hotel;
  room: Room;
}

interface Guest {
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
}

interface ActiveReservation {
  id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  status: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    nationality: string;
  };
  room: {
    id: string;
    number: string;
    type: string;
  };
  hotel: {
    id: string;
    name: string;
  };
}

interface GuestsClientProps {
  guests: Guest[];
  userRole: string;
  activeReservations?: ActiveReservation[];
}

function maskIdNumber(id: string): string {
  if (id.length <= 6) return id;
  return id.slice(0, 3) + "****" + id.slice(-3);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const NATIONALITY_FLAGS: Record<string, string> = {
  TR: "🇹🇷",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  US: "🇺🇸",
  RU: "🇷🇺",
};

function getStayInfo(checkIn: Date | string, checkOut: Date | string) {
  const now = new Date();
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const totalNights = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  const stayedNights = Math.ceil((now.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  const remainingNights = Math.max(totalNights - stayedNights, 0);
  return { totalNights, stayedNights, remainingNights };
}

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Single",
  DOUBLE: "Double",
  SUITE: "Suite",
  DELUXE: "Deluxe",
  FAMILY: "Aile",
};

export function GuestsClient({ guests, userRole, activeReservations = [] }: GuestsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = guests.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      g.firstName.toLowerCase().includes(q) ||
      g.lastName.toLowerCase().includes(q) ||
      (g.email ?? "").toLowerCase().includes(q) ||
      g.idNumber.toLowerCase().includes(q)
    );
  });

  function handleAdd() {
    setEditGuest(null);
    setDialogOpen(true);
  }

  function handleEdit(guest: Guest) {
    setEditGuest(guest);
    setDialogOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteGuest(deleteTarget.id);
      if (!result.success) {
        console.error(result.error ?? "Silme işlemi başarısız.");
      } else {
        router.refresh();
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  function handleDelete(guest: Guest) {
    setDeleteTarget(guest);
  }

  function handleView(id: string) {
    router.push(`/guests/${id}`);
  }

  function handleSuccess() {
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Misafir Yönetimi</h1>
            <p className="text-sm text-muted-foreground">
              {guests.length} misafir kayıtlı
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus size={16} weight="bold" />
          Yeni Misafir Ekle
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Misafir Ara (isim, email veya TC kimlik no)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Active Guests */}
      {activeReservations.length > 0 && (
        <Card className="rounded-xl border-emerald-200 dark:border-emerald-800/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Bed size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Otelde Bulunan Misafirler
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {activeReservations.length} misafir şu anda otelde
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-emerald-50/50 dark:bg-emerald-950/20">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Misafir</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Oda</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Otel</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Giriş</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Çıkış</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Konaklama</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReservations.map((res, idx) => {
                    const stay = getStayInfo(res.checkIn, res.checkOut);
                    return (
                      <tr
                        key={res.id}
                        className={`border-b transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 ${
                          idx % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              {res.guest.firstName[0]}{res.guest.lastName[0]}
                            </div>
                            <div>
                              <button
                                onClick={() => handleView(res.guest.id)}
                                className="font-medium hover:text-primary hover:underline text-left"
                              >
                                {res.guest.firstName} {res.guest.lastName}
                              </button>
                              {res.guest.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone size={11} />
                                  {res.guest.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              {res.room.number}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ROOM_TYPE_LABELS[res.room.type] ?? res.room.type}
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {res.hotel.name}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CalendarCheck size={13} className="text-emerald-500" />
                            {formatDate(res.checkIn)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {formatDate(res.checkOut)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Moon size={14} className="text-indigo-500" />
                            <span className="text-sm font-semibold">{stay.totalNights}</span>
                            <span className="text-xs text-muted-foreground">gece</span>
                            {stay.remainingNights > 0 && (
                              <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">
                                ({stay.remainingNights} kaldı)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {filtered.length > 0
              ? `${filtered.length} misafir listeleniyor`
              : search
              ? "Arama sonucu bulunamadı"
              : "Misafir listesi"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={48} className="mb-4 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Arama kriterlerine uygun misafir bulunamadı."
                  : "Henüz misafir kaydı bulunmamaktadır."}
              </p>
              {!search && (
                <Button variant="outline" className="mt-4 gap-2" onClick={handleAdd}>
                  <Plus size={14} />
                  İlk misafiri ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ad Soyad</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Email</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Telefon</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">TC Kimlik</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Uyruk</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground xl:table-cell">Son Rezervasyon</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((guest, idx) => {
                    const lastRes = guest.reservations[0];
                    return (
                      <tr
                        key={guest.id}
                        className={`border-b transition-colors hover:bg-muted/30 ${
                          idx % 2 === 0 ? "" : "bg-muted/10"
                        }`}
                      >
                        {/* Name + avatar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                              {guest.firstName[0]}{guest.lastName[0]}
                            </div>
                            <button
                              onClick={() => handleView(guest.id)}
                              className="font-medium hover:text-primary hover:underline text-left"
                            >
                              {guest.firstName} {guest.lastName}
                            </button>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {guest.email ? (
                            <span className="flex items-center gap-1">
                              <Envelope size={13} />
                              {guest.email}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                          {guest.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone size={13} />
                              {guest.phone}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* ID */}
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <IdentificationCard size={13} />
                            {maskIdNumber(guest.idNumber)}
                          </span>
                        </td>

                        {/* Nationality */}
                        <td className="hidden px-4 py-3 sm:table-cell">
                          <span className="flex items-center gap-1">
                            <Flag size={13} className="text-muted-foreground" />
                            {NATIONALITY_FLAGS[guest.nationality] ?? ""} {guest.nationality}
                          </span>
                        </td>

                        {/* Last reservation */}
                        <td className="hidden px-4 py-3 xl:table-cell">
                          {lastRes ? (
                            <div className="space-y-1">
                              <p className="text-xs font-medium">{lastRes.hotel.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(lastRes.checkIn)}
                                </span>
                                <GuestReservationBadge status={lastRes.status} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">Rezervasyon yok</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleView(guest.id)}
                              title="Detay"
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(guest)}
                              title="Düzenle"
                            >
                              <PencilSimple size={14} />
                            </Button>
                            {(userRole === "ADMIN" || userRole === "MANAGER") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                onClick={() => handleDelete(guest)}
                                disabled={isPending && deletingId === guest.id}
                                title="Sil"
                              >
                                <Trash size={14} />
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

      <GuestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        guest={editGuest}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`"${deleteTarget?.firstName} ${deleteTarget?.lastName}" adlı misafiri silmek istediğinize emin misiniz?`}
        description="Bu işlem geri alınamaz."
        confirmLabel="Sil"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
