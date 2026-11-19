/**
 * Base error class for all bcv-rates related errors.
 */
export class BcvRatesError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options as ErrorOptions);
    this.name = new.target.name;
  }
}

/**
 * Thrown when a network failure or timeout occurs while fetching the BCV page.
 */
export class NetworkError extends BcvRatesError {}

/**
 * Thrown when the HTML structure cannot be parsed or expected elements are missing.
 */
export class ParseError extends BcvRatesError {}

/**
 * Thrown when an unsupported or invalid currency code is requested.
 */
export class CurrencyNotFoundError extends BcvRatesError {
  /** The invalid currency code that triggered the error. */
  readonly currency: string;

  constructor(currency: string, supported: readonly string[]) {
    super(`Unsupported currency: "${currency}". Available: ${supported.join(', ')}.`);
    this.currency = currency;
  }
}
