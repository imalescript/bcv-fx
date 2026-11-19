import { ParseError } from './errors.ts';
import { mapCurrencies, type Rates } from './currencies.ts';

const BCV_NUMBER_FORMAT = /^\d+(?:\.\d{3})*(?:,\d+)?$/;

export function parseRates(rawRates: Rates): Rates {
  return mapCurrencies((code) => parseRate(rawRates[code]));
}

export function parseRate(toParse: string): string {
  const clean = toParse.trim();
  if (!BCV_NUMBER_FORMAT.test(clean)) {
    throw new ParseError(`Failed to parse rate format: "${clean}".`);
  }

  const rate = clean.replaceAll('.', '').replace(',', '.');
  if (Number(rate) <= 0) {
    throw new ParseError(`Rate must be greater than 0: "${clean}".`);
  }

  return rate;
}

export function parseDate(toParse: string): string {
  const valueDate = toParse.trim().slice(0, 10);
  const check = new Date(`${valueDate}T00:00:00Z`);
  const exists =
    /^\d{4}-\d{2}-\d{2}$/.test(valueDate)
    && !Number.isNaN(check.getTime())
    && check.toISOString().startsWith(valueDate);

  if (!exists) {
    throw new ParseError(`Failed to parse value date: "${toParse.trim()}".`);
  }

  return valueDate;
}
