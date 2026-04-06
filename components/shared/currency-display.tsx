"use client";

import { CurrencyCircleDollar } from "@phosphor-icons/react";
import { getCurrencyAdapter } from "@/patterns/adapter/currency-adapter";

interface CurrencyDisplayProps {
  amount: number;
  baseCurrency?: string;
  showConversions?: boolean;
  selectedCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

const CURRENCIES = ["TRY", "USD", "EUR"] as const;
const SYMBOLS: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };

export function CurrencyDisplay({
  amount,
  baseCurrency = "TRY",
  showConversions = false,
  selectedCurrency,
  onCurrencyChange,
}: CurrencyDisplayProps) {
  const adapter = getCurrencyAdapter();

  const displayCurrency = selectedCurrency ?? baseCurrency;
  const displayAmount =
    displayCurrency === baseCurrency
      ? amount
      : adapter.convert(amount, baseCurrency, displayCurrency).convertedAmount;

  const formattedPrimary = adapter.formatPrice(displayAmount, displayCurrency);

  const conversions =
    showConversions
      ? CURRENCIES.filter((c) => c !== displayCurrency).map((c) => ({
          currency: c,
          formatted: adapter.formatPrice(
            adapter.convert(amount, baseCurrency, c).convertedAmount,
            c
          ),
        }))
      : [];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <CurrencyCircleDollar size={18} className="text-muted-foreground" />
        <span className="text-lg font-bold">{formattedPrimary}</span>
      </div>

      {showConversions && conversions.length > 0 && (
        <div className="flex gap-2 text-sm text-muted-foreground">
          {conversions.map((c, i) => (
            <span key={c.currency}>
              {i > 0 && <span className="mr-2">|</span>}
              ≈ {c.formatted}
            </span>
          ))}
        </div>
      )}

      {onCurrencyChange && (
        <div className="flex gap-1 mt-1">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => onCurrencyChange(c)}
              className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
                displayCurrency === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {SYMBOLS[c]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
