"use client";

import { RoomStatus } from "@/types";

interface RoomStatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

const STATUS_CONFIG: Record<RoomStatus, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Müsait",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  OCCUPIED: {
    label: "Dolu",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  CLEANING: {
    label: "Temizleniyor",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  MAINTENANCE: {
    label: "Bakımda",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  RESERVED: {
    label: "Rezerve",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
};

export function RoomStatusBadge({ status, className = "" }: RoomStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-zinc-100 text-zinc-700" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
