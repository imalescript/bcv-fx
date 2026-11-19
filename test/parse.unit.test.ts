import test from 'node:test';
import assert from 'node:assert';
import { parseRate, parseRates, parseDate } from '../src/parse.ts';
import { ParseError } from '../src/errors.ts';

test('parseRate correctly formats BCV numbers', () => {
  assert.strictEqual(parseRate('1.009,34130871'), '1009.34130871');
  assert.strictEqual(parseRate('911,62430000'), '911.62430000');
  assert.strictEqual(parseRate('18,14116338'), '18.14116338');
});

test('parseRates processes a complete dictionary of raw rates', () => {
  const raw = {
    USD: '911,62430000',
    EUR: '1.009,34130871',
    CNY: '136,72245301',
    TRY: '18,14116338',
    RUB: '10,99142387',
  };
  const parsed = parseRates(raw);

  assert.deepStrictEqual(parsed, {
    USD: '911.62430000',
    EUR: '1009.34130871',
    CNY: '136.72245301',
    TRY: '18.14116338',
    RUB: '10.99142387',
  });
});

test('parseRate throws ParseError on invalid or <= 0 formats', () => {
  assert.throws(() => parseRate('invalid-text'), ParseError);
  assert.throws(() => parseRate('0,00'), ParseError);
  assert.throws(() => parseRate('-5,25'), ParseError);
});

test('parseDate correctly slices and validates the YYYY-MM-DD date', () => {
  assert.strictEqual(parseDate('2026-11-13T00:00:00-04:00'), '2026-11-13');
});

test('parseDate throws ParseError on malformed dates', () => {
  assert.throws(() => parseDate('2026-02-30'), ParseError);
  assert.throws(() => parseDate('not-a-date'), ParseError);
});
