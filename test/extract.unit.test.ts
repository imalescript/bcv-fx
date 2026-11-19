import test from 'node:test';
import assert from 'node:assert';
import { extractRate, extractRates, extractDate } from '../src/extract.ts';
import { ParseError } from '../src/errors.ts';
import { mockBcvHtml } from './fixtures/bcv.fixture.ts';

test('extractRate correctly extracts the value of a specific currency', () => {
  assert.strictEqual(extractRate(mockBcvHtml, 'USD'), '911,62430000');
  assert.strictEqual(extractRate(mockBcvHtml, 'EUR'), '1.009,34130871');
});

test('extractRates extracts all supported currencies', () => {
  const rates = extractRates(mockBcvHtml);
  assert.deepStrictEqual(rates, {
    USD: '911,62430000',
    EUR: '1.009,34130871',
    CNY: '136,72245301',
    TRY: '18,14116338',
    RUB: '10,99142387',
  });
});

test('extractDate extracts the date from the content attribute', () => {
  assert.strictEqual(extractDate(mockBcvHtml), '2026-11-13T00:00:00-04:00');
});

test('extractRate throws ParseError if the currency does not exist in the HTML', () => {
  assert.throws(() => extractRate('<div>Sin bloques</div>', 'USD'), ParseError);
});

test('extractRate throws ParseError if the currency block has no strong tag', () => {
  assert.throws(() => extractRate('<div id="dolar">sin strong</div>', 'USD'), ParseError);
});

test('extractDate throws ParseError if the date structure changes', () => {
  assert.throws(() => extractDate('<div>Sin fecha</div>'), ParseError);
});
