import { API_BASE } from '../lib/api';

const TOKEN_KEY = 'englio-admin-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) ?? '';
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Thrown when the server says the token is wrong; the panel goes back to the login screen. */
export class Unauthorized extends Error {}

/** Calls an admin endpoint with the saved token; throws with the server's message on failure. */
export async function adminApi<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/admin${path}`, {
    method,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken()}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    clearToken();
    throw new Unauthorized('Wrong admin token');
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json as T;
}
