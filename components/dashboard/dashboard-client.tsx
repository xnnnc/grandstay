"use client";

import { UserRole } from "@/types";
import { StatsCards, PendingReservationCard } from "./stats-cards";
import { OccupancyChart } from "./occupancy-chart";
import { RecentActivityList } from "./recent-activity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  DashboardStats,
  OccupancyDataPoint,
  RecentActivity,
} from "@/actions/dashboard";

interface DashboardClientProps {
  userRole: UserRole;
  userName: string;
  stats: DashboardStats;
  occupancyData: OccupancyDataPoint[];
  recentActivities: RecentActivity[];
}

const ACTIONS_BY_ROLE: Record<UserRole, { label: string; href: string }[]> = {
  ADMIN: [
    { label: "Yeni Rezervasyon", href: "/reservations/new" },
    { label: "Raporlar", href: "/reports" },
  ],
  MANAGER: [
    { label: "Yeni Rezervasyon", href: "/reservations/new" },
    { label: "Raporlar", href: "/reports" },
  ],
  RECEPTIONIST: [
    { label: "Check-in", href: "/check-in" },
    { label: "Check-out", href: "/check-out" },
  ],
  HOUSEKEEPING: [
    { label: "Görev Listesi", href: "/tasks" },
  ],
  CONCIERGE: [
    { label: "Hizmet Talepleri", href: "/service-requests" },
  ],
};

export function DashboardClient({
  userRole,
  userName,
  stats,
  occupancyData,
  recentActivities,
}: DashboardClientProps) {
  const actions = ACTIONS_BY_ROLE[userRole] ?? [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gösterge Paneli</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Hoş geldiniz, {userName.split(" ")[0]}. İşte bugünün özet durumu.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {actions.map((action) => (
            <Button key={action.href} asChild size="sm" variant="secondary">
              <a href={action.href}>{action.label}</a>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <StatsCards
          stats={stats}
          pendingReservationCard={
            userRole !== "HOUSEKEEPING" && userRole !== "CONCIERGE" ? (
              <PendingReservationCard count={stats.pendingReservations} />
            ) : undefined
          }
        />
      </div>

      {userRole === "ADMIN" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Doluluk Oranı</CardTitle>
                <CardDescription>
                  Son 7 günlük doluluk durumu.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px] pb-6">
                <OccupancyChart data={occupancyData} />
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>
                  Sistem genelinde gerçekleşen işlemler.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[350px]">
                <RecentActivityList activities={recentActivities} />
              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {userRole === "MANAGER" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col col-span-2">
            <CardHeader>
              <CardTitle>Doluluk Trendi</CardTitle>
              <CardDescription>Haftalık / Aylık doluluk değişim grafiği.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px]">
              <OccupancyChart data={occupancyData} />
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Aktivite Akışı</CardTitle>
              <CardDescription>Personel ve rezervasyon işlemleri.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[300px]">
              <RecentActivityList activities={recentActivities} />
            </CardContent>
          </Card>
        </div>
      )}

      {(userRole !== "ADMIN" && userRole !== "MANAGER") && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>İşlem Akışı</CardTitle>
              <CardDescription>Sorumluluğunuzdaki güncel işlemler.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivityList activities={recentActivities} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
