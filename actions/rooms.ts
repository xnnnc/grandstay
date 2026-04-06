"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { RoomStatus, RoomType } from "@/types";
import { RoomContext } from "@/patterns/state";

export interface RoomFilters {
  type?: RoomType;
  status?: RoomStatus;
  floor?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  hotelId?: string;
}

export interface RoomData {
  number: string;
  floor: number;
  type: RoomType;
  capacity: number;
  pricePerNight: number;
  status?: RoomStatus;
  amenities?: string[];
  hotelId: string;
}

export async function getRooms(filters?: RoomFilters) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const where: Record<string, unknown> = {};

    if (user.role !== "ADMIN") {
      where.hotelId = user.hotelId ?? undefined;
    } else if (filters?.hotelId) {
      where.hotelId = filters.hotelId;
    }

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.floor) where.floor = filters.floor;
    if (filters?.search) {
      where.number = { contains: filters.search };
    }
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.pricePerNight = {};
      if (filters.minPrice !== undefined)
        (where.pricePerNight as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice !== undefined)
        (where.pricePerNight as Record<string, number>).lte = filters.maxPrice;
    }

    const rooms = await prisma.room.findMany({
      where,
      include: { hotel: true },
      orderBy: [{ hotel: { name: "asc" } }, { floor: "asc" }, { number: "asc" }],
    });

    return { success: true, data: rooms };
  } catch {
    return { success: false, error: "Odalar yüklenirken bir hata oluştu." };
  }
}

export async function getRoomById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        hotel: true,
        reservations: { include: { guest: true } },
        housekeepingTasks: true,
      },
    });

    if (!room) return { success: false, error: "Oda bulunamadı." };

    if (user.role !== "ADMIN" && room.hotelId !== user.hotelId) {
      return { success: false, error: "Bu odaya erişim yetkiniz yok." };
    }

    return { success: true, data: room };
  } catch {
    return { success: false, error: "Oda yüklenirken bir hata oluştu." };
  }
}

export async function createRoom(data: RoomData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { success: false, error: "Bu işlem için yetkiniz yok." };
  }

  if (!data.number || !data.floor || !data.type || !data.capacity || !data.pricePerNight || !data.hotelId) {
    return { success: false, error: "Tüm zorunlu alanları doldurun." };
  }

  if (user.role === "MANAGER" && data.hotelId !== user.hotelId) {
    return { success: false, error: "Sadece kendi otelinize oda ekleyebilirsiniz." };
  }

  try {
    const room = await prisma.room.create({
      data: {
        number: data.number,
        floor: data.floor,
        type: data.type,
        capacity: data.capacity,
        pricePerNight: data.pricePerNight,
        status: data.status ?? "AVAILABLE",
        amenities: JSON.stringify(data.amenities ?? []),
        hotelId: data.hotelId,
      },
      include: { hotel: true },
    });

    revalidatePath("/rooms");
    return { success: true, data: room };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Bu otelde aynı oda numarası zaten mevcut." };
    }
    return { success: false, error: "Oda oluşturulurken bir hata oluştu." };
  }
}

export async function updateRoom(id: string, data: Partial<RoomData>) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { success: false, error: "Bu işlem için yetkiniz yok." };
  }

  try {
    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Oda bulunamadı." };

    if (user.role === "MANAGER" && existing.hotelId !== user.hotelId) {
      return { success: false, error: "Bu odayı düzenleme yetkiniz yok." };
    }

    const updateData: Record<string, unknown> = {};
    if (data.number !== undefined) updateData.number = data.number;
    if (data.floor !== undefined) updateData.floor = data.floor;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.pricePerNight !== undefined) updateData.pricePerNight = data.pricePerNight;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.amenities !== undefined) updateData.amenities = JSON.stringify(data.amenities);
    if (data.hotelId !== undefined && user.role === "ADMIN") updateData.hotelId = data.hotelId;

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
      include: { hotel: true },
    });

    revalidatePath("/rooms");
    return { success: true, data: room };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Bu otelde aynı oda numarası zaten mevcut." };
    }
    return { success: false, error: "Oda güncellenirken bir hata oluştu." };
  }
}

export async function deleteRoom(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Oda silme işlemi için admin yetkisi gereklidir." };
  }

  try {
    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Oda bulunamadı." };

    await prisma.room.delete({ where: { id } });

    revalidatePath("/rooms");
    return { success: true };
  } catch {
    return { success: false, error: "Oda silinirken bir hata oluştu." };
  }
}

export async function updateRoomStatus(id: string, action: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Oda bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false, error: "Bu odanın durumunu değiştirme yetkiniz yok." };
    }

    const context = new RoomContext(existing.status);

    const validActions = ["reserve", "checkIn", "checkOut", "completeCleaning", "startMaintenance", "completeMaintenance"] as const;
    type ValidAction = typeof validActions[number];

    if (!validActions.includes(action as ValidAction)) {
      return { success: false, error: "Geçersiz işlem." };
    }

    try {
      context[action as ValidAction]();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Geçersiz durum geçişi.";
      return { success: false, error: msg };
    }

    const newStatus = context.getStatus() as RoomStatus;

    const room = await prisma.room.update({
      where: { id },
      data: { status: newStatus },
      include: { hotel: true },
    });

    revalidatePath("/rooms");
    return { success: true, data: room };
  } catch {
    return { success: false, error: "Oda durumu güncellenirken bir hata oluştu." };
  }
}

export async function getRoomTransitions(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) return { success: false, error: "Oda bulunamadı." };

    if (user.role !== "ADMIN" && room.hotelId !== user.hotelId) {
      return { success: false, error: "Bu odaya erişim yetkiniz yok." };
    }

    const context = new RoomContext(room.status);
    const transitions = context.getAvailableTransitions();

    return { success: true, data: transitions };
  } catch {
    return { success: false, error: "Geçişler yüklenirken bir hata oluştu." };
  }
}
