"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function getHotels() {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    if (user.role !== "ADMIN") {
      const hotel = user.hotelId
        ? await prisma.hotel.findUnique({ where: { id: user.hotelId } })
        : null;
      return { success: true as const, data: hotel ? [hotel] : [] };
    }
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return { success: true as const, data: hotels };
  } catch {
    return { success: false as const, error: "Oteller yüklenirken bir hata oluştu." };
  }
}

export async function getOccupancyReport(
  hotelId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const start = startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ?? new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const resolvedHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const roomsWhere: Record<string, unknown> = {};
    if (resolvedHotelId) roomsWhere.hotelId = resolvedHotelId;
    const totalRooms = await prisma.room.count({ where: roomsWhere });

    const reservationsWhere: Record<string, unknown> = {
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] },
      checkIn: { lte: end },
      checkOut: { gte: start },
    };
    if (resolvedHotelId) reservationsWhere.hotelId = resolvedHotelId;

    const reservations = await prisma.reservation.findMany({
      where: reservationsWhere,
      select: { checkIn: true, checkOut: true },
    });

    const days: { date: string; occupancy: number; occupiedRooms: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dayStart = new Date(cursor);
      const dayEnd = new Date(cursor);
      dayEnd.setHours(23, 59, 59, 999);

      const occupied = reservations.filter(
        (r) => r.checkIn <= dayEnd && r.checkOut > dayStart
      ).length;

      days.push({
        date: cursor.toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
        occupancy: totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0,
        occupiedRooms: occupied,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const avgOccupancy =
      days.length > 0
        ? Math.round(days.reduce((s, d) => s + d.occupancy, 0) / days.length)
        : 0;
    const peak = days.reduce((a, b) => (a.occupancy >= b.occupancy ? a : b), days[0] ?? { date: "-", occupancy: 0 });
    const lowest = days.reduce((a, b) => (a.occupancy <= b.occupancy ? a : b), days[0] ?? { date: "-", occupancy: 0 });

    return {
      success: true as const,
      data: { days, avgOccupancy, peak, lowest, totalRooms },
    };
  } catch {
    return { success: false as const, error: "Doluluk raporu yüklenirken bir hata oluştu." };
  }
}

export async function getRevenueReport(
  hotelId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const start = startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ?? new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const resolvedHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const where: Record<string, unknown> = {
      status: { in: ["CHECKED_OUT", "CHECKED_IN", "CONFIRMED"] },
      checkIn: { gte: start, lte: end },
    };
    if (resolvedHotelId) where.hotelId = resolvedHotelId;

    const reservations = await prisma.reservation.findMany({
      where,
      include: { room: true },
    });

    // Daily revenue
    const dailyMap: Record<string, number> = {};
    for (const r of reservations) {
      const key = r.checkIn.toLocaleDateString("tr-TR", { month: "short", day: "numeric" });
      dailyMap[key] = (dailyMap[key] ?? 0) + r.totalPrice;
    }

    // Build daily trend sorted by date
    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue),
    }));

    // By room type
    const byTypeMap: Record<string, number> = {};
    for (const r of reservations) {
      const type = r.room.type;
      byTypeMap[type] = (byTypeMap[type] ?? 0) + r.totalPrice;
    }
    const byRoomType = Object.entries(byTypeMap).map(([type, revenue]) => ({
      type,
      revenue: Math.round(revenue),
    }));

    const totalRevenue = reservations.reduce((s, r) => s + r.totalPrice, 0);
    const avgPerReservation =
      reservations.length > 0 ? totalRevenue / reservations.length : 0;
    const topRoomType =
      byRoomType.sort((a, b) => b.revenue - a.revenue)[0]?.type ?? "-";

    return {
      success: true as const,
      data: {
        dailyRevenue,
        byRoomType,
        totalRevenue: Math.round(totalRevenue),
        avgPerReservation: Math.round(avgPerReservation),
        topRoomType,
        totalReservations: reservations.length,
      },
    };
  } catch {
    return { success: false as const, error: "Gelir raporu yüklenirken bir hata oluştu." };
  }
}

export async function getGuestStats(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const resolvedHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const reservationWhere: Record<string, unknown> = {};
    if (resolvedHotelId) reservationWhere.hotelId = resolvedHotelId;

    const reservations = await prisma.reservation.findMany({
      where: reservationWhere,
      select: { guestId: true },
    });

    const guestIds = reservations.map((r) => r.guestId);
    const uniqueGuestIds = [...new Set(guestIds)];

    const guests = await prisma.guest.findMany({
      where: { id: { in: uniqueGuestIds } },
      select: { id: true, nationality: true },
    });

    // Nationality distribution
    const nationalityMap: Record<string, number> = {};
    for (const g of guests) {
      const nat = g.nationality || "TR";
      nationalityMap[nat] = (nationalityMap[nat] ?? 0) + 1;
    }
    const nationalityDistribution = Object.entries(nationalityMap)
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count);

    // Repeat guests (more than 1 reservation)
    const guestReservationCount: Record<string, number> = {};
    for (const r of reservations) {
      guestReservationCount[r.guestId] = (guestReservationCount[r.guestId] ?? 0) + 1;
    }
    const repeatGuests = Object.values(guestReservationCount).filter((c) => c > 1).length;

    const mostCommonNationality = nationalityDistribution[0]?.nationality ?? "-";

    return {
      success: true as const,
      data: {
        totalGuests: uniqueGuestIds.length,
        repeatGuests,
        nationalityDistribution,
        mostCommonNationality,
        totalReservations: reservations.length,
      },
    };
  } catch {
    return { success: false as const, error: "Misafir istatistikleri yüklenirken bir hata oluştu." };
  }
}

export async function getHousekeepingReport(
  hotelId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const start = startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ?? new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const resolvedHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const roomWhere: Record<string, unknown> = {};
    if (resolvedHotelId) roomWhere.hotelId = resolvedHotelId;
    const rooms = await prisma.room.findMany({
      where: roomWhere,
      select: { id: true },
    });
    const roomIds = rooms.map((r) => r.id);

    const tasks = await prisma.housekeepingTask.findMany({
      where: {
        roomId: { in: roomIds },
        createdAt: { gte: start, lte: end },
      },
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Avg completion time in minutes
    const completedWithTime = tasks.filter(
      (t) => t.status === "COMPLETED" && t.completedAt
    );
    const avgCompletionTime =
      completedWithTime.length > 0
        ? Math.round(
            completedWithTime.reduce((sum, t) => {
              const diff =
                (t.completedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60);
              return sum + diff;
            }, 0) / completedWithTime.length
          )
        : 0;

    // By status
    const statusMap: Record<string, number> = {};
    for (const t of tasks) {
      statusMap[t.status] = (statusMap[t.status] ?? 0) + 1;
    }
    const byStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // By type
    const typeMap: Record<string, number> = {};
    for (const t of tasks) {
      typeMap[t.type] = (typeMap[t.type] ?? 0) + 1;
    }
    const byType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    // By priority
    const priorityMap: Record<string, number> = {};
    for (const t of tasks) {
      priorityMap[t.priority] = (priorityMap[t.priority] ?? 0) + 1;
    }
    const byPriority = Object.entries(priorityMap).map(([priority, count]) => ({
      priority,
      count,
    }));

    return {
      success: true as const,
      data: {
        total,
        completed,
        completionRate,
        avgCompletionTime,
        byStatus,
        byType,
        byPriority,
      },
    };
  } catch {
    return { success: false as const, error: "Kat hizmetleri raporu yüklenirken bir hata oluştu." };
  }
}

export async function getReservationAnalysis(
  hotelId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const start = startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ?? new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const resolvedHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const where: Record<string, unknown> = {
      createdAt: { gte: start, lte: end },
    };
    if (resolvedHotelId) where.hotelId = resolvedHotelId;

    const reservations = await prisma.reservation.findMany({ where });

    const total = reservations.length;
    const cancelled = reservations.filter((r) => r.status === "CANCELLED").length;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    const avgStayDuration =
      total > 0
        ? Math.round(
            reservations.reduce((sum, r) => {
              const nights = Math.ceil(
                (r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24)
              );
              return sum + nights;
            }, 0) / total
          )
        : 0;

    // Status distribution
    const statusMap: Record<string, number> = {};
    for (const r of reservations) {
      statusMap[r.status] = (statusMap[r.status] ?? 0) + 1;
    }
    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    // Monthly trend
    const monthlyMap: Record<string, number> = {};
    for (const r of reservations) {
      const key = r.createdAt.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" });
      monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
    }
    const monthlyTrend = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }));

    return {
      success: true as const,
      data: {
        total,
        cancelled,
        cancellationRate,
        avgStayDuration,
        statusDistribution,
        monthlyTrend,
      },
    };
  } catch {
    return { success: false as const, error: "Rezervasyon analizi yüklenirken bir hata oluştu." };
  }
}
