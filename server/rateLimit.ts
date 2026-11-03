import type { IncomingMessage } from 'node:http';

/** At most `max` hits per `windowMs` for each key (an IP address); counts reset when the window ends. */
export class RateLimit {
  private hits = new Map<string, { n: number; until: number }>();
  private readonly max: number;
  private readonly windowMs: number;

  constructor(max: number, windowMs: number) {
    this.max = max;
    this.windowMs = windowMs;
  }

  /** Counts one hit; false once the key is over its limit. */
  take(key: string, now = Date.now()): boolean {
    const hit = this.hits.get(key);
    if (!hit || hit.until <= now) {
      // Forget old entries now and then, so the map can't grow without end.
      if (this.hits.size > 50_000) for (const [k, h] of this.hits) if (h.until <= now) this.hits.delete(k);
      this.hits.set(key, { n: 1, until: now + this.windowMs });
      return true;
    }
    hit.n++;
    return hit.n <= this.max;
  }
}

/**
 * Who is calling. Behind a proxy (Caddy, nginx, Cloudflare) every request comes from the proxy,
 * so set TRUST_PROXY=1 there to use the address it forwards.
 */
export function clientIp(req: IncomingMessage, trustProxy = process.env.TRUST_PROXY === '1'): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (trustProxy && typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

export const MINUTE = 60_000;
