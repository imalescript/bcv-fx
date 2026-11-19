import { fetchHtml, type Options } from './fetch.ts';
import { extractDate, extractRate, extractRates } from './extract.ts';
import { parseDate, parseRate, parseRates } from './parse.ts';
import { SUPPORTED_CURRENCIES, isSupportedCurrency, type CurrencyCode, type Rates } from './currencies.ts';
import { CurrencyNotFoundError } from './errors.ts';

export { BcvRatesError, NetworkError, ParseError, CurrencyNotFoundError } from './errors.ts';
export type { CurrencyCode, Rates } from './currencies.ts';
export type { Options } from './fetch.ts';

/**
 * Metadata associated with the fetched exchange rates.
 */
export interface Meta {
  /** Value date of the rates, formatted as YYYY-MM-DD. */
  valueDate: string;
}

/**
 * Every reference exchange rate published by the BCV.
 */
export interface RatesResult {
  meta: Meta;
  rates: Rates;
}

/**
 * The exchange rate of a single currency.
 */
export interface RateResult {
  meta: Meta;
  rate: string;
}

/**
 * Fetches every reference exchange rate published by the BCV.
 *
 * @param options - Optional configuration parameters for the request.
 * @returns A promise resolving to the metadata and a record of all currency rates.
 */
export async function getRates(options: Options = {}): Promise<RatesResult> {
  const html = await fetchHtml(options);

  return {
    rates: parseRates(extractRates(html)),
    meta: { valueDate: parseDate(extractDate(html)) },
  };
}

/**
 * Fetches the exchange rate of a single specified currency.
 *
 * @param code - The target currency code to fetch.
 * @param options - Optional configuration parameters for the request.
 * @returns A promise resolving to the metadata and the specific currency rate.
 */
export async function getRate(code: CurrencyCode, options: Options = {}): Promise<RateResult> {
  if (!isSupportedCurrency(code)) {
    throw new CurrencyNotFoundError(code, SUPPORTED_CURRENCIES);
  }

  const html = await fetchHtml(options);

  return {
    rate: parseRate(extractRate(html, code)),
    meta: { valueDate: parseDate(extractDate(html)) },
  };
}
