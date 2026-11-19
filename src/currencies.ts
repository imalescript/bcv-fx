export const CURRENCIES = {
  USD: 'dolar',
  EUR: 'euro',
  CNY: 'yuan',
  TRY: 'lira',
  RUB: 'rublo',
} as const;

/**
 * Supported currency codes by the BCV.
 */
export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * The rate of every supported currency.
 */
export type Rates = Record<CurrencyCode, string>;

export const SUPPORTED_CURRENCIES: CurrencyCode[] = Object.keys(CURRENCIES) as CurrencyCode[];

export function isSupportedCurrency(currency: string): currency is CurrencyCode {
  if (typeof currency !== 'string') {
    return false;
  }
  
  return Object.hasOwn(CURRENCIES, currency);
}

export function mapCurrencies<T>(build: (code: CurrencyCode) => T): Record<CurrencyCode, T> {
  const result = {} as Record<CurrencyCode, T>;

  for (const code of SUPPORTED_CURRENCIES) {
    result[code] = build(code);
  }

  return result;
}
