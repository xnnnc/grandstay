"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RecentActivity } from "@/actions/dashboard";

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "az önce";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
}

const ACTIVITY_CONFIG = {
  CHECK_IN: {
    icon: <ArrowDownIcon size={16} weight="bold" />,
    label: "Giriş Yaptı",
    bgClass: "bg-emerald-500/10",
    colorClass: "text-emerald-600",
  },
  CHECK_OUT: {
    icon: <ArrowUpIcon size={16} weight="bold" />,
    label: "Çıkış Yaptı",
    bgClass: "bg-blue-500/10",
    colorClass: "text-blue-600",
  },
  NEW_RESERVATION: {
    icon: <CalendarIcon size={16} weight="bold" />,
    label: "Rezervasyon",
    bgClass: "bg-primary/10",
    colorClass: "text-primary",
  },
  CANCELLED: {
    icon: <XCircleIcon size={16} weight="bold" />,
    label: "İptal Edildi",
    bgClass: "bg-red-500/10",
    colorClass: "text-red-600",
  },
};

interface RecentActivityProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityProps) {
  return (
    <Card className="rounded-xl border border-border/60 dashboard-card hover:border-primary/10">
      <CardHeader className="pb-1 border-b border-border/40">
        <h3 className="text-sm font-semibold">Son Aktiviteler</h3>
        <p className="text-xs text-muted-foreground">Son 10 rezervasyon hareketi</p>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CalendarIcon size={28} weight="thin" className="mb-2 opacity-30 text-primary/40" />
            <p className="text-sm">Henüz aktivite bulunmuyor</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activities.map((activity) => {
              const config = ACTIVITY_CONFIG[activity.type];
              return (
                <li
                  key={activity.id}
                  className="group/activity flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-all duration-200 border-l-2 border-l-transparent hover:border-l-current"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/activity:scale-110 ${config.bgClass}`}
                  >
                    <span className={config.colorClass}>{config.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.guestName}
                      <span className="ml-1 text-muted-foreground font-normal">
                        &mdash; {config.label}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Oda {activity.roomNumber} &bull; {activity.hotelName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(activity.timestamp)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
