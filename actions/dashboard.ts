"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  monthlyRevenue: number;
  pendingReservations: number;
}

export interface OccupancyDataPoint {
  date: string;
  occupied: number;
  available: number;
  rate: number;
}

export interface RecentActivity {
  id: string;
  type: "CHECK_IN" | "CHECK_OUT" | "NEW_RESERVATION" | "CANCELLED";
  guestName: string;
  roomNumber: string;
  hotelName: string;
  timestamp: string;
  status: string;
}

export interface HotelSummary {
  id: string;
  name: string;
  city: string;
  stars: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  pendingReservations: number;
}

export async function getDashboardStats(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const targetHotelId =
      user.role === "ADMIN" ? hotelId : (user.hotelId ?? undefined);

    const roomWhere: Record<string, unknown> = {};
    const reservationWhere: Record<string, unknown> = {};

    if (targetHotelId) {
      roomWhere.hotelId = targetHotelId;
      reservationWhere.hotelId = targetHotelId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalRooms,
      occupiedRooms,
      availableRooms,
      todayCheckIns,
      todayCheckOuts,
      pendingReservations,
      monthlyInvoices,
    ] = await Promise.all([
      prisma.room.count({ where: roomWhere }),
      prisma.room.count({ where: { ...roomWhere, status: "OCCUPIED" } }),
      prisma.room.count({
        where: { ...roomWhere, status: { not: "OCCUPIED" } },
      }),
      prisma.reservation.count({
        where: {
          ...reservationWhere,
          status: "CONFIRMED",
          checkIn: { gte: today, lt: tomorrow },
        },
      }),
      prisma.reservation.count({
        where: {
          ...reservationWhere,
          status: "CHECKED_IN",
          checkOut: { gte: today, lt: tomorrow },
        },
      }),
      prisma.reservation.count({
        where: { ...reservationWhere, status: "PENDING" },
      }),
      prisma.invoice.findMany({
        where: {
          paidAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
          reservation: targetHotelId ? { hotelId: targetHotelId } : undefined,
        },
        select: { total: true },
      }),
    ]);

    const monthlyRevenue = monthlyInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );

    const stats: DashboardStats = {
      totalRooms,
      occupiedRooms,
      availableRooms,
      todayCheckIns,
      todayCheckOuts,
      monthlyRevenue,
      pendingReservations,
    };

    return { success: true, data: stats };
  } catch {
    return { success: false, error: "İstatistikler yüklenirken hata oluştu." };
  }
}

export async function getOccupancyData(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const targetHotelId =
      user.role === "ADMIN" ? hotelId : (user.hotelId ?? undefined);

    const roomWhere: Record<string, unknown> = {};
    if (targetHotelId) roomWhere.hotelId = targetHotelId;

    const totalRooms = await prisma.room.count({ where: roomWhere });

    const data: OccupancyDataPoint[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let occupied: number;

      if (i === 0) {
        // Today: use actual room status for accurate data
        occupied = await prisma.room.count({
          where: { ...roomWhere, status: "OCCUPIED" },
        });
      } else {
        // Past days: use reservation data
        const reservationWhere: Record<string, unknown> = {
          status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
          checkIn: { lte: nextDate },
          checkOut: { gte: date },
        };
        if (targetHotelId) reservationWhere.hotelId = targetHotelId;

        occupied = await prisma.reservation.count({
          where: reservationWhere,
        });
      }

      const clampedOccupied = Math.min(occupied, totalRooms);
      const available = Math.max(totalRooms - clampedOccupied, 0);
      const rate =
        totalRooms > 0
          ? Math.round((clampedOccupied / totalRooms) * 100)
          : 0;

      const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      data.push({
        date: dayNames[date.getDay()],
        occupied: clampedOccupied,
        available,
        rate,
      });
    }

    return { success: true, data };
  } catch {
    return { success: false, error: "Doluluk verisi yüklenirken hata oluştu." };
  }
}

export async function getRecentActivities(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const targetHotelId =
      user.role === "ADMIN" ? hotelId : (user.hotelId ?? undefined);

    const where: Record<string, unknown> = {};
    if (targetHotelId) where.hotelId = targetHotelId;

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        guest: true,
        room: true,
        hotel: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const activities: RecentActivity[] = reservations.map((r) => {
      let type: RecentActivity["type"] = "NEW_RESERVATION";
      if (r.status === "CHECKED_IN") type = "CHECK_IN";
      else if (r.status === "CHECKED_OUT") type = "CHECK_OUT";
      else if (r.status === "CANCELLED") type = "CANCELLED";

      return {
        id: r.id,
        type,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        roomNumber: r.room.number,
        hotelName: r.hotel.name,
        timestamp: r.updatedAt.toISOString(),
        status: r.status,
      };
    });

    return { success: true, data: activities };
  } catch {
    return {
      success: false,
      error: "Son aktiviteler yüklenirken hata oluştu.",
    };
  }
}

export async function getHotelsSummary() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };
  if (user.role !== "ADMIN")
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };

  try {
    const hotels = await prisma.hotel.findMany({
      where: { isActive: true },
      include: {
        rooms: { select: { id: true, status: true } },
        reservations: {
          where: { status: "PENDING" },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const summary: HotelSummary[] = hotels.map((hotel) => {
      const totalRooms = hotel.rooms.length;
      const occupiedRooms = hotel.rooms.filter(
        (r) => r.status === "OCCUPIED"
      ).length;
      const occupancyRate =
        totalRooms > 0
          ? Math.round((occupiedRooms / totalRooms) * 100)
          : 0;

      return {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        stars: hotel.stars,
        totalRooms,
        occupiedRooms,
        occupancyRate,
        pendingReservations: hotel.reservations.length,
      };
    });

    return { success: true, data: summary };
  } catch {
    return {
      success: false,
      error: "Otel özeti yüklenirken hata oluştu.",
    };
  }
}
