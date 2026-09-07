import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api';

/**
 * Single source of truth for "who's logged in" across the app — the
 * session cookie itself isn't readable from JS, so this is how any
 * component finds out whether there's a valid session.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  });
}
