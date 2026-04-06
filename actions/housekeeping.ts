"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { RoomContext } from "@/patterns/state";
import { revalidatePath } from "next/cache";

export interface HousekeepingTaskFilters {
  status?: string;
  type?: string;
  priority?: string;
  assignedToId?: string;
  hotelId?: string;
}

export interface HousekeepingTaskData {
  roomId: string;
  type: string;
  priority?: string;
  notes?: string;
  assignedToId?: string;
}

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

export async function getHousekeepingTasks(filters?: HousekeepingTaskFilters) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const where: Record<string, unknown> = {};

    // Scope to hotel
    const effectiveHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : filters?.hotelId;

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.assignedToId) where.assignedToId = filters.assignedToId;

    // Filter by hotel via room relation
    if (effectiveHotelId) {
      where.room = { hotelId: effectiveHotelId };
    }

    const tasks = await prisma.housekeepingTask.findMany({
      where,
      include: {
        room: { include: { hotel: true } },
        assignedTo: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Sort by priority (URGENT first), then createdAt asc
    tasks.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_ORDER[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return { success: true as const, data: tasks };
  } catch {
    return { success: false as const, error: "Görevler yüklenirken bir hata oluştu." };
  }
}

export async function getHousekeepingTaskById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const task = await prisma.housekeepingTask.findUnique({
      where: { id },
      include: {
        room: { include: { hotel: true } },
        assignedTo: true,
      },
    });

    if (!task) return { success: false as const, error: "Görev bulunamadı." };

    if (user.role !== "ADMIN" && task.room.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu göreve erişim yetkiniz yok." };
    }

    return { success: true as const, data: task };
  } catch {
    return { success: false as const, error: "Görev yüklenirken bir hata oluştu." };
  }
}

export async function createHousekeepingTask(data: HousekeepingTaskData) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  if (!data.roomId) {
    return { success: false as const, error: "Oda seçimi zorunludur." };
  }

  try {
    const task = await prisma.housekeepingTask.create({
      data: {
        roomId: data.roomId,
        type: data.type ?? "CLEANING",
        priority: data.priority ?? "NORMAL",
        notes: data.notes?.trim() || null,
        assignedToId: data.assignedToId || null,
        status: "PENDING",
      },
      include: {
        room: { include: { hotel: true } },
        assignedTo: true,
      },
    });

    revalidatePath("/housekeeping");
    return { success: true as const, data: task };
  } catch {
    return { success: false as const, error: "Görev oluşturulurken bir hata oluştu." };
  }
}

export async function updateHousekeepingTask(
  id: string,
  data: Partial<HousekeepingTaskData>
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.housekeepingTask.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!existing) return { success: false as const, error: "Görev bulunamadı." };

    if (user.role !== "ADMIN" && existing.room.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu görevi düzenleme yetkiniz yok." };
    }

    const updateData: Record<string, unknown> = {};
    if (data.roomId !== undefined) updateData.roomId = data.roomId;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;
    if (data.assignedToId !== undefined)
      updateData.assignedToId = data.assignedToId || null;

    const task = await prisma.housekeepingTask.update({
      where: { id },
      data: updateData,
      include: {
        room: { include: { hotel: true } },
        assignedTo: true,
      },
    });

    revalidatePath("/housekeeping");
    return { success: true as const, data: task };
  } catch {
    return { success: false as const, error: "Görev güncellenirken bir hata oluştu." };
  }
}

export async function assignTask(taskId: string, userId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.housekeepingTask.findUnique({
      where: { id: taskId },
      include: { room: true },
    });
    if (!existing) return { success: false as const, error: "Görev bulunamadı." };

    if (user.role !== "ADMIN" && existing.room.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu işlem için yetkiniz yok." };
    }

    const updateData: Record<string, unknown> = { assignedToId: userId };
    if (existing.status === "PENDING") {
      updateData.status = "IN_PROGRESS";
    }

    await prisma.housekeepingTask.update({ where: { id: taskId }, data: updateData });

    revalidatePath("/housekeeping");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Personel atanırken bir hata oluştu." };
  }
}

export async function completeTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const task = await prisma.housekeepingTask.findUnique({
      where: { id: taskId },
      include: { room: true },
    });
    if (!task) return { success: false as const, error: "Görev bulunamadı." };

    if (user.role !== "ADMIN" && task.room.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu işlem için yetkiniz yok." };
    }

    // Mark task as completed
    await prisma.housekeepingTask.update({
      where: { id: taskId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    // Update room status via State Pattern
    const context = new RoomContext(task.room.status);

    try {
      if (task.type === "CLEANING") {
        context.completeCleaning(); // CLEANING → AVAILABLE
      } else if (task.type === "MAINTENANCE") {
        context.completeMaintenance(); // MAINTENANCE → AVAILABLE
      }

      await prisma.room.update({
        where: { id: task.roomId },
        data: { status: context.getStatus() },
      });
    } catch {
      // State transition failed — room status unchanged, task still marked complete
    }

    revalidatePath("/housekeeping");
    revalidatePath("/rooms");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Görev tamamlanırken bir hata oluştu." };
  }
}

export async function deleteHousekeepingTask(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { success: false as const, error: "Silme işlemi için yetkiniz yok." };
  }

  try {
    const existing = await prisma.housekeepingTask.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!existing) return { success: false as const, error: "Görev bulunamadı." };

    if (user.role !== "ADMIN" && existing.room.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu görevi silme yetkiniz yok." };
    }

    await prisma.housekeepingTask.delete({ where: { id } });

    revalidatePath("/housekeeping");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Görev silinirken bir hata oluştu." };
  }
}

export async function getHousekeepingStats(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const effectiveHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const roomFilter = effectiveHotelId ? { hotelId: effectiveHotelId } : {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [pendingCount, inProgressCount, completedTodayCount, roomsNeedingCleaning, roomsInMaintenance] =
      await Promise.all([
        prisma.housekeepingTask.count({
          where: { status: "PENDING", room: roomFilter },
        }),
        prisma.housekeepingTask.count({
          where: { status: "IN_PROGRESS", room: roomFilter },
        }),
        prisma.housekeepingTask.count({
          where: {
            status: "COMPLETED",
            completedAt: { gte: today, lt: tomorrow },
            room: roomFilter,
          },
        }),
        prisma.room.count({
          where: { status: "CLEANING", ...roomFilter },
        }),
        prisma.room.count({
          where: { status: "MAINTENANCE", ...roomFilter },
        }),
      ]);

    return {
      success: true as const,
      data: {
        pendingCount,
        inProgressCount,
        completedTodayCount,
        roomsNeedingCleaning,
        roomsInMaintenance,
      },
    };
  } catch {
    return { success: false as const, error: "İstatistikler yüklenirken bir hata oluştu." };
  }
}

export async function getHousekeepingStaff(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const effectiveHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const staff = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["HOUSEKEEPING", "MANAGER", "ADMIN"] },
        ...(effectiveHotelId ? { hotelId: effectiveHotelId } : {}),
      },
      orderBy: { name: "asc" },
    });

    return { success: true as const, data: staff };
  } catch {
    return { success: false as const, error: "Personel listesi yüklenirken bir hata oluştu." };
  }
}

export async function getRoomsForHousekeeping(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const effectiveHotelId =
      user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const rooms = await prisma.room.findMany({
      where: effectiveHotelId ? { hotelId: effectiveHotelId } : {},
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });

    return { success: true as const, data: rooms };
  } catch {
    return { success: false as const, error: "Odalar yüklenirken bir hata oluştu." };
  }
}
