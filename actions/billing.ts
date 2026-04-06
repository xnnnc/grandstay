"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getCurrencyAdapter } from "@/patterns/adapter";
import { revalidatePath } from "next/cache";
import type { InvoiceItem } from "@/types";

export interface InvoiceFilters {
  status?: "paid" | "unpaid";
  hotelId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getInvoices(filters?: InvoiceFilters) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const where: Record<string, unknown> = {};

    // Scope to user's hotel unless ADMIN
    const reservationWhere: Record<string, unknown> = {};
    if (user.role !== "ADMIN") {
      reservationWhere.hotelId = user.hotelId ?? undefined;
    } else if (filters?.hotelId) {
      reservationWhere.hotelId = filters.hotelId;
    }

    if (filters?.status === "paid") {
      where.paidAt = { not: null };
    } else if (filters?.status === "unpaid") {
      where.paidAt = null;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(filters.dateTo);
      }
    }

    if (filters?.search) {
      reservationWhere.guest = {
        OR: [
          { firstName: { contains: filters.search } },
          { lastName: { contains: filters.search } },
        ],
      };
    }

    if (Object.keys(reservationWhere).length > 0) {
      where.reservation = reservationWhere;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        reservation: {
          include: {
            guest: true,
            room: true,
            hotel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, data: invoices };
  } catch {
    return { success: false as const, error: "Faturalar yüklenirken bir hata oluştu." };
  }
}

export async function getInvoiceById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        reservation: {
          include: {
            guest: true,
            room: true,
            hotel: true,
          },
        },
      },
    });

    if (!invoice) return { success: false as const, error: "Fatura bulunamadı." };

    if (
      user.role !== "ADMIN" &&
      invoice.reservation.hotelId !== user.hotelId
    ) {
      return { success: false as const, error: "Bu faturaya erişim yetkiniz yok." };
    }

    return { success: true as const, data: invoice };
  } catch {
    return { success: false as const, error: "Fatura yüklenirken bir hata oluştu." };
  }
}

export async function updateInvoicePayment(
  invoiceId: string,
  data: { paymentMethod: string; currency: string }
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { reservation: true },
    });

    if (!invoice) return { success: false as const, error: "Fatura bulunamadı." };

    if (
      user.role !== "ADMIN" &&
      invoice.reservation.hotelId !== user.hotelId
    ) {
      return { success: false as const, error: "Bu faturaya erişim yetkiniz yok." };
    }

    let exchangeRate = 1.0;
    if (data.currency !== "TRY") {
      const adapter = getCurrencyAdapter();
      exchangeRate = adapter.getExchangeRate("TRY", data.currency);
    }

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentMethod: data.paymentMethod,
        currency: data.currency,
        exchangeRate,
        paidAt: new Date(),
      },
    });

    revalidatePath("/billing");
    revalidatePath(`/billing/${invoiceId}`);
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Ödeme kaydedilirken bir hata oluştu." };
  }
}

export async function addInvoiceItem(
  invoiceId: string,
  item: { description: string; amount: number }
) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { reservation: true },
    });

    if (!invoice) return { success: false as const, error: "Fatura bulunamadı." };

    if (
      user.role !== "ADMIN" &&
      invoice.reservation.hotelId !== user.hotelId
    ) {
      return { success: false as const, error: "Bu faturaya erişim yetkiniz yok." };
    }

    const currentItems: InvoiceItem[] = JSON.parse(invoice.items as string);
    const newItems = [...currentItems, { description: item.description, amount: item.amount }];

    const newSubtotal = newItems.reduce((sum, i) => sum + i.amount, 0);
    const newTax = newSubtotal * 0.08;
    const newTotal = newSubtotal + newTax;

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        items: JSON.stringify(newItems),
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
      },
    });

    revalidatePath("/billing");
    revalidatePath(`/billing/${invoiceId}`);
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Kalem eklenirken bir hata oluştu." };
  }
}

export async function removeInvoiceItem(invoiceId: string, itemIndex: number) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { reservation: true },
    });

    if (!invoice) return { success: false as const, error: "Fatura bulunamadı." };

    if (
      user.role !== "ADMIN" &&
      invoice.reservation.hotelId !== user.hotelId
    ) {
      return { success: false as const, error: "Bu faturaya erişim yetkiniz yok." };
    }

    const currentItems: InvoiceItem[] = JSON.parse(invoice.items as string);
    if (itemIndex < 0 || itemIndex >= currentItems.length) {
      return { success: false as const, error: "Geçersiz kalem indeksi." };
    }

    const newItems = currentItems.filter((_, idx) => idx !== itemIndex);
    const newSubtotal = newItems.reduce((sum, i) => sum + i.amount, 0);
    const newTax = newSubtotal * 0.08;
    const newTotal = newSubtotal + newTax;

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        items: JSON.stringify(newItems),
        subtotal: newSubtotal,
        tax: newTax,
        total: newTotal,
      },
    });

    revalidatePath("/billing");
    revalidatePath(`/billing/${invoiceId}`);
    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Kalem silinirken bir hata oluştu." };
  }
}

export async function getInvoiceStats(hotelId?: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Yetkisiz erişim." };

  try {
    const reservationWhere: Record<string, unknown> = {};
    if (user.role !== "ADMIN") {
      reservationWhere.hotelId = user.hotelId ?? undefined;
    } else if (hotelId) {
      reservationWhere.hotelId = hotelId;
    }

    const where: Record<string, unknown> =
      Object.keys(reservationWhere).length > 0
        ? { reservation: reservationWhere }
        : {};

    const [paidInvoices, unpaidInvoices] = await Promise.all([
      prisma.invoice.findMany({
        where: { ...where, paidAt: { not: null } },
        select: { total: true },
      }),
      prisma.invoice.findMany({
        where: { ...where, paidAt: null },
        select: { total: true },
      }),
    ]);

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidCount = paidInvoices.length;
    const unpaidCount = unpaidInvoices.length;
    const allTotals = [...paidInvoices, ...unpaidInvoices].map((i) => i.total);
    const averageInvoice =
      allTotals.length > 0
        ? allTotals.reduce((sum, t) => sum + t, 0) / allTotals.length
        : 0;

    return {
      success: true as const,
      data: { totalRevenue, paidCount, unpaidCount, averageInvoice },
    };
  } catch {
    return { success: false as const, error: "İstatistikler yüklenirken bir hata oluştu." };
  }
}
