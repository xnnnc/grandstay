"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ReservationStatus } from "@/types";

export interface ReservationFilters {
  status?: ReservationStatus;
  hotelId?: string;
  guestId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface ReservationData {
  guestId: string;
  roomId: string;
  hotelId: string;
  checkIn: string;
  checkOut: string;
  currency?: string;
  notes?: string;
}

export async function getReservations(filters?: ReservationFilters) {
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
    if (filters?.guestId) where.guestId = filters.guestId;

    if (filters?.dateFrom || filters?.dateTo) {
      where.checkIn = {};
      if (filters.dateFrom)
        (where.checkIn as Record<string, unknown>).gte = new Date(filters.dateFrom);
      if (filters.dateTo)
        (where.checkIn as Record<string, unknown>).lte = new Date(filters.dateTo);
    }

    if (filters?.search) {
      where.guest = {
        OR: [
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } },
        ],
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        guest: true,
        room: true,
        hotel: true,
      },
      orderBy: { checkIn: "desc" },
    });

    return { success: true as const, data: reservations };
  } catch {
    return { success: false as const, error: "Rezervasyonlar yüklenirken bir hata oluştu." };
  }
}

export async function getReservationById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        room: true,
        hotel: true,
        invoice: true,
      },
    });

    if (!reservation) return { success: false as const, error: "Rezervasyon bulunamadı." };

    if (user.role !== "ADMIN" && reservation.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu rezervasyona erişim yetkiniz yok." };
    }

    return { success: true as const, data: reservation };
  } catch {
    return { success: false as const, error: "Rezervasyon yüklenirken bir hata oluştu." };
  }
}

export async function createReservation(data: ReservationData) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { success: false as const, error: "Geçersiz tarih formatı." };
  }

  if (checkIn >= checkOut) {
    return { success: false as const, error: "Giriş tarihi çıkış tarihinden önce olmalıdır." };
  }

  try {
    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) return { success: false as const, error: "Oda bulunamadı." };

    // Check for overlapping reservations
    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId: data.roomId,
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    if (overlapping) {
      return { success: false as const, error: "Bu oda seçilen tarihler için müsait değil." };
    }

    // Calculate total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    const reservation = await prisma.reservation.create({
      data: {
        guestId: data.guestId,
        roomId: data.roomId,
        hotelId: data.hotelId,
        checkIn,
        checkOut,
        status: "PENDING",
        totalPrice,
        currency: data.currency ?? "TRY",
        notes: data.notes?.trim() || null,
      },
      include: { guest: true, room: true, hotel: true },
    });

    // Update room status to RESERVED if currently AVAILABLE
    if (room.status === "AVAILABLE") {
      await prisma.room.update({
        where: { id: data.roomId },
        data: { status: "RESERVED" },
      });
    }

    revalidatePath("/reservations");
    revalidatePath("/rooms");
    return { success: true as const, data: reservation };
  } catch {
    return { success: false as const, error: "Rezervasyon oluşturulurken bir hata oluştu." };
  }
}

export async function updateReservation(id: string, data: Partial<ReservationData>) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Rezervasyon bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu rezervasyonu düzenleme yetkiniz yok." };
    }

    const updateData: Record<string, unknown> = {};
    if (data.checkIn) updateData.checkIn = new Date(data.checkIn);
    if (data.checkOut) updateData.checkOut = new Date(data.checkOut);
    if (data.currency) updateData.currency = data.currency;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: { guest: true, room: true, hotel: true },
    });

    revalidatePath("/reservations");
    return { success: true as const, data: reservation };
  } catch {
    return { success: false as const, error: "Rezervasyon güncellenirken bir hata oluştu." };
  }
}

export async function cancelReservation(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.reservation.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!existing) return { success: false as const, error: "Rezervasyon bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu rezervasyonu iptal etme yetkiniz yok." };
    }

    if (existing.status === "CANCELLED") {
      return { success: false as const, error: "Rezervasyon zaten iptal edilmiş." };
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Set room back to AVAILABLE if it was RESERVED
    if (existing.room.status === "RESERVED") {
      await prisma.room.update({
        where: { id: existing.roomId },
        data: { status: "AVAILABLE" },
      });
    }

    revalidatePath("/reservations");
    revalidatePath("/rooms");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Rezervasyon iptal edilirken bir hata oluştu." };
  }
}

export async function confirmReservation(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) return { success: false as const, error: "Rezervasyon bulunamadı." };

    if (user.role !== "ADMIN" && existing.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu rezervasyonu onaylama yetkiniz yok." };
    }

    if (existing.status !== "PENDING") {
      return { success: false as const, error: "Sadece beklemedeki rezervasyonlar onaylanabilir." };
    }

    await prisma.reservation.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    revalidatePath("/reservations");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Rezervasyon onaylanırken bir hata oluştu." };
  }
}

export async function getAvailableRooms(hotelId: string, checkIn: string, checkOut: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { success: false as const, error: "Geçersiz tarih formatı." };
  }

  try {
    // Find rooms that have overlapping reservations
    const unavailableRoomIds = await prisma.reservation.findMany({
      where: {
        hotelId,
        status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } },
        ],
      },
      select: { roomId: true },
    });

    const unavailableIds = unavailableRoomIds.map((r) => r.roomId);

    const rooms = await prisma.room.findMany({
      where: {
        hotelId,
        status: { in: ["AVAILABLE", "RESERVED"] },
        id: { notIn: unavailableIds },
      },
      include: { hotel: true },
      orderBy: [{ floor: "asc" }, { number: "asc" }],
    });

    return { success: true as const, data: rooms };
  } catch {
    return { success: false as const, error: "Müsait odalar yüklenirken bir hata oluştu." };
  }
}

export async function checkInReservation(reservationId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true },
    });

    if (!reservation) return { success: false as const, error: "Rezervasyon bulunamadı." };

    if (user.role !== "ADMIN" && reservation.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu rezervasyona erişim yetkiniz yok." };
    }

    if (reservation.status !== "CONFIRMED" && reservation.status !== "PENDING") {
      return { success: false as const, error: "Sadece onaylanmış veya beklemedeki rezervasyonlar için giriş yapılabilir." };
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CHECKED_IN" },
    });

    await prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: "OCCUPIED" },
    });

    revalidatePath("/check-in");
    revalidatePath("/reservations");
    revalidatePath("/rooms");
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Check-in işlemi sırasında bir hata oluştu." };
  }
}

export async function checkOutReservation(reservationId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { room: true },
    });

    if (!reservation) return { success: false as const, error: "Rezervasyon bulunamadı." };

    if (user.role !== "ADMIN" && reservation.hotelId !== user.hotelId) {
      return { success: false as const, error: "Bu rezervasyona erişim yetkiniz yok." };
    }

    if (reservation.status !== "CHECKED_IN") {
      return { success: false as const, error: "Sadece giriş yapılmış rezervasyonlar için çıkış yapılabilir." };
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CHECKED_OUT" },
    });

    await prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: "CLEANING" },
    });

    const nights = Math.max(
      1,
      Math.ceil(
        (reservation.checkOut.getTime() - reservation.checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const subtotal = reservation.totalPrice;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const invoice = await prisma.invoice.create({
      data: {
        reservationId,
        items: JSON.stringify([
          { description: `Oda Ücreti (${nights} gece)`, amount: subtotal },
        ]),
        subtotal,
        tax,
        total,
        currency: reservation.currency,
      },
    });

    revalidatePath("/check-out");
    revalidatePath("/reservations");
    revalidatePath("/rooms");
    return { success: true as const, data: { invoice } };
  } catch {
    return { success: false as const, error: "Check-out işlemi sırasında bir hata oluştu." };
  }
}

export async function getTodayCheckIns(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: Record<string, unknown> = {
      status: { in: ["CONFIRMED", "PENDING"] },
      checkIn: { gte: today, lt: tomorrow },
    };

    if (user.role !== "ADMIN") {
      where.hotelId = user.hotelId ?? undefined;
    } else if (hotelId) {
      where.hotelId = hotelId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: { guest: true, room: true, hotel: true },
      orderBy: { checkIn: "asc" },
    });

    return { success: true as const, data: reservations };
  } catch {
    return { success: false as const, error: "Bugünün girişleri yüklenirken bir hata oluştu." };
  }
}

export async function getTodayCheckOuts(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where: Record<string, unknown> = {
      status: "CHECKED_IN",
      checkOut: { gte: today, lt: tomorrow },
    };

    if (user.role !== "ADMIN") {
      where.hotelId = user.hotelId ?? undefined;
    } else if (hotelId) {
      where.hotelId = hotelId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: { guest: true, room: true, hotel: true, invoice: true },
      orderBy: { checkOut: "asc" },
    });

    return { success: true as const, data: reservations };
  } catch {
    return { success: false as const, error: "Bugünün çıkışları yüklenirken bir hata oluştu." };
  }
}
