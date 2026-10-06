// ============================================================
// SoloBuildAI — Base API Client
// All requests go through here so token management is centralised.
//
// Base URL is set via VITE_API_BASE_URL in .env:
//   Development  → http://127.0.0.1:8000
//   Production   → replace VITE_API_BASE_URL in your deployment env
//
// The prefix /api/v1 is appended automatically.
// ============================================================

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'}/api/v1`;

// ——— Token storage helpers ———
const TOKEN_KEY = 'sb_access_token';
const REFRESH_KEY = 'sb_refresh_token';

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ——— Refresh in-flight lock (avoid multiple simultaneous refreshes) ———
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) throw new Error('No refresh token');

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      tokenStorage.clear();
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    return data.access_token as string;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// ——— Core request function ———
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Use this for multipart/form-data (file uploads). Pass a FormData object. */
  formData?: FormData;
  /** Set to false to skip attaching the Bearer token (e.g. login/register). */
  auth?: boolean;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, formData, auth = true } = options;

  const buildHeaders = (token: string | null): HeadersInit => {
    const headers: Record<string, string> = {};
    if (auth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData — browser sets it with boundary
    if (!formData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  const doFetch = async (token: string | null): Promise<Response> => {
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers: buildHeaders(token),
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  };

  let token = auth ? tokenStorage.getAccess() : null;
  let response = await doFetch(token);

  // Token expired — attempt one refresh then retry
  if (response.status === 401 && auth) {
    try {
      token = await refreshAccessToken();
      response = await doFetch(token);
    } catch {
      // Refresh failed; caller should handle redirect to login
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    let message = `API error ${response.status}`;
    try {
      const err = await response.json();
      const detail = err?.detail ?? err?.message;
      if (typeof detail === 'string') {
        message = detail;
      } else if (Array.isArray(detail)) {
        message = detail.map(item => {
          if (typeof item === 'string') return item;
          if (!item || typeof item !== 'object') return JSON.stringify(item);
          const errorItem = item as { loc?: unknown[]; msg?: unknown };
          const location = Array.isArray(errorItem.loc) ? errorItem.loc.join('.') : '';
          const description = typeof errorItem.msg === 'string' ? errorItem.msg : JSON.stringify(item);
          return location ? `${location}: ${description}` : description;
        }).join('; ');
      } else if (detail !== undefined) {
        message = JSON.stringify(detail);
      }
    } catch { /* ignore parse errors */ }
    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
