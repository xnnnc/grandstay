import { getCurrentUser } from "@/lib/auth";
import {
  getDashboardStats,
  getOccupancyData,
  getRecentActivities,
} from "@/actions/dashboard";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import type { UserRole } from "@/types";

const MOCK_USER = {
  id: "1",
  name: "Admin User",
  role: "ADMIN" as UserRole,
  hotelId: null as string | null,
};

export default async function DashboardPage() {
  // Try to get real user, fall back to mock for development
  const user = (await getCurrentUser()) ?? MOCK_USER;

  const [statsResult, occupancyResult, activitiesResult] = await Promise.all([
    getDashboardStats(user.hotelId ?? undefined),
    getOccupancyData(user.hotelId ?? undefined),
    getRecentActivities(user.hotelId ?? undefined),
  ]);

  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : {
        totalRooms: 0,
        occupiedRooms: 0,
        availableRooms: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        monthlyRevenue: 0,
        pendingReservations: 0,
      };

  const occupancyData =
    occupancyResult.success && occupancyResult.data ? occupancyResult.data : [];
  const recentActivities =
    activitiesResult.success && activitiesResult.data
      ? activitiesResult.data
      : [];
  return (
    <DashboardClient
      userRole={user.role as UserRole}
      userName={user.name}
      stats={stats}
      occupancyData={occupancyData}
      recentActivities={recentActivities}
    />
  );
}
