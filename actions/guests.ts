"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface GuestData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idNumber: string;
  nationality?: string;
  notes?: string;
}

export async function getGuests(search?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { idNumber: { contains: search } },
          ],
        }
      : undefined;

    const guests = await prisma.guest.findMany({
      where,
      include: {
        reservations: {
          include: { hotel: true, room: true },
          orderBy: { checkIn: "desc" as const },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: guests };
  } catch {
    return { success: false, error: "Misafirler yüklenirken bir hata oluştu." };
  }
}

export async function getGuestById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  try {
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          include: { room: true, hotel: true, invoice: true },
          orderBy: { checkIn: "desc" },
        },
        serviceRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!guest) return { success: false, error: "Misafir bulunamadı." };

    return { success: true, data: guest };
  } catch {
    return { success: false, error: "Misafir yüklenirken bir hata oluştu." };
  }
}

export async function createGuest(data: GuestData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (!data.firstName?.trim() || !data.lastName?.trim()) {
    return { success: false, error: "Ad ve soyad zorunludur." };
  }
  if (!data.idNumber?.trim()) {
    return { success: false, error: "TC Kimlik No / Pasaport No zorunludur." };
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: "Geçerli bir email adresi girin." };
  }

  try {
    const guest = await prisma.guest.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        idNumber: data.idNumber.trim(),
        nationality: data.nationality || "TR",
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/guests");
    return { success: true, data: guest };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Bu TC Kimlik No / Pasaport No zaten kayıtlı." };
    }
    return { success: false, error: "Misafir oluşturulurken bir hata oluştu." };
  }
}

export async function updateGuest(id: string, data: Partial<GuestData>) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: "Geçerli bir email adresi girin." };
  }

  try {
    const existing = await prisma.guest.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Misafir bulunamadı." };

    const updateData: Record<string, unknown> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.email !== undefined) updateData.email = data.email?.trim() || null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.idNumber !== undefined) updateData.idNumber = data.idNumber.trim();
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

    const guest = await prisma.guest.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/guests");
    revalidatePath(`/guests/${id}`);
    return { success: true, data: guest };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("Unique constraint")) {
      return { success: false, error: "Bu TC Kimlik No / Pasaport No zaten kayıtlı." };
    }
    return { success: false, error: "Misafir güncellenirken bir hata oluştu." };
  }
}

export async function deleteGuest(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return { success: false, error: "Misafir silme işlemi için yetkiniz yok." };
  }

  try {
    const existing = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          where: {
            status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
          },
        },
      },
    });

    if (!existing) return { success: false, error: "Misafir bulunamadı." };

    if (existing.reservations.length > 0) {
      return {
        success: false,
        error: "Aktif rezervasyonu olan misafir silinemez.",
      };
    }

    await prisma.guest.delete({ where: { id } });

    revalidatePath("/guests");
    return { success: true };
  } catch {
    return { success: false, error: "Misafir silinirken bir hata oluştu." };
  }
}
