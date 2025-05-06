
/**
 * @fileOverview Utility functions for currency conversion and formatting.
 */

interface ExchangeRates {
  [key: string]: number;
}

/**
 * Converts an amount from a base currency to a target currency using provided exchange rates.
 *
 * @param amount The amount in the base currency.
 * @param targetCurrency The currency code to convert to (e.g., "EUR").
 * @param rates The exchange rates object, relative to the base currency.
 * @param baseCurrency The base currency code (default: "USD").
 * @returns The converted amount in the target currency, or NaN if conversion is not possible.
 */
export function convertCurrencyValue(
  amount: number | undefined | null,
  targetCurrency: string,
  rates: ExchangeRates | null,
  baseCurrency: string = 'USD'
): number {
  if (amount === undefined || amount === null || isNaN(amount) || !rates) {
    return NaN;
  }

  if (targetCurrency === baseCurrency) {
    return amount;
  }

  const rate = rates[targetCurrency];
  if (rate === undefined || rate === null || isNaN(rate)) {
    console.warn(`Exchange rate not found for ${targetCurrency}`);
    return NaN; // Rate not available
  }

  return amount * rate;
}


/**
 * Formats a number as a currency string according to the specified currency code.
 * Does NOT perform conversion.
 *
 * @param amount The numerical amount to format.
 * @param currencyCode The ISO 4217 currency code (e.g., "USD", "EUR").
 * @returns The formatted currency string, or "N/A" if the amount is invalid.
 */
export function formatCurrency(amount: number | undefined | null, currencyCode: string = 'USD'): string {
   if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) {
    return "N/A";
  }
  try {
     return amount.toLocaleString('en-US', { // Using 'en-US' locale for consistency, adjust if needed
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
      console.error(`Error formatting currency ${currencyCode}:`, error);
      // Fallback for unsupported currency codes, display with code
      return `${amount.toFixed(2)} ${currencyCode}`;
  }
}


/**
 * Converts an amount from a base currency to a target currency and formats it.
 *
 * @param amount The amount in the base currency (e.g., USD).
 * @param targetCurrency The currency code to convert to and format (e.g., "EUR").
 * @param rates The exchange rates object, relative to the base currency.
 * @param baseCurrency The base currency code (default: "USD").
 * @returns The formatted currency string in the target currency, or "N/A".
 */
export function convertAndFormatCurrency(
  amount: number | undefined | null,
  targetCurrency: string,
  rates: ExchangeRates | null,
  baseCurrency: string = 'USD'
): string {
   if (amount === undefined || amount === null || isNaN(amount) || !rates) {
        return formatCurrency(NaN, targetCurrency); // Return N/A formatted for the target currency
    }

  const convertedAmount = convertCurrencyValue(amount, targetCurrency, rates, baseCurrency);
  return formatCurrency(convertedAmount, targetCurrency);
}

// List of commonly used currencies for dropdown
export const supportedCurrencies = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'ZAR', name: 'South African Rand' },
];
