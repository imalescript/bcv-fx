import test from 'node:test';
import assert from 'node:assert';
import { getRates, getRate } from '../src/index.ts';
import type { FetchOptions } from '../src/fetch.ts';
import { CurrencyNotFoundError } from '../src/errors.ts';
import { mockBcvHtml } from './fixtures/bcv.fixture.ts';
import { respondingClient } from './mocks/httpClient.mock.ts';

test('getRates returns the parsed rates and metadata', async () => {
  const options: FetchOptions = { httpClient: respondingClient(200, mockBcvHtml) };
  const result = await getRates(options);

  assert.strictEqual(result.meta.valueDate, '2026-11-13');
  assert.deepStrictEqual(result.rates, {
    USD: '911.62430000',
    EUR: '1009.34130871',
    CNY: '136.72245301',
    TRY: '18.14116338',
    RUB: '10.99142387',
  });
});

test('getRate returns the parsed rate and metadata of a single currency', async () => {
  const options: FetchOptions = { httpClient: respondingClient(200, mockBcvHtml) };
  const result = await getRate('USD', options);

  assert.strictEqual(result.meta.valueDate, '2026-11-13');
  assert.strictEqual(result.rate, '911.62430000');
});

test('getRate throws CurrencyNotFoundError for an unsupported currency', async () => {
  await assert.rejects(
    getRate('BTC' as never),
    (error: unknown) => {
      assert.ok(error instanceof CurrencyNotFoundError);
      assert.strictEqual(error.currency, 'BTC');
      assert.match(error.message, /Unsupported currency: "BTC"\. Available: USD, EUR, CNY, TRY, RUB\./);
      return true;
    },
  );
});

