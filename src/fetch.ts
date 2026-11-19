import https from 'node:https';
import { NetworkError } from './errors.ts';

const BCV_URL = 'https://www.bcv.org.ve';

/**
 * Configuration options for fetching rates.
 */
export interface Options {
  /** Maximum time to wait, in milliseconds. Default: 10000. */
  timeoutMs?: number;
  /** Set to false to skip TLS certificate verification. Default: true. */
  rejectUnauthorized?: boolean;
}

export interface HttpClient {
  get(
    url: string,
    options: { rejectUnauthorized: boolean; signal: AbortSignal },
    callback: (response: {
      statusCode?: number | undefined;
      resume(): void;
      on(event: 'data', listener: (chunk: Buffer) => void): void;
      on(event: 'end', listener: () => void): void;
      on(event: 'error', listener: (error: Error) => void): void;
    }) => void,
  ): { on(event: 'error', listener: (error: Error) => void): void };
}

export interface FetchOptions extends Options {
  httpClient?: HttpClient;
}

export async function fetchHtml({
  timeoutMs = 10_000,
  rejectUnauthorized = true,
  httpClient = https,
}: FetchOptions = {}): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const signal = AbortSignal.timeout(timeoutMs);

    const fail = (error: Error): void => {
      reject(
        signal.aborted
          ? new NetworkError(`Request to BCV timed out after ${timeoutMs} ms.`, { cause: error })
          : toNetworkError(error),
      );
    };

    const requestOptions = {
      rejectUnauthorized,
      signal,
    };

    httpClient.get(BCV_URL, requestOptions, (response) => {
      const status = response.statusCode ?? 0;

      if (status < 200 || status >= 300) {
        response.resume();
        reject(new NetworkError(`BCV responded with HTTP status ${status}.`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk: Buffer) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      response.on('error', fail);
    })
    .on('error', fail);
  });
}

function toNetworkError(error: NodeJS.ErrnoException): NetworkError {
  const isCertificateError = /CERT|SIGNATURE/.test(error.code ?? '');
  const hint = isCertificateError
    ? 'Certificate verification failed; if you trust the site, use { rejectUnauthorized: false }.'
    : '';
  return new NetworkError(`Failed to connect to BCV: ${error.message}. ${hint}`, { cause: error });
}
