"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface HotelData {
  name: string;
  address: string;
  city: string;
  phone: string;
  stars: number;
  isActive?: boolean;
}

export async function getHotels() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        _count: {
          select: { rooms: true, staff: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: hotels };
  } catch {
    return { success: false, error: "Oteller yüklenirken bir hata oluştu." };
  }
}

export async function createHotel(data: HotelData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  if (!data.name || !data.address || !data.city || !data.phone) {
    return { success: false, error: "Tüm zorunlu alanları doldurun." };
  }

  try {
    const hotel = await prisma.hotel.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        city: data.city.trim(),
        phone: data.phone.trim(),
        stars: data.stars ?? 5,
        isActive: data.isActive ?? true,
      },
      include: {
        _count: { select: { rooms: true, staff: true } },
      },
    });

    revalidatePath("/hotels");
    return { success: true, data: hotel };
  } catch {
    return { success: false, error: "Otel oluşturulurken bir hata oluştu." };
  }
}

export async function updateHotel(id: string, data: Partial<HotelData>) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  try {
    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Otel bulunamadı." };

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.address !== undefined) updateData.address = data.address.trim();
    if (data.city !== undefined) updateData.city = data.city.trim();
    if (data.phone !== undefined) updateData.phone = data.phone.trim();
    if (data.stars !== undefined) updateData.stars = data.stars;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const hotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { rooms: true, staff: true } },
      },
    });

    revalidatePath("/hotels");
    return { success: true, data: hotel };
  } catch {
    return { success: false, error: "Otel güncellenirken bir hata oluştu." };
  }
}

export async function deleteHotel(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: {
        _count: { select: { rooms: true, staff: true } },
      },
    });

    if (!hotel) return { success: false, error: "Otel bulunamadı." };

    if (hotel._count.rooms > 0) {
      return { success: false, error: "Bu otelde oda kaydı mevcut. Önce odaları silin." };
    }

    if (hotel._count.staff > 0) {
      return { success: false, error: "Bu otelde personel kaydı mevcut. Önce personeli silin." };
    }

    await prisma.hotel.delete({ where: { id } });

    revalidatePath("/hotels");
    return { success: true };
  } catch {
    return { success: false, error: "Otel silinirken bir hata oluştu." };
  }
}

export async function toggleHotelActive(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  try {
    const existing = await prisma.hotel.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Otel bulunamadı." };

    const hotel = await prisma.hotel.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        _count: { select: { rooms: true, staff: true } },
      },
    });

    revalidatePath("/hotels");
    return { success: true, data: hotel };
  } catch {
    return { success: false, error: "Otel durumu güncellenirken bir hata oluştu." };
  }
}
