import { MockExchangeService } from "./mock-exchange-service";

export interface ConversionResult {
  originalAmount: number;
  convertedAmount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  formattedOriginal: string;
  formattedConverted: string;
}

export interface CurrencyInfo {
  code: string;
  label: string;
  symbol: string;
}

export interface CurrencyConverter {
  convert(amount: number, from: string, to: string): ConversionResult;
  getExchangeRate(from: string, to: string): number;
  getSupportedCurrencies(): CurrencyInfo[];
  formatPrice(amount: number, currency: string): string;
}

export class CurrencyAdapter implements CurrencyConverter {
  private service: MockExchangeService;

  constructor() {
    this.service = new MockExchangeService();
  }

  convert(amount: number, from: string, to: string): ConversionResult {
    const exchangeRate = this.getExchangeRate(from, to);
    const convertedAmount = amount * exchangeRate;

    return {
      originalAmount: amount,
      convertedAmount,
      fromCurrency: from,
      toCurrency: to,
      exchangeRate,
      formattedOriginal: this.formatPrice(amount, from),
      formattedConverted: this.formatPrice(convertedAmount, to),
    };
  }

  getExchangeRate(from: string, to: string): number {
    const rateData = this.service.getRate(from, to);
    return rateData.rate;
  }

  getSupportedCurrencies(): CurrencyInfo[] {
    return [
      { code: "TRY", label: "Türk Lirası", symbol: "₺" },
      { code: "USD", label: "Amerikan Doları", symbol: "$" },
      { code: "EUR", label: "Euro", symbol: "€" },
    ];
  }

  formatPrice(amount: number, currency: string): string {
    const symbols: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };
    return `${symbols[currency] ?? ""}${amount.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export function getCurrencyAdapter(): CurrencyAdapter {
  return new CurrencyAdapter();
}
