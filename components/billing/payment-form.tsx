"use client";

import { useState, useTransition } from "react";
import { Money, CreditCard, Bank, CurrencyCircleDollar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getCurrencyAdapter } from "@/patterns/adapter";
import { updateInvoicePayment } from "@/actions/billing";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  invoiceId: string;
  totalTRY: number;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "Nakit", icon: Money },
  { value: "CREDIT_CARD", label: "Kredi Kartı", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "Havale", icon: Bank },
];

const CURRENCIES = [
  { code: "TRY", symbol: "₺", label: "TRY" },
  { code: "USD", symbol: "$", label: "USD" },
  { code: "EUR", symbol: "€", label: "EUR" },
];

export function PaymentForm({ invoiceId, totalTRY }: PaymentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [currency, setCurrency] = useState("TRY");
  const [error, setError] = useState<string | null>(null);

  const adapter = getCurrencyAdapter();

  const exchangeRate = currency === "TRY" ? 1 : adapter.getExchangeRate("TRY", currency);
  const convertedAmount = totalTRY * exchangeRate;
  const formattedConverted = adapter.formatPrice(convertedAmount, currency);
  const formattedTRY = adapter.formatPrice(totalTRY, "TRY");

  function handlePay() {
    setError(null);
    startTransition(async () => {
      const result = await updateInvoicePayment(invoiceId, { paymentMethod, currency });
      if (!result.success) {
        setError(result.error ?? "Bir hata oluştu.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Payment method */}
      <div>
        <p className="mb-2 text-sm font-medium">Ödeme Yöntemi</p>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setPaymentMethod(value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors ${
                paymentMethod === value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Icon size={20} weight={paymentMethod === value ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div>
        <p className="mb-2 text-sm font-medium">Para Birimi</p>
        <div className="flex gap-2">
          {CURRENCIES.map(({ code, symbol, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setCurrency(code)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                currency === code
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {symbol} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion info */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CurrencyCircleDollar size={15} />
          <span>Toplam (TRY): <span className="font-semibold text-foreground">{formattedTRY}</span></span>
        </div>
        {currency !== "TRY" && (
          <div className="text-sm text-muted-foreground">
            Ödeme tutarı:{" "}
            <span className="font-bold text-primary text-base">{formattedConverted}</span>
            <span className="ml-2 text-xs">(kur: {exchangeRate.toFixed(4)})</span>
          </div>
        )}
        {currency === "TRY" && (
          <div className="text-2xl font-bold text-primary">{formattedTRY}</div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        className="w-full gap-2"
        onClick={handlePay}
        disabled={isPending}
      >
        <CurrencyCircleDollar size={16} />
        {isPending ? "Kaydediliyor..." : "Ödemeyi Kaydet"}
      </Button>
    </div>
  );
}
