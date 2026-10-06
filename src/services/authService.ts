// ============================================================
// SoloBuildAI — Auth Service
// Wraps: POST /auth/register, POST /auth/login,
//        POST /auth/refresh, GET /auth/me
// ============================================================

import { apiRequest, tokenStorage } from './api';

// ——— Response shapes (matching backend spec) ———

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

export interface RegisterResponse extends AuthTokens {
  user: AuthUser;
}

// ——— Register ———
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const data = await apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: { timezone: 'UTC', ...payload },
    auth: false,
  });
  tokenStorage.setTokens(data.access_token, data.refresh_token);
  return data;
}

// ——— Login ———
// Backend expects application/x-www-form-urlencoded
export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  const formBody = new URLSearchParams({
    username: payload.email, // OAuth2 form field is "username"
    password: payload.password,
  });

  const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'}/api/v1`;
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString(),
  });

  if (!response.ok) {
    let message = 'Login failed';
    try {
      const err = await response.json();
      message = err?.detail ?? err?.message ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const data: AuthTokens = await response.json();
  tokenStorage.setTokens(data.access_token, data.refresh_token);
  return data;
}

// ——— Get current user ———
export async function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me', { method: 'GET' });
}

// ——— Logout (client-side only — clears stored tokens) ———
export function logout(): void {
  tokenStorage.clear();
}
