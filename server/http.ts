import type { IncomingMessage, ServerResponse } from 'node:http';

/** Thrown by a handler to answer with an error status. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface Request {
  method: string;
  path: string;
  query: URLSearchParams;
  params: Record<string, string>;
  headers: IncomingMessage['headers'];
  body: unknown;
}

export type Handler = (req: Request) => unknown;

export interface Route {
  method: string;
  pattern: string;
  handler: Handler;
  /** Needs the admin token. */
  admin?: boolean;
}

/** Matches "/api/lessons/:id" against a path; returns the params or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const want = pattern.split('/');
  const got = path.split('/');
  if (want.length !== got.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(':')) params[want[i].slice(1)] = decodeURIComponent(got[i]);
    else if (want[i] !== got[i]) return null;
  }
  return params;
}

const MAX_BODY = 1_000_000;

export async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new HttpError(413, 'Body too large');
    chunks.push(chunk as Buffer);
  }
  if (!size) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'Body is not valid JSON');
  }
}

export function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}): void {
  const text = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization, if-none-match',
    'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
    ...headers,
  });
  res.end(text);
}

/** Pulls a required non-empty string out of a JSON body. */
export function text(body: unknown, key: string): string {
  const value = (body as Record<string, unknown> | null)?.[key];
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `"${key}" is required`);
  return value.trim();
}
