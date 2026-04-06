"use client";

import React from "react";
import {
  BedIcon,
  CheckCircleIcon,
  SignInIcon,
  SignOutIcon,
  CurrencyDollarIcon,
  CalendarCheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/actions/dashboard";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  colorClass?: string;
  bgClass?: string;
  borderColor?: string;
  animationDelay?: string;
}

function StatCard({
  title,
  value,
  icon,
  trend,
  colorClass = "text-muted-foreground",
}: StatCardProps) {
  return (
    <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={colorClass}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend.value >= 0 ? (
              <ArrowUpIcon size={14} className="text-emerald-500" />
            ) : (
              <ArrowDownIcon size={14} className="text-red-500" />
            )}
            <span className={trend.value >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
              {trend.label}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: DashboardStats;
  pendingReservationCard?: React.ReactNode;
}

export function StatsCards({ stats, pendingReservationCard }: StatsCardsProps) {
  const occupancyRate =
    stats.totalRooms > 0
      ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      <StatCard
        title="Toplam Oda"
        value={stats.totalRooms}
        icon={<BedIcon size={18} weight="duotone" />}
        colorClass="text-primary"
        bgClass="bg-primary/10"
        borderColor="border-l-primary"
        animationDelay="0ms"
      />
      <StatCard
        title="Dolu Oda"
        value={stats.occupiedRooms}
        icon={<CheckCircleIcon size={18} weight="duotone" />}
        trend={{ value: occupancyRate, label: `%${occupancyRate} doluluk` }}
        colorClass="text-blue-500"
        bgClass="bg-blue-500/10"
        borderColor="border-l-blue-500"
        animationDelay="60ms"
      />
      <StatCard
        title="Müsait Oda"
        value={stats.availableRooms}
        icon={<BedIcon size={18} weight="duotone" />}
        colorClass="text-green-500"
        bgClass="bg-green-500/10"
        borderColor="border-l-green-500"
        animationDelay="120ms"
      />
      <StatCard
        title="Bugünün Girişleri"
        value={stats.todayCheckIns}
        icon={<SignInIcon size={18} weight="duotone" />}
        colorClass="text-amber-500"
        bgClass="bg-amber-500/10"
        borderColor="border-l-amber-500"
        animationDelay="180ms"
      />
      <StatCard
        title="Bugünün Çıkışları"
        value={stats.todayCheckOuts}
        icon={<SignOutIcon size={18} weight="duotone" />}
        colorClass="text-orange-500"
        bgClass="bg-orange-500/10"
        borderColor="border-l-orange-500"
        animationDelay="240ms"
      />
      <StatCard
        title="Aylık Gelir"
        value={`₺${stats.monthlyRevenue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`}
        icon={<CurrencyDollarIcon size={18} weight="duotone" />}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-500/10"
        borderColor="border-l-emerald-500"
        animationDelay="300ms"
      />
      {pendingReservationCard}
    </div>
  );
}

export function PendingReservationCard({ count }: { count: number }) {
  return (
    <StatCard
      title="Bekleyen Rezervasyonlar"
      value={count}
      icon={<CalendarCheckIcon size={18} weight="duotone" />}
      colorClass="text-amber-500"
      bgClass="bg-amber-500/10"
      borderColor="border-l-amber-400"
      animationDelay="360ms"
    />
  );
}
