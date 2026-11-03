/** Where the Englio API lives: VITE_API_URL at build time, else the same site's /api (proxied in dev). */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '/api';

