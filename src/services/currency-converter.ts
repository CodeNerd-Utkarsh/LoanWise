/**
 * Represents an amount of money in a specific currency.
 */
export interface Money {
  /**
   * The currency code (e.g., USD, EUR).
   */
  currency: string;
  /**
   * The amount of money.
   */
  amount: number;
}

/**
 * Asynchronously converts an amount of money from one currency to another.
 *
 * @param from The amount of money to convert.
 * @param toCurrency The currency to convert to (e.g., USD, EUR).
 * @returns A promise that resolves to the converted amount of money.
 */
export async function convertCurrency(from: Money, toCurrency: string): Promise<Money> {
  // TODO: Implement this by calling an API.
  return {
    currency: toCurrency,
    amount: from.amount * 1.1 // placeholder value
  };
}
