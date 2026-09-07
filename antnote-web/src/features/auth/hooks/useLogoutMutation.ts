import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api';

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Remove, don't setQueryData(..., null) — the cache's type is
      // AuthUser, and a bare `null` isn't type-checked against that (the
      // queryKey here isn't linked to useCurrentUser's at the type level),
      // so components reading `data` would get null where they expect
      // AuthUser. Removing goes back to isPending, which every consumer
      // already handles.
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
