"use client";

import { ReservationStatus } from "@/types";

interface GuestReservationBadgeProps {
  status: string;
  className?: string;
}

const RESERVATION_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Beklemede",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  CONFIRMED: {
    label: "Onaylandı",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  CHECKED_IN: {
    label: "Giriş Yapıldı",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  CHECKED_OUT: {
    label: "Çıkış Yapıldı",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
  CANCELLED: {
    label: "İptal Edildi",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function GuestReservationBadge({ status, className = "" }: GuestReservationBadgeProps) {
  const config = RESERVATION_STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

export { RESERVATION_STATUS_CONFIG };
export type { ReservationStatus };
