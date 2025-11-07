// Currency constants

export const DEFAULT_CURRENCY = 'EUR';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  BGN: 'лв',
  USD: '$'
};

export const CURRENCY_NAMES: Record<string, string> = {
  EUR: 'Euro',
  BGN: 'Bulgarian Lev',
  USD: 'US Dollar'
};

export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${amount.toFixed(2)} ${symbol}`;
}
