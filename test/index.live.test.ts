import test from 'node:test';
import assert from 'node:assert';
import { getRates, getRate, type Meta } from '../src/index.ts';
import { SUPPORTED_CURRENCIES } from '../src/currencies.ts';

function assertValidMeta(meta: Meta): void {
  assert.strictEqual(typeof meta, 'object');
  assert.match(meta.valueDate, /^\d{4}-\d{2}-\d{2}$/);
}

function assertValidRate(rate: string, currencyName: string): void {
  assert.strictEqual(typeof rate, 'string');
  assert.match(rate, /^\d+\.\d+$/);
  assert.ok(Number(rate) > 0, `Expected ${currencyName} rate to be greater than 0`);
}

test('LIVE: getRates fetches and parses current official rates from BCV', async () => {
  const result = await getRates({ rejectUnauthorized: false, timeoutMs: 15_000 });

  assertValidMeta(result.meta);
  assert.strictEqual(typeof result.rates, 'object');

  for (const currency of SUPPORTED_CURRENCIES) {
    assertValidRate(result.rates[currency], currency);
  }
});

test('LIVE: getRate fetches and parses a single currency (USD) from BCV', async () => {
  const result = await getRate('USD', { rejectUnauthorized: false, timeoutMs: 15_000 });

  assertValidMeta(result.meta);
  assertValidRate(result.rate, 'USD');
});
