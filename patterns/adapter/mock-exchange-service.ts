// Dış döviz kuru API'sini simüle eden sahte servis
export class MockExchangeService {
  // TRY bazlı sabit kurlar
  private readonly rates: Record<string, Record<string, number>> = {
    TRY: {
      TRY: 1,
      USD: 1 / 32,
      EUR: 1 / 35,
    },
    USD: {
      TRY: 32,
      USD: 1,
      EUR: 32 / 35,
    },
    EUR: {
      TRY: 35,
      USD: 35 / 32,
      EUR: 1,
    },
  };

  getRate(
    fromCurrency: string,
    toCurrency: string
  ): {
    from: string;
    to: string;
    rate: number;
    timestamp: number;
  } {
    const fromRates = this.rates[fromCurrency];
    if (!fromRates) {
      throw new Error(`Desteklenmeyen para birimi: ${fromCurrency}`);
    }

    const rate = fromRates[toCurrency];
    if (rate === undefined) {
      throw new Error(`Desteklenmeyen para birimi: ${toCurrency}`);
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      rate,
      timestamp: Date.now(),
    };
  }
}
