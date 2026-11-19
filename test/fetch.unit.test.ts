import test from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import { fetchHtml, type HttpClient } from '../src/fetch.ts';
import { NetworkError } from '../src/errors.ts';
import { respondingClient, failingClient } from './mocks/httpClient.mock.ts';

test('fetchHtml resolves with HTML content on successful response (200)', async () => {
  const html = await fetchHtml({ httpClient: respondingClient(200, '<html>BCV OK</html>') });
  assert.strictEqual(html, '<html>BCV OK</html>');
});

test('fetchHtml handles certificate or SSL errors by throwing a descriptive NetworkError', async () => {
  const certError = new Error('Self signed certificate in certificate chain');
  (certError as NodeJS.ErrnoException).code = 'CERT_SIGNATURE_FAILURE';

  await assert.rejects(
    () => fetchHtml({ httpClient: failingClient(certError) }),
    (error: unknown) => {
      assert.ok(error instanceof NetworkError);
      assert.match(error.message, /Certificate verification failed/);
      return true;
    },
  );
});

test('fetchHtml maps a generic connection failure to a NetworkError', async () => {
  await assert.rejects(
    () => fetchHtml({ httpClient: failingClient(new Error('ECONNREFUSED')) }),
    (error: unknown) => {
      assert.ok(error instanceof NetworkError);
      assert.match(error.message, /Failed to connect to BCV: ECONNREFUSED/);
      return true;
    },
  );
});

test('fetchHtml throws NetworkError on timeout when the deadline expires', async () => {
  const client: HttpClient = {
    get(_url, options, _callback) {
      const request = new EventEmitter();

      options.signal.addEventListener('abort', () => {
        const timeoutError = new Error('The operation was aborted');
        timeoutError.name = 'AbortError';
        request.emit('error', timeoutError);
      });

      return request;
    },
  };

  await assert.rejects(
    () => fetchHtml({ timeoutMs: 5, httpClient: client }),
    (error: unknown) => {
      assert.ok(error instanceof NetworkError);
      assert.strictEqual(error.message, 'Request to BCV timed out after 5 ms.');
      return true;
    },
  );
});

test('fetchHtml treats a missing status code as a non-2xx response', async () => {
  await assert.rejects(
    () => fetchHtml({ httpClient: respondingClient(undefined) }),
    (error: unknown) => {
      assert.ok(error instanceof NetworkError);
      assert.strictEqual(error.message, 'BCV responded with HTTP status 0.');
      return true;
    },
  );
});
