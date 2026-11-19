import { ParseError } from './errors.ts';
import { CURRENCIES, mapCurrencies, type CurrencyCode, type Rates } from './currencies.ts';

export function extractRates(html: string): Rates {
  return mapCurrencies((code) => extractRate(html, code));
}

export function extractRate(html: string, code: CurrencyCode): string {
  const id = CURRENCIES[code];

  const start = html.indexOf(` id="${id}"`);
  if (start === -1) {
    throw new ParseError(`Failed to find the currency block for id="${id}" in BCV HTML.`);
  }

  const end = html.indexOf(' id="', start + 1);
  const block = html.slice(start, end === -1 ? undefined : end);

  const rate = /<strong[^>]*>([^<]*)<\/strong>/.exec(block)?.[1]?.trim();
  if (!rate) {
    throw new ParseError(`Failed to extract raw rate value for currency "${code}" within block id="${id}".`);
  }

  return rate;
}

export function extractDate(html: string): string {
  const spanAttributes = /Fecha Valor[^<]*<span([^>]*)>/.exec(html)?.[1];

  const date = /content="([^"]*)"/.exec(spanAttributes ?? '')?.[1];
  if (!date) {
    throw new ParseError(
      'Failed to extract the value date from BCV HTML. Structure might have changed.'
    );
  }

  return date;
}
