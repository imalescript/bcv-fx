import test from 'node:test';
import assert from 'node:assert';
import { CURRENCIES, SUPPORTED_CURRENCIES, isSupportedCurrency } from '../src/currencies.ts';

test('isSupportedCurrency accepts every supported currency', () => {
  for (const code of SUPPORTED_CURRENCIES) {
    assert.ok(isSupportedCurrency(code), `Expected "${code}" to be supported`);
  }
});

test('isSupportedCurrency rejects unknown currencies', () => {
  assert.strictEqual(isSupportedCurrency('BTC'), false);
  assert.strictEqual(isSupportedCurrency(''), false);
  assert.strictEqual(isSupportedCurrency('toString'), false);
});

test('isSupportedCurrency rejects non-string input from JavaScript consumers', () => {
  assert.strictEqual(isSupportedCurrency(42 as unknown as string), false);
  assert.strictEqual(isSupportedCurrency(undefined as unknown as string), false);
});

test('SUPPORTED_CURRENCIES matches the currencies published by the BCV', () => {
  assert.deepStrictEqual(SUPPORTED_CURRENCIES, ['USD', 'EUR', 'CNY', 'TRY', 'RUB']);
  assert.strictEqual(Object.keys(CURRENCIES).length, SUPPORTED_CURRENCIES.length);
});
