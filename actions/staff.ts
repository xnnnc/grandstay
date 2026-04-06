"use server";

import prisma from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/types";

export interface StaffFilters {
  role?: UserRole;
  hotelId?: string;
  search?: string;
}

export interface StaffData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  hotelId?: string;
  isActive?: boolean;
}

export async function getStaff(filters?: StaffFilters) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu sayfaya erişim için admin yetkisi gereklidir." };
  }

  try {
    const where: Record<string, unknown> = {};

    if (filters?.role) where.role = filters.role;
    if (filters?.hotelId) where.hotelId = filters.hotelId;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const staff = await prisma.user.findMany({
      where,
      include: { hotel: { select: { id: true, name: true, city: true } } },
      orderBy: [{ name: "asc" }],
    });

    // Remove passwords from results
    const safeStaff = staff.map(({ password, ...s }) => s);

    return { success: true, data: safeStaff };
  } catch {
    return { success: false, error: "Personel listesi yüklenirken bir hata oluştu." };
  }
}

export async function createStaff(data: StaffData) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  if (!data.name || !data.email || !data.password || !data.role) {
    return { success: false, error: "Tüm zorunlu alanları doldurun." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { success: false, error: "Bu e-posta adresi zaten kullanımda." };
    }

    const hashed = await hashPassword(data.password);

    const staff = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashed,
        role: data.role,
        hotelId: data.hotelId || null,
        isActive: data.isActive ?? true,
      },
      include: { hotel: { select: { id: true, name: true, city: true } } },
    });

    const { password, ...safeStaff } = staff;

    revalidatePath("/staff");
    return { success: true, data: safeStaff };
  } catch {
    return { success: false, error: "Personel oluşturulurken bir hata oluştu." };
  }
}

export async function updateStaff(id: string, data: Partial<StaffData>) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Personel bulunamadı." };

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) {
      const emailExists = await prisma.user.findFirst({
        where: { email: data.email.trim().toLowerCase(), NOT: { id } },
      });
      if (emailExists) return { success: false, error: "Bu e-posta adresi zaten kullanımda." };
      updateData.email = data.email.trim().toLowerCase();
    }
    if (data.password && data.password.trim().length > 0) {
      updateData.password = await hashPassword(data.password);
    }
    if (data.role !== undefined) updateData.role = data.role;
    if (data.hotelId !== undefined) updateData.hotelId = data.hotelId || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const staff = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { hotel: { select: { id: true, name: true, city: true } } },
    });

    const { password, ...safeStaff } = staff;

    revalidatePath("/staff");
    return { success: true, data: safeStaff };
  } catch {
    return { success: false, error: "Personel güncellenirken bir hata oluştu." };
  }
}

export async function deleteStaff(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Personel bulunamadı." };

    // Prevent deleting yourself
    if (existing.id === user.id) {
      return { success: false, error: "Kendi hesabınızı silemezsiniz." };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/staff");
    return { success: true };
  } catch {
    return { success: false, error: "Personel silinirken bir hata oluştu." };
  }
}

export async function toggleStaffActive(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false, error: "Bu işlem için admin yetkisi gereklidir." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Personel bulunamadı." };

    if (existing.id === user.id) {
      return { success: false, error: "Kendi hesabınızı devre dışı bırakamazsınız." };
    }

    const staff = await prisma.user.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: { hotel: { select: { id: true, name: true, city: true } } },
    });

    const { password, ...safeStaff } = staff;

    revalidatePath("/staff");
    return { success: true, data: safeStaff };
  } catch {
    return { success: false, error: "Personel durumu güncellenirken bir hata oluştu." };
  }
}
