'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { AuthUser } from '../api';
import { useCurrentUser } from './useCurrentUser';

type RequireAuthResult =
  { ready: false; user: undefined } | { ready: true; user: AuthUser };

/**
 * Redirects to /login when GET /auth/me fails, since the session cookie
 * itself can't be checked client-side (httpOnly, backed by Redis). Every
 * protected page renders nothing until `ready` is true.
 */
export function useRequireAuth(): RequireAuthResult {
  const router = useRouter();
  const { data: user, isPending, isError } = useCurrentUser();

  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  if (isPending || isError || !user) {
    return { ready: false, user: undefined };
  }
  return { ready: true, user };
}
