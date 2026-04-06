"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Printer,
  Plus,
  Trash,
  CalendarCheck,
  CreditCard,
  Money,
  Bank,
  User,
  Buildings,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { AddItemDialog } from "@/components/billing/add-item-dialog";
import { PaymentForm } from "@/components/billing/payment-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { removeInvoiceItem } from "@/actions/billing";
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
  floor: number;
}

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
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
  exchangeRate: number;
  paymentMethod: string | null;
  paidAt: Date | string | null;
  createdAt: Date | string;
  reservation: Reservation;
}

interface InvoiceDetailProps {
  invoice: Invoice;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Nakit",
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale",
};

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "Tekli",
  DOUBLE: "Çiftli",
  SUITE: "Süit",
  DELUXE: "Delüks",
  FAMILY: "Aile",
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcNights(checkIn: Date | string, checkOut: Date | string): number {
  return Math.max(
    1,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [removingIdx, setRemovingIdx] = useState<number | null>(null);

  const { reservation } = invoice;
  const items: InvoiceItem[] = JSON.parse(invoice.items as string);
  const nights = calcNights(reservation.checkIn, reservation.checkOut);
  const isPaid = !!invoice.paidAt;
  const shortId = invoice.id.slice(0, 8).toUpperCase();

  const [removeTarget, setRemoveTarget] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleConfirmRemove() {
    if (removeTarget === null) return;
    setIsRemoving(true);
    try {
      const result = await removeInvoiceItem(invoice.id, removeTarget);
      if (result.success) {
        setRemoveTarget(null);
        router.refresh();
      }
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Receipt size={22} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Fatura #{shortId}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(invoice.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Yazdır
            </Button>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              isPaid
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isPaid ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {isPaid ? "Ödendi" : "Ödeme Bekliyor"}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Guest info */}
          <Card className="rounded-xl print-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <User size={15} />
                Misafir Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold text-base">
                {reservation.guest.firstName} {reservation.guest.lastName}
              </p>
              {reservation.guest.phone && (
                <p className="text-sm text-muted-foreground">{reservation.guest.phone}</p>
              )}
              {reservation.guest.email && (
                <p className="text-sm text-muted-foreground">{reservation.guest.email}</p>
              )}
            </CardContent>
          </Card>

          {/* Stay info */}
          <Card className="rounded-xl print-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Buildings size={15} />
                Konaklama Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold text-base">{reservation.hotel.name}</p>
              <p className="text-sm text-muted-foreground">
                Oda {reservation.room.number} —{" "}
                {ROOM_TYPE_LABELS[reservation.room.type] ?? reservation.room.type}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(reservation.checkIn)} → {formatDate(reservation.checkOut)}
              </p>
              <p className="text-sm text-muted-foreground">{nights} gece</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice items */}
        <Card className="rounded-xl print-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CalendarCheck size={15} className="text-primary" />
              Fatura Kalemleri
            </CardTitle>
            {!isPaid && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 no-print"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus size={13} weight="bold" />
                Hizmet Ekle
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground w-10">#</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Açıklama</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Tutar</th>
                    {!isPaid && (
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground no-print w-12"></th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={`${item.description}-${item.amount}`} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatTRY(item.amount)}</td>
                      {!isPaid && (
                        <td className="px-4 py-3 text-right no-print">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => setRemoveTarget(idx)}
                            disabled={isPending && removingIdx === idx}
                            title="Kalemi Kaldır"
                          >
                            <Trash size={13} />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Price summary */}
        <Card className="rounded-xl print-card">
          <CardContent className="pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span>{formatTRY(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">KDV (%8)</span>
              <span>{formatTRY(invoice.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-lg">Toplam</span>
              <span className="font-bold text-xl text-primary">{formatTRY(invoice.total)}</span>
            </div>
            {/* Currency conversions */}
            <div className="pt-2">
              <CurrencyDisplay
                amount={invoice.total}
                baseCurrency="TRY"
                showConversions={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment section */}
        <Card className="rounded-xl print-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard size={15} className="text-primary" />
              Ödeme
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isPaid ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">Ödeme Alındı</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Yöntem</p>
                    <div className="flex items-center gap-1.5 mt-0.5 font-medium">
                      {invoice.paymentMethod === "CASH" && <Money size={14} />}
                      {invoice.paymentMethod === "CREDIT_CARD" && <CreditCard size={14} />}
                      {invoice.paymentMethod === "BANK_TRANSFER" && <Bank size={14} />}
                      {PAYMENT_METHOD_LABELS[invoice.paymentMethod ?? ""] ?? invoice.paymentMethod}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tarih</p>
                    <p className="mt-0.5 font-medium">{formatDateTime(invoice.paidAt!)}</p>
                  </div>
                  {invoice.currency !== "TRY" && (
                    <div>
                      <p className="text-xs text-muted-foreground">Para Birimi</p>
                      <p className="mt-0.5 font-medium">{invoice.currency}</p>
                    </div>
                  )}
                  {invoice.currency !== "TRY" && (
                    <div>
                      <p className="text-xs text-muted-foreground">Döviz Kuru</p>
                      <p className="mt-0.5 font-medium">1 TRY = {invoice.exchangeRate.toFixed(4)} {invoice.currency}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <PaymentForm invoiceId={invoice.id} totalTRY={invoice.total} />
            )}
          </CardContent>
        </Card>
      </div>

      <AddItemDialog
        invoiceId={invoice.id}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      <ConfirmDialog
        open={removeTarget !== null}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title="Bu kalemi faturadan kaldırmak istediğinize emin misiniz?"
        description="Kalem faturadan silinecektir."
        confirmLabel="Kaldır"
        variant="destructive"
        onConfirm={handleConfirmRemove}
        isPending={isRemoving}
      />
    </>
  );
}
