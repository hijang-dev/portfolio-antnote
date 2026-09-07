import { apiFetch } from '@/lib/api/client';

export interface AuthUser {
  id: string;
  username: string;
  nickname: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface SignUpInput {
  username: string;
  password: string;
  nickname: string;
}

export function login(input: LoginInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function signUp(input: SignUpInput): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}

export function logout(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
}
