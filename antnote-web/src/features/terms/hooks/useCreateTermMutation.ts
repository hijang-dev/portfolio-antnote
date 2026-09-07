import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTerm } from '../api';

export function useCreateTermMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTerm,
    onSuccess: () => {
      // Invalidates both ['terms', 'list'] (this screen) and
      // ['terms', 'random', ...] (dashboard) — a new term should show up
      // in both the next time each is viewed.
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}
