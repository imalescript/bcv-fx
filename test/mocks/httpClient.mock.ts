import { EventEmitter } from 'node:events';
import type { HttpClient } from '../../src/fetch.ts';

export class MockResponse extends EventEmitter {
  statusCode?: number;
  resume(): void {
  }
}

export function respondingClient(statusCode: number | undefined, body?: string): HttpClient {
  return {
    get(_url, _options, callback) {
      const response = new MockResponse();
      response.statusCode = statusCode;

      process.nextTick(() => {
        if (body !== undefined) {
          response.emit('data', Buffer.from(body, 'utf8'));
        }
        response.emit('end');
      });

      callback(response);
      return { on: () => {} };
    },
  };
}

export function failingClient(error: Error): HttpClient {
  return {
    get(_url, _options, _callback) {
      const request = new EventEmitter();

      process.nextTick(() => {
        request.emit('error', error);
      });

      return request;
    },
  };
}