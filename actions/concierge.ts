"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ServiceRequestFilters {
  status?: string;
  type?: string;
  priority?: string;
  hotelId?: string;
  search?: string;
}

export interface ServiceRequestData {
  guestId: string;
  hotelId: string;
  type: string;
  description: string;
  priority?: string;
  notes?: string;
}

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

export async function getServiceRequests(filters?: ServiceRequestFilters) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const where: Record<string, unknown> = {};

    if (user.role !== "ADMIN") {
      where.hotelId = user.hotelId ?? undefined;
    } else if (filters?.hotelId) {
      where.hotelId = filters.hotelId;
    }

    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.priority) where.priority = filters.priority;

    const requests = await prisma.serviceRequest.findMany({
      where,
      include: {
        guest: true,
        hotel: true,
        assignedTo: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Sort by priority then createdAt desc
    requests.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_ORDER[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Apply search filter client-side after fetch (guest name search)
    const filtered = filters?.search
      ? requests.filter((r) => {
          const q = filters.search!.toLowerCase();
          const fullName = `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase();
          return fullName.includes(q);
        })
      : requests;

    return { success: true as const, data: filtered };
  } catch {
    return { success: false as const, error: "Hizmet talepleri yüklenirken bir hata oluştu." };
  }
}

export async function getServiceRequestById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        guest: true,
        hotel: true,
        assignedTo: true,
      },
    });

    if (!request) return { success: false as const, error: "Hizmet talebi bulunamadı." };

    if (user.role !== "ADMIN" && request.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu hizmet talebine erişim yetkiniz yok." };
    }

    return { success: true as const, data: request };
  } catch {
    return { success: false as const, error: "Hizmet talebi yüklenirken bir hata oluştu." };
  }
}

export async function createServiceRequest(data: ServiceRequestData) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  if (!data.description?.trim()) {
    return { success: false as const, error: "Açıklama zorunludur." };
  }

  try {
    const request = await prisma.serviceRequest.create({
      data: {
        guestId: data.guestId,
        hotelId: data.hotelId,
        type: data.type,
        description: data.description.trim(),
        priority: data.priority ?? "NORMAL",
        notes: data.notes?.trim() || null,
        status: "PENDING",
      },
      include: { guest: true, hotel: true, assignedTo: true },
    });

    revalidatePath("/concierge");
    return { success: true as const, data: request };
  } catch {
    return { success: false as const, error: "Hizmet talebi oluşturulurken bir hata oluştu." };
  }
}

export async function updateServiceRequest(id: string, data: Partial<ServiceRequestData>) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Hizmet talebi bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu hizmet talebini düzenleme yetkiniz yok." };
    }

    const updateData: Record<string, unknown> = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

    const request = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: { guest: true, hotel: true, assignedTo: true },
    });

    revalidatePath("/concierge");
    return { success: true as const, data: request };
  } catch {
    return { success: false as const, error: "Hizmet talebi güncellenirken bir hata oluştu." };
  }
}

export async function updateServiceRequestStatus(id: string, status: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Hizmet talebi bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu işlem için yetkiniz yok." };
    }

    if (status === "IN_PROGRESS" && !existing.assignedToId) {
      return { success: false as const, error: "Durum İşleniyor yapılabilmesi için önce personel atanmalıdır." };
    }

    const updateData: Record<string, unknown> = { status };
    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    await prisma.serviceRequest.update({ where: { id }, data: updateData });

    revalidatePath("/concierge");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Durum güncellenirken bir hata oluştu." };
  }
}

export async function assignServiceRequest(id: string, userId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Hizmet talebi bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu işlem için yetkiniz yok." };
    }

    const updateData: Record<string, unknown> = { assignedToId: userId };
    if (existing.status === "PENDING") {
      updateData.status = "IN_PROGRESS";
    }

    await prisma.serviceRequest.update({ where: { id }, data: updateData });

    revalidatePath("/concierge");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Personel atanırken bir hata oluştu." };
  }
}

export async function deleteServiceRequest(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  if (user.role !== "ADMIN") {
    return { success: false as const, error: "Silme işlemi için yetkiniz yok." };
  }

  try {
    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Hizmet talebi bulunamadı." };

    await prisma.serviceRequest.delete({ where: { id } });

    revalidatePath("/concierge");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Hizmet talebi silinirken bir hata oluştu." };
  }
}

export async function getCheckedInGuests(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const effectiveHotelId = user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const reservations = await prisma.reservation.findMany({
      where: {
        status: "CHECKED_IN",
        ...(effectiveHotelId ? { hotelId: effectiveHotelId } : {}),
      },
      include: { guest: true },
      orderBy: { checkIn: "desc" },
    });

    // Deduplicate guests
    const seen = new Set<string>();
    const guests = reservations
      .map((r) => r.guest)
      .filter((g) => {
        if (seen.has(g.id)) return false;
        seen.add(g.id);
        return true;
      });

    return { success: true as const, data: guests };
  } catch {
    return { success: false as const, error: "Misafirler yüklenirken bir hata oluştu." };
  }
}

export async function getConciergeStaff(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const effectiveHotelId = user.role !== "ADMIN" ? (user.hotelId ?? undefined) : hotelId;

    const staff = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["CONCIERGE", "RECEPTIONIST", "MANAGER", "ADMIN"] },
        ...(effectiveHotelId ? { hotelId: effectiveHotelId } : {}),
      },
      orderBy: { name: "asc" },
    });

    return { success: true as const, data: staff };
  } catch {
    return { success: false as const, error: "Personel listesi yüklenirken bir hata oluştu." };
  }
}
