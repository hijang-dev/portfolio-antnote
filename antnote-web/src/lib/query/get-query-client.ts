import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid an immediate refetch right after hydration.
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: always create a fresh client (per-request, no cross-request cache
 * leaks). Browser: reuse a single client across renders.
 * See https://tanstack.com/query/latest/docs/framework/react/guides/ssr
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
