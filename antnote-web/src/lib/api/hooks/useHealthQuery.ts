import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../health';

/**
 * Business logic (what to fetch, cache key, retry policy) lives here so
 * presentational components only consume the result — see
 * src/components/SetupStatus.tsx.
 */
export function useHealthQuery() {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: false,
  });
}
