
interface ExchangeRates {
  [key: string]: number;
}

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
    return NaN;
  }

  return amount * rate;
}


export function formatCurrency(amount: number | undefined | null, currencyCode: string = 'USD'): string {
   if (amount === undefined || amount === null || isNaN(amount) || !isFinite(amount)) {
    return "N/A";
  }
  try {
     return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch (error) {
      console.error(`Error formatting currency ${currencyCode}:`, error);
      return `${amount.toFixed(2)} ${currencyCode}`;
  }
}


export function convertAndFormatCurrency(
  amount: number | undefined | null,
  targetCurrency: string,
  rates: ExchangeRates | null,
  baseCurrency: string = 'USD'
): string {
   if (amount === undefined || amount === null || isNaN(amount) || !rates) {
        return formatCurrency(NaN, targetCurrency);
    }

  const convertedAmount = convertCurrencyValue(amount, targetCurrency, rates, baseCurrency);
  return formatCurrency(convertedAmount, targetCurrency);
}


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
