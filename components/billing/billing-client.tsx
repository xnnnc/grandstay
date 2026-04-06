"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  MagnifyingGlass,
  Eye,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InvoiceItem } from "@/types";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

interface Room {
  id: string;
  number: string;
  type: string;
}

interface Hotel {
  id: string;
  name: string;
}

interface Reservation {
  id: string;
  checkIn: Date | string;
  checkOut: Date | string;
  guest: Guest;
  room: Room;
  hotel: Hotel;
}

interface Invoice {
  id: string;
  items: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string | null;
  paidAt: Date | string | null;
  createdAt: Date | string;
  reservation: Reservation;
}

interface Stats {
  totalRevenue: number;
  paidCount: number;
  unpaidCount: number;
  averageInvoice: number;
}

interface BillingClientProps {
  invoices: Invoice[];
  stats: Stats;
  userRole: string;
  hotels?: Hotel[];
}

const EMPTY_HOTELS: Hotel[] = [];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Nakit",
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale",
};

function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "paid", label: "Ödendi" },
  { value: "unpaid", label: "Bekliyor" },
];

export function BillingClient({ invoices, stats, userRole, hotels = EMPTY_HOTELS }: BillingClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hotelFilter, setHotelFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = invoices.filter((inv) => {
    if (statusFilter === "paid" && !inv.paidAt) return false;
    if (statusFilter === "unpaid" && inv.paidAt) return false;
    if (hotelFilter && inv.reservation.hotel.id !== hotelFilter) return false;

    if (dateFrom) {
      if (new Date(inv.createdAt) < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      if (new Date(inv.createdAt) > new Date(dateTo)) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const fullName = `${inv.reservation.guest.firstName} ${inv.reservation.guest.lastName}`.toLowerCase();
      if (!fullName.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Receipt size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faturalar</h1>
          <p className="text-sm text-muted-foreground">{invoices.length} fatura kayıtlı</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Toplam Gelir</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {formatTRY(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Ödenen Faturalar</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.paidCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Bekleyen Faturalar</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats.unpaidCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Ortalama Fatura</p>
            <p className="mt-1 text-2xl font-bold">{formatTRY(stats.averageInvoice)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Misafir adı ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-52"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Date from */}
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          title="Başlangıç tarihi"
        />

        {/* Date to */}
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          title="Bitiş tarihi"
        />

        {/* Hotel (admin only) */}
        {userRole === "ADMIN" && hotels.length > 0 && (
          <select
            value={hotelFilter}
            onChange={(e) => setHotelFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Tüm Oteller</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <Card className="rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {filtered.length > 0
              ? `${filtered.length} fatura listeleniyor`
              : "Fatura bulunamadı"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CurrencyCircleDollar size={48} className="mb-4 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search || statusFilter || hotelFilter || dateFrom || dateTo
                  ? "Filtre kriterlerine uygun fatura bulunamadı."
                  : "Henüz fatura kaydı bulunmamaktadır."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fatura No</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Misafir</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Oda</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Otel</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Tutar</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Para Birimi</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ödeme Durumu</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Yöntem</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Tarih</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, idx) => {
                    const isPaid = !!inv.paidAt;
                    return (
                      <tr
                        key={inv.id}
                        className={`border-b transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                      >
                        {/* Fatura No */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            #{inv.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        {/* Misafir */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                              {inv.reservation.guest.firstName[0]}
                              {inv.reservation.guest.lastName[0]}
                            </div>
                            <span className="font-medium">
                              {inv.reservation.guest.firstName}{" "}
                              {inv.reservation.guest.lastName}
                            </span>
                          </div>
                        </td>

                        {/* Oda */}
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {inv.reservation.room.number}
                        </td>

                        {/* Otel */}
                        <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                          {inv.reservation.hotel.name}
                        </td>

                        {/* Tutar */}
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatTRY(inv.total)}
                        </td>

                        {/* Para Birimi */}
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {inv.currency}
                        </td>

                        {/* Ödeme Durumu */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              isPaid
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-amber-500"}`}
                            />
                            {isPaid ? "Ödendi" : "Bekliyor"}
                          </span>
                        </td>

                        {/* Yöntem */}
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {inv.paymentMethod
                            ? PAYMENT_METHOD_LABELS[inv.paymentMethod] ?? inv.paymentMethod
                            : "—"}
                        </td>

                        {/* Tarih */}
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {formatDate(inv.createdAt)}
                        </td>

                        {/* İşlemler */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => router.push(`/billing/${inv.id}`)}
                              title="Detay Görüntüle"
                            >
                              <Eye size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
