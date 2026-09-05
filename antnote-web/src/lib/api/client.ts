const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Thin fetch wrapper shared by every query/mutation function. Keeping this
 * in one place means base URL, error shape, and JSON parsing only need to
 * be handled once.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    // Backend auth is session-cookie based (Redis-backed) — without this,
    // the browser won't send the session cookie cross-origin (3001 -> 3000).
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.message ?? response.statusText);
  }

  return response.json() as Promise<T>;
}
