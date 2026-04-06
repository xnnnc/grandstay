import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getHousekeepingTasks,
  getHousekeepingStats,
  getHousekeepingStaff,
  getRoomsForHousekeeping,
} from "@/actions/housekeeping";
import { HousekeepingClient } from "@/components/housekeeping/housekeeping-client";

export default async function HousekeepingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const hotelId = user.hotelId ?? undefined;

  const [tasksResult, statsResult, staffResult, roomsResult] = await Promise.all([
    getHousekeepingTasks(),
    getHousekeepingStats(hotelId),
    getHousekeepingStaff(hotelId),
    getRoomsForHousekeeping(hotelId),
  ]);

  const tasks = tasksResult.success ? tasksResult.data : [];
  const stats = statsResult.success
    ? statsResult.data
    : {
        pendingCount: 0,
        inProgressCount: 0,
        completedTodayCount: 0,
        roomsNeedingCleaning: 0,
        roomsInMaintenance: 0,
      };
  const staff = staffResult.success ? staffResult.data : [];
  const rooms = roomsResult.success ? roomsResult.data : [];

  return (
    <div className="p-6">
      <HousekeepingClient
        tasks={tasks}
        rooms={rooms}
        staff={staff}
        stats={stats}
        userRole={user.role}
        hotelId={user.hotelId ?? ""}
      />
    </div>
  );
}
