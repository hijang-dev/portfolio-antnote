import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../api';

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      // Seed the cache directly instead of refetching — we already have
      // the exact response /auth/me would return.
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });
}
