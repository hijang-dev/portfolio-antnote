import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTerm, type UpdateTermInput } from '../api';

export function useUpdateTermMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTermInput }) =>
      updateTerm(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
    },
  });
}
