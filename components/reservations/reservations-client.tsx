"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { confirmReservation, cancelReservation } from "@/actions/reservations";
import { ReservationStats } from "@/components/reservations/reservation-stats";
import { ReservationFilters } from "@/components/reservations/reservation-filters";
import { ReservationTable } from "@/components/reservations/reservation-table";

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

interface ReservationsClientProps {
  reservations: Reservation[];
  userRole: string;
  hotels?: Hotel[];
}

function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function ReservationsClient({ reservations, userRole, hotels = [] }: ReservationsClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [hotelFilter, setHotelFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = reservations.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (hotelFilter && r.hotel.id !== hotelFilter) return false;

    if (dateFilter === "week") {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const checkIn = new Date(r.checkIn);
      if (checkIn < weekStart || checkIn > weekEnd) return false;
    } else if (dateFilter === "month") {
      const now = new Date();
      const checkIn = new Date(r.checkIn);
      if (checkIn.getMonth() !== now.getMonth() || checkIn.getFullYear() !== now.getFullYear()) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const fullName = `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }

    return true;
  });

  const total = reservations.length;
  const pending = reservations.filter((r) => r.status === "PENDING").length;
  const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
  const todayCheckIns = reservations.filter((r) => isToday(r.checkIn) && r.status !== "CANCELLED").length;

  function handleConfirm(id: string) {
    setActionId(id);
    startTransition(async () => {
      const result = await confirmReservation(id);
      setActionId(null);
      if (!result.success) alert(result.error ?? "İşlem başarısız.");
      else router.refresh();
    });
  }

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  function handleCancel(id: string) {
    setCancelTarget(id);
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const result = await cancelReservation(cancelTarget);
      if (result.success) {
        setCancelTarget(null);
        router.refresh();
      }
    } finally {
      setIsCancelling(false);
    }
  }

  const hasActiveFilters = !!(search || statusFilter || dateFilter || hotelFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CalendarCheck size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rezervasyon Yönetimi</h1>
            <p className="text-sm text-muted-foreground">{total} rezervasyon kayıtlı</p>
          </div>
        </div>
        <Button onClick={() => router.push("/reservations/new")} className="gap-2">
          <Plus size={16} weight="bold" />
          Yeni Rezervasyon
        </Button>
      </div>

      <ReservationStats
        total={total}
        pending={pending}
        confirmed={confirmed}
        todayCheckIns={todayCheckIns}
      />

      <ReservationFilters
        search={search}
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        hotelFilter={hotelFilter}
        userRole={userRole}
        hotels={hotels}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDateChange={setDateFilter}
        onHotelChange={setHotelFilter}
      />

      <ReservationTable
        filtered={filtered}
        hasActiveFilters={hasActiveFilters}
        isPending={isPending}
        actionId={actionId}
        onView={(id) => router.push(`/reservations/${id}`)}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onNewReservation={() => router.push("/reservations/new")}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title="Bu rezervasyonu iptal etmek istediğinize emin misiniz?"
        description="Rezervasyon iptal edilecektir. Bu işlem geri alınamaz."
        confirmLabel="İptal Et"
        variant="warning"
        onConfirm={handleConfirmCancel}
        isPending={isCancelling}
      />
    </div>
  );
}
