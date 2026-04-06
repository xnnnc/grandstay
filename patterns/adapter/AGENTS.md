# Adapter Pattern - Currency Conversion

**Parent:** [../AGENTS.md](../AGENTS.md)

## Purpose

Adapter pattern for currency conversion — adapts external exchange rate services to a unified interface. This implementation allows the application to work with different currency exchange services through a consistent, type-safe API.

## Pattern Overview

The Adapter pattern converts the interface of external exchange rate services (like `MockExchangeService`) into the `CurrencyConverter` interface that the application expects. This allows:

- Seamless substitution of exchange rate sources (mock, real API, etc.)
- Type-safe currency conversion with formatted output
- Centralized currency and formatting logic
- Easy testing with mock exchange services

## Files

### `index.ts`
Barrel export file. Exports `CurrencyAdapter`, `getCurrencyAdapter()` factory function, and type definitions (`CurrencyConverter`, `ConversionResult`, `CurrencyInfo`).

### `currency-adapter.ts`
Core adapter implementation.

**Key Components:**
- `ConversionResult` interface: Contains original amount, converted amount, exchange rate, and formatted strings for display
- `CurrencyInfo` interface: Currency metadata (code, label, symbol)
- `CurrencyConverter` interface: The contract that adapters must implement with methods:
  - `convert()`: Converts an amount from one currency to another
  - `getExchangeRate()`: Returns the exchange rate between two currencies
  - `getSupportedCurrencies()`: Lists all supported currencies (TRY, USD, EUR)
  - `formatPrice()`: Formats a price with currency symbol and locale-specific formatting (Turkish locale)

- `CurrencyAdapter` class: Implements `CurrencyConverter` by delegating to `MockExchangeService`. Handles currency conversion calculations and price formatting.
- `getCurrencyAdapter()` factory: Returns a new `CurrencyAdapter` instance

**Supported Currencies:**
- TRY (Türk Lirası) - Turkish Lira, symbol ₺
- USD (Amerikan Doları) - US Dollar, symbol $
- EUR (Euro) - Euro, symbol €

### `mock-exchange-service.ts`
External service being adapted. Simulates an exchange rate API with hardcoded TRY-based rates.

**Methods:**
- `getRate(fromCurrency, toCurrency)`: Returns rate data with from/to codes, rate value, and timestamp

**Fixed Exchange Rates:**
- 1 USD = 32 TRY
- 1 EUR = 35 TRY
- Cross rates calculated from these base rates

## AI Agent Instructions

When working with the Adapter pattern in this codebase:

1. **Understand the separation**: The `MockExchangeService` is the external service with its own interface. The `CurrencyAdapter` bridges between that service and the application's `CurrencyConverter` interface.

2. **Adding new exchange services**: To integrate a real exchange rate API, create a new adapter class implementing `CurrencyConverter` instead of modifying existing code.

3. **Type safety**: All conversion operations return structured `ConversionResult` objects with both numeric and formatted values. Use these objects rather than raw calculations.

4. **Currency support**: Currently hardcoded to TRY, USD, EUR. To add currencies, update both the `getSupportedCurrencies()` method and the `MockExchangeService` rates table.

5. **Price formatting**: The adapter handles Turkish locale formatting (comma for thousands, dot for decimals). This is locale-specific and should be parameterized if supporting multiple regions.

6. **Testing**: The `MockExchangeService` provides deterministic rates for testing. Replace it with a real service implementation when needed without changing the `CurrencyAdapter` code.

## Adapter Pattern Benefits Here

- **Decoupling**: Application code depends only on `CurrencyConverter`, not the specific service
- **Testability**: Easy to test with mock exchange rates
- **Extensibility**: New exchange rate sources can be added without modifying existing code
- **Consistency**: All currency operations go through a unified, type-safe interface
