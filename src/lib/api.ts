// CHORROM backend (Java, /api) uchun HTTP mijoz.
// Bir domenda ishlaydi (nginx /api ni backend'ga uzatadi); lokal dev'da Vite proxy.

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const TOKEN_KEY = 'chorrom-token';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage yopiq */
  }
}

export async function apiFetch<T>(path: string, init: RequestInit & { json?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = init.auth === false ? null : getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  const res = await fetch(BASE + path, { ...init, headers, body });
  if (res.status === 401 && token) setToken(null); // muddati o'tgan token
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new ApiError(String(msg), res.status);
  }
  return data as T;
}

export const apiGet = <T>(path: string, auth = false) => apiFetch<T>(path, { auth });
export const apiPost = <T>(path: string, json?: unknown) => apiFetch<T>(path, { method: 'POST', json });

/** Rasm yuklash: backend asl fayl + 400/640/960 WebP nusxalarni saqlaydi va URL qaytaradi. */
export async function uploadImage(file: File, folder = 'site'): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const res = await apiFetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: form });
  return res.url;
}
